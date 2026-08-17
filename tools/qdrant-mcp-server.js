#!/usr/bin/env node
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function sendResponse(response) {
  process.stdout.write(JSON.stringify(response) + '\n');
}

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    if (!request.id && request.method) {
      // Notification
      return;
    }

    switch (request.method) {
      case 'initialize':
        sendResponse({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            protocolVersion: request.params?.protocolVersion || '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'qdrant-dev', version: '1.0.0' }
          }
        });
        break;

      case 'ping':
        sendResponse({ jsonrpc: '2.0', id: request.id, result: {} });
        break;

      case 'tools/list':
        sendResponse({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            tools: [
              {
                name: 'qdrant_search',
                description: 'Search or manage vector collections in Qdrant vector database',
                inputSchema: {
                  type: 'object',
                  properties: {
                    collection: { type: 'string', description: 'Name of the vector collection' },
                    query: { type: 'string', description: 'Search term or vector query' }
                  },
                  required: ['collection', 'query']
                }
              }
            ]
          }
        });
        break;

      case 'tools/call':
        const { name, arguments: args } = request.params || {};
        if (name === 'qdrant_search') {
          const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
          sendResponse({
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `Qdrant MCP Server Connected (${qdrantUrl}). Collection: ${args?.collection}, Query: ${args?.query}`
                }
              ]
            }
          });
        } else {
          sendResponse({
            jsonrpc: '2.0',
            id: request.id,
            error: { code: -32601, message: `Tool non-existent: ${name}` }
          });
        }
        break;

      default:
        sendResponse({
          jsonrpc: '2.0',
          id: request.id,
          error: { code: -32601, message: `Method not found: ${request.method}` }
        });
        break;
    }
  } catch (err) {
    // Ignore invalid JSON lines
  }
});
