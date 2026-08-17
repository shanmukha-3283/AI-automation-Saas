import { db } from '../api/repositories/index.ts';
import { clients, leads, conversations, messages, appointments } from './schema.ts';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Clear existing data (cascade handles dependencies)
    await db.delete(clients);
    console.log('Cleared existing clients and cascading records.');

    // 2. Insert test client (Tenant)
    const [testClient] = await db.insert(clients).values({
      name: 'Test Business Inc.',
      email: 'admin@testbusiness.com',
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || 'mock_sid',
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || 'mock_token',
      twilioPhoneNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
      systemPrompt: 'You are a helpful customer support assistant for Test Business Inc.',
    }).returning();
    console.log(`Inserted test client: ${testClient.id}`);

    // 3. Insert test leads
    const testLeads = await db.insert(leads).values([
      {
        clientId: testClient.id,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+15550101',
        company: 'TechCorp',
        budget: '50000',
        status: 'qualified',
      },
      {
        clientId: testClient.id,
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+15550102',
        company: 'DesignWorks',
        budget: '10000',
        status: 'escalated',
      },
      {
        clientId: testClient.id,
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        phone: '+15550103',
        status: 'new',
      }
    ]).returning();

    console.log(`Inserted ${testLeads.length} leads.`);

    // 4. Create conversations for Alice and Bob
    const alice = testLeads[0];
    const bob = testLeads[1];

    const convos = await db.insert(conversations).values([
      { clientId: testClient.id, leadId: alice.id, platform: 'whatsapp' },
      { clientId: testClient.id, leadId: bob.id, platform: 'whatsapp' }
    ]).returning();

    const aliceConvo = convos[0];
    const bobConvo = convos[1];

    console.log(`Inserted ${convos.length} conversations.`);

    // 4. Insert Messages for Alice (Qualified flow)
    await db.insert(messages).values([
      { conversationId: aliceConvo.id, role: 'user', content: 'Hi, I need help automating our customer support.' },
      { conversationId: aliceConvo.id, role: 'agent', content: 'Hello Alice! I can definitely help with that. Are you looking to integrate with WhatsApp or your website?' },
      { conversationId: aliceConvo.id, role: 'user', content: 'Both, but WhatsApp is the priority. We have about 5,000 inquiries a month.' },
      { conversationId: aliceConvo.id, role: 'agent', content: 'Understood. Based on that volume, our Enterprise tier would be a great fit. What is your estimated budget for the initial setup?' },
      { conversationId: aliceConvo.id, role: 'user', content: 'Around $50k.' },
      { conversationId: aliceConvo.id, role: 'agent', content: 'Perfect. I have marked your account as qualified. Would you like me to schedule a technical deep-dive with our engineering team?' },
    ]);

    // 5. Insert Messages for Bob (Escalated flow)
    await db.insert(messages).values([
      { conversationId: bobConvo.id, role: 'user', content: 'Your platform is too confusing, how do I reset my API keys?' },
      { conversationId: bobConvo.id, role: 'agent', content: 'Hi Bob, I am sorry you are having trouble. You can reset your API keys in the developer dashboard under Settings > Security.' },
      { conversationId: bobConvo.id, role: 'user', content: 'I tried that and it gave me a 500 error! This is urgent, my production app is down!' },
      { conversationId: bobConvo.id, role: 'agent', content: 'I understand this is urgent. Since you are experiencing a production outage and server error, I am escalating this immediately to our human engineering support team. Someone will call you at +15550102 shortly.' },
    ]);

    console.log('Inserted test messages.');
    console.log('✅ Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
