import mongoose from 'mongoose';
import { seedDatabase } from '../seeds/seed';

let mongoMemoryServer: any = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_rent_connect';
  const isProduction = process.env.NODE_ENV === 'production';

  // Sanitize URI for logging (hide password)
  const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${maskedUri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] Connected successfully to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
    await seedDatabase();
  } catch (error: any) {
    console.warn(`[Database] Could not connect to primary MongoDB (${error.message}).`);

    if (isProduction) {
      console.error(`[Database] FATAL: Production MongoDB connection failed. Please verify MONGODB_URI and Network Access on MongoDB Atlas.`);
      process.exit(1);
    }

    console.log('[Database] Development mode: Starting resilient embedded In-Memory MongoDB Server...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] In-Memory MongoDB running and connected at: ${memUri}`);
      await seedDatabase();
    } catch (memErr: any) {
      console.error('[Database] Failed to start fallback In-Memory MongoDB server:', memErr);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

