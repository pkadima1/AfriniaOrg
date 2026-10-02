/**
 * The interactive parts visitors use, in both languages and at phone width
 * (project mobile-375). Read-only: no form is submitted with real data.
 */
import { expect, test } from '@playwright/test';
import { ARTICLE_FR, BUILDER_EN, collectErrors, useLanguage } from './helpers';

test.beforeEach(async ({ page }) => useLanguage(page, 'fr'));

test('homepage audio: play opens the bottom player, close removes it', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  // Placeholder rows (same class, not clickable) show until episodes load
  // from Firestore — wait for a real, playable one.
  await page.locator('.afrinia-episode[style*="cursor: pointer"]').first().click();
  const close = page.locator('button[title="Close player"]');
  await expect(close).toBeVisible();
  await close.click();
  await expect(close).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('language switcher moves the blog to the other language', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile-375', 'switcher sits in the mobile menu; covered on desktop');
  await page.goto('/en/blog');
  await page.getByRole('button', { name: /english|français|language/i }).first().click();
  await page.getByRole('menuitem', { name: /français/i }).click();
  await expect(page).toHaveURL(/\/fr\/blog$/);
});

test('newsletter rejects an invalid email before sending anything', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('form.afrinia-subscribe-form').first();
  await form.scrollIntoViewIfNeeded();
  await form.locator('input').fill('not-an-email');
  await form.locator('button').click();
  expect(await form.locator('input').evaluate(i => (i as HTMLInputElement).validity.valid)).toBe(false);
});

test('comment form keeps typed text and caps its length', async ({ page }) => {
  await page.goto(ARTICLE_FR);
  const textarea = page.locator('form:has(.comment-form-grid) textarea');
  await textarea.fill('Test e2e');
  await expect(textarea).toHaveValue('Test e2e');
  await expect(textarea).toHaveAttribute('maxlength', '2000');
});

test('builder profile renders (English-only profile)', async ({ page }) => {
  await page.goto(BUILDER_EN);
  await expect(page.locator('h1')).toHaveText('Aliko Mohammad Dangote');
});

test('no horizontal scrolling on the homepage and blog', async ({ page }) => {
  for (const path of ['/', '/fr/blog', '/fr/builders']) {
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
