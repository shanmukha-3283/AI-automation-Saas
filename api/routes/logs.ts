import { Hono } from 'hono';
import { messageRepository } from '../repositories/index.js';

export const logsRoute = new Hono();

logsRoute.get('/', async (c) => {
  try {
    const clientId = c.req.query('clientId');
    if (!clientId) {
      return c.json({ success: false, error: 'clientId is required' }, 400);
    }
    
    const logs = await messageRepository.listAllByClient(clientId);
    return c.json({ success: true, logs });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});
