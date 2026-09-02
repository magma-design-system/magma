import { spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer';

// Stencil 4.x reads puppeteer.executablePath() synchronously, but puppeteer 25
// made it async, so Stencil would pass a pending Promise as the browser path.
// Resolve it here and hand it to Stencil through the env var it checks first.
const main = async (): Promise<void> => {
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ?? (await puppeteer.executablePath());

  const result = spawnSync('stencil', ['test', ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, PUPPETEER_EXECUTABLE_PATH: executablePath },
  });

  process.exit(result.status ?? 1);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
