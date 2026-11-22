import { expect, test } from '@playwright/test';

const site = process.env.TEST_SITE_URL ?? 'http://localhost:3002';

for (const width of [390, 1440]) {
  test(`the project stage holds while projects pass through at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(site);
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('.landing-built');
    const stage = section.locator('.landing-built-stage');
    const quickcall = section.getByRole('heading', { name: 'quickcall.dev' });
    const misal = section.getByRole('heading', { name: /misal/ });
    const jump = async (offset: number) => {
      await section.evaluate((el, delta) => {
        window.scrollTo({ top: scrollY + el.getBoundingClientRect().top + delta, behavior: 'instant' });
      }, offset);
    };
    await jump(20);
    await expect(quickcall).toBeInViewport();
    const top = (await stage.boundingBox())!.y;
    const headingTop = (await section.locator('h2').boundingBox())!.y;
    const height = (await stage.boundingBox())!.height;
    expect(height).toBeGreaterThan(800);
    await jump(height * .8);
    await expect(misal).toBeInViewport();
    await expect(quickcall).not.toBeInViewport();
    expect((await stage.boundingBox())!.y).toBeCloseTo(top, 0);
    expect((await section.locator('h2').boundingBox())!.y).toBeCloseTo(headingTop, 0);
    await jump(20);
    await expect(quickcall).toBeInViewport();
    await page.getByRole('heading', { name: 'Consulting' }).evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    const released = (await stage.boundingBox())!;
    const header = (await page.locator('header').boundingBox())!;
    expect(released.y + released.height).toBeLessThanOrEqual(header.y + header.height);
    await expect(page.getByRole('heading', { name: 'Consulting' })).toBeInViewport();
  });
}

test('both project columns stay readable on wide desktops', async ({ page }) => {
  await page.goto(site);
  await page.evaluate(() => document.fonts.ready);
  const projects = page.locator('.landing-projects');
  for (const width of [1440, 1920, 2560, 3440, 5120]) {
    await page.setViewportSize({ width, height: 1290 });
    const container = (await projects.boundingBox())!;
    for (const article of await projects.locator('article').all()) {
      const box = (await article.boundingBox())!;
      expect(box.width).toBeGreaterThan(container.width * .55);
      expect(box.x + box.width).toBeCloseTo(container.x + container.width, 0);
    }
    const title = projects.getByRole('heading', { name: 'quickcall.dev' });
    const lines = await title.evaluate(el => el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight));
    expect(lines).toBeCloseTo(1, 1);
  }
});
