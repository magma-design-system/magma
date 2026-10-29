import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { hardcoverCap } from '../meta/spine';

// covers that load in the test page, whose own server has no /assets: an svg keeps its
// width and height as its natural size
const cover = (width: number, height: number, fill = '#e8a33d'): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${fill}"/></svg>`,
  )}`;

// the mark of a publisher, black on a transparent ground as a mark usually is
const logo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><circle cx="20" cy="15" r="12" fill="black"/></svg>',
)}`;

// the host lays out the unturned book, so its box gives the proportions of the format
const ratioOf = (element: Element): number => {
  const { width, height } = element.getBoundingClientRect();
  return width / height;
};

const part = (root: HTMLElement, selector: string): HTMLElement | null =>
  root.shadowRoot!.querySelector<HTMLElement>(selector);

const background = (root: HTMLElement, selector: string, pseudo?: string): string =>
  getComputedStyle(part(root, selector)!, pseudo).backgroundColor;

// the colour a consumer gives the drawn cover, and the paper a printed one is bound in
const drawnColor = 'rgb(27, 94, 32)';
const paper = 'rgb(250, 248, 242)';

const loaded = async (root: HTMLElement): Promise<void> => {
  const image = part(root, 'img') as HTMLImageElement;
  await vi.waitFor(() => expect(image.complete && image.naturalWidth > 0).toBe(true));
  await vi.waitFor(() =>
    expect(part(root, '.book')!.style.getPropertyValue('--private-book-cover')).not.toBe(''),
  );
};

describe('mds-book', () => {
  it('renders a paperback of 300 pages in the proportions of its image by default', async () => {
    const { root } = await render<HTMLMdsBookElement>('<mds-book></mds-book>');

    expect(root).toHaveAttribute('hydrated');
    expect(root).toEqualAttributes({ binding: 'paperback', format: 'auto' });
    expect(root.pages).toBe(300);
  });

  describe('the accessible name', () => {
    it('names the book after its alt', async () => {
      const { root } = await render(
        '<mds-book alt="Copertina del Codice degli appalti" name="Codice degli appalti"></mds-book>',
      );

      expect(root).toEqualAttributes({
        role: 'img',
        'aria-label': 'Copertina del Codice degli appalti',
      });
    });

    it('builds the name from the title and the author', async () => {
      const { root } = await render(
        '<mds-book name="Creare la holding" author="Ennio Vial"></mds-book>',
      );

      expect(root).toEqualAttribute('aria-label', 'Creare la holding by Ennio Vial');
    });

    it('builds it in the language of the page', async () => {
      document.documentElement.lang = 'it';
      const { root, waitForChanges } = await render(
        '<mds-book name="Creare la holding" author="Ennio Vial"></mds-book>',
      );
      await waitForChanges();

      await vi.waitFor(() =>
        expect(root).toEqualAttribute('aria-label', 'Creare la holding di Ennio Vial'),
      );
    });

    // the phrase goes through mustache, which escapes HTML with double braces
    it('keeps the apostrophes and ampersands of a title as they are', async () => {
      const { root } = await render(
        `<mds-book name="L'agenda dell'ufficio &amp; dei servizi" author="Anna D'Amico"></mds-book>`,
      );

      expect(root).toEqualAttribute(
        'aria-label',
        "L'agenda dell'ufficio & dei servizi by Anna D'Amico",
      );
    });

    it('is the title alone without an author, and a generic name without either', async () => {
      const { root: titled } = await render(
        '<mds-book name="Operazioni straordinarie"></mds-book>',
      );
      const { root: untitled } = await render('<mds-book></mds-book>');

      expect(titled).toEqualAttribute('aria-label', 'Operazioni straordinarie');
      expect(untitled).toEqualAttribute('aria-label', 'Book');
    });

    it('leaves a decorative book out with an empty alt', async () => {
      const { root } = await render('<mds-book alt="" name="Operazioni straordinarie"></mds-book>');

      expect(root).toEqualAttribute('role', 'presentation');
      expect(root).not.toHaveAttribute('aria-label');
    });

    it('hides the text printed on the book, which repeats the name', async () => {
      const { root } = await render('<mds-book name="Operazioni straordinarie"></mds-book>');

      expect(part(root, '.spine')).toEqualAttribute('aria-hidden', 'true');
      expect(part(root, '.drawn-cover')).toEqualAttribute('aria-hidden', 'true');
    });
  });

  describe('the cover', () => {
    it('shows the image as the cover part, lazily by default', async () => {
      const { root } = await render(
        `<mds-book src="${cover(170, 240)}" name="Manuale"></mds-book>`,
      );
      const image = part(root, 'img')!;

      expect(image).toEqualAttributes({
        part: 'cover',
        alt: '',
        'aria-hidden': 'true',
        loading: 'lazy',
      });
      expect(part(root, '.drawn-cover')).toBeNull();
    });

    it('draws a cover with the title, the author and the publisher when there is no image', async () => {
      const { root } = await render(
        '<mds-book name="Manuale" author="Mario Rossi" publisher="Maggioli Editore"></mds-book>',
      );

      expect(part(root, 'img')).toBeNull();
      expect(part(root, '.drawn-name')).toEqualText('Manuale');
      expect(part(root, '.drawn-author')).toEqualText('Mario Rossi');
      expect(part(root, '.drawn-publisher')).toEqualText('Maggioli Editore');
    });

    // the padding of the drawn cover pushed its foot past the bottom edge, where it was cut off
    it('keeps the publisher at the foot of a drawn cover inside it', async () => {
      const { root } = await render(
        '<mds-book name="Manuale" publisher="Maggioli Editore"></mds-book>',
      );
      const publisher = part(root, '.drawn-publisher')!;

      expect(publisher.offsetTop + publisher.offsetHeight).toBeLessThan(
        part(root, '.front')!.offsetHeight,
      );
    });

    it('prints the mark of the publisher instead of its name, at the foot of a drawn cover', async () => {
      const { root } = await render(
        `<mds-book name="Manuale" publisher="Maggioli Editore" publisher-logo="${logo}"></mds-book>`,
      );
      await vi.waitFor(() => expect(part(root, '.drawn-logo')).not.toBeNull());
      const mark = part(root, '.drawn-logo')!;

      expect(part(root, '.drawn-publisher')).toBeNull();
      expect(mark.offsetTop + mark.offsetHeight).toBeLessThan(part(root, '.front')!.offsetHeight);
      expect(getComputedStyle(mark).maskImage).toContain('data:image/svg+xml');
    });

    it('draws the cover when the image fails to load, in the colour of a drawn cover', async () => {
      const { root } = await render(
        `<mds-book src="/missing-cover.webp" name="Manuale" style="--mds-book-color: ${drawnColor}"></mds-book>`,
      );

      await vi.waitFor(() => expect(part(root, '.drawn-name')).toEqualText('Manuale'));
      expect(part(root, 'img')).toBeNull();
      expect(background(root, '.front')).toBe(drawnColor);
      expect(background(root, '.spine')).toBe(drawnColor);
    });

    // A lazy catalogue showed every book in the colour of drawn covers until its cover arrived,
    // and the spine flashed in it again once the cover had arrived (#1171): a book with an
    // image is printed on paper, from the start.
    it('is a blank book of paper while its image is on the way, not the colour of a drawn cover', async () => {
      const { root } = await render(
        // far below the viewport, a lazy image is not requested yet (a data: url would load at once)
        `<div><mds-book style="--mds-book-color: ${drawnColor}"></mds-book><div style="height: 20000px"></div><mds-book src="/far-below.webp" style="--mds-book-color: ${drawnColor}"></mds-book></div>`,
      );
      const [drawn, waiting] = Array.from(root.querySelectorAll<HTMLElement>('mds-book'));

      expect(background(drawn, '.front')).toBe(drawnColor);
      expect(background(waiting, '.front')).toBe(paper);
      expect(background(waiting, '.spine')).toBe(paper);
    });

    it('keeps the paper under its image once loaded, on the spine and the board edges', async () => {
      const { root } = await render(
        `<div>
          <mds-book src="${cover(170, 240)}" loading="eager" style="--mds-book-color: ${drawnColor}"></mds-book>
          <mds-book src="${cover(170, 240)}" loading="eager" binding="hardcover" style="--mds-book-color: ${drawnColor}"></mds-book>
        </div>`,
      );
      const [paperback, hardcover] = Array.from(root.querySelectorAll<HTMLElement>('mds-book'));
      await loaded(paperback);
      await loaded(hardcover);

      expect(getComputedStyle(part(paperback, '.spine')!).backgroundImage).toContain(
        'data:image/svg+xml',
      );
      expect(background(paperback, '.spine')).toBe(paper);
      expect(background(paperback, '.pages-top', '::after')).toBe(paper);
      expect(background(hardcover, '.slat')).toBe(paper);
      expect(background(hardcover, '.board-top')).toBe(paper);
    });

    it('tries a new image again after a failed one', async () => {
      const { root, waitForChanges } = await render(
        '<mds-book src="/missing-cover.webp"></mds-book>',
      );
      await vi.waitFor(() => expect(part(root, 'img')).toBeNull());

      root.setAttribute('src', cover(170, 240));
      await waitForChanges();

      expect(part(root, 'img')).not.toBeNull();
    });
  });

  // sized as an image is: one dimension, and the other follows the proportions of the book
  describe('size', () => {
    const box = (element: Element) => {
      const { width, height } = element.getBoundingClientRect();
      return [Math.round(width), Math.round(height)];
    };

    it('takes its height from a width', async () => {
      const { root } = await render('<mds-book format="17x24" style="width: 170px"></mds-book>');

      expect(box(root)).toEqual([170, 240]);
    });

    it('takes its width from a height', async () => {
      const { root } = await render('<mds-book format="17x24" style="height: 240px"></mds-book>');

      expect(box(root)).toEqual([170, 240]);
      expect(part(root, '.book')!.offsetHeight).toBe(240);
    });

    it('fills the width of a block with neither', async () => {
      const { root } = await render(
        '<div style="width: 340px"><mds-book format="17x24"></mds-book></div>',
      );

      expect(box(root.querySelector('mds-book')!)).toEqual([340, 480]);
    });

    it('is as wide as an image of 200 px where nothing gives it a width', async () => {
      const { root } = await render(
        '<div style="display: flex; width: 900px"><mds-book format="17x24"></mds-book></div>',
      );

      expect(box(root.querySelector('mds-book')!)[0]).toBe(200);
    });
  });

  describe('format', () => {
    const frame = (markup: string) => `<div style="width: 200px">${markup}</div>`;

    it('keeps 17x24 before the image loads and without one', async () => {
      const { root } = await render(frame('<mds-book></mds-book>'));
      const book = root.querySelector('mds-book')!;

      expect(ratioOf(book)).toBeCloseTo(17 / 24, 2);
    });

    it('takes the proportions of the image with auto: a square cover gives a square book', async () => {
      const { root } = await render(
        frame(`<mds-book src="${cover(600, 600)}" loading="eager"></mds-book>`),
      );
      const book = root.querySelector('mds-book')!;

      await vi.waitFor(() => expect(ratioOf(book)).toBeCloseTo(1, 2));
    });

    it('takes the proportions of a wider agenda too', async () => {
      const { root } = await render(
        frame(`<mds-book src="${cover(472, 560)}" loading="eager"></mds-book>`),
      );
      const book = root.querySelector('mds-book')!;

      await vi.waitFor(() => expect(ratioOf(book)).toBeCloseTo(472 / 560, 2));
    });

    it('gives the named formats their ISO proportions, portrait', async () => {
      const { root } = await render(
        frame(
          '<mds-book format="a4"></mds-book><mds-book format="a5"></mds-book><mds-book format="b5"></mds-book>',
        ),
      );
      const [a4, a5, b5] = Array.from(root.querySelectorAll('mds-book'));

      expect(ratioOf(a4)).toBeCloseTo(21 / 29.7, 2);
      expect(ratioOf(a5)).toBeCloseTo(14.8 / 21, 2);
      expect(ratioOf(b5)).toBeCloseTo(17.6 / 25, 2);
    });

    it('reads WxH in centimetres, the order of the two numbers being the orientation', async () => {
      const { root } = await render(
        frame(
          '<mds-book format="17x24"></mds-book><mds-book format="24x17"></mds-book><mds-book format="21x21"></mds-book>',
        ),
      );
      const [portrait, landscape, square] = Array.from(root.querySelectorAll('mds-book'));

      expect(ratioOf(portrait)).toBeCloseTo(17 / 24, 2);
      expect(ratioOf(landscape)).toBeCloseTo(24 / 17, 2);
      expect(ratioOf(square)).toBeCloseTo(1, 2);
    });

    it('keeps a fixed format whatever the proportions of the image', async () => {
      const { root } = await render(
        frame(`<mds-book format="a4" src="${cover(600, 600)}" loading="eager"></mds-book>`),
      );
      const book = root.querySelector('mds-book')!;
      await loaded(book);

      expect(ratioOf(book)).toBeCloseTo(21 / 29.7, 2);
    });

    it('falls back on auto, with a warning, for a value that is not a format', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { root } = await render(frame('<mds-book format="pocket"></mds-book>'));
      const book = root.querySelector('mds-book')!;

      expect(ratioOf(book)).toBeCloseTo(17 / 24, 2);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"pocket" is not a format'));
      warn.mockRestore();
    });
  });

  describe('the spine', () => {
    it('prints the author, the title and the publisher', async () => {
      const { root } = await render(
        '<mds-book name="Manuale" author="Mario Rossi" publisher="Maggioli Editore"></mds-book>',
      );

      expect(part(root, '.spine-author')).toEqualText('Mario Rossi');
      expect(part(root, '.spine-name')).toEqualText('Manuale');
      expect(part(root, '.spine-publisher')).toEqualText('Maggioli Editore');
    });

    // where the spans are laid out on the spine, before the 3D turns it: the text runs top to
    // bottom, and its lines from right to left
    const placeOf = (root: HTMLElement, selector: string) => {
      const span = part(root, selector)!;
      return {
        fontSize: parseFloat(getComputedStyle(span).fontSize),
        left: span.offsetLeft,
        top: span.offsetTop,
      };
    };

    // 150 pages make a spine of 14 mm on a 17 cm book: one line across it
    it('prints the author after the title on a spine with room for one line', async () => {
      const { root } = await render(
        '<div style="width: 200px"><mds-book pages="150" name="Manuale" author="Mario Rossi"></mds-book></div>',
      );
      const book = root.querySelector('mds-book')!;
      const name = placeOf(book, '.spine-name');
      const author = placeOf(book, '.spine-author');

      expect(author.top).toBeGreaterThan(name.top);
      expect(author.left).toBe(name.left);
      expect(author.fontSize).toBe(name.fontSize);
    });

    // 640 pages make a spine of 44 mm: room for a second line
    it('prints the author under the title, smaller, on a spine with room for two lines', async () => {
      const { root } = await render(
        '<div style="width: 200px"><mds-book pages="640" name="Manuale" author="Mario Rossi"></mds-book></div>',
      );
      const book = root.querySelector('mds-book')!;
      const name = placeOf(book, '.spine-name');
      const author = placeOf(book, '.spine-author');

      expect(author.left).toBeLessThan(name.left);
      expect(author.top).toBe(name.top);
      expect(author.fontSize).toBeLessThan(name.fontSize);
    });

    it('prints the mark of the publisher instead of its name at the foot, on a cover image too', async () => {
      const { root } = await render(
        `<mds-book src="${cover(170, 240)}" loading="eager" name="Manuale" publisher="Maggioli Editore" publisher-logo="${logo}"></mds-book>`,
      );
      await vi.waitFor(() => expect(part(root, '.spine-logo')).not.toBeNull());

      expect(part(root, '.spine-publisher')).toBeNull();
      expect(getComputedStyle(part(root, '.spine-logo')!).maskImage).toContain(
        'data:image/svg+xml',
      );
    });

    it('paints the publisher in the colour of the text, or in a colour of its own', async () => {
      const { root, waitForChanges } = await render(
        `<mds-book publisher="Maggioli Editore" publisher-logo="${logo}" style="--mds-book-text-color: rgb(255, 255, 255)"></mds-book>`,
      );
      await vi.waitFor(() => expect(part(root, '.spine-logo')).not.toBeNull());
      const ink = () => getComputedStyle(part(root, '.spine-logo')!).backgroundColor;
      expect(ink()).toBe('rgb(255, 255, 255)');

      root.style.setProperty('--mds-book-publisher-color', 'rgb(27, 94, 32)');
      expect(ink()).toBe('rgb(27, 94, 32)');

      root.removeAttribute('publisher-logo');
      await waitForChanges();

      expect(getComputedStyle(part(root, '.spine-publisher')!).color).toBe('rgb(27, 94, 32)');
    });

    it('prints the name of the publisher when its mark does not load', async () => {
      const { root } = await render(
        '<mds-book publisher="Maggioli Editore" publisher-logo="/missing-logo.svg"></mds-book>',
      );

      await vi.waitFor(() =>
        expect(part(root, '.spine-publisher')).toEqualText('Maggioli Editore'),
      );
      expect(part(root, '.spine-logo')).toBeNull();
      expect(part(root, '.drawn-publisher')).toEqualText('Maggioli Editore');
    });

    it('fades the text out on a spine under 5 mm, too narrow to print on', async () => {
      const { root, waitForChanges } = await render('<mds-book name="Manuale"></mds-book>');
      const opacity = () => getComputedStyle(part(root, '.spine-text')!).opacity;
      expect(opacity()).toBe('1');

      root.setAttribute('pages', '40');
      await waitForChanges();

      expect(opacity()).toBe('0');
    });

    // a page from 0.1 mm at 1 page to 0.05 mm at 1000, in proportion: 100 pages make 9.5 mm,
    // 300 pages 25.5 mm, 1000 pages 50 mm, against a 17 cm width (21 cm for an A4)
    it('is as deep as its pages, as a share of the width of its format', async () => {
      const { root } = await render(
        '<div style="width: 200px"><mds-book pages="100"></mds-book><mds-book></mds-book><mds-book pages="1000"></mds-book><mds-book pages="300" format="a4"></mds-book></div>',
      );
      const widths = Array.from(root.querySelectorAll('mds-book')).map(
        (book) => part(book as HTMLElement, '.spine')!.offsetWidth,
      );

      expect(widths).toEqual([11, 30, 59, 24]);
    });

    it('keeps the thickness of a page of 1000 pages beyond them', async () => {
      const { root } = await render(
        '<div style="width: 200px"><mds-book pages="2000"></mds-book></div>',
      );

      expect(part(root.querySelector('mds-book')!, '.spine')!.offsetWidth).toBe(118);
    });

    it('takes the thickness of a page from the two page weights', async () => {
      const { root } = await render(
        '<div style="width: 200px"><mds-book style="--mds-book-page-weight-min: 0.2; --mds-book-page-weight-max: 0.1"></mds-book></div>',
      );

      expect(part(root.querySelector('mds-book')!, '.spine')!.offsetWidth).toBe(60);
    });

    it('is drawn with 300 pages, with a warning, for a value that is not a number of pages', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { root } = await render(
        '<div style="width: 200px"><mds-book pages="-12"></mds-book></div>',
      );

      expect(part(root.querySelector('mds-book')!, '.spine')!.offsetWidth).toBe(30);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"-12" is not a number of pages'));
      warn.mockRestore();
    });

    it('continues the left edge of the cover image', async () => {
      const src = cover(170, 240);
      const { root } = await render(`<mds-book src="${src}" loading="eager"></mds-book>`);
      await loaded(root);

      expect(getComputedStyle(part(root, '.spine')!).backgroundImage).toContain(
        'data:image/svg+xml',
      );
    });

    it('takes the colour of the binding without an image', async () => {
      const { root } = await render(
        '<mds-book style="--mds-book-color: rgb(27, 94, 32)"></mds-book>',
      );
      const spine = getComputedStyle(part(root, '.spine')!);

      expect(spine.backgroundImage).not.toContain('url(');
      expect(spine.backgroundColor).toBe('rgb(27, 94, 32)');
    });

    it('takes the solid colour the consumer sets instead of the image, the board edges too', async () => {
      const { root } = await render(
        `<mds-book src="${cover(170, 240)}" loading="eager" style="--mds-book-spine-color: rgb(27, 94, 32)"></mds-book>`,
      );
      await loaded(root);
      const solid = 'linear-gradient(rgb(27, 94, 32), rgb(27, 94, 32))';
      const spine = getComputedStyle(part(root, '.spine')!).backgroundImage;
      const board = getComputedStyle(part(root, '.pages-top')!, '::after').backgroundImage;

      expect(spine).not.toContain('url(');
      expect(spine).toContain(solid);
      expect(board).toContain(solid);
    });
  });

  describe('the binding', () => {
    const size = (book: HTMLElement, selector: string) => {
      const element = part(book, selector)!;
      return [element.offsetWidth, element.offsetHeight];
    };
    const book = async (attributes: string): Promise<HTMLElement> => {
      const { root } = await render(
        `<div style="width: 200px"><mds-book ${attributes} pages="640"></mds-book></div>`,
      );
      return root.querySelector('mds-book')!;
    };

    it('cuts a paperback flush: the page block as wide and tall as the cover, no boards', async () => {
      const root = await book('binding="paperback"');

      expect(size(root, '.pages-top')[0]).toBe(200);
      expect(size(root, '.pages-bottom')[0]).toBe(200);
      expect(size(root, '.pages-fore')[1]).toBe(size(root, '.front')[1]);
      expect(part(root, '.board-top')).toBeNull();
      expect(part(root, '.slat')).toBeNull();
      expect(size(root, '.spine')[0]).toBe(51);
    });

    it('gives a hardcover boards with a thickness, overhanging a page block set in from them', async () => {
      const root = await book('binding="hardcover"');
      const [, board] = size(root, '.board-top--front');
      const [pagesWidth] = size(root, '.pages-top');
      const [, pagesHeight] = size(root, '.pages-fore');
      const [, frontHeight] = size(root, '.front');

      expect(board).toBe(3);
      expect(size(root, '.board-bottom--front')[1]).toBe(3);
      expect(pagesWidth).toBeLessThan(200);
      expect(pagesHeight).toBeLessThan(frontHeight);
      // the head and the tail, both seen once the book lies down
      for (const face of ['.endpaper--top', '.endpaper--bottom', '.pages-bottom', '.cap--bottom']) {
        expect(part(root, face)).not.toBeNull();
      }
    });

    it('rounds the spine of a hardcover with slats, each one lit by where it faces', async () => {
      const root = await book('binding="hardcover" name="Manuale"');
      const slats = Array.from(root.shadowRoot!.querySelectorAll<HTMLElement>('.slat'));
      const lights = slats.map((slat) =>
        parseFloat(slat.style.getPropertyValue('--private-book-light')),
      );

      expect(slats).toHaveLength(6);
      expect(new Set(lights.map((value) => value.toFixed(2))).size).toBeGreaterThan(1);
      expect(part(root, '.spine-label .spine-name')).toEqualText('Manuale');
    });

    it('cuts the caps of a rounded spine on the arc of its slats, not past it', async () => {
      const root = await book('binding="hardcover"');
      const numbers = (shape: string) => Array.from(shape.matchAll(/-?[\d.]+/g), Number);
      const arc = numbers(hardcoverCap);

      for (const edge of ['top', 'bottom']) {
        const shape = getComputedStyle(part(root, `.cap--${edge}`)!).clipPath;

        expect(shape).toMatch(/^polygon\(/);
        numbers(shape).forEach((value, index) => expect(value).toBeCloseTo(arc[index], 2));
      }
    });

    it('rebuilds itself when the binding changes', async () => {
      const root = await book('binding="paperback"');

      root.setAttribute('binding', 'hardcover');
      await vi.waitFor(() => expect(part(root, '.board-top')).not.toBeNull());

      expect(part(root, '.spine')).toBeNull();
    });
  });

  describe('the pose', () => {
    type Pose = { glare: number; lay: number; lift: number; tilt: number; turn: number };
    const pose = (book: HTMLElement): Pose => {
      const style = part(book, '.scene')!.style;
      const read = (name: string) => parseFloat(style.getPropertyValue(`--private-book-${name}`));
      return {
        glare: read('glare'),
        lay: read('lay'),
        lift: read('lift'),
        tilt: read('tilt'),
        turn: read('turn'),
      };
    };
    const light = (book: HTMLElement, face: string): number =>
      parseFloat(part(book, '.scene')!.style.getPropertyValue(`--private-book-${face}-light`));
    // the main button held, as during a drag, unless said otherwise
    const pointer = (
      book: HTMLElement,
      type: string,
      x: number,
      {
        buttons = 1,
        pointerType = 'mouse',
        y = 0.5,
      }: { buttons?: number; pointerType?: string; y?: number } = {},
    ): void => {
      const { left, top, width, height } = book.getBoundingClientRect();
      book.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          button: 0,
          buttons,
          clientX: left + width * x,
          clientY: top + height * y,
          pointerId: 3,
          pointerType,
        }),
      );
    };
    const settled = (book: HTMLElement, expected: Partial<Pose>) =>
      vi.waitFor(() => expect(pose(book)).toMatchObject(expected), { timeout: 4000 });
    const book = async (markup = '<mds-book></mds-book>'): Promise<HTMLElement> => {
      const { root } = await render(`<div style="width: 200px">${markup}</div>`);
      return root.querySelector('mds-book')!;
    };

    // The real mouse of the test page stays where an earlier test left it, and a book drawn
    // under it is hovered, out of its resting pose: these books are 200 px wide at the top left
    // of the page, so the mouse waits in the bottom right corner.
    beforeEach(async () => {
      const corner = document.createElement('div');
      corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px';
      document.body.append(corner);
      await userEvent.hover(corner);
      corner.remove();
    });

    afterEach(() => {
      document.documentElement.classList.remove(
        'pref-animation-reduce',
        'pref-consumption-low',
        'pref-consumption-medium',
      );
    });

    it('rests turned, with the spine in sight and the front cover lit as its image', async () => {
      const root = await book();

      expect(pose(root)).toEqual({ glare: 0, lay: 0, lift: 0, tilt: -6, turn: 28 });
      expect(light(root, 'front')).toBe(0);
    });

    it('takes the pose it is given: standing to either side, facing the reader, or lying', async () => {
      const poses = {
        spine: { lay: 0, tilt: -6, turn: 28 },
        'fore-edge': { lay: 0, tilt: -6, turn: -28 },
        front: { lay: 0, tilt: 0, turn: 0 },
        lying: { lay: 90, tilt: -30, turn: 0 },
        'lying-turned': { lay: 90, tilt: -34, turn: 32 },
      };
      for (const [name, angles] of Object.entries(poses)) {
        const root = await book(`<mds-book pose="${name}"></mds-book>`);

        expect(pose(root)).toMatchObject(angles);
        expect(light(root, 'front')).toBe(0);
      }
    });

    it('moves to another pose when the pose changes', async () => {
      const root = await book();

      root.setAttribute('pose', 'lying');

      await settled(root, { lay: 90, tilt: -30, turn: 0 });
    });

    it('rests as spine on a value that is not a pose', async () => {
      const root = await book('<mds-book pose="upside-down"></mds-book>');

      expect(pose(root)).toMatchObject({ lay: 0, tilt: -6, turn: 28 });
    });

    it('spins a lying book on the surface when dragged, past where a standing one stops', async () => {
      const root = await book('<mds-book pose="lying"></mds-book>');
      pointer(root, 'pointerdown', 0.5);

      pointer(root, 'pointermove', 3);

      await settled(root, { lay: 90, turn: 70 });
    });

    it('darkens a face turned away from the light through the opacity of a dark layer', async () => {
      const root = await book();
      const shade = () => parseFloat(getComputedStyle(part(root, '.front .shade')!).opacity);
      expect(shade()).toBe(0);

      pointer(root, 'pointerdown', 0.5);
      pointer(root, 'pointermove', 3);
      await settled(root, { turn: 64 });

      expect(shade()).toBeGreaterThan(0);
    });

    // a translate is applied by the compositor; a background position paints the cover again
    it('slides the gloss across the cover with a translate', async () => {
      const root = await book();
      const gloss = () => getComputedStyle(part(root, '.gloss')!).translate;
      const rest = gloss();

      pointer(root, 'pointerdown', 0.5);
      pointer(root, 'pointermove', 1);
      await settled(root, { glare: 1 });

      expect(gloss()).not.toBe(rest);
    });

    it('keeps still, in its pose, with the consumption set to low', async () => {
      document.documentElement.classList.add('pref-consumption-low');
      await new Promise((resolve) => setTimeout(resolve, 50));
      const root = await book('<mds-book pose="fore-edge"></mds-book>');
      expect(root).toHaveAttribute('pref-consumption', 'low');

      pointer(root, 'pointerenter', 1);
      pointer(root, 'pointerdown', 0.5);
      pointer(root, 'pointermove', 3);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(pose(root)).toEqual({ glare: 0, lay: 0, lift: 0, tilt: -6, turn: -28 });
      expect(getComputedStyle(root).cursor).toBe('auto');
    });

    it('moves without the gloss with the consumption set to medium', async () => {
      document.documentElement.classList.add('pref-consumption-medium');
      await new Promise((resolve) => setTimeout(resolve, 50));
      const root = await book();
      expect(root).toHaveAttribute('pref-consumption', 'medium');

      pointer(root, 'pointerdown', 0.5);
      pointer(root, 'pointermove', 3);

      await settled(root, { glare: 0, turn: 64 });
      expect(getComputedStyle(part(root, '.gloss')!).display).toBe('none');
    });

    it('comes forward on hover, leaning toward the pointer, with a glimpse of gloss', async () => {
      const root = await book();

      pointer(root, 'pointerenter', 1);
      pointer(root, 'pointermove', 1);

      await settled(root, { glare: 0.45, lift: 1, turn: 34 });
    });

    it('goes back to rest when the pointer leaves', async () => {
      const root = await book();
      pointer(root, 'pointerenter', 1);
      pointer(root, 'pointermove', 1);
      await settled(root, { lift: 1 });

      pointer(root, 'pointerleave', 2);

      await settled(root, { glare: 0, lift: 0, turn: 28 });
    });

    it('turns on a drag to show the spine, as far as its limit, and goes back when released', async () => {
      const root = await book();
      expect(getComputedStyle(root).cursor).toBe('ew-resize');
      pointer(root, 'pointerenter', 0.5);
      pointer(root, 'pointerdown', 0.5);

      pointer(root, 'pointermove', 3);
      await settled(root, { glare: 1, turn: 64 });
      expect(light(root, 'spine')).toBeGreaterThan(light(root, 'front'));
      expect(getComputedStyle(part(root, '.scene')!).cursor).toBe('ew-resize');

      pointer(root, 'pointerup', 3);
      pointer(root, 'pointerleave', 3);
      await settled(root, { glare: 0, turn: 28 });
    });

    it('turns the other way to show the pages, never as far as the back cover', async () => {
      const root = await book();
      pointer(root, 'pointerdown', 0.5);

      pointer(root, 'pointermove', -3);

      await settled(root, { turn: -64 });
      expect(light(root, 'fore')).toBeGreaterThan(-1);
    });

    it('turns under a finger too, which has no hover to lean toward', async () => {
      const root = await book();

      pointer(root, 'pointerenter', 1, { pointerType: 'touch' });
      pointer(root, 'pointermove', 1, { pointerType: 'touch' });
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(pose(root)).toMatchObject({ lift: 0, turn: 28 });

      pointer(root, 'pointerdown', 0.5, { pointerType: 'touch' });
      pointer(root, 'pointermove', 0.7, { pointerType: 'touch' });
      await settled(root, { turn: 50 });
    });

    // inside a link, the click that ends a drag would open the link
    describe('a drag that goes out of reach', () => {
      const dragging = async (): Promise<HTMLElement> => {
        const root = await book();
        pointer(root, 'pointerenter', 0.5);
        pointer(root, 'pointerdown', 0.5);
        pointer(root, 'pointermove', 1.5);
        await settled(root, { turn: 64 });
        return root;
      };
      const ended = async (root: HTMLElement) => {
        await settled(root, { turn: 28 });
        expect(part(root, '.scene')).not.toHaveClass('scene--dragging');
      };

      it('ends when the pointer comes back with no button held, released out of the frame', async () => {
        const root = await dragging();

        pointer(root, 'pointermove', 0.5, { buttons: 0 });

        await ended(root);
      });

      it('ends when the pointer leaves the window or the frame of the page', async () => {
        const root = await dragging();

        window.dispatchEvent(new PointerEvent('pointerout', { relatedTarget: null }));

        await ended(root);
      });

      it('ends when the window loses the focus', async () => {
        const root = await dragging();

        window.dispatchEvent(new Event('blur'));

        await ended(root);
      });

      // still over the book, it leans toward the pointer again, as on hover
      it('ends when the browser takes the pointer back', async () => {
        const root = await dragging();

        root.dispatchEvent(new PointerEvent('lostpointercapture', { pointerId: 3 }));

        await settled(root, { glare: 0.45, turn: 34 });
        expect(part(root, '.scene')).not.toHaveClass('scene--dragging');
      });

      it('goes on outside the book, within the page', async () => {
        const root = await dragging();

        pointer(root, 'pointermove', -0.5);

        await settled(root, { turn: -64 });
      });
    });

    it('takes the click that ends a drag, not a plain click', async () => {
      const { root } = await render(
        '<a href="#book" style="display: block; width: 200px"><mds-book></mds-book></a>',
      );
      const inner = root.querySelector('mds-book')!;
      const click = () => {
        const event = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
        part(inner, '.front')!.dispatchEvent(event);
        return event.defaultPrevented;
      };

      expect(click()).toBe(false);

      pointer(inner, 'pointerdown', 0.5);
      pointer(inner, 'pointermove', 0.8);
      pointer(inner, 'pointerup', 0.8);

      expect(click()).toBe(true);
      expect(click()).toBe(false);
    });

    it('keeps its resting pose with reduced motion, and offers no drag', async () => {
      document.documentElement.classList.add('pref-animation-reduce');
      await new Promise((resolve) => setTimeout(resolve, 50));
      const root = await book();
      expect(root).toHaveAttribute('pref-animation', 'reduce');

      pointer(root, 'pointerenter', 1);
      pointer(root, 'pointerdown', 0.5);
      pointer(root, 'pointermove', 3);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(pose(root)).toEqual({ glare: 0, lay: 0, lift: 0, tilt: -6, turn: 28 });
      expect(getComputedStyle(root).cursor).toBe('auto');
    });
  });
});
