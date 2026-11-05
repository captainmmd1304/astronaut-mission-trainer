import { defineConfig } from 'tsup';

// Bundle the workspace packages (they ship TypeScript source); keep npm packages external.
export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node22',
  clean: true,
  noExternal: [/^@amt\//],
});
