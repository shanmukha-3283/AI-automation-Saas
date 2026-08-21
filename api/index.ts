import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRoute } from './routes/health.js';
import { authRoute } from './routes/auth.js';
import { adminRoute } from './routes/admin.js';
import { clientsRoute } from './routes/clients.js';
import { leadsRoute } from './routes/leads.js';
import { webhookRoute } from './routes/webhook.js';
import { logsRoute } from './routes/logs.js';
import { startFollowUpWorker, startCronJob } from '../workers/index.js';
import 'dotenv/config';

// Start Background Workers (only if Redis is configured)
const redisUrl = process.env.REDIS_URL;
if (redisUrl) {
  console.log('Starting BullMQ Background Workers...');
  startFollowUpWorker();
  startCronJob();
} else {
  console.log('⏭️  Skipping BullMQ workers (REDIS_URL not configured or is default localhost).');
}

const app = new Hono();

// Global Middlewares
app.use('*', logger());

// CORS — lock down to dashboard origin in production
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.DASHBOARD_URL || 'http://localhost:3001']
  : ['http://localhost:3001', 'http://localhost:3000'];

app.use('*', cors({
  origin: allowedOrigins,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Simple in-memory rate limiter (per IP, 60 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;

app.use('/api/*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
  } else {
    entry.count++;
    if (entry.count > RATE_LIMIT) {
      return c.json({ success: false, error: 'Rate limit exceeded. Try again later.' }, 429);
    }
  }

  return next();
});

// Route Mounts
app.route('/health', healthRoute);
app.route('/api/auth', authRoute);
app.route('/api/admin', adminRoute);
app.route('/api/clients', clientsRoute);
app.route('/api/leads', leadsRoute);
app.route('/api/webhook', webhookRoute);
app.route('/api/logs', logsRoute);

// Global Error Handler
app.onError((err, c) => {
  console.error('Unhandled Gateway Error:', err);
  return c.json(
    {
      success: false,
      error: err.message || 'Internal Server Error'
    },
    500
  );
});

// 404 Handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Route not found' }, 404);
});

import { Server as SocketIOServer } from 'socket.io';

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Hono API Gateway starting on port ${port}...`);

const server = serve({
  fetch: app.fetch,
  port
});

// Attach Socket.io for Real-Time WebSockets
export const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 WebSocket connected: ${socket.id}`);
  
  // Clients join a room based on their clientId to receive scoped updates
  socket.on('joinRoom', (clientId) => {
    socket.join(clientId);
    console.log(`Socket ${socket.id} joined room: ${clientId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 WebSocket disconnected: ${socket.id}`);
  });
});

export default app;
