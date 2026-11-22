import { expect, test } from 'playwright/test';

const site = process.env.TEST_SITE_URL ?? 'http://localhost:3002';

for (const width of [390, 1440]) {
  test(`page progress tracks the full scroll range at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/blog/genai/making-misal/']) {
      await page.goto(new URL(path, site).href);
      await page.evaluate(() => document.fonts.ready);
      const bar = page.getByRole('progressbar', { name: 'Reading progress' });
      if (path === '/') {
        const wave = page.getByRole('img', { name: /breaking wave/i });
        await wave.evaluate((image: HTMLImageElement) => image.decode());
        const box = await wave.boundingBox();
        expect(box!.width).toBe(width);
        expect(box!.height).toBeGreaterThan(800);
        await page.evaluate(() => window.scrollTo({ top: 180, behavior: 'instant' }));
        const cover = page.locator('.landing-hero');
        const pinnedTop = (await cover.boundingBox())!.y;
        await page.evaluate(() => window.scrollTo({ top: 610, behavior: 'instant' }));
        await expect.poll(async () => (await cover.boundingBox())!.y).toBeCloseTo(pinnedTop, 0);
        await expect.poll(() => wave.evaluate(image => new DOMMatrix(getComputedStyle(image).transform).a)).toBeGreaterThan(1.15);
        await expect(page.locator('.landing-intro')).toBeInViewport();
      }
      for (const percent of [0, 50, 100, 25, 0]) {
        await page.evaluate(value => {
          const root = document.documentElement;
          window.scrollTo({ top: (root.scrollHeight - root.clientHeight) * value / 100, behavior: 'instant' });
        }, percent);
        await expect(bar).toHaveAttribute('aria-valuenow', String(percent));
        await expect.poll(() => bar.evaluate(element => {
          const root = document.documentElement;
          const fraction = window.scrollY / (root.scrollHeight - root.clientHeight);
          const expected = element.getBoundingClientRect().width * fraction;
          return Math.abs(element.firstElementChild!.getBoundingClientRect().width - expected);
        })).toBeLessThan(2);
      }
    }
  });
}
