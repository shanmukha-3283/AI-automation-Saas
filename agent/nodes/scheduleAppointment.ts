import { LeadQualifierState } from '../state.js';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { clientRepository } from '../../api/repositories/index.js';
import { calendarIntegration } from '../../integrations/calendar.js';

const appointmentSchema = z.object({
  requestedTime: z.string().optional().describe("The requested meeting time in ISO format (e.g. 2026-08-25T10:00:00Z) if mentioned."),
  isSchedulingRequested: z.boolean().describe("Whether the user actually requested or agreed to schedule a meeting.")
});

export const scheduleAppointment = async (state: LeadQualifierState): Promise<Partial<LeadQualifierState>> => {
  try {
    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0,
      callbacks: [
        {
          handleLLMEnd: async (output: any) => {
            const tokens = output.llmOutput?.tokenUsage?.totalTokens || 0;
            if (tokens > 0 && state.clientId) {
              await clientRepository.incrementTokenUsage(state.clientId, tokens);
            }
          }
        }
      ]
    });

    const structuredLlm = llm.withStructuredOutput(appointmentSchema);

    // Extract appointment details based on conversation history
    const result = await structuredLlm.invoke([
      { role: 'system', content: 'Extract any mentioned appointment scheduling requests. Only mark isSchedulingRequested if they explicitly agree to a time or ask for one.' },
      ...state.messages
    ]);

    if (result.isSchedulingRequested && result.requestedTime) {
      const startTime = new Date(result.requestedTime);
      const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minute meeting
      
      if (state.clientId && state.leadId) {
        await calendarIntegration.scheduleAppointment(state.clientId, state.leadId, startTime, endTime);
      }
    }

    return {
      appointmentTime: result.requestedTime || null
    };
  } catch (error: any) {
    console.error('Scheduling Error:', error);
    return {
      error: `Failed to schedule: ${error.message}`
    };
  }
};
