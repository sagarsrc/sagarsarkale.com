import { test, expect } from 'playwright/test';

const PAGE = 'http://localhost:3000/blog/genai/what-is-mcp-part1';

test.describe('Mermaid diagram rendering', () => {
  test('diagrams render at readable size, not as tiny thumbnails', async ({ page }) => {
    await page.goto(PAGE, { waitUntil: 'networkidle' });

    const diagrams = page.locator('.mermaid-diagram');
    const count = await diagrams.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const wrapper = diagrams.nth(i);
      const svg = wrapper.locator('svg');
      await expect(svg).toBeVisible();

      const box = await svg.boundingBox();
      expect(box).not.toBeNull();

      // A readable diagram must be at least 300px in both dimensions
      expect(box!.width, `diagram ${i} width`).toBeGreaterThan(300);
      expect(box!.height, `diagram ${i} height`).toBeGreaterThan(300);

      await wrapper.screenshot({ path: `test-results/mermaid-${i}.png` });
    }
  });

  test('MCP architecture diagram section looks correct', async ({ page }) => {
    await page.goto(`${PAGE}#mcp-architecture`, { waitUntil: 'networkidle' });

    const heading = page.locator('#mcp-architecture');
    await expect(heading).toBeVisible();

    const diagram = page.locator('.mermaid-diagram').first();
    await expect(diagram.locator('svg')).toBeVisible();

    const box = await diagram.locator('svg').boundingBox();
    expect(box!.width).toBeGreaterThan(400);
    expect(box!.height).toBeGreaterThan(400);

    await diagram.screenshot({ path: 'test-results/mcp-architecture.png' });
  });
});
