import { ensureCollectionExists, ingestFAQ } from './qdrant-client.js';
import 'dotenv/config';

/**
 * Seeds the Qdrant vector database with sample FAQ data.
 * This data is used by the RAG pipeline to answer common questions
 * without hitting the expensive LLM.
 */
const sampleFAQs = [
  {
    question: "What services do you offer?",
    answer: "We offer AI-powered customer support automation, lead qualification via WhatsApp & web, appointment scheduling, FAQ chatbots, and multi-channel integration (WhatsApp, Instagram, Slack, Email)."
  },
  {
    question: "How much do your services cost?",
    answer: "Our AI automation plans start at $49/month for small businesses (up to 500 conversations). We also offer Professional ($149/mo) and Enterprise (custom pricing) tiers. Contact us for a custom quote!"
  },
  {
    question: "How does the WhatsApp automation work?",
    answer: "We connect your business WhatsApp number via Twilio. When a customer messages you, our AI agent instantly responds, collects their information, qualifies them as a lead, and if needed, escalates to a human operator — all automatically."
  },
  {
    question: "Can I use my own phone number?",
    answer: "Yes! For production use, you'll need a Twilio account with a verified WhatsApp Business number. For testing, you can use Twilio's sandbox which works with any WhatsApp number."
  },
  {
    question: "Do you support languages other than English?",
    answer: "Yes, our AI agents support 50+ languages including Hindi, Spanish, French, Arabic, and more. The AI automatically detects the customer's language and responds accordingly."
  },
  {
    question: "How long does setup take?",
    answer: "Basic setup takes about 30 minutes. We'll help you connect your WhatsApp number, upload your FAQ data, and configure your AI agent's personality and business rules."
  },
  {
    question: "What happens when the AI can't answer a question?",
    answer: "The AI automatically escalates complex queries to a human operator via the dashboard. You'll see the conversation in real-time and can take over instantly with a single click."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. All conversations are encrypted in transit and at rest. We use PostgreSQL with row-level security, and your data is never shared with other clients or used to train AI models."
  },
  {
    question: "Can the AI book appointments?",
    answer: "Yes! Our AI can check calendar availability, suggest times, and book appointments directly. It integrates with Google Calendar and sends automatic reminders before the appointment."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach our team via WhatsApp at +1-555-0100, email at support@aiautomation.dev, or through the live chat on our dashboard. We typically respond within 5 minutes."
  }
];

async function seedFAQs() {
  console.log('🔄 Ensuring Qdrant collection exists...');
  await ensureCollectionExists();

  console.log(`📝 Ingesting ${sampleFAQs.length} FAQs...`);
  
  for (const faq of sampleFAQs) {
    const success = await ingestFAQ(faq.question, faq.answer);
    if (success) {
      console.log(`  ✅ "${faq.question.substring(0, 50)}..."`);
    } else {
      console.log(`  ❌ Failed: "${faq.question.substring(0, 50)}..."`);
    }
  }

  console.log('🎉 FAQ seeding complete!');
}

seedFAQs().catch(console.error);
