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

test('a trackpad flick with a long momentum tail moves one card, and arrow keys step cards', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(site);
  await page.evaluate(() => document.fonts.ready);
  const [, intro, proof] = await cardTops(page);
  const cdp = await page.context().newCDPSession(page);
  const wheel = (dy: number) => cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 700, y: 450, deltaX: 0, deltaY: dy });
  // A tiny accidental touch does nothing.
  for (let i = 0; i < 4; i++) await wheel(3);
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  // Burst then ~1.5s of decaying momentum: exactly one card.
  for (let i = 1; i <= 8; i++) { await wheel(5 * i); await page.waitForTimeout(16); }
  for (let i = 0; i < 90; i++) { await wheel(Math.max(1, 40 * 0.95 ** i)); await page.waitForTimeout(16); }
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 3000 }).toBeCloseTo(intro - 48, -1);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(intro - 48, -1);
  // Each move is debounced: the next one waits for the glide to land plus a 300ms cooldown.
  await page.waitForTimeout(400);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 3000 }).toBeCloseTo(proof - 48, -1);
  await page.waitForTimeout(400);
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 3000 }).toBeCloseTo(intro - 48, -1);
  await page.waitForTimeout(400);
  await page.keyboard.press('Home');
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 3000 }).toBe(0);
  // Holding a key never races through cards.
  await page.waitForTimeout(400);
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(1200);
  await page.keyboard.up('ArrowDown');
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(intro - 48, -1);
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
    const landed = async (top: number) => { const g = await gap(top); return g > 40 && g < 64; };
    await swipe();
    await expect.poll(() => landed(intro), { timeout: 3000 }).toBe(true);
    await page.waitForTimeout(500);
    await swipe();
    await expect.poll(() => landed(proof), { timeout: 3000 }).toBe(true);
  });
});
