import { LeadQualifierState } from '../state.js';

export const qualifyLead = async (state: LeadQualifierState): Promise<Partial<LeadQualifierState>> => {
  try {
    const { extractedInfo } = state;
    
    // Business logic: require name, email, and a valid budget > 0
    if (extractedInfo.name && extractedInfo.email) {
      if (extractedInfo.budget !== undefined) {
        if (extractedInfo.budget <= 0) {
          return { qualificationStatus: 'disqualified' };
        }
        return { qualificationStatus: 'qualified' };
      }
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
