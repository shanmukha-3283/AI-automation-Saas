import { Hono } from 'hono';
export const healthRoute = new Hono();
const startTime = Date.now();
healthRoute.get('/', (c) => {
    return c.json({
        status: 'ok',
        uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});
