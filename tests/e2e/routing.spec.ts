/**
 * Routing as a visitor experiences it: real 404s, legacy links, redirects,
 * in-app navigation without page reloads, and per-page titles/canonicals.
 */
import { expect, test } from '@playwright/test';
import { ARTICLE_FR, collectErrors, useLanguage } from './helpers';

test.beforeEach(async ({ page }) => useLanguage(page, 'fr'));

test('an unknown URL answers 404 and shows the app\'s Not Found screen', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('404');
});

test('a retired page answers 404 to crawlers but takes visitors home', async ({ page }) => {
  const res = await page.goto('/services');
  expect(res?.status()).toBe(404);
  await expect(page).toHaveURL(/\/$/);
});

test('/blog and /builders redirect to the French listings', async ({ page }) => {
  await page.goto('/blog');
  await expect(page).toHaveURL(/\/fr\/blog$/);
  await page.goto('/builders');
  await expect(page).toHaveURL(/\/fr\/builders$/);
});

test('mixed-case URLs lead visitors to the lowercase page', async ({ page }) => {
  await page.goto('/ABOUT');
  await expect(page).toHaveURL(/\/about$/);
});

test('in-app navigation updates title and canonical without reloading the page', async ({ page }) => {
  const errors = collectErrors(page);
  let documentLoads = 0;
  page.on('request', r => { if (r.resourceType() === 'document') documentLoads++; });
  await page.goto('/fr/blog');
  await expect(page.locator('a[href^="/fr/blog/"]').first()).toBeVisible();
  documentLoads = 0;
  await page.locator('a[href^="/fr/blog/"]').first().click();
  await expect(page).toHaveURL(/\/fr\/blog\/.+/);
  await expect(page.locator('h1')).not.toBeEmpty();
  const { pathname } = new URL(page.url());
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://afrinia.org${pathname}`);
  expect(documentLoads).toBe(0);
  expect(errors).toEqual([]);
});

test('an article page shows its content with its own canonical', async ({ page }) => {
  const errors = collectErrors(page);
  const res = await page.goto(ARTICLE_FR);
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText('Coton');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://afrinia.org${ARTICLE_FR}`);
  expect(errors).toEqual([]);
});
