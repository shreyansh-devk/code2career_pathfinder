import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'**/*.spec.ts',fullyParallel:false,workers:1,timeout:60000,
  use:{ baseURL:'http://127.0.0.1:3100',trace:'retain-on-failure',launchOptions:{ executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } },
  projects:[{ name:'chromium',use:{ ...devices['Desktop Chrome'] } }],
  webServer:process.env.PATHFINDER_TEST_EXISTING_SERVER==='true' ? undefined : { command:'npm run seed:dev && npm run dev -- --port 3100',url:'http://127.0.0.1:3100/sign-in',reuseExistingServer:false,timeout:120000,env:{ ENABLE_LOCAL_AUTH:'true',LOCAL_DATABASE_PATH:'.data/e2e',DEV_ACCOUNT_PASSWORD:'pathfinder-local-2026',DATABASE_URL:'',CLERK_SECRET_KEY:'',NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:'',AI_GATEWAY_API_KEY:'',AI_MODEL:'',ANTHROPIC_BASE_URL:'',ANTHROPIC_AUTH_TOKEN:'',ANTHROPIC_MODEL:'' } },
});
