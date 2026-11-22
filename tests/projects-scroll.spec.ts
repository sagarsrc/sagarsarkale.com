import { expect, test } from '@playwright/test';

const site = process.env.TEST_SITE_URL ?? 'http://localhost:3002';

for (const width of [390, 1440]) {
  test(`sections stack: What I Built holds while Consulting slides over it at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(site);
    await page.evaluate(() => document.fonts.ready);
    const built = page.locator('#what-i-built');
    const next = page.locator('.landing-section').first();
    await expect(built.getByRole('heading', { name: 'quickcall.dev' })).toHaveCount(1);
    await expect(built.locator('.landing-status')).toHaveCount(0);
    const jumpTo = (y: number) => page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y);
    const nextStart = await next.evaluate(el => el.getBoundingClientRect().top + scrollY);
    await jumpTo(nextStart - 700);
    await page.waitForTimeout(150);
    const stuck = (await built.boundingBox())!.y;
    const nextTop = (await next.boundingBox())!.y;
    await jumpTo(nextStart - 300);
    await page.waitForTimeout(150);
    // It shrinks a little as it is covered, but does not travel with the 400px scroll.
    expect(Math.abs((await built.boundingBox())!.y - stuck)).toBeLessThan(80);
    expect((await next.boundingBox())!.y).toBeLessThan(nextTop - 300);
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
