# Project structure

```
ai-automation-platform/
├── mcp_config.json          # Antigravity MCP servers (workspace-level)
├── rules/
│   └── coding-standards.md  # Antigravity project rules
├── plugins/
│   ├── lead-qualifier/
│   │   ├── plugin.json
│   │   ├── mcp_config.json
│   │   └── skills/
│   ├── support-bot/
│   │   ├── plugin.json
│   │   ├── mcp_config.json
│   │   └── skills/
│   └── follow-up-bot/
│       ├── plugin.json
│       ├── mcp_config.json
│       └── skills/
├── api/                      # Hono gateway
│   ├── routes/
│   ├── repositories/         # all DB writes go through here
│   └── index.ts
├── agent/                    # LangGraph agent core
│   ├── graphs/
│   ├── nodes/
│   └── index.ts
├── workers/                  # BullMQ job queue
│   ├── jobs/
│   └── index.ts
├── integrations/              # adapters — calendar, CRM, WhatsApp, email
│   ├── calendar.ts
│   ├── whatsapp.ts
│   └── crm.ts
├── db/
│   ├── schema.sql            # Postgres schema
│   └── migrations/
├── rag/
│   └── qdrant-client.ts       # vector DB wiring
├── dashboard/                 # Next.js + Tailwind + shadcn/ui
│   ├── app/
│   └── components/
└── tools/                     # local MCP servers used only in dev
    ├── postgres-mcp-server.js
    └── qdrant-mcp-server.js
```

## Build order

1. `api/` — gateway skeleton, health check route
2. `agent/` — single LangGraph workflow (lead qualifier only)
3. `db/schema.sql` — leads, conversations, appointments tables
4. `rag/` — wire Qdrant, ingest one client's FAQ doc
5. `workers/` — reminder + follow-up jobs
6. `dashboard/` — live conversation view + basic analytics

Get step 1–4 working end-to-end as one vertical slice before adding `support-bot` or `follow-up-bot` plugins. That slice is your demo.
