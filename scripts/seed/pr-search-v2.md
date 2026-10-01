## Search v2

Adds search to the requests page so people can find a request by item name or by words in the justification.

**What changed**

- `GET /api/requests?q=<text>` searches item names and justifications (paginated, same response shape as before).
- Item search moves into a new `apps/api/src/search.ts` so both searches live together; `GET /api/items?q=` behaves exactly as before.
- The requests page gets a search box.

**Testing**

- New tests in `apps/api/test/search.test.ts`.
- `npm test` passes.

Draft until someone has reviewed it.
