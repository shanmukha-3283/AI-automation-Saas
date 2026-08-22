import { LeadQualifierState } from '../state.js';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { clientRepository } from '../../api/repositories/index.js';

const triageSchema = z.object({
  intent: z.enum(['sales', 'support', 'other', 'unknown']).describe("The intent of the user's latest message"),
  reasoning: z.string().describe("Brief reasoning for the classification")
});

export const triageNode = async (state: LeadQualifierState): Promise<Partial<LeadQualifierState>> => {
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

    const structuredLlm = llm.withStructuredOutput(triageSchema);

    const systemPrompt = `You are a conversational triage agent. Analyze the user's messages.
Classify the intent into one of the following categories:
- 'sales': The user is inquiring about buying, pricing, services, or scheduling a meeting.
- 'support': The user is asking for help, reporting an issue, or asking a FAQ.
- 'other': Casual conversation, greetings, or irrelevant.
- 'unknown': Cannot be determined.`;

    const result = await structuredLlm.invoke([
      { role: 'system', content: systemPrompt },
      ...state.messages
    ]);

    return {
      intent: result.intent,
    };
  } catch (error: any) {
    console.error('Triage Error:', error);
    // Rule #4: Handle errors gracefully
    return {
      error: `Triage failed: ${error.message}`,
      intent: 'unknown'
    };
  }
};
