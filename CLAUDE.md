# Copperline

Internal IT equipment request portal. npm workspaces monorepo, TypeScript everywhere.

## Commands

- `npm run setup` — build db-mcp and reset the SQLite database to demo data (safe to re-run)
- `npm run dev` — web :5173, API :3001, vendor stub :4010
- `npm test` — all unit/API tests; one workspace: `npm test -w @copperline/api`
- `npm run lint` and `npm run typecheck` — run both before committing
- `npm run test:e2e` — Playwright smoke tests (starts its own servers)
- `npm run screenshot -- /dashboard --width 800` — needs `npm run dev` running

## Layout

- `apps/api` — Fastify + better-sqlite3; routes in `src/routes`, queries in `src/repo.ts`
- `apps/web` — React 19 + Vite; pages in `src/pages`, API client in `src/api.ts`
- `apps/vendor-stub` — fake vendor pricing API (rate-limited on purpose)
- `packages/shared` — types shared by web and API; change types here first
- `tools/db-mcp` — read-only MCP server for the database

## Conventions

- Auth is a stub: every API call needs an `X-User-Id` header (1 = Ava, employee; 2 = Ben, Engineering manager; 8 = Hiro, admin)
- API errors are JSON `{ error, message }`; throw `HttpError` helpers from `src/errors.ts`, never raw `Error`
- API tests: `makeTestApp()` and `as(userId)` from `apps/api/test/helpers.ts`; in-memory DB, real routes, no mocks of our own code
- ES modules, single quotes, Prettier width 100
- Conventional Commits (`feat(api): …`, `fix(web): …`); one logical change per commit

## Not app code

`workshop/`, `logs/` and `scripts/` are workshop material. Don't change them unless asked.
