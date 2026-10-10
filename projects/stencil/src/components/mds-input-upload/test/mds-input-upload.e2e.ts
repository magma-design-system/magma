import { render, vi } from '@stencil/vitest';
import { AttachmentSort, LOCALSTORAGE_KEY_USER_SORT } from '../meta/types';

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

const namedFiles = (...names: string[]): File[] =>
  names.map((name) => new File(['m'], name, { type: 'text/plain' }));

const toFileList = (files: File[]): FileList => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  return dataTransfer.files;
};

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

  // a removed attribute leaves null, the value Angular and Vue bind for a missing one
  it.each([
    ['removed', (upload: HTMLElement) => upload.removeAttribute('sort')],
    ['empty', (upload: HTMLElement) => upload.setAttribute('sort', '')],
  ])('should not show sort once the sort attribute is %s', async (_, clearSort) => {
    const result = await setupUpload('sort="date" max-files="5"');
    await addFiles(result, 2);

    clearSort(result.upload);
    await result.waitForChanges();

    expect(result.upload.shadowRoot!.querySelector('.action-sort')).toBeNull();
  });

  it('should count the files without a maximum once max-files is removed', async () => {
    const result = await setupUpload('max-files="5"');
    await addFiles(result, 2);

    result.upload.removeAttribute('max-files');
    await result.waitForChanges();

    const caption = result.upload.shadowRoot!.querySelector('.main-infos mds-text')!;
    expect(caption.textContent).toBe('You have uploaded 2 files');
  });

  it('should set the files picked with the native input', async () => {
    const { upload, waitForChanges } = await setupUpload('max-files="2"');
    const inputElement = upload.shadowRoot!.querySelector('input')!;

    inputElement.files = toFileList(mockFiles(2));
    inputElement.dispatchEvent(new Event('change'));
    await waitForChanges();

    expect(await upload.getFiles()).toHaveLength(2);
    // the files live in the component: the picker is cleared to pick a removed file again
    expect(inputElement.value).toBe('');
  });
});

// Like a native file input, the accepted files reach the form (#822)
describe('mds-input-upload form participation', () => {
  const setupForm = async (attributes: string) => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      `<form><mds-input-upload ${attributes}></mds-input-upload></form>`,
    );
    return { form, upload: form.querySelector('mds-input-upload')!, waitForChanges };
  };

  it('submits every accepted file under its name', async () => {
    const { form, upload, waitForChanges } = await setupForm('name="docs" max-files="2"');

    upload.initialValue = namedFiles('a.txt', 'b.txt', 'c.txt');
    await waitForChanges();

    const entries = new FormData(form).getAll('docs');
    // c.txt goes over max-files: it is shown as an error, not submitted
    expect(entries.map((entry) => (entry as File).name)).toEqual(['a.txt', 'b.txt']);
    expect(entries[0]).toBeInstanceOf(File);
  });

  it('submits nothing without a name, like a native file input', async () => {
    const { form, upload, waitForChanges } = await setupForm('max-files="2"');

    upload.initialValue = namedFiles('a.txt');
    await waitForChanges();

    expect(Array.from(new FormData(form).keys())).toEqual([]);
  });

  it('submits the files under a name set after they were added', async () => {
    const { form, upload, waitForChanges } = await setupForm('name="docs" max-files="2"');
    upload.initialValue = namedFiles('a.txt');
    await waitForChanges();

    upload.setAttribute('name', 'attachments');
    await waitForChanges();

    const data = new FormData(form);
    expect(data.getAll('docs')).toHaveLength(0);
    expect((data.get('attachments') as File).name).toBe('a.txt');
  });

  it('clears the files on a form reset', async () => {
    const { form, upload, waitForChanges } = await setupForm('name="docs" max-files="2"');
    upload.initialValue = namedFiles('a.txt', 'b.txt');
    await waitForChanges();

    form.reset();
    await waitForChanges();

    expect(new FormData(form).getAll('docs')).toHaveLength(0);
    expect(await upload.getFiles()).toHaveLength(0);
    expect(upload.shadowRoot!.querySelectorAll('mds-file-preview')).toHaveLength(0);
  });

  it('applies an initial value set before the component loads', async () => {
    const form = document.createElement('form');
    const upload = document.createElement('mds-input-upload');
    upload.setAttribute('name', 'docs');
    upload.setAttribute('max-files', '2');
    upload.initialValue = namedFiles('a.txt', 'b.txt');
    const changes: (FileList | null)[] = [];
    upload.addEventListener('mdsInputUploadChange', (event) => changes.push(event.detail));
    form.append(upload);
    document.body.append(form);

    try {
      await upload.componentOnReady();

      expect(await upload.getFiles()).toHaveLength(2);
      expect(new FormData(form).getAll('docs')).toHaveLength(2);
      expect(changes).toHaveLength(1);
      expect(changes[0]).toHaveLength(2);
    } finally {
      form.remove();
    }
  });
});

describe('mds-input-upload sort', () => {
  const readOrder = (upload: HTMLElement): string[] =>
    Array.from(upload.shadowRoot!.querySelectorAll('mds-file-preview')).map((preview) =>
      preview.getAttribute('filename')!,
    );

  const readTab = (upload: HTMLElement, value: AttachmentSort): HTMLMdsTabItemElement =>
    upload.shadowRoot!.querySelector<HTMLMdsTabItemElement>(`mds-tab-item[value="${value}"]`)!;

  afterEach(() => {
    localStorage.removeItem(LOCALSTORAGE_KEY_USER_SORT);
  });

  it('keeps the order the user picked when files are added', async () => {
    const result = await setupUpload('sort="status" max-files="5"');
    result.upload.initialValue = namedFiles('a.txt', 'b.txt');
    await result.waitForChanges();
    expect(readOrder(result.upload)).toEqual(['a.txt', 'b.txt']);

    readTab(result.upload, 'date').shadowRoot!.querySelector('mds-button')!.click();
    await result.waitForChanges();
    expect(readOrder(result.upload)).toEqual(['b.txt', 'a.txt']);

    result.upload.initialValue = namedFiles('c.txt');
    await result.waitForChanges();

    expect(readOrder(result.upload)).toEqual(['c.txt', 'b.txt', 'a.txt']);
    expect(readTab(result.upload, 'date')).toHaveAttribute('selected');
    expect(localStorage.getItem(LOCALSTORAGE_KEY_USER_SORT)).toBe('date');
  });

  it('starts from the sort attribute and highlights it, whatever the stored choice', async () => {
    localStorage.setItem(LOCALSTORAGE_KEY_USER_SORT, 'date');
    const result = await setupUpload('sort="status" max-files="5"');
    result.upload.initialValue = namedFiles('a.txt', 'b.txt');
    await result.waitForChanges();

    expect(readOrder(result.upload)).toEqual(['a.txt', 'b.txt']);
    expect(readTab(result.upload, 'status')).toHaveAttribute('selected');
    expect(readTab(result.upload, 'date')).not.toHaveAttribute('selected');
  });

  it('applies a new sort attribute without storing it as the user choice', async () => {
    const result = await setupUpload('sort="status" max-files="5"');
    result.upload.initialValue = namedFiles('a.txt', 'b.txt');
    await result.waitForChanges();

    result.upload.setAttribute('sort', 'date');
    await result.waitForChanges();

    expect(readOrder(result.upload)).toEqual(['b.txt', 'a.txt']);
    expect(readTab(result.upload, 'date')).toHaveAttribute('selected');
    expect(localStorage.getItem(LOCALSTORAGE_KEY_USER_SORT)).toBeNull();
  });
});

describe('mds-input-upload drag and drop', () => {
  const readPrompt = (upload: HTMLElement): string =>
    upload.shadowRoot!.querySelector<HTMLMdsTextElement>('.main-action mds-text')!.text!;

  it('restores the prompt once the files are dropped', async () => {
    const { upload, waitForChanges } = await setupUpload('max-files="2"');
    const dragArea = upload.shadowRoot!.querySelector('.drag-area')!;

    dragArea.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true }));
    await waitForChanges();
    expect(dragArea).toHaveClass('drag-area--on-drag-enter');
    expect(readPrompt(upload)).toBe('Drop files to upload here');

    const dataTransfer = new DataTransfer();
    namedFiles('a.txt').forEach((file) => dataTransfer.items.add(file));
    dragArea.dispatchEvent(
      new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }),
    );
    await waitForChanges();

    expect(dragArea).not.toHaveClass('drag-area--on-drag-enter');
    expect(readPrompt(upload)).toBe('Click and select or drag files to upload here');
    expect(await upload.getFiles()).toHaveLength(1);
  });
});

describe('mds-input-upload previews', () => {
  const readSources = (upload: HTMLElement): string[] =>
    Array.from(upload.shadowRoot!.querySelectorAll('mds-file-preview')).map((preview) =>
      preview.getAttribute('src')!,
    );

  it('creates one object URL per file and revokes it when the file is removed', async () => {
    const { upload, waitForChanges } = await setupUpload('max-files="2"');
    // spied after the render, which disconnects the components of the previous tests
    const createObjectURL = vi.spyOn(URL, 'createObjectURL');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
    upload.initialValue = namedFiles('a.txt', 'b.txt');
    await waitForChanges();
    const sources = readSources(upload);

    // a render that does not touch the files, the drag prompt
    const dragArea = upload.shadowRoot!.querySelector('.drag-area')!;
    dragArea.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true }));
    await waitForChanges();

    expect(readSources(upload)).toEqual(sources);
    expect(createObjectURL).toHaveBeenCalledTimes(2);

    upload
      .shadowRoot!.querySelector('mds-file-preview')!
      .dispatchEvent(new CustomEvent('mdsFileDelete'));
    await waitForChanges();

    expect(revokeObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith(sources[0]);
  });

  it('renders new object URLs when the component is moved', async () => {
    const { upload, waitForChanges } = await setupUpload('max-files="2"');
    upload.initialValue = namedFiles('a.txt');
    await waitForChanges();
    const [source] = readSources(upload);

    const parent = upload.parentElement!;
    upload.remove();
    parent.append(upload);
    await waitForChanges();

    const [moved] = readSources(upload);
    expect(moved).not.toBe(source);
    expect((await fetch(moved)).ok).toBe(true);
    await expect(fetch(source)).rejects.toThrow();
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
