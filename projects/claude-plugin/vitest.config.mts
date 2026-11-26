import { defineConfig } from 'vitest/config';

// The tests of the plugin: the launcher of the MCP server, run as Claude Code runs it, a process
// on stdio. The skills are held by `scripts/skills.ts check`, not here.
export default defineConfig({
  test: { include: ['test/**/*.test.mjs'], environment: 'node' },
});
