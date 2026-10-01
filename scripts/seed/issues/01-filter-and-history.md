title: Filter requests by status and show approval history
labels: feature,api,ui,workshop
---

Managers and employees can't narrow the requests list, and nobody can see who approved or rejected a request.

**Asked for**

- A status filter on the requests page (All, Pending, Approved, Rejected, Fulfilled, Cancelled). The API should accept `GET /api/requests?status=pending`, and the page count must reflect the filter.
- An approval history for each request: who submitted it, who approved, rejected or cancelled it, when, and any note. Every status change is already recorded in the `request_events` table, but nothing exposes it.

**Acceptance**

- `GET /api/requests?status=<status>` returns only that status; an unknown status returns 400.
- `GET /api/requests/:id/events` returns the history oldest first, with the actor's name. It follows the same visibility rules as `GET /api/requests/:id`.
- The requests page has a status filter and a way to show a request's history.
- Tests cover the new API behaviour.
