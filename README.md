# Copperline

Copperline is the internal IT equipment request portal for a fictional company. Employees request laptops, monitors and peripherals; their department manager approves or rejects; IT tracks stock.

## Run it

Requires Node 22.22.2+ (22.x), 24.15+ (24.x) or 26+.

```bash
npm install
npx playwright install chromium   # on Linux/WSL: npx playwright install --with-deps chromium
npm run setup
npm run dev
```

Open http://localhost:5173. Use **Signed in as** in the header to switch between demo users (employees, managers, and an admin).

| Service                | Port | Workspace          |
| ---------------------- | ---- | ------------------ |
| Web (React + Vite)     | 5173 | `apps/web`         |
| API (Fastify + SQLite) | 3001 | `apps/api`         |
| Vendor pricing stub    | 4010 | `apps/vendor-stub` |

## Commands

| Command                                        | What it does                                                                  |
| ---------------------------------------------- | ----------------------------------------------------------------------------- |
| `npm run setup`                                | Builds the database tools, then resets the SQLite database to the demo data   |
| `npm run dev`                                  | Starts web, API and vendor stub together                                      |
| `npm test`                                     | Unit and API tests (Vitest)                                                   |
| `npm run test:e2e`                             | Browser smoke tests (Playwright)                                              |
| `npm run lint` / `npm run typecheck`           | ESLint / TypeScript                                                           |
| `npm run screenshot -- /dashboard --width 800` | Saves a screenshot of a page to `.screenshots/` (needs `npm run dev` running) |

## API at a glance

All routes except `/api/health` need an `X-User-Id` header with a demo user's id.

`GET /api/me` · `GET /api/users` · `GET /api/dashboard` · `GET /api/items[?q=]` · `GET /api/items/:id` · `GET /api/items/:id/price` · `GET /api/requests[?page=&pageSize=]` · `GET /api/requests/:id` · `POST /api/requests` · `POST /api/requests/:id/approve` · `POST /api/requests/:id/reject` · `POST /api/requests/:id/cancel` · `GET /api/approvals`

## Layout

```
apps/web          React front end
apps/api          REST API, migrations, seed data
apps/vendor-stub  Local stand-in for the vendor pricing service
packages/shared   Types shared by web and API
tools/db-mcp      Read-only MCP server for the Copperline database
```
