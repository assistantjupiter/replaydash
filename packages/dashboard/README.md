# @replaydash/dashboard

ReplayDash session replay dashboard built with Next.js 15.

## Features

- 📋 Session list with search and filtering
- 🎬 Session replay viewer (powered by rrweb-player)
- 🎨 Dark mode support
- 📱 Responsive design

## Setup

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=your-secret-api-key
```

## Development

```bash
npm run dev
```

Dashboard will be available at `http://localhost:3000`

## Build

```bash
npm run build
npm start
```

## Pages

- `/` - Home page
- `/sessions` - Session list
- `/sessions/[id]` - Session replay viewer

## Tech Stack

- **Next.js 15** - App Router + Server Components
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **rrweb-player** - Session replay
- **date-fns** - Date formatting

## License

MIT
