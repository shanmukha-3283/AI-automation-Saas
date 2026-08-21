import { Queue, Worker } from 'bullmq';
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
connection.on('error', (err) => {
    console.error('[Redis Error]', err);
});
// 1. Define the Queue
export const followUpQueue = new Queue('FollowUpQueue', { connection });
// 3. Define the Worker
// Rule #1: Component handles its own initialization
export const startFollowUpWorker = () => {
    const worker = new Worker('FollowUpQueue', async (job) => {
        console.log(`[Worker] Processing Job ${job.id} for lead: ${job.data.email}`);
        let subject = '';
        let body = '';
        if (job.data.type === 'reminder') {
            subject = 'Reminder: Upcoming Appointment';
            body = `Hi ${job.data.name},\nThis is a reminder for your upcoming appointment.`;
        }
        else {
            subject = 'Checking in!';
            body = `Hi ${job.data.name},\nWe wanted to follow up on our last conversation.`;
        }
        // Delegate to our mock email sender
        const success = await sendEmail(job.data.email, subject, body);
        if (!success) {
            throw new Error('Failed to send email');
        }
        console.log(`[Worker] Job ${job.id} completed successfully.`);
    }, { connection });
    worker.on('failed', (job, err) => {
        console.error(`[Worker] Job ${job?.id} failed:`, err.message);
    });
    return worker;
};
