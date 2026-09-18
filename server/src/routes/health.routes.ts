import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const dbStatusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    status: 'healthy',
    message: 'Smart Rent Connect Backend API is operating normally',
    service: 'smart-rent-connect-server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: dbState === 1,
      host: mongoose.connection.host || 'in-memory',
      name: mongoose.connection.name || 'smart_rent_connect',
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
