/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/*
  The part of render_preview that runs in the page (./render.ts). It waits until the markup
  is what a person would see, then looks at it element by element for what makes an image not
  representative. `inPage` is sent to the page as source text, so it reads nothing outside
  itself: every helper is declared inside it.

  What each step waits for, and why:
  - the components: the lazy loader of the dist defines every tag of the build at once, Stencil
    emits `appload` on window when the components of the first load are ready and sets the
    hydrated flag on each component when it is; the flag is the attribute or the class
    `hydrated`, the selector styles/dist/css/hydrated.css hides a component with until then;
  - the fonts: `document.fonts.ready`;
  - the animations: a hidden or throttled page pauses them, so a component can be caught
    half faded in (#1180); finished, they show their end state, and an infinite one (a
    spinner) is paused where it is.
*/

export type ProblemKind =
  | 'unknown-component'
  | 'not-hydrated'
  | 'zero-size'
  | 'flat'
  | 'console-error'
  | 'asset'
  | 'font'
  | 'broken-word'
  | 'cut';

export interface PageProblem {
  kind: ProblemKind;
  /** The element, as the markup writes it: its tag, its place among its peers, its text. */
  element?: string;
  detail: string;
}

/** A box of the page to look at in the image, in CSS pixels. */
export interface Region {
  element: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Step =
  | { step: 'settle'; timeout: number }
  | { step: 'inspect' }
  | { step: 'pixels'; png: string; scale: number; regions: Region[] };

export interface Inspection {
  problems: PageProblem[];
  /** The components with content, whose image must not be one flat colour. */
  regions: Region[];
  /** The height of the content, to size the viewport to it. */
  height: number;
}

/** The id of the element the markup is written into. */
export const PREVIEW_ID = 'magma-preview';

export const inPage = async (args: Step): Promise<void | Inspection | PageProblem[]> => {
  const HYDRATED = ':is([hydrated], .hydrated)';
  const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
  const frame = () => new Promise((done) => requestAnimationFrame(() => done(undefined)));
  const isComponent = (element: Element) => element.localName.startsWith('mds-');

  /** Every element of the page, those inside shadow roots too, and the shadow roots. */
  const deep = () => {
    const elements: Element[] = [];
    const roots: ShadowRoot[] = [];
    const walk = (root: Document | ShadowRoot) => {
      for (const element of root.querySelectorAll('*')) {
        elements.push(element);
        if (element.shadowRoot) {
          roots.push(element.shadowRoot);
          walk(element.shadowRoot);
        }
      }
    };
    walk(document);
    return { elements, roots };
  };

  const preview = document.getElementById('magma-preview')!;

  /** An element as the markup writes it: `mds-button [2 of 3] "Salva"`, `> span.label` inside a component. */
  const label = (element: Element): string => {
    const own = (one: Element): string => {
      const root = one.getRootNode();
      if (root instanceof ShadowRoot) {
        const name = typeof one.className === 'string' ? one.className.trim().split(/\s+/)[0] : '';
        return `${one.localName}${name ? `.${name}` : ''}`;
      }
      const peers = [...preview.querySelectorAll(one.localName)];
      const place = peers.length > 1 ? ` [${peers.indexOf(one) + 1} of ${peers.length}]` : '';
      const text = (one.textContent ?? '').replace(/\s+/g, ' ').trim();
      const id = one.id ? `#${one.id}` : '';
      return `${one.localName}${id}${place}${text ? ` "${text.length > 32 ? `${text.slice(0, 31)}...` : text}"` : ''}`;
    };
    const parts: string[] = [];
    let node: Element | undefined = element;
    while (node) {
      parts.unshift(own(node));
      const root = node.getRootNode();
      node = root instanceof ShadowRoot ? (root.host as Element) : undefined;
    }
    return parts.join(' > ');
  };

  /** Finish every animation that has an end; pause the infinite ones where they are. */
  const finishAnimations = (roots: ShadowRoot[]) => {
    const animations = new Set([document, ...roots].flatMap((root) => root.getAnimations()));
    for (const animation of animations)
      try {
        animation.finish();
      } catch {
        // an infinite animation cannot finish (InvalidStateError)
        animation.pause();
      }
  };

  if (args.step === 'settle') {
    const deadline = Date.now() + args.timeout;
    const left = () => Math.max(0, deadline - Date.now());
    // the components of the first load (Stencil emits appload on window, the init script of
    // ./render.ts records it), then each one, inserted later too
    while (left() && !(window as { magmaAppLoaded?: boolean }).magmaAppLoaded) await sleep(25);
    while (left()) {
      const waiting = deep().elements.filter(
        (element) =>
          isComponent(element) &&
          customElements.get(element.localName) &&
          !element.matches(HYDRATED),
      );
      if (!waiting.length) break;
      await sleep(25);
    }
    await Promise.race([document.fonts.ready, sleep(left())]);
    // a component may start an animation once it has rendered: three rounds catch those
    for (let round = 0; round < 3; round++) {
      finishAnimations(deep().roots);
      await frame();
      await frame();
    }
    return;
  }

  if (args.step === 'inspect') {
    const { elements } = deep();
    const problems: PageProblem[] = [];
    const regions: Region[] = [];

    // components: a tag the loader did not define is not in this version of Magma
    const unknown = new Set<string>();
    for (const element of elements.filter(isComponent)) {
      if (!customElements.get(element.localName)) {
        if (!unknown.has(element.localName)) {
          unknown.add(element.localName);
          problems.push({
            kind: 'unknown-component',
            element: label(element),
            detail: `${element.localName} is not a component of the installed Magma: it renders as an unknown element. Check the tag with find_component.`,
          });
        }
      } else if (!element.matches(HYDRATED))
        problems.push({
          kind: 'not-hydrated',
          element: label(element),
          detail:
            'The component did not hydrate: it stays hidden (hydrated.css) or shows its markup before rendering. A console error usually says why.',
        });
    }

    // the boxes of the components of the markup, and of its images
    const hasContent = (element: Element): boolean => {
      if ((element.textContent ?? '').trim()) return true;
      const inside = element.shadowRoot;
      return Boolean(
        inside &&
        ([...inside.querySelectorAll('*')].some(
          (one) =>
            !['style', 'slot', 'script'].includes(one.localName) && (one.textContent ?? '').trim(),
        ) ||
          inside.querySelector('img, svg, canvas, video')),
      );
    };
    for (const element of preview.querySelectorAll('*')) {
      if (!isComponent(element) && element.localName !== 'img') continue;
      // display: none (a closed overlay, `hidden`) is a choice of the markup, not a failure
      if (!element.checkVisibility()) continue;
      const box = element.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) {
        problems.push({
          kind: 'zero-size',
          element: label(element),
          detail: `The element is displayed but its box measures ${Math.round(box.width)}x${Math.round(box.height)} px: the layout gives it no ${box.width < 1 ? 'width' : 'height'}, so it shows collapsed or not at all.`,
        });
        continue;
      }
      if (element.localName === 'img') {
        const image = element as HTMLImageElement;
        if (image.complete && !image.naturalWidth)
          problems.push({
            kind: 'asset',
            element: label(element),
            detail: `The image ${image.getAttribute('src') ?? ''} did not load.`,
          });
        continue;
      }
      if (box.width >= 8 && box.height >= 8 && hasContent(element))
        regions.push({
          element: label(element),
          x: box.left + window.scrollX,
          y: box.top + window.scrollY,
          width: box.width,
          height: box.height,
        });
    }

    // the fonts the text asks for, and whether a face of each one loaded
    const GENERIC =
      /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[a-z-]+|emoji|math|fangsong|-apple-system|blinkmacsystemfont)$/i;
    const faces = [...document.fonts];
    const familyOf = (face: FontFace) => face.family.replace(/^['"]|['"]$/g, '').toLowerCase();
    const asked = new Map<string, Element>();
    const walkers = [document, ...deep().roots];
    const texts: Text[] = [];
    for (const root of walkers) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (!parent || !node.textContent?.trim()) continue;
        if (['style', 'script', 'title', 'noscript'].includes(parent.localName)) continue;
        if (!parent.checkVisibility({ visibilityProperty: true } as CheckVisibilityOptions))
          continue;
        texts.push(node as Text);
        const family = getComputedStyle(parent)
          .fontFamily.split(',')[0]!
          .trim()
          .replace(/^['"]|['"]$/g, '');
        if (family && !GENERIC.test(family) && !asked.has(family.toLowerCase()))
          asked.set(family.toLowerCase(), parent);
      }
    }
    for (const [family, element] of asked) {
      const mine = faces.filter((face) => familyOf(face) === family);
      if (mine.some((face) => face.status === 'loaded')) continue;
      const name = getComputedStyle(element)
        .fontFamily.split(',')[0]!
        .trim()
        .replace(/^['"]|['"]$/g, '');
      problems.push({
        kind: 'font',
        element: label(element),
        detail: mine.some((face) => face.status === 'error')
          ? `The font ${name} failed to load: the text shows in a fallback font.`
          : `No face of the font ${name} is loaded: the text shows in a fallback font (agents/assets.md, "Fonts").`,
      });
    }

    // a word broken across two lines: the segments between the places a line may break
    const range = document.createRange();
    for (const node of texts) {
      const text = node.data;
      for (const match of text.matchAll(/[^\s\-\u00ad\u2010-\u2014/]{2,}/g)) {
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const tops = new Set(
          [...range.getClientRects()]
            .filter((one) => one.width > 0)
            .map((one) => Math.round(one.top)),
        );
        if (tops.size > 1)
          problems.push({
            kind: 'broken-word',
            element: label(node.parentElement!),
            detail: `The word "${match[0]}" is broken across ${tops.size} lines: its box is too narrow for it.`,
          });
      }
    }

    const content = preview.getBoundingClientRect();
    return { problems, regions, height: Math.ceil(content.bottom + window.scrollY) };
  }

  // the image, region by region: one colour from edge to edge means nothing of it rendered
  const bitmap = await createImageBitmap(
    await (await fetch(`data:image/png;base64,${args.png}`)).blob(),
  );
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d')!;
  context.drawImage(bitmap, 0, 0);
  const problems: PageProblem[] = [];
  const hex = (r: number, g: number, b: number) =>
    `#${[r, g, b].map((one) => one.toString(16).padStart(2, '0')).join('')}`;
  const whole = {
    element: '',
    x: 0,
    y: 0,
    width: bitmap.width / args.scale,
    height: bitmap.height / args.scale,
  };
  for (const region of [whole, ...args.regions]) {
    const x = Math.max(0, Math.floor(region.x * args.scale));
    const y = Math.max(0, Math.floor(region.y * args.scale));
    const width = Math.min(bitmap.width - x, Math.ceil(region.width * args.scale));
    const height = Math.min(bitmap.height - y, Math.ceil(region.height * args.scale));
    if (width < 1 || height < 1) continue;
    const { data } = context.getImageData(x, y, width, height);
    // the most frequent colour, then the share of the pixels within a few levels of it
    const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 40000)));
    const counts = new Map<number, number>();
    let samples = 0;
    for (let row = 0; row < height; row += step)
      for (let column = 0; column < width; column += step) {
        const at = (row * width + column) * 4;
        const key = (data[at]! << 16) | (data[at + 1]! << 8) | data[at + 2]!;
        counts.set(key, (counts.get(key) ?? 0) + 1);
        samples++;
      }
    const [top] = [...counts].sort((a, b) => b[1] - a[1])[0]!;
    const [r, g, b] = [(top >> 16) & 255, (top >> 8) & 255, top & 255];
    let near = 0;
    for (const [key, count] of counts)
      if (
        Math.abs(((key >> 16) & 255) - r) <= 8 &&
        Math.abs(((key >> 8) & 255) - g) <= 8 &&
        Math.abs((key & 255) - b) <= 8
      )
        near += count;
    if (near / samples >= 0.998)
      problems.push(
        region.element
          ? {
              kind: 'flat',
              element: region.element,
              detail: `The component has content but its whole box is one flat colour, ${hex(r, g, b)}: its content does not show.`,
            }
          : {
              kind: 'flat',
              detail: `The whole image is one flat colour, ${hex(r, g, b)}: nothing rendered.`,
            },
      );
  }
  return problems;
};
