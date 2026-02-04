# AGENTS.md - Task Manager Development Guide

## Build Commands

### Root (Monorepo)
```bash
# Install dependencies
pnpm install

# Development (runs all apps)
pnpm dev

# Production build
pnpm build

# Lint all packages
pnpm lint

# Database commands (API app)
pnpm db:generate   # Generate Drizzle migrations
pnpm db:migrate    # Run migrations
pnpm db:push       # Push schema changes
pnpm db:studio     # Open Drizzle Studio
```

### Web App (apps/web)
```bash
cd apps/web
pnpm dev           # Start Vite dev server
pnpm build         # TypeScript check + Vite build
pnpm lint          # ESLint
pnpm preview       # Preview production build
```

### API App (apps/api)
```bash
cd apps/api
pnpm dev           # Start with nodemon + tsx
pnpm dev:tsx       # Alternative: tsx watch
pnpm build         # TypeScript compilation
pnpm start         # Run compiled JS
```

## Test Commands

**Note:** No test framework is configured. To add tests:

```bash
# Add Vitest for both apps
pnpm add -D vitest @vitest/ui

# After setup, run tests:
pnpm test              # All tests
pnpm test -- --run     # Run once (no watch)
pnpm test path/file.test.ts  # Single file
```

## Code Style Guidelines

### General
- **Language**: TypeScript 5.x with strict mode
- **Module**: ES modules (`"type": "module"`)
- **Quotes**: Single quotes for strings, backticks for templates
- **Semicolons**: Required
- **Indentation**: 2 spaces

### Imports
- External packages first, then internal modules
- Use `.js` extension in imports (NodeNext resolution)
- Order: React/Express → Services → Components → Types
- Named exports preferred over default exports

### Naming Conventions
- **Components**: PascalCase (e.g., `TaskModal.tsx`)
- **Functions/Variables**: camelCase (e.g., `handleAddTask`)
- **Interfaces/Types**: PascalCase (e.g., `TaskFilters`)
- **Enums**: PascalCase with UPPER_SNAKE_CASE values
- **Files**: camelCase for utilities, PascalCase for components

### TypeScript
- Explicit return types on exported functions
- Prefer `interface` over `type` for object shapes
- Use `enum` for status/priority values
- Strict null checks enabled
- Avoid `any` - use `unknown` or proper types

### Error Handling
- Use try-catch with `next(error)` in Express controllers
- Custom ApiError class for API errors with validation
- Zod for runtime validation schemas
- Always handle async errors in controllers

### React (Web)
- Functional components with hooks
- Custom hooks for data fetching (e.g., `useTasks.ts`)
- Context API for auth state (AuthContext)
- Tailwind CSS for styling
- Controlled components for forms

### API (Express)
- Controller class pattern (e.g., `TasksController`)
- Service layer for business logic
- Middleware for auth and error handling
- Route files in `routes/` directory
- Zod schemas for request validation

### Database (Drizzle)
- Schema definitions in `db/schema.ts`
- Service methods for queries
- Better-sqlite3 for local development
- Migrations with drizzle-kit

### Linting
- ESLint with TypeScript parser (typescript-eslint)
- React hooks and refresh plugins
- No unused vars (except capitalized patterns)
- Run `pnpm lint` before committing

## Project Structure

```
apps/
  web/              # React + Vite frontend
    src/
      components/   # React components
      hooks/        # Custom hooks
      contexts/     # React contexts
      services/     # API clients
      types/        # TypeScript types
  api/              # Express backend
    src/
      controllers/  # Route handlers
      services/     # Business logic
      routes/       # Route definitions
      middleware/   # Express middleware
      db/           # Database config
```

## Environment Setup

1. Copy `apps/api/.env.example` to `apps/api/.env`
2. Set `FRONTEND_URL` (default: http://localhost:5173)
3. Database auto-creates SQLite file

## Common Issues

- **Build fails**: Check TypeScript strict errors
- **API errors**: Verify env vars and database connection
- **Import errors**: Use `.js` extensions in imports
- **Auth issues**: Check better-auth configuration
