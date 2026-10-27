require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[CivicPulse Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('[CivicPulse Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[CivicPulse Server] Closed remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error(`[CivicPulse Server] Failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
