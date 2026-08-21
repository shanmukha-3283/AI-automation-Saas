import { LeadQualifierState } from '../state.js';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { clientRepository } from '../../api/repositories/index.js';

const extractionSchema = z.object({
  name: z.string().optional().describe("The lead's name"),
  email: z.string().optional().describe("The lead's email address"),
  company: z.string().optional().describe("The lead's company"),
  budget: z.number().optional().describe("The lead's budget in USD")
});

export const extractLeadInfo = async (state: LeadQualifierState): Promise<Partial<LeadQualifierState>> => {
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

    const structuredLlm = llm.withStructuredOutput(extractionSchema);

    // Extract information based on conversation history
    const result = await structuredLlm.invoke([
      { role: 'system', content: 'Extract lead information from the conversation. If a field is not mentioned, leave it empty.' },
      ...state.messages
    ]);

    return {
      extractedInfo: result,
      confidenceScore: 0.9 // High confidence if extraction parsing succeeded
    };
  } catch (error: any) {
    // Rule #4: Every node must handle its own error and return typed result, not throw
    console.error('LLM Extraction Error:', error);
    return {
      error: `Failed to extract lead info: ${error.message}`,
      confidenceScore: 0.2 // Low confidence on error triggers escalation
    };
  }
};
