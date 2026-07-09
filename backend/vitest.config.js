import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom environment for fetch tests
    environment: 'node',
    // Global test setup
    globals: true,
    // Include test files
    include: ['tests/**/*.test.js'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server.js'],
      exclude: ['tests/**', 'node_modules/**']
    },
    // Server configuration for tests
    server: {
      port: 3001,
      host: 'localhost'
    }
  },
  resolve: {
    alias: {
      // This helps with ES modules
    }
  }
});