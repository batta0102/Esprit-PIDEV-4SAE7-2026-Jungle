import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/Frontend/test-setup.ts'],
    include: ['src/Frontend/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
  },
  define: {
    jasmine: 'globalThis.jasmine',
    spyOn: 'globalThis.spyOn',
    fail: 'globalThis.fail'
  }
});
