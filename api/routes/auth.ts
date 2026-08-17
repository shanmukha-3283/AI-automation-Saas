import { Hono } from 'hono';
import { db } from '../../db/schema.js'; // Note: db instance from repositories, or import from repositories directly
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema.js';

export const authRoute = new Hono();

authRoute.post('/login', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ success: false, error: 'Email is required' }, 400);
    }

    // Dynamic import to avoid circular dependency if any
    const { clientRepository } = await import('../repositories/index.js');
    
    // Actually clientRepository.findById uses id, let's write a quick query here
    const { db } = await import('../repositories/index.js');
    const client = await db.query.clients.findFirst({
      where: eq(schema.clients.email, email)
    });

    if (!client) {
      return c.json({ success: false, error: 'Client not found' }, 401);
    }

    return c.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        twilioAccountSid: client.twilioAccountSid,
        twilioAuthToken: client.twilioAuthToken,
        twilioPhoneNumber: client.twilioPhoneNumber,
        systemPrompt: client.systemPrompt,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});
