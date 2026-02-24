# ReplayDash

Session replay and event tracking platform for debugging production issues.

## Project Structure

```
replaydash/
├── packages/
│   ├── sdk/        # JavaScript SDK for browser event capture
│   ├── api/        # NestJS backend API
│   └── dashboard/  # Next.js replay viewer
```

## Quick Start

### Install Dependencies
```bash
npm install
```

### Development
```bash
# Run SDK in dev mode
npm run dev:sdk

# Run API server
npm run dev:api

# Run dashboard
npm run dev:dashboard
```

### Build
```bash
npm run build
```

## Tech Stack

- **SDK:** TypeScript + rrweb + Vite
- **API:** NestJS + Prisma + PostgreSQL + Bull
- **Dashboard:** Next.js 15 + TypeScript + Tailwind CSS + Better Auth

## License

MIT
