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
    if (!line.trim())
        return;
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
                        serverInfo: { name: 'postgres-dev', version: '1.0.0' }
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
                                name: 'query_postgres',
                                description: 'Execute SQL queries or inspect schema on the development PostgreSQL database',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        query: { type: 'string', description: 'SQL statement or query to execute' }
                                    },
                                    required: ['query']
                                }
                            }
                        ]
                    }
                });
                break;
            case 'tools/call':
                const { name, arguments: args } = request.params || {};
                if (name === 'query_postgres') {
                    const dbUrl = process.env.DATABASE_URL || 'postgres://localhost:5432/ai_automation_dev';
                    sendResponse({
                        jsonrpc: '2.0',
                        id: request.id,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: `PostgreSQL MCP Server Connected (${dbUrl}). Query: ${args?.query || ''}`
                                }
                            ]
                        }
                    });
                }
                else {
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
    }
    catch (err) {
        // Ignore invalid JSON lines
    }
});
export {};
