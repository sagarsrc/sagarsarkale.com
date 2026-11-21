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
        expect(box!.width).toBeCloseTo(box!.height, 0);
      }
      for (const percent of [0, 50, 100, 25, 0]) {
        await page.evaluate(value => {
          const root = document.documentElement;
          window.scrollTo({ top: (root.scrollHeight - root.clientHeight) * value / 100, behavior: 'instant' });
        }, percent);
        await expect(bar).toHaveAttribute('aria-valuenow', String(percent));
        const fill = await bar.locator('div').boundingBox();
        expect(Math.abs((fill?.width ?? 0) - width * percent / 100)).toBeLessThan(2);
      }
    }
  });
}
