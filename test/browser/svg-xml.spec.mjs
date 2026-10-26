import { test, expect } from '@playwright/test';

test('standalone SSR SVGs parse as XML across every document string carrier', async ({ page, request }) => {
  // The independent packed consumer supplies the markup using the selected
  // React version, rather than the test runner's local React dependency.
  const response = await request.get('/svg-text-cases.json');
  expect(response.ok()).toBe(true);
  const cases = await response.json();
  expect(cases).toHaveLength(998);
  const failures = await page.evaluate(cases => {
    const parser = new DOMParser();
    const failures = [];
    for (const { name, svg, selector, attribute, expected } of cases) {
      const document = parser.parseFromString(svg, 'image/svg+xml');
      if (document.querySelector('parsererror') || document.documentElement.localName !== 'svg') {
        failures.push({ name, error: document.documentElement.textContent });
        continue;
      }
      if (document.documentElement.namespaceURI !== 'http://www.w3.org/2000/svg') {
        failures.push({ name, error: 'Missing SVG namespace' });
        continue;
      }
      if (!selector) continue;
      const node = document.querySelector(selector);
      const actual = attribute ? node?.getAttribute(attribute) : node?.textContent;
      // XML 1.0 normalises line endings and attribute whitespace while parsing.
      const normalised = attribute ? expected.replace(/[\t\r\n]/g, ' ') : expected.replace(/\r/g, '\n');
      if (!actual?.includes(normalised)) failures.push({ name, expected: normalised, actual });
    }
    return failures;
  }, cases);
  expect(failures).toEqual([]);
});

test('raw SSR output decodes and paints as a standalone SVG image', async ({ page, request }) => {
  const response = await request.get('/svg-image-cases.json');
  expect(response.ok()).toBe(true);
  const cases = await response.json();
  expect(cases).toHaveLength(12);
  const failures = await page.evaluate(async cases => {
    const failures = [];
    for (const { name, svg } of cases) {
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      try {
        const image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 240; canvas.height = 180;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, 240, 180);
        const pixels = context.getImageData(0, 0, 240, 180).data;
        if (!image.naturalWidth || !image.naturalHeight || !pixels.some((value, index) => index % 4 === 3 && value > 0)) {
          failures.push({ name, error: 'Image has no painted pixels' });
        }
      } catch (error) {
        failures.push({ name, error: String(error) });
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    return failures;
  }, cases);
  expect(failures).toEqual([]);
});
