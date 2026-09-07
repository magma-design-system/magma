import { render } from '@stencil/vitest';

type Upload = { upload: HTMLMdsInputUploadElement; waitForChanges: () => Promise<void> };

const setupUpload = async (attributes = ''): Promise<Upload> => {
  const { root, waitForChanges } = await render<HTMLMdsInputUploadElement>(
    `<mds-input-upload ${attributes}></mds-input-upload>`,
  );
  return { upload: root, waitForChanges };
};

const setupUploadInContainer = async (width: number, attributes = ''): Promise<Upload> => {
  const { root, waitForChanges } = await render(`
    <div style="width: ${width}px;">
      <mds-input-upload ${attributes}></mds-input-upload>
    </div>
  `);
  return {
    upload: root.querySelector<HTMLMdsInputUploadElement>('mds-input-upload')!,
    waitForChanges,
  };
};

const mockFiles = (count: number, size = 5): File[] =>
  Array.from(
    { length: count },
    (_, index) => new File(['m'.repeat(size)], `file-${index + 1}.txt`, { type: 'text/plain' }),
  );

const addFiles = async ({ upload, waitForChanges }: Upload, count: number): Promise<void> => {
  upload.initialValue = mockFiles(count);
  await waitForChanges();
};

const readCaptionMetrics = (upload: HTMLElement): { height: number; lineHeight: number } => {
  const caption = upload.shadowRoot!.querySelector<HTMLElement>('.main-infos mds-text')!;
  const text = caption.shadowRoot!.querySelector<HTMLElement>('.text')!;
  const style = getComputedStyle(text);
  return {
    height: text.getBoundingClientRect().height,
    lineHeight: parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5,
  };
};

const readActionPositions = (upload: HTMLElement): { x: number; y: number }[] =>
  Array.from(upload.shadowRoot!.querySelectorAll<HTMLElement>('.main-actions mds-button')).map(
    (button) => {
      const { x, y } = button.getBoundingClientRect();
      return { x, y };
    },
  );

describe('mds-input-upload', () => {
  it('renders', async () => {
    const { upload } = await setupUpload();

    expect(upload).toHaveAttribute('hydrated');
  });

  it('should set default attributes', async () => {
    const { upload } = await setupUpload();

    expect(upload.accept).toBe('');
    expect(upload.maxFileSize).toBe(20);
    expect(upload.maxFiles).toBe(1);
    expect(upload.sort).toBeUndefined();
  });

  it('should accept only pdf', async () => {
    const { upload } = await setupUpload('accept=".pdf"');
    const shadow = upload.shadowRoot!;
    const extensionText = shadow.querySelector('.file-specs')?.firstChild;
    const sizeText = shadow.querySelector('.file-specs')?.lastChild;

    expect(upload.accept).toBe('.pdf');
    expect(shadow.querySelector('.main-actions')?.childElementCount).toBe(1);
    expect(extensionText?.textContent).toContain('PDF');
    expect(sizeText?.textContent).toContain('20');
  });

  it('should show 10 max files with 5mb max file size', async () => {
    const { upload } = await setupUpload('max-files="10" max-file-size="5"');
    const shadow = upload.shadowRoot!;
    const sizeText = shadow.querySelector('.file-specs')?.lastChild;
    const nfilesText = shadow.querySelector('.main-infos mds-text');

    expect(upload.accept).toBe('');
    expect(upload.maxFiles).toBe(10);
    expect(upload.maxFileSize).toBe(5);
    expect(nfilesText?.textContent).toContain('10');
    expect(sizeText?.textContent).toContain('5');
  });

  it('should not show sort', async () => {
    const { upload } = await setupUpload('sort="status"');

    expect(upload.sort).toBe('status');
    expect(upload.shadowRoot!.querySelector('.action-sort')).toBeNull();
  });

  it('should not show sort when more than one file is added and sort hasnt been set', async () => {
    const result = await setupUpload('max-files="5"');
    await addFiles(result, 2);

    expect(result.upload.shadowRoot!.querySelector('.action-sort')).toBeNull();
  });

  it('should not show sort when one file is added and sort has been set', async () => {
    const result = await setupUpload('sort="date" max-files="5"');
    await addFiles(result, 1);

    expect(result.upload.shadowRoot!.querySelector('.action-sort')).toBeNull();
  });

  it('should show sort when more than one file is added and sort has been set', async () => {
    const result = await setupUpload('sort="date" max-files="5"');
    await addFiles(result, 2);

    const sortTab = result.upload.shadowRoot!.querySelector('.action-sort');
    expect(sortTab).toBeTruthy();
    expect(sortTab?.firstChild).toHaveAttribute('selected');
  });

  it('should set files', async () => {
    const { upload, waitForChanges } = await setupUpload();
    const inputElement = upload.shadowRoot!.querySelector('input')!;

    const dataTransfer = new DataTransfer();
    mockFiles(2).forEach((file) => dataTransfer.items.add(file));
    inputElement.files = dataTransfer.files;
    await waitForChanges();

    expect(await upload.getFiles()).toHaveLength(2);
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
      const result = await setupUploadInContainer(800, 'max-files="5"');
      document.documentElement.lang = language;
      await result.waitForChanges();

      const before = readCaptionMetrics(result.upload);
      expect(before.height).toBeLessThanOrEqual(before.lineHeight + 1);

      await addFiles(result, 2);

      const after = readCaptionMetrics(result.upload);
      expect(after.height).toBeLessThanOrEqual(after.lineHeight + 1);
    },
  );

  it('lays the add and cancel actions on the same row in a wide container', async () => {
    const result = await setupUploadInContainer(800, 'max-files="5"');
    await addFiles(result, 1);

    const actions = readActionPositions(result.upload);

    expect(actions).toHaveLength(2);
    expect(Math.abs(actions[1].y - actions[0].y)).toBeLessThanOrEqual(1);
    expect(actions[1].x).toBeGreaterThan(actions[0].x);
  });

  it('stacks the actions below the 340px container breakpoint', async () => {
    const result = await setupUploadInContainer(300, 'max-files="5"');
    await addFiles(result, 1);

    const actions = readActionPositions(result.upload);

    // The breakpoint is resolved against the :host container-type, so it must trigger from the
    // component's own width without any consumer-provided container ancestor.
    expect(actions).toHaveLength(2);
    expect(actions[1].y).toBeGreaterThan(actions[0].y);
  });

  it('caps the progress bar width and centers it in the infos column', async () => {
    const { upload } = await setupUploadInContainer(800);
    const progressRect = upload.shadowRoot!.querySelector('.progress-bar')!.getBoundingClientRect();
    const infosRect = upload.shadowRoot!.querySelector('.main-infos')!.getBoundingClientRect();

    expect(progressRect.width).toBe(320);
    expect(
      Math.abs(progressRect.left - infosRect.left - (infosRect.right - progressRect.right)),
    ).toBeLessThanOrEqual(1);
  });
});
