import { expect, test } from '@playwright/test';

const site = process.env.TEST_SITE_URL ?? 'http://localhost:3002';

const cardTops = (page: import('@playwright/test').Page) => page.evaluate(() =>
  [...document.querySelectorAll('.snap-point')].map(el => el.getBoundingClientRect().top + scrollY));

test('one wheel gesture moves exactly one card on the homepage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(site);
  await page.evaluate(() => document.fonts.ready);
  const [, intro, proof] = await cardTops(page);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 3000 }).toBeCloseTo(intro - 48, -1);
  await page.waitForTimeout(500);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 3000 }).toBeCloseTo(proof - 48, -1);
  await page.waitForTimeout(500);
  await page.mouse.wheel(0, -120);
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 3000 }).toBeCloseTo(intro - 48, -1);
});

test.describe('phone', () => {
  test.use({ isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } });

  test('one swipe moves exactly one card on the homepage', async ({ page }) => {
    await page.goto(site);
    await page.evaluate(() => document.fonts.ready);
    const [, intro, proof] = await cardTops(page);
    const cdp = await page.context().newCDPSession(page);
    const swipe = async () => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 600 }] });
      for (let k = 1; k <= 8; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 600 - k * 40 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    // The card's top lands just under the header (48-57px, depending on its state).
    const gap = (top: number) => page.evaluate(t => t - scrollY, top);
    await swipe();
    await expect.poll(() => gap(intro), { timeout: 3000 }).toBeGreaterThan(40);
    expect(await gap(intro)).toBeLessThan(64);
    await page.waitForTimeout(500);
    await swipe();
    await expect.poll(() => gap(proof), { timeout: 3000 }).toBeGreaterThan(40);
    expect(await gap(proof)).toBeLessThan(64);
  });
});
