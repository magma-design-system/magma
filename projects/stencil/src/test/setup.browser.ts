import { beforeEach } from 'vitest';

// Browser mode shares one page per test file: undo the global side effects a test can leave
// (the mds-pref-* controllers write <html lang>, pref-* classes and the storages).
beforeEach(() => {
  const html = document.documentElement;
  html.removeAttribute('lang');
  Array.from(html.classList)
    .filter((name) => name.startsWith('pref-'))
    .forEach((name) => html.classList.remove(name));
  localStorage.clear();
  sessionStorage.clear();
});
