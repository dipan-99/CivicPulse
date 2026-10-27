const mongoose = require('mongoose');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let mongodProcess = null;

const startLocalMongodIfNeeded = async () => {
  try {
    const whichMongod = execSync('which mongod', { encoding: 'utf8' }).trim();
    if (!whichMongod) return false;

    const dataDir = fs.existsSync(path.resolve(__dirname, '../../../../mongodb_data'))
      ? path.resolve(__dirname, '../../../../mongodb_data')
      : path.resolve(__dirname, '../../mongodb_data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let shimPath = path.resolve(__dirname, '../../shim.so');
    if (!fs.existsSync(shimPath)) {
      shimPath = path.resolve(__dirname, '../../../../shim.so');
    }
    const spawnEnv = { ...process.env };
    if (fs.existsSync(shimPath)) {
      spawnEnv.LD_PRELOAD = shimPath;
    }

    console.log('[CivicPulse DB] Initializing local MongoDB child engine...');
    mongodProcess = spawn(
      'mongod',
      [
        '--dbpath', dataDir,
        '--port', '27017',
        '--bind_ip', '127.0.0.1',
        '--nounixsocket'
      ],
      { env: spawnEnv, stdio: 'ignore' }
    );

    // Ensure clean teardown on exit
    const cleanup = () => {
      if (mongodProcess && !mongodProcess.killed) {
        mongodProcess.kill('SIGINT');
      }
    };
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Wait 1.5 seconds for mongod to accept connections
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return true;
  } catch (err) {
    console.warn(`[CivicPulse DB] Unable to launch local mongod child: ${err.message}`);
    return false;
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civicpulse_dev';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[CivicPulse DB] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    // If local connection failed, try launching local child engine
    if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
      console.log('[CivicPulse DB] Standalone daemon not found on 127.0.0.1:27017. Spawning local instance...');
      const started = await startLocalMongodIfNeeded();
      if (started) {
        try {
          const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
          console.log(`[CivicPulse DB] MongoDB connected to local instance: ${conn.connection.host}/${conn.connection.name}`);
          return conn;
        } catch (innerErr) {
          console.error(`[CivicPulse DB] Secondary connection error: ${innerErr.message}`);
          process.exit(1);
        }
      }
    }

    console.error(`[CivicPulse DB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
