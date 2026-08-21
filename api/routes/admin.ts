import { Hono } from 'hono';
import { eq, count, sum } from 'drizzle-orm';
import * as schema from '../../db/schema.js';

export const adminRoute = new Hono();

adminRoute.get('/stats', async (c) => {
  try {
    const { db } = await import('../repositories/index.js');
    
    // Total Clients
    const totalClientsResult = await db.select({ value: count() }).from(schema.clients);
    
    // Total Leads
    const totalLeadsResult = await db.select({ value: count() }).from(schema.leads);
    
    // Total Messages
    const totalMessagesResult = await db.select({ value: count() }).from(schema.messages);
    
    // Total Tokens
    const totalTokensResult = await db.select({ value: sum(schema.clients.tokenUsage) }).from(schema.clients);

    return c.json({
      success: true,
      stats: {
        totalClients: totalClientsResult[0].value,
        totalLeads: totalLeadsResult[0].value,
        totalMessages: totalMessagesResult[0].value,
        totalTokens: Number(totalTokensResult[0].value) || 0,
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

adminRoute.get('/clients', async (c) => {
  try {
    const { db } = await import('../repositories/index.js');
    
    const allClients = await db.query.clients.findMany({
      orderBy: (clients, { desc }) => [desc(clients.createdAt)],
    });

    return c.json({ success: true, clients: allClients });
  } catch (error) {
    console.error('Admin clients error:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});
