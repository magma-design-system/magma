import { E2EPage, newE2EPage } from '@stencil/core/testing';

const setupUploadInContainer = async (width: number, attributes = ''): Promise<E2EPage> => {
  const page = await newE2EPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setContent(`
    <div style="width: ${width}px;">
      <mds-input-upload ${attributes}></mds-input-upload>
    </div>
  `);
  await page.waitForChanges();
  return page;
};

const addFiles = async (page: E2EPage, count: number): Promise<void> => {
  await page.$eval(
    'mds-input-upload',
    (element, filesCount) => {
      const files = Array.from(
        { length: filesCount as number },
        (_, index) => new File(['magma'], `file-${index + 1}.txt`, { type: 'text/plain' }),
      );
      (element as HTMLMdsInputUploadElement).initialValue = files;
    },
    count,
  );
  await page.waitForChanges();
};

const readCaptionMetrics = (page: E2EPage): Promise<{ height: number; lineHeight: number }> =>
  page.$eval('mds-input-upload', (element) => {
    const caption = element.shadowRoot?.querySelector('.main-infos mds-text') as HTMLElement;
    const text = caption.shadowRoot?.querySelector('.text') as HTMLElement;
    const style = getComputedStyle(text);
    return {
      height: text.getBoundingClientRect().height,
      lineHeight: parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5,
    };
  });

const readActionPositions = (page: E2EPage): Promise<{ x: number; y: number }[]> =>
  page.$eval('mds-input-upload', (element) => {
    const buttons = Array.from(
      element.shadowRoot?.querySelectorAll('.main-actions mds-button') ?? [],
    ) as HTMLElement[];
    return buttons.map((button) => {
      const { x, y } = button.getBoundingClientRect();
      return { x, y };
    });
  });

describe('mds-input-upload', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-input-upload></mds-input-upload>');

    const component = await page.find('mds-input-upload');
    expect(component).toHaveAttribute('hydrated');
  });
});

describe('mds-input-upload drag-area layout', () => {
  // Only the progress bar is capped (--spacing(8000)): the counter caption keeps the full
  // drag-area width, so it must stay on a single line in every shipped locale, both before
  // (maxFilesUpload) and after (currentFilesWithMax) some files are uploaded — including in wide
  // fallback fonts such as DejaVu Sans (Karla ships no greek subset, and the CI runner renders
  // the el strings with it).
  it.each(['en', 'it', 'es', 'el'])(
    'keeps the counter caption on a single line at regular widths (%s)',
    async (language) => {
      const page = await setupUploadInContainer(800, 'max-files="5"');
      await page.evaluate((lang) => {
        document.documentElement.lang = lang as string;
      }, language);
      await page.waitForChanges();

      const before = await readCaptionMetrics(page);
      expect(before.height).toBeLessThanOrEqual(before.lineHeight + 1);

      await addFiles(page, 2);

      const after = await readCaptionMetrics(page);
      expect(after.height).toBeLessThanOrEqual(after.lineHeight + 1);
    },
  );

  it('lays the add and cancel actions on the same row in a wide container', async () => {
    const page = await setupUploadInContainer(800, 'max-files="5"');
    await addFiles(page, 1);

    const actions = await readActionPositions(page);

    expect(actions).toHaveLength(2);
    expect(Math.abs(actions[1].y - actions[0].y)).toBeLessThanOrEqual(1);
    expect(actions[1].x).toBeGreaterThan(actions[0].x);
  });

  it('stacks the actions below the 340px container breakpoint', async () => {
    const page = await setupUploadInContainer(300, 'max-files="5"');
    await addFiles(page, 1);

    const actions = await readActionPositions(page);

    // The breakpoint is resolved against the :host container-type, so it must trigger from the
    // component's own width without any consumer-provided container ancestor.
    expect(actions).toHaveLength(2);
    expect(actions[1].y).toBeGreaterThan(actions[0].y);
  });

  it('caps the progress bar width and centers it in the infos column', async () => {
    const page = await setupUploadInContainer(800);

    const metrics = await page.$eval('mds-input-upload', (element) => {
      const progress = element.shadowRoot?.querySelector('.progress-bar') as HTMLElement;
      const infos = element.shadowRoot?.querySelector('.main-infos') as HTMLElement;
      const progressRect = progress.getBoundingClientRect();
      const infosRect = infos.getBoundingClientRect();
      return {
        width: progressRect.width,
        leftGap: progressRect.left - infosRect.left,
        rightGap: infosRect.right - progressRect.right,
      };
    });

    expect(metrics.width).toBe(320);
    expect(Math.abs(metrics.leftGap - metrics.rightGap)).toBeLessThanOrEqual(1);
  });
});
