/**
 * Run the stories' play functions and a11y checks against the static Storybook.
 *
 * Serves `dist-storybook` (built by `npm run storybook.build`) on an ephemeral
 * port, points `test-storybook` at it and exits with the test-runner's exit
 * code, so CI and a local run behave the same without a live Storybook on 6006.
 * Extra arguments are forwarded: `npm run test.storybook.static -- --testTimeout 30000`.
 */
import { spawn } from 'node:child_process';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { type AddressInfo } from 'node:net';
import { extname, join, normalize } from 'node:path';
import { DIST_STORYBOOK_DIR } from './meta';

const MIME_TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.mjs': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!existsSync(join(DIST_STORYBOOK_DIR, 'index.json'))) {
  console.error(
    `No static Storybook in ${DIST_STORYBOOK_DIR}: run \`npm run storybook.build\` first`,
  );
  process.exit(1);
}

const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  // normalize() folds `..` away, so a request never leaves dist-storybook
  let file = join(DIST_STORYBOOK_DIR, normalize(pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {
    'Content-Type': MIME_TYPES[extname(file)] ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(response);
});

server.listen(0, '127.0.0.1', () => {
  const { port } = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${port}`;
  console.info(`Serving ${DIST_STORYBOOK_DIR} on ${url}`);
  const runner = spawn('test-storybook', ['--url', url, ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  runner.on('exit', (code, signal) => {
    server.close();
    process.exit(code ?? (signal ? 1 : 0));
  });
});
