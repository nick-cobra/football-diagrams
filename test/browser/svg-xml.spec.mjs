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
