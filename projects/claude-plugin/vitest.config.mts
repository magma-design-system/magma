import { defineConfig } from 'vitest/config';

// The tests of the plugin: the launcher of the MCP server, run as Claude Code runs it, a process
// on stdio, and the parts of the generator that read only files (`scripts/skill-files.ts`). The
// skills themselves are held by `scripts/skills.ts check`, not here.
export default defineConfig({
  test: { include: ['test/**/*.test.mjs', 'test/**/*.test.ts'], environment: 'node' },
});
