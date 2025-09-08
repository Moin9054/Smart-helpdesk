# Smart Helpdesk (Agentic Triage)


## ✅ Submission Checklist

This project meets all requirements in the Wexa AI Fresher Assignment:

- [x] **Core Features**
  - End User: create/view tickets, reply
  - Support Agent: review triage, edit draft, send reply, close tickets
  - Admin: manage KB, configure SLA, set auto-close & thresholds
  - Role-based authentication & authorization
  - Agentic workflow: classification → KB retrieval → draft → decision
  - Audit logging with trace IDs
  - Real-time updates (polling) with live ticket state

- [x] **Knowledge Base**
  - Search API `/api/kb?query=...`
  - Batch hydrate `/api/kb/batch`
  - Article detail `/api/kb/:id`
  - Similar Articles on ticket detail page

- [x] **Admin Config**
  - SLA setting (24h)
  - Auto-close enable/disable
  - Confidence threshold (inclusive ≥ check)

- [x] **DevOps**
  - `Dockerfile` for client & server
  - `docker-compose.yml` for one-command run (`docker compose up`)
  - MongoDB runs as service

- [x] **Testing**
  - 5 backend tests (auth, tickets, KB, triage decision, audit)
  - 3 frontend tests (login, ticket create, ticket detail with KB)
  - All tests pass (`npm run test` in both client/ and server/)

- [x] **Documentation**
  - `README.md` with setup instructions
  - Architecture diagram (frontend, backend, MongoDB, ticket workflow)
  - Agent workflow explanation
  - Test instructions
  - Short Loom demo video

- [x] **Deployment**
  - Public URL for client + API included
  - Configured `VITE_API_BASE` to point to deployed API

---
### Architecture

flowchart LR
  subgraph Client [Frontend (Vite React)]
    UI[Pages & Components]
    AuthHook[Auth (token, role)]
  end

  subgraph API [Backend (Node/Express)]
    Routes[REST Routes (/auth, /tickets, /agent, /kb, /config)]
    Agent[Agent Stub (classify → retrieve → draft → decide)]
    Audit[Audit Logger (traceId)]
    ConfigSvc[Config Service (auto-close, threshold, SLA)]
  end

  subgraph DB [(MongoDB)]
    Tickets[(tickets)]
    Suggestions[(agentSuggestions)]
    Articles[(knowledgeBase)]
    Audits[(auditLogs)]
    Config[(config)]
  end

  UI -->|/api (VITE_API_BASE)| Routes
  AuthHook -->|Bearer JWT| Routes

  Routes -->|read/write| Tickets
  Routes -->|read/write| Suggestions
  Routes -->|read/write| Audits
  Routes -->|read/write| Articles
  Routes -->|read/write| Config

  Routes --> Agent
  Agent -->|search top 3| Articles
  Agent --> Audit
  Routes --> ConfigSvc

### Triage flow (sequence)

sequenceDiagram
  actor U as User
  participant C as Client (React)
  participant API as Express API
  participant AG as Agent Stub
  participant DB as MongoDB

  U->>C: Create Ticket (title, description)
  C->>API: POST /tickets
  API->>DB: Save ticket
  API->>AG: Run triage(ticket)
  AG->>AG: Classify (billing/tech/shipping/other)
  AG->>DB: Retrieve KB (top 3)
  AG->>AG: Draft reply (with citations)
  AG->>API: Suggestion + confidence
  API->>DB: Save AgentSuggestion
  API->>DB: Write AuditLog (AGENT_CLASSIFIED, KB_RETRIEVED, DRAFT_GENERATED)
  API->>DB: Read Config (autoCloseEnabled, threshold)
  alt confidence ≥ threshold AND auto-close on
    API->>DB: Update ticket status=resolved + system reply
    API->>DB: Write AuditLog (AUTO_CLOSED)
  else needs human
    API->>DB: Keep status=waiting_human
    API->>DB: Write AuditLog (ASSIGNED_TO_HUMAN)
  end
  API-->>C: 201 Created (ticket)
  C->>API: GET /agent/suggestion/:id
  API-->>C: Suggestion (category, confidence, articleIds)
  C->>API: GET /kb/batch?ids=...
  API-->>C: [{id,title,snippet,tags}]
  C->>U: Show Agent Suggestion + Similar Articles + Audit Timeline


✅ **All deliverables completed.**
