title: Invalid request id returns 500 instead of 400
labels: bug,api,workshop
---

`GET /api/requests/abc` (with any valid `X-User-Id`) returns **500 Internal Server Error**. The same happens for `/api/items/abc`. A malformed id is the client's mistake, so the API should say so.

**Expected:** 400 with the usual JSON error body, for example `{ "error": "validation_error", "message": "…" }`, for any id that isn't a positive whole number, on every `:id` route. Existing 404 behaviour for well-formed ids that don't exist stays the same.
