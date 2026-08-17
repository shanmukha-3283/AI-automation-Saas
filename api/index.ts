import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRoute } from './routes/health.js';
import { authRoute } from './routes/auth.js';
import { clientsRoute } from './routes/clients.js';
import { leadsRoute } from './routes/leads.js';
import { webhookRoute } from './routes/webhook.js';
import { startFollowUpWorker } from '../workers/index.js';
import 'dotenv/config';

// Start Background Workers (only if Redis is configured)
const redisUrl = process.env.REDIS_URL;
if (redisUrl && redisUrl !== 'redis://localhost:6379') {
  console.log('Starting BullMQ Background Workers...');
  startFollowUpWorker();
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
app.route('/api/clients', clientsRoute);
app.route('/api/leads', leadsRoute);
app.route('/api/webhook', webhookRoute);

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

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Hono API Gateway starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port
});

export default app;
