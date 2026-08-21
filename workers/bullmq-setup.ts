import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import 'dotenv/config';
import { sendEmail } from './email-sender.js';

// Rule #2: Do not hardcode credentials. 
// Fallback to localhost if not provided (common for local development)
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Shared Redis connection for BullMQ
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

connection.on('error', (err: any) => {
  console.error('[Redis Error]', err);
});

// 1. Define the Queue
export const followUpQueue = new Queue('FollowUpQueue', { connection });

// 2. Define the Job Payload Interface
export interface FollowUpJobData {
  clientId: string;
  leadId: string;
  email: string;
  name: string;
  phone: string;
  type: 'reminder' | 'check-in';
}

// 3. Define the Worker
// Rule #1: Component handles its own initialization
export const startFollowUpWorker = () => {
  const worker = new Worker<FollowUpJobData>(
    'FollowUpQueue',
    async (job: Job<FollowUpJobData>) => {
      console.log(`[Worker] Processing Job ${job.id} for lead: ${job.data.phone}`);
      
      const text = job.data.type === 'reminder' 
        ? `Hi ${job.data.name}, this is a reminder for your upcoming appointment.`
        : `Hi ${job.data.name}, just checking in to see if you had any more questions about our services!`;

      // 1. Send via WhatsApp adapter
      try {
        const { clientRepository, conversationRepository, messageRepository } = await import('../api/repositories/index.js');
        const { io } = await import('../api/index.js');
        const { WhatsAppAdapter } = await import('../integrations/whatsapp-adapter.js');
        
        const client = await clientRepository.findById(job.data.clientId);
        if (client) {
           const adapter = new WhatsAppAdapter(
             client.twilioAccountSid || undefined,
             client.twilioAuthToken || undefined,
             client.twilioPhoneNumber || undefined
           );
           
           await adapter.sendMessage(job.data.phone, text);
           console.log(`[Worker] WhatsApp message sent to ${job.data.phone}`);

           // 2. Save to DB
           const conversation = await conversationRepository.findOrCreate(job.data.clientId, job.data.leadId, 'whatsapp');
           const agentMessage = await messageRepository.create(conversation.id, 'agent', text);
           
           // 3. Emit real-time update
           io.to(client.id).emit('new_message', { ...agentMessage, leadId: job.data.leadId });
        }
      } catch (err) {
        console.error(`[Worker] Failed to process WhatsApp logic:`, err);
        throw err;
      }

      console.log(`[Worker] Job ${job.id} completed successfully.`);
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
};
