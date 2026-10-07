import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

// Only the tests that create, edit and delete (revoke) data: npm run test:e2e:mutation
export default defineConfig({
  ...baseConfig,
  testIgnore: [],
  testMatch: ["**/*.mutation.spec.ts"],
});
