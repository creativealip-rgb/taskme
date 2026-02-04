# TaskMe - Task Management Application

A modern task management application built with Next.js, Express, and TypeScript. Features include Kanban board, calendar view, and project management.

## Tech Stack

- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: SQLite with Drizzle ORM (mock database for development)
- **Authentication**: Better-Auth

## Features

- ✅ Kanban Board with drag-and-drop
- ✅ Calendar View for task visualization
- ✅ List View for task management
- ✅ Project-based task organization
- ✅ Create/Edit/Delete tasks
- ✅ Priority and status management
- ✅ Responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/creativealip-rgb/taskme.git
cd taskme
```

2. Install dependencies:
```bash
pnpm install
```

### Running the Project

The project requires two servers running simultaneously:

**Terminal 1 - Start the API Server:**
```bash
cd apps/api
npx tsx src/index.ts
```
API runs on: http://localhost:3000

**Terminal 2 - Start the Next.js Application:**
```bash
cd apps/nextjs
npx next dev -p 3002
```
App runs on: http://localhost:3002

## Project Structure

```
taskme/
├── apps/
│   ├── api/              # Express API backend
│   │   └── src/
│   │       ├── config/   # Database & auth config
│   │       ├── controllers/  # Route handlers
│   │       ├── routes/       # API routes
│   │       ├── services/     # Business logic
│   │       └── db/           # Drizzle schema
│   │
│   └── nextjs/           # Next.js frontend
│       └── src/
│           ├── app/          # App Router pages
│           │   └── (dashboard)/   # Dashboard routes
│           ├── components/   # React components
│           │   ├── calendar/
│           │   ├── dashboard/
│           │   ├── layout/
│           │   ├── project/
│           │   └── tasks/
│           ├── actions/      # Server actions
│           ├── lib/           # Utilities & API client
│           └── types/         # TypeScript types
```

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Workspaces
- `GET /api/workspaces` - Get all workspaces
- `POST /api/workspaces` - Create a workspace
- `DELETE /api/workspaces/:id` - Delete a workspace

## Mock Data

The project uses in-memory mock data for development. Default data includes:

- 3 sample tasks
- 4 sample projects (Website Redesign, Mobile App, Marketing, Internal Tools)

## Development Notes

- The API runs on port 3000
- The Next.js app runs on port 3002
- No authentication required (uses mock auth)
- Changes persist in memory (reset on server restart)

## License

MIT
