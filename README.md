# DevTrack

A ClickUp-style task tracking tool for dev teams. Simple, self-hosted Kanban boards with team collaboration.

## Features

- **Kanban Boards** — Drag-and-drop task management across customizable columns
- **Team Collaboration** — Invite team members, assign tasks, leave comments
- **Task Organization** — Priorities (Low/Medium/High/Urgent), labels, due dates, activity logs
- **Real-time Updates** — See changes instantly as your team works
- **Dark UI** — Easy on the eyes, built with Tailwind CSS

## Quick Start

### Docker (Recommended)

```bash
cd ~/devtrack
docker compose up --build
```

Then open **http://localhost:3000** and log in:
- Email: `alice@devtrack.io`
- Password: `password123`

### Manual Setup

Requires Node 20+, PostgreSQL 16+:

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

## Architecture

```
app/              Next.js 14 App Router (pages + API)
components/       React components (board, tasks, modals)
lib/              Utilities, auth, Prisma client
prisma/           Database schema & migrations
scripts/          Helper scripts
```

## Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Node.js, Next.js API routes
- **Database:** PostgreSQL 16 + Prisma ORM
- **Auth:** NextAuth.js (email/password)
- **DnD:** @hello-pangea/dnd

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/auth/register` | POST | User registration |
| `/api/projects` | GET/POST | List/create projects |
| `/api/projects/[id]` | GET/PATCH/DELETE | Project details & updates |
| `/api/projects/[id]/members` | POST | Invite team members |
| `/api/tasks` | POST | Create task |
| `/api/tasks/[id]` | GET/PATCH/DELETE | Task details & updates |
| `/api/tasks/[id]/move` | POST | Move task to column |
| `/api/tasks/[id]/comments` | POST | Add comment |
| `/api/columns` | POST | Create column |
| `/api/columns/[id]` | PATCH/DELETE | Update/delete column |
| `/api/labels` | POST | Create label |

## Development

### Running Tests

```bash
npm run lint
```

### Database

View schema:
```bash
npx prisma studio
```

Reset database:
```bash
docker compose down -v
docker compose up --build
```

## Deployment

Build for production:
```bash
npm run build
npm start
```

Docker image is automatically built when running `docker compose up --build`.

## License

MIT
