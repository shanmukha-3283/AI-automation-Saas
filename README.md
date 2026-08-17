# AI Business Automation Platform (SaaS)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Hono](https://img.shields.io/badge/Hono-v4-orange)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle-blue?logo=postgresql)
![Claude 3.5](https://img.shields.io/badge/AI-Claude_3.5_Sonnet-purple)

A true multi-tenant B2B SaaS platform that allows businesses to automate their WhatsApp lead generation and customer support using autonomous AI agents powered by LangGraph and Claude 3.5 Sonnet.

## ✨ Core Features

- **Multi-Tenant Architecture:** Secure, isolated data spaces for every client.
- **Next.js Dashboard:** A modern, real-time command center for businesses to monitor their AI pipelines, configure settings, and intervene in live chats.
- **Autonomous AI Agents:** LangGraph-powered state machines that can qualify leads, extract business requirements, and answer FAQs using conversational empathy.
- **Twilio WhatsApp Integration:** Dynamic webhook routing allowing clients to bring their own Twilio credentials.
- **Built-in NextAuth Security:** Secure authentication for dashboard access.
- **Extensible Database:** Fully typed schema using Drizzle ORM mapped to PostgreSQL.

---

## 🏗️ System Architecture

The platform operates as a modern monorepo, keeping the backend API and frontend Dashboard closely aligned.

```
ai-automations/
├── api/             # Hono API Gateway (Webhooks, Client Config, Lead Management)
├── agent/           # LangGraph State Machine (Nodes: Qualify, Extract, Generate)
├── dashboard/       # Next.js 16 App Router (NextAuth, Tailwind, Shadcn UI)
├── db/              # Drizzle ORM schemas and migrations
├── integrations/    # External Providers (Dynamic Twilio Adapter)
├── rag/             # Vector embeddings for semantic FAQ retrieval
└── workers/         # BullMQ async jobs (Follow-ups, escalations)
```

### The AI Pipeline (LangGraph)
Whenever a WhatsApp message is received, it is processed through a state graph:
1. **Determine intent:** Is the user asking a question, or are we qualifying them?
2. **Extract Information:** Identify Names, Emails, and Budgets dynamically.
3. **Guardrails & Context:** Execute against a dynamic `System Prompt` tied to the client's specific business context.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v20+)
- PostgreSQL Database
- Twilio Account (for WhatsApp Sandbox/Production)
- Anthropic API Key (for Claude 3.5 Sonnet)

### 2. Environment Variables

Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_automations

# API & Auth
PORT=3000
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:3001

# AI Providers
ANTHROPIC_API_KEY=sk-ant-xxx...
```

Create a `.env.local` inside the `dashboard/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-key-here
```

### 3. Installation & Setup

Install dependencies across the monorepo:
```bash
npm install
npm install --prefix dashboard
```

Run database migrations and seed the initial multi-tenant test client:
```bash
npx drizzle-kit push
npm run seed
```
*(The seed script provisions a root user: `admin@testbusiness.com` with password `password`)*

### 4. Running the Application

**Start the Hono API Backend (Port 3000):**
```bash
npm run dev
```

**Start the Next.js Dashboard (Port 3001):**
```bash
npm run dashboard:dev
```

Navigate to `http://localhost:3001` to login and access the command center.

---

## 🔧 Configuring WhatsApp Webhooks

To connect your Twilio WhatsApp number to the system:
1. Go to your Dashboard **Settings**.
2. Input your `Twilio Account SID` and `Auth Token`.
3. In your Twilio Console, configure the WhatsApp incoming webhook to point to:
   `https://<your-domain>/api/webhook/<your-client-id>`

---

## 🗺️ Roadmap & Phases

- [x] **Phase 1:** Core LLM Agents & Information Extraction
- [x] **Phase 2:** WhatsApp Integration & Memory Persistence
- [x] **Phase 3:** Multi-Tenancy & Secure Authentication
- [ ] **Phase 4:** Google Calendar Booking & Scheduling Integration (In Progress)
- [ ] **Phase 5:** WebSockets for Live UI Chat Streaming

---
*Built for scale, designed for modern AI automation.*
