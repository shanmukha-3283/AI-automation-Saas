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

    // 1.5 Insert Super Admin
    const [superAdmin] = await db.insert(clients).values({
      name: 'Stitch Platform Admin',
      email: 'platform_admin@stitch.com',
      role: 'superadmin',
    }).returning();
    console.log(`Inserted super admin: ${superAdmin.id}`);

    // 2. Insert test client (Tenant)
    const [testClient] = await db.insert(clients).values({
      name: 'Reliance Digital AI',
      email: 'admin@reliancedigital.in',
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || 'mock_sid',
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || 'mock_token',
      twilioPhoneNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+919876543210',
      systemPrompt: 'You are a helpful customer support assistant for Reliance Digital AI.',
    }).returning();
    console.log(`Inserted test client: ${testClient.id}`);

    // 3. Insert test leads
    const testLeads = await db.insert(leads).values([
      {
        clientId: testClient.id,
        name: 'Rahul Sharma',
        email: 'rahul.s@tatatech.in',
        phone: '+919876500001',
        company: 'Tata Tech',
        budget: '5000000',
        status: 'qualified',
      },
      {
        clientId: testClient.id,
        name: 'Priya Patel',
        email: 'priya.p@infosys.com',
        phone: '+919876500002',
        company: 'Infosys',
        budget: '1000000',
        status: 'escalated',
      },
      {
        clientId: testClient.id,
        name: 'Amit Singh',
        email: 'amit.s@wipro.com',
        phone: '+919876500003',
        status: 'new',
      }
    ]).returning();

    console.log(`Inserted ${testLeads.length} leads.`);

    // 4. Create conversations for Rahul and Priya
    const rahul = testLeads[0];
    const priya = testLeads[1];

    const convos = await db.insert(conversations).values([
      { clientId: testClient.id, leadId: rahul.id, platform: 'whatsapp' },
      { clientId: testClient.id, leadId: priya.id, platform: 'whatsapp' }
    ]).returning();

    const rahulConvo = convos[0];
    const priyaConvo = convos[1];

    console.log(`Inserted ${convos.length} conversations.`);

    // 4. Insert Messages for Rahul (Qualified flow)
    await db.insert(messages).values([
      { conversationId: rahulConvo.id, role: 'user', content: 'Hi, I need help automating our customer support.' },
      { conversationId: rahulConvo.id, role: 'agent', content: 'Hello Rahul! I can definitely help with that. Are you looking to integrate with WhatsApp or your website?' },
      { conversationId: rahulConvo.id, role: 'user', content: 'Both, but WhatsApp is the priority in India. We have about 50,000 inquiries a month.' },
      { conversationId: rahulConvo.id, role: 'agent', content: 'Understood. Based on that volume, our Enterprise tier would be a great fit. What is your estimated budget for the initial setup?' },
      { conversationId: rahulConvo.id, role: 'user', content: 'Around ₹50 Lakhs.' },
      { conversationId: rahulConvo.id, role: 'agent', content: 'Perfect. I have marked your account as qualified. Would you like me to schedule a technical deep-dive with our engineering team?' },
    ]);

    // 5. Insert Messages for Priya (Escalated flow)
    await db.insert(messages).values([
      { conversationId: priyaConvo.id, role: 'user', content: 'Your platform is too confusing, how do I reset my API keys?' },
      { conversationId: priyaConvo.id, role: 'agent', content: 'Hi Priya, I am sorry you are having trouble. You can reset your API keys in the developer dashboard under Settings > Security.' },
      { conversationId: priyaConvo.id, role: 'user', content: 'I tried that and it gave me a 500 error! This is urgent, my production app is down!' },
      { conversationId: priyaConvo.id, role: 'agent', content: 'I understand this is urgent. Since you are experiencing a production outage and server error, I am escalating this immediately to our human engineering support team. Someone will call you at +919876500002 shortly.' },
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
