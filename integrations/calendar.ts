import { db } from '../api/repositories/index.js';
import * as schema from '../db/schema.js';

export class CalendarIntegration {
  /**
   * Mocks a Google Calendar insertion by inserting into our local appointments table.
   */
  async scheduleAppointment(clientId: string, leadId: string, startTime: Date, endTime: Date) {
    try {
      console.log(`[Calendar Integration] Scheduling appointment for lead ${leadId} at ${startTime}`);
      
      const [appointment] = await db.insert(schema.appointments).values({
        clientId,
        leadId,
        startTime,
        endTime,
        status: 'scheduled'
      }).returning();
      
      console.log(`[Calendar Integration] Successfully booked appointment ID: ${appointment.id}`);
      return appointment;
    } catch (error) {
      console.error('[Calendar Integration] Failed to schedule appointment:', error);
      throw error; // Let the LangGraph node catch and handle it
    }
  }
}

export const calendarIntegration = new CalendarIntegration();
