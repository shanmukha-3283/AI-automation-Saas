import { leadRepository } from '../api/repositories/index.js';
import { followUpQueue } from './bullmq-setup.js';
import 'dotenv/config';

// Function to poll the database and enqueue inactive leads
export async function scheduleFollowUps() {
  console.log('[Cron] Checking for inactive leads...');
  try {
    // Find leads inactive for more than 24 hours
    // (For MVP demo purposes, you can change this to 0.01 for ~36 seconds)
    const INACTIVE_HOURS = Number(process.env.INACTIVE_HOURS_THRESHOLD) || 24;
    const inactiveLeads = await leadRepository.findInactive(INACTIVE_HOURS);

    console.log(`[Cron] Found ${inactiveLeads.length} inactive leads.`);

    for (const lead of inactiveLeads) {
      console.log(`[Cron] Enqueueing follow-up for lead ${lead.email}`);
      
      await followUpQueue.add('send-followup', {
        clientId: lead.clientId,
        leadId: lead.id,
        email: lead.email,
        name: lead.name,
        phone: lead.phone,
        type: 'check-in'
      });

      // To prevent spamming them on the next tick, we can update their status or updatedAt
      // For this MVP, we'll just bump their updatedAt so they get another 24 hours
      await leadRepository.update(lead.clientId, lead.id, {}); 
    }
  } catch (error) {
    console.error('[Cron] Error scheduling follow-ups:', error);
  }
}

// In a real production system, this would be triggered by a Scheduler (like node-cron or a BullMQ Repeatable Job)
// Here, we just export the function and can run it via a setInterval if imported.

export function startCronJob() {
  console.log('[Cron] Starting follow-up scheduler...');
  // Run every 60 seconds
  setInterval(scheduleFollowUps, 60 * 1000);
}
