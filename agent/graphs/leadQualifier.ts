import { StateGraph } from '@langchain/langgraph';
import { LeadQualifierState, leadQualifierStateChannels } from '../state.js';
import { triageNode } from '../nodes/triageNode.js';
import { extractLeadInfo } from '../nodes/extractLeadInfo.js';
import { qualifyLead } from '../nodes/qualifyLead.js';
import { scheduleAppointment } from '../nodes/scheduleAppointment.js';
import { escalateToHuman } from '../nodes/escalateToHuman.js';
import { generateResponse } from '../nodes/generateResponse.js';

// Define the logic for routing based on triage intent
const routeAfterTriage = (state: LeadQualifierState) => {
  if (state.error || state.intent === 'support' || state.intent === 'other' || state.intent === 'unknown') {
    return 'escalateToHuman';
  }
  return 'extractLeadInfo'; // Default to sales flow
};

// Route after qualification
const routeAfterQualification = (state: LeadQualifierState) => {
  if (state.qualificationStatus === 'qualified') {
    return 'scheduleAppointment';
  }
  return 'generateResponse';
};

const builder = new StateGraph<LeadQualifierState>({
  channels: leadQualifierStateChannels,
})
  .addNode('triageNode', triageNode)
  .addNode('extractLeadInfo', extractLeadInfo)
  .addNode('qualifyLead', qualifyLead)
  .addNode('scheduleAppointment', scheduleAppointment)
  .addNode('escalateToHuman', escalateToHuman)
  .addNode('generateResponse', generateResponse)
  // Entry point
  .addEdge('__start__', 'triageNode')
  // Conditional Edge out of Triage
  .addConditionalEdges('triageNode', routeAfterTriage, {
    extractLeadInfo: 'extractLeadInfo',
    escalateToHuman: 'escalateToHuman'
  })
  // Sales flow
  .addEdge('extractLeadInfo', 'qualifyLead')
  .addConditionalEdges('qualifyLead', routeAfterQualification, {
    scheduleAppointment: 'scheduleAppointment',
    generateResponse: 'generateResponse'
  })
  .addEdge('scheduleAppointment', 'generateResponse')
  // End nodes
  .addEdge('generateResponse', '__end__')
  .addEdge('escalateToHuman', '__end__');

export const leadQualifierGraph = builder.compile();
