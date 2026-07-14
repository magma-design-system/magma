import puppeteer from 'puppeteer';
import type { Deck } from '../model/types.js';
import { exportHtml, type HtmlOptions } from './html.js';
import { applyUtilities } from './tailwind.js';

export interface PdfOptions extends HtmlOptions {
  /** Also generate the Tailwind utilities the author used (opt-in, adds a step). */
  tailwind?: boolean;
}

/**
 * Render a deck to a PDF (one slide per page at 1280x720). Prints the
 * self-contained HTML from {@link exportHtml} through headless Chromium, which
 * applies the `@media print` rules (all slides shown, page-broken).
 */
export async function exportPdf(deck: Deck, options: PdfOptions = {}): Promise<Uint8Array> {
  let html = exportHtml(deck, options);
  if (options.tailwind) html = await applyUtilities(html);
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    return await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}
