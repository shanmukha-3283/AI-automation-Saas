import { LeadQualifierState } from '../state.js';

export const qualifyLead = async (state: LeadQualifierState): Promise<Partial<LeadQualifierState>> => {
  try {
    const { extractedInfo } = state;
    
    // Simple business logic: need name and email to be qualified
    // In a real scenario, this might check budget against minimums
    if (extractedInfo.name && extractedInfo.email) {
      if (extractedInfo.budget && extractedInfo.budget < 1000) {
         return { qualificationStatus: 'disqualified' };
      }
      return { qualificationStatus: 'qualified' };
    }

    // Need more info
    return { qualificationStatus: 'pending' };
  } catch (error: any) {
    // Rule #4: Every node must handle its own error
    return {
      error: `Qualification Error: ${error.message}`,
      qualificationStatus: 'escalated' // Fallback safely
    };
  }
};
