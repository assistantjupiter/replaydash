# ReplayDash

> Session replay and analytics platform for modern web applications

ReplayDash is an open-source session recording and analytics tool that helps you understand how users interact with your web application. Record user sessions, replay them, and gain insights into user behavior, bugs, and UX issues.

## 🚀 Features (Roadmap)

- **Session Recording** - Capture DOM mutations, clicks, scrolls, and user inputs
- **Session Replay** - Watch recordings of user sessions with a video-like player
- **Privacy Controls** - Mask sensitive data (inputs, text, elements)
- **Event Tracking** - Track custom events and user actions
- **Analytics Dashboard** - View session statistics and user insights
- **Network Monitoring** - Capture API calls and network requests
- **Error Tracking** - Automatically capture JavaScript errors and stack traces
- **User Identification** - Associate sessions with user profiles

## 📦 Monorepo Structure

This project uses **Turborepo** to manage multiple packages:

```
replaydash/
├── apps/
│   ├── dashboard/       # Next.js admin dashboard
│   ├── api/             # NestJS backend API
│   └── demo/            # Demo site for testing SDK
├── packages/
│   ├── sdk/             # JavaScript SDK for browsers
│   └── shared/          # Shared TypeScript types
└── docs/                # Documentation
```

## 🛠 Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript + Prisma
- **SDK**: Vanilla TypeScript (browser-only)
- **Database**: PostgreSQL (via Prisma)
- **Monorepo**: Turborepo
- **Auth**: Better Auth (coming soon)

## 🏃 Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10

### Installation

```bash
# Install dependencies
npm install

# Start all apps in development mode
npm run dev

# Or start specific apps
cd apps/dashboard && npm run dev   # Dashboard on :3000
cd apps/api && npm run dev          # API on :3001
cd apps/demo && npm run dev         # Demo on :3002
```

### Build

```bash
# Build all packages
npm run build

# Build specific package
cd apps/dashboard && npm run build
```

## 📚 Documentation

See the `/docs` folder for detailed documentation:

- **ARCHITECTURE.md** - System design and architecture
- **ROADMAP.md** - Planned features and milestones

## 🧪 Using the SDK

```typescript
import { init } from '@replaydash/sdk';

const replay = init({
  apiKey: 'your-api-key',
  endpoint: 'https://api.replaydash.com/events',
  maskAllInputs: true,
});

// Track custom events
replay.track('button_clicked', {
  buttonId: 'signup',
  page: '/home',
});

// Stop recording
replay.stop();
```

## 🤝 Contributing

Contributions are welcome! This is an MVP in active development.

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ for better user insights
