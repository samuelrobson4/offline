# EventSync

Transform scattered venue event emails into a unified calendar and map view.

## Project Structure

```
eventSync/
├── backend/          # Express.js + TypeScript API
├── frontend/         # React + Vite + shadcn/ui
├── docker-compose.yml
└── README.md
```

## Tech Stack

- **Frontend:** React, TypeScript, Vite, shadcn/ui, TailwindCSS
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **AI/LLM:** Claude API (Anthropic)
- **APIs:** Gmail API, Google Maps API

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (or Docker)

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Set up database:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

4. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

## Deployment

See `docker-compose.yml` for containerized deployment options.

## Roadmap

**V1 (MVP):** Gmail extraction, calendar view, map view, place management
**V2:** EventSync-managed email addresses, improved data quality
**V3:** Direct venue integrations, real-time updates

## Contributing

All work happens on feature branches with clear commit messages.
