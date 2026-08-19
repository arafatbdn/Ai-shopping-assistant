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

dotenv.config();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
      ];
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS'));
    },
  }),
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'ai-shopping-assistant-api',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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
