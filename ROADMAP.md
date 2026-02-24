# ReplayDash Roadmap

## MVP (Minimum Viable Product)

The goal of the MVP is to have a **working session replay system** with basic features.

### Phase 1: Core SDK ✅ (Setup Complete)

- [x] Monorepo structure (Turborepo)
- [x] SDK package scaffolding
- [x] Shared types package
- [x] Project documentation

**Next Steps**:

- [ ] Implement DOM mutation capture (MutationObserver)
- [ ] Implement event listeners (click, scroll, input)
- [ ] Create event queue and batching system
- [ ] Implement data masking for privacy
- [ ] Add session ID generation and management
- [ ] Build HTTP client to send events to API

**Acceptance Criteria**:
- SDK can be imported and initialized
- SDK captures basic events (clicks, inputs, scrolls)
- SDK sends batched events to API endpoint
- Input values are masked by default

---

### Phase 2: Backend API ⏳ (In Progress)

- [x] NestJS app scaffolding
- [x] Prisma setup (dependencies added)
- [ ] Define Prisma schema (Session, Event, User)
- [ ] Create database migrations
- [ ] Build EventsController (POST /api/events)
- [ ] Build SessionsController (GET /api/sessions, GET /api/sessions/:id)
- [ ] Implement EventService (validation, storage)
- [ ] Implement SessionService (aggregation)
- [ ] Add CORS and API key validation
- [ ] Add error handling and logging

**Acceptance Criteria**:
- API accepts event batches from SDK
- API stores events in Postgres
- API returns session list and details
- API validates API keys

---

### Phase 3: Dashboard UI ⏳ (In Progress)

- [x] Next.js app scaffolding
- [ ] Build session list page (`/sessions`)
- [ ] Build session detail page (`/sessions/[id]`)
- [ ] Implement basic session player (replay events)
- [ ] Add data fetching (TanStack Query)
- [ ] Add loading states and error handling
- [ ] Add filtering and search for sessions
- [ ] Add basic analytics page (`/analytics`)

**Acceptance Criteria**:
- Dashboard displays list of recorded sessions
- User can click on a session to view details
- Player can replay basic events (clicks, scrolls)
- Dashboard has a clean, minimal UI

---

### Phase 4: Demo App 🔜 (Coming Soon)

- [x] Next.js demo app scaffolding
- [ ] Create sample pages with various interactions
- [ ] Integrate SDK on demo site
- [ ] Add buttons, forms, modals for testing
- [ ] Document how to use demo app

**Acceptance Criteria**:
- Demo app has SDK integrated
- Demo app has interactive elements
- Recorded sessions appear in dashboard

---

## Post-MVP Features

### Phase 5: Enhanced Player

- [ ] DOM diffing for efficient rendering
- [ ] Timeline scrubber (seek to timestamp)
- [ ] Playback speed controls (0.5x, 1x, 2x)
- [ ] Skip inactive periods
- [ ] Event annotations on timeline

### Phase 6: Privacy & Security

- [ ] Better Auth integration
- [ ] User authentication in dashboard
- [ ] Role-based access control (RBAC)
- [ ] Configurable masking rules
- [ ] GDPR compliance (data deletion)
- [ ] IP anonymization

### Phase 7: Advanced Features

- [ ] Heatmaps (click/scroll density)
- [ ] Session search (full-text)
- [ ] User identification (link sessions to users)
- [ ] Funnels (track multi-step flows)
- [ ] Error tracking integration
- [ ] Network request replay
- [ ] Console log replay

### Phase 8: Performance & Scale

- [ ] Redis caching for session metadata
- [ ] Event compression (gzip/brotli)
- [ ] Database query optimization
- [ ] WebSocket streaming for real-time events
- [ ] CDN for SDK distribution
- [ ] Horizontal scaling (load balancer)

### Phase 9: Analytics & Insights

- [ ] Dashboard stats (session count, avg duration, etc.)
- [ ] User segmentation
- [ ] Retention analysis
- [ ] Conversion tracking
- [ ] Custom event metrics
- [ ] Alerts and notifications

### Phase 10: Developer Experience

- [ ] TypeScript SDK improvements
- [ ] React SDK wrapper
- [ ] Vue/Svelte SDK wrappers
- [ ] npm package publishing
- [ ] Detailed SDK documentation
- [ ] API reference docs
- [ ] Video tutorials

---

## Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| **M1**: MVP Setup | Week 1 | ✅ Done |
| **M2**: SDK Core | Week 2 | 🔜 Next |
| **M3**: API Core | Week 3 | 🔜 Next |
| **M4**: Basic Dashboard | Week 4 | 🔜 Next |
| **M5**: Full MVP | Week 5-6 | ⏳ Planned |
| **M6**: Public Beta | Week 8+ | ⏳ Planned |

---

## Contributing

Want to contribute? Check the roadmap above and pick a task!

- **Good First Issues**: SDK event listeners, basic player controls
- **Medium Complexity**: Prisma schema, API endpoints, player timeline
- **Advanced**: DOM diffing, heatmaps, compression

Open an issue or PR to discuss before starting.

---

**Last Updated**: 2026-02-23  
**Status**: MVP in progress 🚀
