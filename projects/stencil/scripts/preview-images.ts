/*
  The images of the previews (#1243): renders every preview the build copied into
  agents/patterns/previews/ (sync-agent-docs.ts) in the frame of PREVIEW_IMAGE, light and dark,
  and writes each beside its stage as <id>.light.webp and <id>.dark.webp, for the readers that
  cannot run the stage: the cards of the docs site, get_pattern for a client without a browser,
  a decision that cannot run live. In magma only, the package get_pattern and the docs site
  read: the wrappers depend on it.

  The render is the one of render_preview (projects/lint/src/mcp/render.ts) on the components
  this build made, and an image with a problem fails the build, so no image ships that its check
  did not pass; it is written all the same, to be looked at. Needs playwright-core and a browser
  of the machine (Google Chrome, Microsoft Edge or the Chromium of `npx playwright install
  chromium`), as render_preview does: the runners of GitHub have Google Chrome. Runs at the end
  of the build, after dist/magma-components.
*/
import { writeFileSync } from 'fs';
import { availableParallelism } from 'os';
import { join, relative } from 'path';
import { previewImageFile, readPreviews } from '../../lint/src/core/patterns';
import { renderPreviewImages } from '../../lint/src/mcp/render';
import { PROJECT_DIR } from './meta';

const REPO = join(PROJECT_DIR, '../..');
const DIR = join(PROJECT_DIR, 'agents/patterns');
// half the cores, up to four pages at a time: three browsers at once on a runner of 4 cores
// slowed a first render to 30-58 s (#1241), one browser with two pages does not
const CONCURRENCY = Math.max(1, Math.min(4, Math.floor(availableParallelism() / 2)));

const previews = readPreviews(DIR);
const started = Date.now();
renderPreviewImages({ root: REPO, settings: { root: REPO } }, previews, CONCURRENCY)
  .then((images) => {
    let bytes = 0;
    const failed: string[] = [];
    for (const image of images) {
      const file = previewImageFile(image.preview.file, image.mode);
      writeFileSync(file, image.webp);
      bytes += image.webp.length;
      for (const problem of image.problems)
        failed.push(
          `${relative(REPO, file)}: ${problem.kind}${problem.element ? ` ${problem.element}` : ''} - ${problem.detail}`,
        );
    }
    if (failed.length) {
      console.error(
        `${failed.length} problem(s) in the images of the previews (render_preview checks them the same way; npx nx run lint:serve.previews shows a preview live):\n${failed
          .map((one) => `  - ${one}`)
          .join('\n')}`,
      );
      process.exit(1);
    }
    console.log(
      `preview images -> ${relative(REPO, DIR)}/previews: ${images.length} images of ${previews.length} previews, ${Math.round(bytes / 1024)} KB, in ${Math.round((Date.now() - started) / 1000)} s`,
    );
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
