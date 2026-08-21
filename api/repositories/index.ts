import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../../db/schema.js';
import 'dotenv/config';

// Initialize Drizzle ORM database connection
const client = postgres(process.env.DATABASE_URL as string);
export const db = drizzle(client, { schema });

export class ClientRepository {
  async findById(id: string) {
    const client = await db.query.clients.findFirst({
      where: eq(schema.clients.id, id)
    });
    return client || null;
  }

  async incrementTokenUsage(id: string, tokens: number) {
    // We get the current usage, then update it. In Drizzle we can use sql operator, but simple fetch and update is fine for MVP.
    const client = await this.findById(id);
    if (client) {
      const [updated] = await db.update(schema.clients)
        .set({ tokenUsage: client.tokenUsage + tokens, updatedAt: new Date() })
        .where(eq(schema.clients.id, id))
        .returning();
      return updated;
    }
    return null;
  }
}

export const clientRepository = new ClientRepository();

export interface CreateLeadInput {
  clientId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  budget?: number;
}

class LeadRepository {
  async create(input: CreateLeadInput) {
    const [lead] = await db.insert(schema.leads).values({
      clientId: input.clientId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      budget: input.budget ? input.budget.toString() : null,
      status: 'new'
    }).onConflictDoUpdate({
      target: [schema.leads.clientId, schema.leads.email], // Update on conflict of (clientId, email)
      set: {
        name: input.name,
        phone: input.phone,
        updatedAt: new Date(),
      }
    }).returning();
    return lead;
  }

  async findByPhone(clientId: string, phone: string) {
    const lead = await db.query.leads.findFirst({
      where: and(
        eq(schema.leads.clientId, clientId),
        eq(schema.leads.phone, phone)
      ),
      with: {
        conversations: true,
        appointments: true
      }
    });
    return lead || null;
  }

  /**
   * Core method for webhook flow: find existing lead by phone or create a new one.
   * Scoped by clientId.
   */
  async findOrCreateByPhone(input: { clientId: string; phone: string; name?: string; email?: string }) {
    // 1. Try to find by phone first
    const existing = await this.findByPhone(input.clientId, input.phone);
    if (existing) {
      // Update name if we got a better one (profile name from WhatsApp)
      if (input.name && input.name !== 'Unknown User' && existing.name === 'Unknown User') {
        await db.update(schema.leads)
          .set({ name: input.name, updatedAt: new Date() })
          .where(eq(schema.leads.id, existing.id));
        existing.name = input.name;
      }
      return existing;
    }

    // 2. Create new lead
    const [lead] = await db.insert(schema.leads).values({
      clientId: input.clientId,
      name: input.name || 'Unknown User',
      email: input.email || `${input.phone.replace(/[^0-9]/g, '')}@wa.lead`,
      phone: input.phone,
      status: 'new'
    }).onConflictDoUpdate({
      target: [schema.leads.clientId, schema.leads.email],
      set: {
        phone: input.phone,
        updatedAt: new Date(),
      }
    }).returning();
    return lead;
  }

  async findById(clientId: string, id: string) {
    const lead = await db.query.leads.findFirst({
      where: and(
        eq(schema.leads.clientId, clientId),
        eq(schema.leads.id, id)
      ),
      with: {
        conversations: true,
        appointments: true
      }
    });
    return lead || null;
  }

  async list(clientId: string) {
    return await db.query.leads.findMany({
      where: eq(schema.leads.clientId, clientId)
    });
  }

  async updateStatus(clientId: string, id: string, status: 'new' | 'qualifying' | 'qualified' | 'disqualified' | 'escalated') {
    const [lead] = await db.update(schema.leads)
      .set({ status, updatedAt: new Date() })
      .where(and(
        eq(schema.leads.clientId, clientId),
        eq(schema.leads.id, id)
      ))
      .returning();
    return lead || null;
  }

  async update(clientId: string, id: string, data: Partial<CreateLeadInput>) {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.budget !== undefined) {
      updateData.budget = data.budget?.toString() ?? null;
    }
    const [lead] = await db.update(schema.leads)
      .set(updateData)
      .where(and(
        eq(schema.leads.clientId, clientId),
        eq(schema.leads.id, id)
      ))
      .returning();
    return lead || null;
  }

  async findInactive(hours: number) {
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db.query.leads.findMany({
      where: (leads, { and, or, eq, lt }) => and(
        or(
          eq(leads.status, 'new'),
          eq(leads.status, 'qualifying')
        ),
        lt(leads.updatedAt, cutoffDate)
      ),
      with: {
        client: true
      }
    });
  }
}

export const leadRepository = new LeadRepository();

export class ConversationRepository {
  async findOrCreate(clientId: string, leadId: string, platform: string = 'web') {
    let conversation = await db.query.conversations.findFirst({
      where: and(
        eq(schema.conversations.clientId, clientId),
        eq(schema.conversations.leadId, leadId)
      ),
      orderBy: (conversations, { desc }) => [desc(conversations.createdAt)],
    });

    if (!conversation) {
      [conversation] = await db.insert(schema.conversations).values({
        clientId,
        leadId,
        platform,
      }).returning();
    }
    return conversation;
  }

  async updateAiPausedAt(id: string, aiPausedAt: Date | null) {
    const [conversation] = await db.update(schema.conversations)
      .set({ aiPausedAt })
      .where(eq(schema.conversations.id, id))
      .returning();
    return conversation || null;
  }
}

export class MessageRepository {
  async create(conversationId: string, role: 'user' | 'agent' | 'system', content: string) {
    const [message] = await db.insert(schema.messages).values({
      conversationId,
      role,
      content,
    }).returning();
    return message;
  }

  async listByConversation(conversationId: string) {
    return await db.query.messages.findMany({
      where: eq(schema.messages.conversationId, conversationId),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });
  }

  async listAllByClient(clientId: string) {
    // Join messages -> conversations -> leads to filter by client and get lead name
    const result = await db.select({
      id: schema.messages.id,
      role: schema.messages.role,
      content: schema.messages.content,
      createdAt: schema.messages.createdAt,
      leadName: schema.leads.name,
      channel: schema.conversations.platform
    })
    .from(schema.messages)
    .innerJoin(schema.conversations, eq(schema.messages.conversationId, schema.conversations.id))
    .innerJoin(schema.leads, eq(schema.conversations.leadId, schema.leads.id))
    .where(eq(schema.leads.clientId, clientId))
    .orderBy(desc(schema.messages.createdAt))
    .limit(100);

    return result;
  }
}

export const conversationRepository = new ConversationRepository();
export const messageRepository = new MessageRepository();
