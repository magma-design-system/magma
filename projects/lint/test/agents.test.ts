// The Magma block the install guides write into a consumer's agent file, as check_setup finds it.
import { describe, expect, test } from 'vitest';

import { hasMagmaBlock, MAGMA_BLOCK_END, MAGMA_BLOCK_START } from '../src/core/agents.js';

describe('hasMagmaBlock', () => {
  test('finds the block between its markers, in any place of the file', () => {
    expect(hasMagmaBlock(`# App\n\n${MAGMA_BLOCK_START}\n## Magma\n${MAGMA_BLOCK_END}\n`)).toBe(
      true,
    );
  });

  test('takes a start marker with another wording of its comment', () => {
    expect(hasMagmaBlock(`<!-- magma:start -->\n## Magma\n${MAGMA_BLOCK_END}`)).toBe(true);
  });

  test('wants both markers, the start first', () => {
    expect(hasMagmaBlock('# App\n\n## Magma\n')).toBe(false);
    expect(hasMagmaBlock(`${MAGMA_BLOCK_START}\n## Magma\n`)).toBe(false);
    expect(hasMagmaBlock(`${MAGMA_BLOCK_END}\n${MAGMA_BLOCK_START}\n`)).toBe(false);
    // another name that starts with magma is not the block
    expect(hasMagmaBlock(`<!-- magma:starter -->\n${MAGMA_BLOCK_END}`)).toBe(false);
  });
});
