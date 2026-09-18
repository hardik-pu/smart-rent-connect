import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { initSocket } from './socket';

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:3000';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Create HTTP Server
    const server = http.createServer(app);

    // 3. Initialize Socket.IO
    initSocket(server, CLIENT_URL);

    // 4. Start Listening (bind to 0.0.0.0 for cloud containers like Render)
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`================================================`);
      console.log(`🚀 Smart Rent Connect Backend running on port ${PORT}`);
      console.log(`📡 Health check URL: http://0.0.0.0:${PORT}/health or /api/health`);
      console.log(`🌐 Allowed Client(s): ${CLIENT_URL}`);
      console.log(`================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
