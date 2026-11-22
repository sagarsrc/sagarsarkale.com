import { expect, test } from '@playwright/test';

const site = process.env.TEST_SITE_URL ?? 'http://localhost:3002';

test('the homepage shares the wave card with absolute Open Graph and X tags', async ({ page, request }) => {
  await page.goto(site);
  const meta = (key: string) => page.locator(`meta[property="${key}"], meta[name="${key}"]`).first().getAttribute('content');
  expect(await meta('og:image')).toBe('https://sagarsarkale.com/social/home.jpg');
  expect(await meta('og:image:width')).toBe('1200');
  expect(await meta('og:image:height')).toBe('630');
  expect(await meta('og:image:alt')).toContain('wave');
  expect(await meta('twitter:card')).toBe('summary_large_image');
  expect(await meta('twitter:image')).toBe('https://sagarsarkale.com/social/home.jpg');
  const image = await request.get(new URL('/social/home.jpg', site).href);
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/jpeg');
  expect((await image.body()).length).toBeLessThan(300 * 1024);
  const square = await page.locator('meta[property="og:image"]').nth(1).getAttribute('content');
  expect(square).toBe('https://sagarsarkale.com/social/square.jpg');
  const sq = await request.get(new URL('/social/square.jpg', site).href);
  expect(sq.status()).toBe(200);
  expect((await sq.body()).length).toBeLessThan(300 * 1024);
});
