import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { leadRepository, conversationRepository, messageRepository } from '../repositories/index.js';
import { defaultWhatsAppAdapter as whatsAppAdapter } from '../../integrations/whatsapp-adapter.js';

export const leadsRoute = new Hono();

const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  budget: z.number().min(0).optional()
});

// Helper to get clientId safely
const getClientId = (c: any) => {
  const clientId = c.req.query('clientId');
  if (!clientId) {
    throw new Error('clientId is required');
  }
  return clientId;
};

// POST /api/leads - Create lead using Hono zValidator middleware
leadsRoute.post('/', zValidator('json', createLeadSchema), async (c) => {
  try {
    const clientId = getClientId(c);
    const data = c.req.valid('json');
    const lead = await leadRepository.create({ ...data, clientId });
    return c.json({ success: true, lead }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// GET /api/leads - List all leads
leadsRoute.get('/', async (c) => {
  try {
    const clientId = getClientId(c);
    const leads = await leadRepository.list(clientId);
    return c.json({ success: true, leads });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// GET /api/leads/:id - Get lead details
leadsRoute.get('/:id', async (c) => {
  try {
    const clientId = getClientId(c);
    const id = c.req.param('id');
    const lead = await leadRepository.findById(clientId, id);
    if (!lead) {
      return c.json({ success: false, error: 'Lead not found' }, 404);
    }
    return c.json({ success: true, lead });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// GET /api/leads/:id/messages - Get chat history for a lead
leadsRoute.get('/:id/messages', async (c) => {
  try {
    const clientId = getClientId(c);
    const id = c.req.param('id');
    const lead = await leadRepository.findById(clientId, id);
    if (!lead) {
      return c.json({ success: false, error: 'Lead not found' }, 404);
    }
    
    const conversation = await conversationRepository.findOrCreate(clientId, id);
    const messages = await messageRepository.listByConversation(conversation.id);
    
    // Format messages to match frontend expectations
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt
    }));

    return c.json({ success: true, messages: formattedMessages });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// POST /api/leads/:id/messages - Send message to lead manually
leadsRoute.post('/:id/messages', async (c) => {
  try {
    const clientId = getClientId(c);
    const id = c.req.param('id');
    const { content } = await c.req.json();

    const lead = await leadRepository.findById(clientId, id);
    if (!lead) return c.json({ success: false, error: 'Lead not found' }, 404);
    if (!lead.phone) return c.json({ success: false, error: 'Lead has no phone number' }, 400);

    const conversation = await conversationRepository.findOrCreate(clientId, id);
    
    // Pause AI for 24 hours when human intervenes
    await conversationRepository.updateAiPausedAt(conversation.id, new Date());
    
    // Save to DB
    const message = await messageRepository.create(conversation.id, 'agent', content);

    // Send via WhatsApp
    await whatsAppAdapter.sendMessage(lead.phone, content);

    return c.json({ 
      success: true, 
      message: {
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.createdAt
      } 
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});
