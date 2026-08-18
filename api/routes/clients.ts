import { Hono } from 'hono';
import { db } from '../repositories/index.js';
import * as schema from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const clientsRoute = new Hono();

// Helper to get clientId safely
const getClientId = (c: any) => {
  const clientId = c.req.query('clientId');
  if (!clientId) {
    throw new Error('clientId is required');
  }
  return clientId;
};

const updateClientSchema = z.object({
  twilioAccountSid: z.string().optional().nullable(),
  twilioAuthToken: z.string().optional().nullable(),
  twilioPhoneNumber: z.string().optional().nullable(),
  systemPrompt: z.string().optional().nullable(),
});

// GET /api/clients/me
clientsRoute.get('/me', async (c) => {
  try {
    const clientId = getClientId(c);
    
    // Using direct db query here since clientRepository might not have a full update method yet
    const client = await db.query.clients.findFirst({
      where: eq(schema.clients.id, clientId)
    });

    if (!client) {
      return c.json({ success: false, error: 'Client not found' }, 404);
    }

    return c.json({ success: true, client });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// PUT /api/clients/me
clientsRoute.put('/me', zValidator('json', updateClientSchema), async (c) => {
  try {
    const clientId = getClientId(c);
    const data = c.req.valid('json');
    
    const [updatedClient] = await db
      .update(schema.clients)
      .set({
        twilioAccountSid: data.twilioAccountSid,
        twilioAuthToken: data.twilioAuthToken,
        twilioPhoneNumber: data.twilioPhoneNumber,
        systemPrompt: data.systemPrompt,
        updatedAt: new Date()
      })
      .where(eq(schema.clients.id, clientId))
      .returning();

    return c.json({ success: true, client: updatedClient });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});
