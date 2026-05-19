import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.spec.ts',
  use: { baseURL: 'http://localhost:5173' },
  webServer: [
    { command: 'npm run start -w @copperline/vendor-stub', port: 4010, reuseExistingServer: true },
    {
      command: 'npm run db:reset -w @copperline/api && npm run start -w @copperline/api',
      url: 'http://127.0.0.1:3001/api/health',
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev -w @copperline/web',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
    },
  ],
});
