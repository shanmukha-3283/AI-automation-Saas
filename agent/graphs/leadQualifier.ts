import { StateGraph } from '@langchain/langgraph';
import { LeadQualifierState, leadQualifierStateChannels } from '../state.js';
import { extractLeadInfo } from '../nodes/extractLeadInfo.js';
import { qualifyLead } from '../nodes/qualifyLead.js';
import { escalateToHuman } from '../nodes/escalateToHuman.js';
import { generateResponse } from '../nodes/generateResponse.js';

// Define the logic for routing based on confidence and errors
const routeAfterExtraction = (state: LeadQualifierState) => {
  if (state.error || state.confidenceScore < 0.6) {
    return 'escalateToHuman';
  }
  return 'qualifyLead';
};

const builder = new StateGraph<LeadQualifierState>({
  channels: leadQualifierStateChannels,
})
  .addNode('extractLeadInfo', extractLeadInfo)
  .addNode('qualifyLead', qualifyLead)
  .addNode('escalateToHuman', escalateToHuman)
  .addNode('generateResponse', generateResponse)
  // Entry point
  .addEdge('__start__', 'extractLeadInfo')
  // Conditional Edge
  .addConditionalEdges('extractLeadInfo', routeAfterExtraction, {
    escalateToHuman: 'escalateToHuman',
    qualifyLead: 'qualifyLead'
  })
  // End nodes
  .addEdge('qualifyLead', 'generateResponse')
  .addEdge('generateResponse', '__end__')
  .addEdge('escalateToHuman', '__end__');

export const leadQualifierGraph = builder.compile();
