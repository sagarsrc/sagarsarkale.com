import { expect, test } from '@playwright/test';

const site = process.env.TEST_SITE_URL ?? 'http://localhost:3002';

test('the homepage shares the wave card with absolute Open Graph and X tags', async ({ page, request }) => {
  await page.goto(site);
  const meta = (key: string) => page.locator(`meta[property="${key}"], meta[name="${key}"]`).first().getAttribute('content');
  expect(await meta('og:image')).toBe('https://sagarsarkale.com/social/home.png');
  expect(await meta('og:image:width')).toBe('1200');
  expect(await meta('og:image:height')).toBe('630');
  expect(await meta('og:image:alt')).toContain('wave');
  expect(await meta('twitter:card')).toBe('summary_large_image');
  expect(await meta('twitter:image')).toBe('https://sagarsarkale.com/social/home.png');
  const image = await request.get(new URL('/social/home.png', site).href);
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/png');
  expect((await image.body()).length).toBeLessThan(5 * 1024 * 1024);
});
