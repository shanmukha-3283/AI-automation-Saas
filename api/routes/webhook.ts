import { Hono } from 'hono';
import { WhatsAppAdapter } from '../../integrations/whatsapp-adapter.js';
import { clientRepository, leadRepository, conversationRepository, messageRepository } from '../repositories/index.js';
import { searchFAQ } from '../../rag/qdrant-client.js';
import { leadQualifierGraph, LeadQualifierState } from '../../agent/index.js';
import { HumanMessage, AIMessage, BaseMessage, SystemMessage } from '@langchain/core/messages';
import twilio from 'twilio';
import { io } from '../index.js';

export const webhookRoute = new Hono();

// Twilio webhooks are sent as form data to a specific client's endpoint
webhookRoute.post('/:clientId', async (c) => {
  try {
    const clientId = c.req.param('clientId');
    
    // 1. Load Client configuration
    const client = await clientRepository.findById(clientId);
    if (!client) {
      return c.text('Client not found', 404);
    }

    // 2. Validate Twilio Signature (Security)
    const authToken = client.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
    if (authToken && authToken !== 'your-twilio-auth-token' && process.env.NODE_ENV !== 'development') {
      const twilioSignature = c.req.header('X-Twilio-Signature') || '';
      const url = c.req.url;
      const rawBody = await c.req.parseBody();
      
      const isValid = twilio.validateRequest(authToken, twilioSignature, url, rawBody as Record<string, string>);
      if (!isValid) {
        console.warn(`[Webhook Security] Invalid Twilio signature for client ${clientId}`);
        return c.text('Forbidden', 403);
      }
    }

    const body = await c.req.parseBody();
    
    // 3. Parse via the Integration Adapter
    const message = WhatsAppAdapter.parseIncomingWebhook(body as any);
    
    // 4. Find existing lead by phone or create a new one, scoped to this client
    const lead = await leadRepository.findOrCreateByPhone({
      clientId: client.id,
      phone: message.senderPhone,
      name: message.senderProfileName || 'Unknown User',
      email: `${message.senderPhone.replace(/[^0-9]/g, '')}@wa.lead`,
    });
    
    // 5. Find or Create Conversation
    const conversation = await conversationRepository.findOrCreate(client.id, lead.id, 'whatsapp');
    
    // Save user message to Postgres
    const userMessage = await messageRepository.create(conversation.id, 'user', message.text);
    io.to(client.id).emit('new_message', { ...userMessage, leadId: lead.id });
    io.to(client.id).emit('lead_updated', lead);

    // 5.5 AI Pause Check (Human Override)
    if (conversation.aiPausedAt) {
      const hoursSincePause = (Date.now() - new Date(conversation.aiPausedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSincePause < 24) {
        console.log(`[Webhook] AI is paused for conversation ${conversation.id}. Human is handling this.`);
        return c.text('OK');
      }
    }

    // 6. RAG FAQ Check
    let faqResults: { score: number; question: string; answer: string }[] = [];
    try {
      faqResults = await searchFAQ(message.text, 1);
    } catch (e) {
      console.warn('[RAG] Qdrant search failed, falling through to LLM:', (e as Error).message);
    }
    
    let finalResponse = '';

    // If we have a very confident FAQ match (>0.85 score)
    if (faqResults.length > 0 && faqResults[0].score > 0.85) {
      finalResponse = faqResults[0].answer;
    } else {
      // 7. Fallback to LangGraph Agent
      // Reconstruct conversation history from DB
      const dbMessages = await messageRepository.listByConversation(conversation.id);
      
      const langGraphMessages: BaseMessage[] = dbMessages.map(msg => 
        msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      );

      // Prepend dynamic System Prompt if the client has one
      if (client.systemPrompt) {
         langGraphMessages.unshift(new SystemMessage(client.systemPrompt));
      }

      // Determine current qualification status from lead's DB status
      const currentStatus = (lead.status === 'new' || lead.status === 'qualifying') ? 'pending' : lead.status;

      // Invoke the Lead Qualifier Graph
      const initialState: LeadQualifierState = {
        messages: langGraphMessages,
        leadId: lead.id,
        extractedInfo: {
          name: lead.name !== 'Unknown User' ? lead.name : undefined,
          email: lead.email && !lead.email.endsWith('@wa.lead') ? lead.email : undefined,
          company: lead.company || undefined,
          budget: lead.budget ? Number(lead.budget) : undefined,
        },
        qualificationStatus: currentStatus as LeadQualifierState['qualificationStatus'],
        confidenceScore: 1.0,
        clientId: client.id,
      };

      const resultState = (await leadQualifierGraph.invoke(initialState as any)) as unknown as LeadQualifierState;
      
      // 8. PERSIST agent state back to DB
      if (resultState.qualificationStatus && resultState.qualificationStatus !== 'pending') {
        const updatedLead = await leadRepository.updateStatus(client.id, lead.id, resultState.qualificationStatus);
        if (updatedLead) io.to(client.id).emit('lead_updated', updatedLead);

        // Immediate Escalation Notification
        if (resultState.qualificationStatus === 'escalated' && client.escalationWebhookUrl) {
          fetch(client.escalationWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'lead.escalated',
              lead: { id: lead.id, name: lead.name, phone: lead.phone, email: lead.email },
              message: `🚨 Lead escalated: ${lead.name}. Please take over in the dashboard.`
            })
          }).catch(err => console.error('[Webhook] Failed to send escalation alert:', err));
        }

      } else if (lead.status === 'new') {
        const updatedLead = await leadRepository.updateStatus(client.id, lead.id, 'qualifying');
        if (updatedLead) io.to(client.id).emit('lead_updated', updatedLead);
      }

      // Update lead info if extraction found new data
      if (resultState.extractedInfo) {
        const info = resultState.extractedInfo;
        if (info.name || info.email || info.company || info.budget) {
          const updatedLead = await leadRepository.update(client.id, lead.id, {
            clientId: client.id,
            name: info.name || lead.name,
            email: info.email || lead.email,
            phone: lead.phone || '',
            company: info.company || lead.company || undefined,
            budget: info.budget,
          } as any);
          if (updatedLead) io.to(client.id).emit('lead_updated', updatedLead);
        }
      }
      
      // Get the last AI message from the agent's output state
      const lastMessage = resultState.messages[resultState.messages.length - 1];
      if (lastMessage && lastMessage._getType() === 'ai') {
        finalResponse = lastMessage.content as string;
      } else {
        finalResponse = "I'm having trouble processing that. Let me connect you with a human.";
      }
    }

    // 9. Save AI Response to Postgres
    const agentMessage = await messageRepository.create(conversation.id, 'agent', finalResponse);
    io.to(client.id).emit('new_message', { ...agentMessage, leadId: lead.id });

    // 10. Send the response back out via the Client's specific WhatsApp Adapter
    const adapter = new WhatsAppAdapter(
      client.twilioAccountSid || undefined, 
      client.twilioAuthToken || undefined, 
      client.twilioPhoneNumber || undefined
    );
    await adapter.sendMessage(message.senderPhone, finalResponse);

    // Twilio expects a 200 OK
    return c.text('OK');

  } catch (error) {
    console.error('Webhook Error:', error);
    // Still return 200 to Twilio so it doesn't retry infinitely
    return c.text('OK');
  }
});
