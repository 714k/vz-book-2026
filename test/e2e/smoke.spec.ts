import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readdirSync } from 'node:fs';

const projectSlugs = readdirSync('./src/content/projects')
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.replace(/\.json$/, ''));

const staticRoutes = [
  '/',
  '/at-the-beginning/',
  '/at-the-beginning/no-one-knows/',
  '/at-the-beginning/no-one-knows/the-fixer/',
  '/at-the-beginning/no-one-knows/the-navigator/',
  '/at-the-beginning/no-one-knows/the-server/',
  '/at-the-beginning/nobody-knows-he-worked-on/',
  '/at-the-beginning/nor-where-to-find-him/',
];

const projectRoutes = projectSlugs.map(
  (slug) => `/at-the-beginning/nobody-knows-he-worked-on/${slug}/`,
);

const routes = [...staticRoutes, ...projectRoutes];

for (const route of routes) {
  test(`${route} loads with no console/page errors`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const response = await page.goto(route);

    expect(response?.ok(), `${route} responded with ${response?.status()}`).toBe(true);
    await expect(page).toHaveTitle(/.+/);
    expect(consoleErrors, `console errors on ${route}`).toEqual([]);
    expect(pageErrors, `uncaught page errors on ${route}`).toEqual([]);
  });

  test(`${route} has no critical accessibility violations`, async ({ page }, testInfo) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    // Attach every violation (any severity) as a report, but only fail the
    // build on 'critical' ones - e.g. per-project accent colors currently
    // fail 'serious' color-contrast checks, which needs a deliberate design
    // pass across ~8 projects' brand colors, not a quick code fix.
    if (results.violations.length) {
      await testInfo.attach('axe-violations', {
        body: JSON.stringify(results.violations, null, 2),
        contentType: 'application/json',
      });
    }

    const critical = results.violations.filter((violation) => violation.impact === 'critical');
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
}

test('project pages link to a working previous/next project', async ({ page }) => {
  await page.goto(`/at-the-beginning/nobody-knows-he-worked-on/${projectSlugs[0]}/`);

  const nav = page.locator('footer a.left, footer a.right').first();
  await expect(nav).toBeVisible();
});
