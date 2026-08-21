import { AIMessage } from '@langchain/core/messages';
export const escalateToHuman = async (state) => {
    try {
        // Rule #6: Escalation to human is a valid output
        const escalationMessage = new AIMessage("I'm connecting you with a human representative who can assist you further.");
        return {
            qualificationStatus: 'escalated',
            messages: [escalationMessage]
        };
    }
    catch (error) {
        return {
            error: `Escalation Node Error: ${error.message}`
        };
    }
};
