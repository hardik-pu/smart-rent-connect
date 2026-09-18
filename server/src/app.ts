import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

// Route Imports
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import favouriteRoutes from './routes/favourite.routes';
import enquiryRoutes from './routes/enquiry.routes';
import visitRoutes from './routes/visit.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';

const app: Application = express();

const configuredOrigins = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...configuredOrigins,
];

// Global Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server health checks)
      if (!origin) return callback(null, true);

      // Check if origin matches allowed origins or Vercel deployment domain pattern (*.vercel.app)
      const isAllowed =
        defaultAllowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        (process.env.NODE_ENV !== 'production' && origin.includes('localhost'));

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file serving for uploads fallback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Render Default Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Smart Rent Connect API',
    healthCheck: '/api/health',
    docs: 'Available API endpoints: /api/auth, /api/properties, /api/favourites, /api/enquiries, /api/visits, /api/notifications, /api/admin',
  });
});

// Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[App Error]', err);
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred on the server',
  });
});

export default app;
