/**
 * The patterns Magma ships, one line each, the domains of Foundation first, then by group: the
 * same list as the get_pattern tool of the MCP server with no argument (#1174), read from
 * docs/agents/patterns/.
 *
 * Run from the stencil package dir:
 *   npm run list.patterns [-- --kind pattern|foundation] [--group <group>] [--status candidate|draft|decided] [--not-validated]
 */
import { listPatterns } from '../../lint/src/core/patterns';
import { readPatterns, renderList } from './patterns-lib';

const option = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

process.stdout.write(
  renderList(listPatterns(readPatterns().map((one) => one.data)), {
    kind: option('kind'),
    group: option('group'),
    status: option('status'),
    notValidated: process.argv.includes('--not-validated'),
  }),
);
