import { expect, test } from '@playwright/test';

const site = process.env.TEST_SITE_URL ?? 'http://localhost:3002';

for (const width of [390, 1440]) {
  test(`the project section scrolls with the page instead of pinning at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(site);
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#what-i-built');
    const title = section.locator('h2');
    const quickcall = section.getByRole('heading', { name: 'quickcall.dev' });
    const misal = section.getByRole('heading', { name: /misal/ });

    await title.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    const before = (await title.boundingBox())!.y;
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(200);
    expect((await title.boundingBox())!.y).toBeLessThan(before - 300);

    await quickcall.scrollIntoViewIfNeeded();
    await expect(quickcall).toBeInViewport();
    await misal.scrollIntoViewIfNeeded();
    await expect(misal).toBeInViewport();
    await expect(section.locator('.landing-status')).toHaveCount(0);
  });
}

test('project titles stay on one line and visuals keep their width on wide desktops', async ({ page }) => {
  await page.goto(site);
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1440, 1920, 2560, 3440]) {
    await page.setViewportSize({ width, height: 1200 });
    for (const article of await page.locator('.landing-projects article').all()) {
      const box = (await article.boundingBox())!;
      const visual = (await article.locator('.pv').boundingBox())!;
      expect(visual.width).toBeGreaterThan(box.width * .5);
    }
    const title = page.getByRole('heading', { name: 'quickcall.dev' });
    const lines = await title.evaluate(el => (el as HTMLElement).offsetHeight / parseFloat(getComputedStyle(el).lineHeight));
    expect(lines).toBeCloseTo(1, 1);
  }
});
