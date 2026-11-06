import { defineConfig } from 'vitest/config';

export default defineConfig({
  // the imports of the lint, through the exports of magma, resolved to its sources by the paths
  // of tsconfig.json, as tsc and tsx resolve them
  resolve: { tsconfigPaths: true },
  // One test file at a time (#1241). Three files start Chrome (mcp-stdio, mcp-tools,
  // serve-previews): side by side on the 4 vCPU runner of CI their first renders took 30-58 s
  // instead of about 1 s and went past their timeouts, while the files with no browser kept their
  // times. In a row the suite takes about 15 s more on CI, and no render waits on another browser.
  test: {
    fileParallelism: false,
  },
});
