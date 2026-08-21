import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import mongoose from 'mongoose';
import assistantRoutes from './routes/assistant.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import productRoutes from './routes/product.routes.js';
import intelligenceRoutes from './routes/intelligence.routes.js';
import adminRoutes from './routes/admin.routes.js';
import agentRoutes from './routes/agent.routes.js';
import liveRoutes from './routes/live.routes.js';
import { connectDatabase } from './config/db.js';

dotenv.config();

const app = express();

// Eagerly initiate database connection for serverless/cold starts
connectDatabase().catch(() => {});

const getAllowedOrigins = () => {
  const envOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim().replace(/\/+$/, ''))
    : [];

  return [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://ai-shopping-assistant-eosin.vercel.app',
    ...envOrigins,
  ].filter(Boolean);
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');
      const allowedOrigins = getAllowedOrigins();

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json());

// Ensure database connection is established for serverless/Vercel requests
app.use(async (_request, _response, next) => {
  if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
    try {
      await connectDatabase();
    } catch {
      // Errors are handled and logged safely in connectDatabase
    }
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', async (_request, response) => {
  if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
    try {
      await connectDatabase();
    } catch {
      // Errors are handled and logged safely in connectDatabase
    }
  }

  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = readyStates[mongoose.connection.readyState] || 'disconnected';

  response.json({
    ok: true,
    service: 'ai-shopping-assistant-api',
    database: dbState,
    mongoEnvConfigured: Boolean(process.env.MONGODB_URI),
    timestamp: new Date().toISOString(),
  });
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  if (error.code === 'LIMIT_FILE_SIZE') return response.status(400).json({ message: 'Image must be smaller than 2MB' });
  if (error.message === 'Unexpected field') return response.status(400).json({ message: 'Only one image file is supported' });
  response.status(500).json({ message: 'Something went wrong on the server' });
});

export default app;
