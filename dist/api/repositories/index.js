import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../db/schema.js';
import 'dotenv/config';
// Initialize Drizzle ORM database connection
const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });
export class ClientRepository {
    async findById(id) {
        const client = await db.query.clients.findFirst({
            where: eq(schema.clients.id, id)
        });
        return client || null;
    }
}
export const clientRepository = new ClientRepository();
class LeadRepository {
    async create(input) {
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
    async findByPhone(clientId, phone) {
        const lead = await db.query.leads.findFirst({
            where: and(eq(schema.leads.clientId, clientId), eq(schema.leads.phone, phone)),
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
    async findOrCreateByPhone(input) {
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
    async findById(clientId, id) {
        const lead = await db.query.leads.findFirst({
            where: and(eq(schema.leads.clientId, clientId), eq(schema.leads.id, id)),
            with: {
                conversations: true,
                appointments: true
            }
        });
        return lead || null;
    }
    async list(clientId) {
        return await db.query.leads.findMany({
            where: eq(schema.leads.clientId, clientId)
        });
    }
    async updateStatus(clientId, id, status) {
        const [lead] = await db.update(schema.leads)
            .set({ status, updatedAt: new Date() })
            .where(and(eq(schema.leads.clientId, clientId), eq(schema.leads.id, id)))
            .returning();
        return lead || null;
    }
    async update(clientId, id, data) {
        const updateData = { ...data, updatedAt: new Date() };
        if (data.budget !== undefined) {
            updateData.budget = data.budget?.toString() ?? null;
        }
        const [lead] = await db.update(schema.leads)
            .set(updateData)
            .where(and(eq(schema.leads.clientId, clientId), eq(schema.leads.id, id)))
            .returning();
        return lead || null;
    }
}
export const leadRepository = new LeadRepository();
export class ConversationRepository {
    async findOrCreate(clientId, leadId, platform = 'web') {
        let conversation = await db.query.conversations.findFirst({
            where: and(eq(schema.conversations.clientId, clientId), eq(schema.conversations.leadId, leadId)),
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
    async updateAiPausedAt(id, aiPausedAt) {
        const [conversation] = await db.update(schema.conversations)
            .set({ aiPausedAt })
            .where(eq(schema.conversations.id, id))
            .returning();
        return conversation || null;
    }
}
export class MessageRepository {
    async create(conversationId, role, content) {
        const [message] = await db.insert(schema.messages).values({
            conversationId,
            role,
            content,
        }).returning();
        return message;
    }
    async listByConversation(conversationId) {
        return await db.query.messages.findMany({
            where: eq(schema.messages.conversationId, conversationId),
            orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        });
    }
}
export const conversationRepository = new ConversationRepository();
export const messageRepository = new MessageRepository();
