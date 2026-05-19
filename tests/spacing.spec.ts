import { test, expect } from '@playwright/test';

const HEADER_HEIGHT = 56; // h-14 = 3.5rem = 56px

async function checkHeaderToHeadingGap(page: import('@playwright/test').Page) {
  const header = page.locator('header');
  const h1 = page.locator('h1').first();
  
  await expect(header).toBeVisible();
  await expect(h1).toBeVisible();
  
  const headerBox = await header.boundingBox();
  const h1Box = await h1.boundingBox();
  
  expect(headerBox).toBeTruthy();
  expect(h1Box).toBeTruthy();
  
  const gap = h1Box!.y - (headerBox!.y + headerBox!.height);
  expect(gap).toBeGreaterThanOrEqual(24); // at least 24px breathing room
  
  return gap;
}

test.describe('header-to-heading spacing', () => {
  test('blog post has proper gap', async ({ page }) => {
    await page.goto('http://localhost:3000/blog/genai/what-is-mcp-part1/');
    await page.waitForLoadState('networkidle');
    
    const gap = await checkHeaderToHeadingGap(page);
    console.log(`Blog post gap: ${gap}px`);
    
    await page.screenshot({ path: 'test-results/blog-post-spacing.png', fullPage: false });
  });
  
  test('agents page has proper gap', async ({ page }) => {
    await page.goto('http://localhost:3000/agents/');
    await page.waitForLoadState('networkidle');
    
    const gap = await checkHeaderToHeadingGap(page);
    console.log(`Agents page gap: ${gap}px`);
    
    await page.screenshot({ path: 'test-results/agents-spacing.png', fullPage: false });
  });
  
  test('home page has proper gap', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    const gap = await checkHeaderToHeadingGap(page);
    console.log(`Home page gap: ${gap}px`);
    
    await page.screenshot({ path: 'test-results/home-spacing.png', fullPage: false });
  });
});
