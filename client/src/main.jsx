import React from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App.jsx';

// Note: StrictMode double-mounting in dev can cause "Map container is already initialized" with Leaflet
createRoot(document.getElementById('root')).render(
  <App />
);
