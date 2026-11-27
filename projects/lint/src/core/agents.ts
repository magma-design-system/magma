/*
  The Magma block: what the install guide of each entry package writes into the root agent file
  of a consumer project (AGENTS.md, and CLAUDE.md when Claude Code reads that instead), step 3.8
  of its AGENTS.md (#1524). No agent reads the guide inside node_modules by itself: the block
  tells an agent opening the project that Magma is there and where its guide is. The guide writes
  it between these markers, so that a later install replaces it; check_setup of the MCP server
  finds it by them. Written by magmaBlock of projects/stencil/scripts/agent-docs-lib.ts, read by
  projects/mcp/src/checks.ts.
*/

/** The first line of the block. */
export const MAGMA_BLOCK_START =
  '<!-- magma:start - written by the Magma install guide; what is inside is replaced -->';

/** The last line of the block. */
export const MAGMA_BLOCK_END = '<!-- magma:end -->';

/**
 * The text carries a Magma block: its start marker, then its end marker. The start is matched up
 * to its name only, so that a block written with another wording of the comment still counts.
 */
export const hasMagmaBlock = (text: string): boolean => {
  const start = text.search(/<!-- magma:start\b/);
  return start !== -1 && text.includes(MAGMA_BLOCK_END, start);
};
