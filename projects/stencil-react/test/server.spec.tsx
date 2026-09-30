import { MdsButton } from '@maggioli-design-system/magma-react/mds-button.server.js';
import { MdsNote } from '@maggioli-design-system/magma-react/mds-note.server.js';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

// Without `window` the server wrappers are async components (Server Components): they render the
// element through the hydrate module of magma and resolve to its markup. React 18 renderToString
// cannot await a component, so the tests await it and render the element it resolves to.
const renderServer = async (component: unknown, props: object): Promise<string> =>
  renderToString(await (component as (props: object) => Promise<ReactElement>)(props));

describe('server wrappers', () => {
  it('emit the host with the attributes of the properties map', async () => {
    const html = await renderServer(MdsButton, { label: 'Salva', iconPosition: 'right' });
    const host = html.match(/^<mds-button\b[^>]*>/)?.[0] ?? '';

    expect(host).toContain('label="Salva"');
    expect(host).toContain('icon-position="right"');
    expect(host).not.toContain('iconPosition');
    // otherwise the anti-FOUC hydrated.css keeps the server markup hidden
    expect(host).toMatch(/\shydrated[\s=>]/);
  });

  it('emit the shadow DOM as a declarative shadow root', async () => {
    const html = await renderServer(MdsButton, { label: 'Salva' });

    expect(html).toMatch(/^<mds-button\b[^>]*><template shadowrootmode="open"/);
  });

  it('emit the children in the light DOM, after the shadow root', async () => {
    const html = await renderServer(MdsNote, {
      children: [
        <strong key="title" slot="title">
          Titolo
        </strong>,
        <span key="content">Contenuto</span>,
      ],
    });

    expect(html).toMatch(
      /<\/template><strong slot="title">Titolo<\/strong><span>Contenuto<\/span><\/mds-note>$/,
    );
  });
});
