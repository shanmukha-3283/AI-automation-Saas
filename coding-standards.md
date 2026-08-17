# Project rules

- All API routes use Hono's built-in validator middleware — never hand-roll request validation.
- Never hardcode API keys, tokens, or connection strings. Read from process.env and fail fast if missing.
- All database writes go through a repository layer (/api/repositories) — no raw queries in route handlers.
- Every LangGraph node must handle its own error case and return a typed result, not throw.
- New bot types are added as plugins (skills + mcp_config + rules), not as branches in the core agent.
- Escalation to a human is always a valid agent output — never force the agent to answer when confidence is low.
- All external integrations (calendar, CRM, WhatsApp) go through an adapter in /integrations, never called directly from agent code.
