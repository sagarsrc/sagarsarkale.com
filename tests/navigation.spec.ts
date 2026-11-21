import { expect, test } from '@playwright/test';

const site = process.env.TEST_SITE_URL ?? 'http://localhost:3002';

test('desktop navigation stays aligned when navigating from Home to Blog', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(site);
  const home = page.locator('header').getByRole('link', { name: 'sagar sarkale' });
  const blog = page.locator('header nav').getByRole('link', { name: 'blog' });
  const homeX = (await home.boundingBox())!.x;
  const blogX = (await blog.boundingBox())!.x;
  await blog.click();
  await expect(page).toHaveURL(/\/blog\/?$/);
  await expect.poll(async () => (await home.boundingBox())!.x).toBe(homeX);
  await expect.poll(async () => (await blog.boundingBox())!.x).toBe(blogX);
});

test('switching to desktop closes the mobile menu and restores scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(site);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 844 });
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Close menu' })).toHaveCount(0);
});
