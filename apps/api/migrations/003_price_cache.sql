CREATE TABLE price_cache (
  item_id INTEGER PRIMARY KEY REFERENCES items(id),
  unit_cost_cents INTEGER NOT NULL,
  fetched_at TEXT NOT NULL
);
