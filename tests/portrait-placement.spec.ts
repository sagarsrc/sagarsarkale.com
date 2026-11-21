import { expect, test } from 'playwright/test';

const site = process.env.TEST_SITE_URL ?? 'http://localhost:3002';

for (const width of [390, 1440]) {
  test(`the homepage shows the wave and About shows the portrait at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(site);
    const wave = page.getByRole('img', { name: /breaking wave/ });
    await expect(wave).toBeVisible();
    await wave.evaluate((image: HTMLImageElement) => image.decode());
    await expect(page.getByRole('button', { name: /reveal profile/i })).toHaveCount(0);
    await expect(page.getByRole('img', { name: 'Sagar Sarkale', exact: true })).toHaveCount(0);

    await page.goto(new URL('/about/', site).href);
    const portrait = page.getByRole('img', { name: 'Sagar Sarkale', exact: true });
    await expect(portrait).toBeInViewport();
    await portrait.evaluate((image: HTMLImageElement) => image.decode());
  });
}
