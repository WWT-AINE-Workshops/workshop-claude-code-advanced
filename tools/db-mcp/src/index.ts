#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { describeTable, listTables, openReadOnly, runQuery } from './tools.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const dbFile = process.env.COPPERLINE_DB ?? join(repoRoot, 'apps', 'api', 'data', 'copperline.db');
if (!existsSync(dbFile)) {
  console.error(`copperline-db: no database at ${dbFile}. Run "npm run setup" first.`);
  process.exit(1);
}
const db = openReadOnly(dbFile);

const text = (value: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
});
const fail = (err: unknown) => ({
  content: [{ type: 'text' as const, text: err instanceof Error ? err.message : String(err) }],
  isError: true,
});

const server = new McpServer({ name: 'copperline-db', version: '1.0.0' });

server.registerTool(
  'list_tables',
  { description: 'List the tables in the Copperline SQLite database.', inputSchema: {} },
  async () => text(listTables(db)),
);

server.registerTool(
  'describe_table',
  { description: 'Show the columns of one Copperline table.', inputSchema: { table: z.string() } },
  async ({ table }) => {
    try {
      return text(describeTable(db, table));
    } catch (err) {
      return fail(err);
    }
  },
);

server.registerTool(
  'query',
  {
    description:
      'Run a read-only SELECT against the Copperline database. Returns at most 200 rows.',
    inputSchema: { sql: z.string() },
  },
  async ({ sql }) => {
    try {
      return text(runQuery(db, sql));
    } catch (err) {
      return fail(err);
    }
  },
);

await server.connect(new StdioServerTransport());
