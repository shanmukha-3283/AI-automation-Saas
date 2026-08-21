import { pgTable, uuid, varchar, text, numeric, timestamp, pgEnum, unique, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const leadStatusEnum = pgEnum('lead_status', ['new', 'qualifying', 'qualified', 'disqualified', 'escalated']);
export const roleEnum = pgEnum('message_role', ['user', 'agent', 'system']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'completed', 'canceled']);

export const clientRoleEnum = pgEnum('client_role', ['superadmin', 'tenant']);

// 1. Clients Table (Multi-Tenancy)
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: clientRoleEnum('role').default('tenant').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(), // Owner email for login
  twilioAccountSid: varchar('twilio_account_sid', { length: 255 }),
  twilioAuthToken: varchar('twilio_auth_token', { length: 255 }),
  twilioPhoneNumber: varchar('twilio_phone_number', { length: 50 }),
  systemPrompt: text('system_prompt'), // Custom AI prompt per client
  escalationWebhookUrl: varchar('escalation_webhook_url', { length: 255 }), // Alert webhook
  tokenUsage: integer('token_usage').default(0).notNull(), // Track LLM token usage
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  leads: many(leads),
  conversations: many(conversations),
  appointments: many(appointments),
}));

// 2. Leads Table
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  budget: numeric('budget', { precision: 12, scale: 2 }),
  status: leadStatusEnum('status').default('new').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueEmailPerClient: unique().on(t.clientId, t.email),
  uniquePhonePerClient: unique().on(t.clientId, t.phone),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  client: one(clients, {
    fields: [leads.clientId],
    references: [clients.id],
  }),
  conversations: many(conversations),
  appointments: many(appointments),
}));

// 3. Conversations Table
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  platform: varchar('platform', { length: 50 }).notNull().default('web'),
  aiPausedAt: timestamp('ai_paused_at', { withTimezone: true }), // Track manual intervention
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  client: one(clients, {
    fields: [conversations.clientId],
    references: [clients.id],
  }),
  lead: one(leads, {
    fields: [conversations.leadId],
    references: [leads.id],
  }),
  messages: many(messages),
}));

// 4. Messages Table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  role: roleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

// 5. Appointments Table
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: appointmentStatusEnum('status').default('scheduled').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  lead: one(leads, {
    fields: [appointments.leadId],
    references: [leads.id],
  }),
}));
