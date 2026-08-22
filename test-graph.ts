import { leadQualifierGraph } from './agent/graphs/leadQualifier.js';
import { HumanMessage } from '@langchain/core/messages';
import { LeadQualifierState } from './agent/state.js';

async function testAgent() {
  console.log('Testing Sales intent...');
  const salesState: LeadQualifierState = {
    messages: [new HumanMessage("I want to buy your software. My name is John. My email is john@test.com. I have a budget of $5000 and would like to schedule a meeting for 2026-08-30T10:00:00Z.")],
    extractedInfo: {},
    qualificationStatus: 'pending',
    confidenceScore: 1,
    clientId: 'test-client-id',
    leadId: 'test-lead-id'
  };

  const salesResult = await leadQualifierGraph.invoke(salesState);
  console.log('Sales result intent:', salesResult.intent);
  console.log('Sales result extracted:', salesResult.extractedInfo);
  console.log('Sales result qualification:', salesResult.qualificationStatus);
  console.log('Sales result appointment:', salesResult.appointmentTime);
  console.log('Sales response:', salesResult.messages[salesResult.messages.length - 1].content);

  console.log('\nTesting Support intent...');
  const supportState: LeadQualifierState = {
    messages: [new HumanMessage("How do I reset my password? I forgot it.")],
    extractedInfo: {},
    qualificationStatus: 'pending',
    confidenceScore: 1,
    clientId: 'test-client-id',
    leadId: 'test-lead-id'
  };

  const supportResult = await leadQualifierGraph.invoke(supportState);
  console.log('Support result intent:', supportResult.intent);
  // Escalate to human should have returned a standard response from escalateToHuman.ts
}

testAgent().catch(console.error);
