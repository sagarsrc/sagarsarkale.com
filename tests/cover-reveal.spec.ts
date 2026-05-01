import { test, expect } from 'playwright/test';

const PAGE = 'http://localhost:3002/';

test.describe('Homepage cover reveal interaction', () => {
  test('wave image is visible initially', async ({ page }) => {
    await page.goto(PAGE, { waitUntil: 'networkidle' });

    const wrapper = page.locator('.cover-reveal-wrapper');
    await expect(wrapper).toBeVisible();

    await wrapper.screenshot({ path: 'test-results/home-reveal-initial.png' });
  });

  test('clicking fades to reveal profile image', async ({ page }) => {
    await page.goto(PAGE, { waitUntil: 'networkidle' });

    const wrapper = page.locator('.cover-reveal-wrapper');
    const cover = page.locator('.cover-reveal-cover');

    await wrapper.click();
    await page.waitForTimeout(600);

    await expect(cover).toHaveClass(/is-revealed/);

    await wrapper.screenshot({ path: 'test-results/home-reveal-revealed.png' });
  });
});
