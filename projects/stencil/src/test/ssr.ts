import { commands } from 'vitest/browser';

interface Diagnostic {
  level: string;
  messageText: string;
}

declare module 'vitest/browser' {
  interface BrowserCommands {
    // defined in vitest.config.mts, runs in Node
    renderToString: (html: string) => Promise<{ html: string; diagnostics: Diagnostic[] }>;
  }
}

/**
 * Server-renders the markup with the hydrate build (`dist/hydrate`, as `renderToString` of
 * `@maggioli-design-system/magma/hydrate`), declarative shadow DOM included. Throws on error
 * diagnostics: the hydrate app swallows lifecycle errors and ships partial HTML anyway.
 */
export const renderToString = async (html: string): Promise<string> => {
  const { html: markup, diagnostics } = await commands.renderToString(html);
  const errors = diagnostics.filter((diagnostic) => diagnostic.level === 'error');
  if (errors.length > 0) {
    throw new Error(errors.map((diagnostic) => diagnostic.messageText).join('\n'));
  }
  return markup;
};

/**
 * Parses server-rendered markup into a new stage the way a browser parses an SSR page (the
 * declarative shadow roots attached, the hydration ids kept), so that the prebuilt components
 * hydrate the server DOM instead of rendering their own. Resolves once they have loaded.
 *
 * `hidden` parses it into a hidden stage, where React streaming puts a Suspense boundary until
 * it is revealed: see `reveal`.
 */
export const hydrate = async (markup: string, { hidden = false } = {}): Promise<HTMLElement> => {
  // a <div> like the stages of render(), which removes them before rendering its own
  document.body.querySelectorAll('div').forEach((stage) => stage.remove());
  const stage = document.createElement('div');
  stage.hidden = hidden;
  document.body.appendChild(stage);
  stage.setHTMLUnsafe(markup);

  // the lazy loader gives every host componentOnReady(), resolved after componentDidLoad
  const components = Array.from(
    stage.querySelectorAll<HTMLElement & { componentOnReady?: () => Promise<unknown> }>('*'),
  ).filter((element) => element.localName.includes('-'));
  await Promise.all(components.map((component) => component.componentOnReady?.()));
  return stage;
};

/**
 * Reveals a hidden stage the way React reveals a streamed Suspense boundary (`$RC`): the hidden
 * container leaves the document and its children are moved into a visible one, so every
 * component in it is disconnected and connected again.
 */
export const reveal = (hiddenStage: HTMLElement): HTMLElement => {
  const stage = document.createElement('div');
  document.body.appendChild(stage);
  hiddenStage.remove();
  while (hiddenStage.firstChild) {
    stage.appendChild(hiddenStage.firstChild);
  }
  return stage;
};
