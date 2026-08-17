import { BaseMessage } from '@langchain/core/messages';
import { StateGraph, StateGraphArgs } from '@langchain/langgraph';

// Data we want to extract about the lead
export interface ExtractedLeadInfo {
  name?: string;
  email?: string;
  company?: string;
  budget?: number;
}

// Global Agent State
export interface LeadQualifierState {
  // Conversation history
  messages: BaseMessage[];
  
  // Extraction progress
  extractedInfo: ExtractedLeadInfo;
  
  // Business logic outputs
  qualificationStatus: 'pending' | 'qualified' | 'disqualified' | 'escalated';
  confidenceScore: number; // 0 to 1
  
  // Any errors encountered in nodes (Rule #4)
  error?: string;
}

// Reducers define how state updates are applied.
export const leadQualifierStateChannels: StateGraphArgs<LeadQualifierState>["channels"] = {
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  },
  extractedInfo: {
    value: (x: ExtractedLeadInfo, y: ExtractedLeadInfo) => ({ ...x, ...y }),
    default: () => ({}),
  },
  qualificationStatus: {
    value: (x: 'pending' | 'qualified' | 'disqualified' | 'escalated', y: 'pending' | 'qualified' | 'disqualified' | 'escalated') => y,
    default: () => 'pending',
  },
  confidenceScore: {
    value: (x: number, y: number) => y,
    default: () => 1.0,
  },
  error: {
    value: (x: string | undefined, y: string | undefined) => y,
    default: () => undefined,
  },
};
