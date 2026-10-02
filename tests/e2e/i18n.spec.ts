/**
 * Language coverage: the same UI in French and English — header sign-in
 * buttons, the footer's social links (only platforms enabled in the admin)
 * and the sign-in window's texts.
 * No login is submitted: repeated wrong logins against production Firebase
 * get this machine rate-limited ("too many attempts" — seen 2026-10-02).
 * The translated wrong-password message is a manual check (verify skill).
 */
import { expect, test } from '@playwright/test';
import { collectErrors } from './helpers';

const CASES = [
  { path: '/fr/blog', signIn: 'Se connecter', signUp: "S'inscrire", follow: 'Suivre', title: 'Bon retour parmi nous', email: 'Adresse e-mail', forgot: 'Mot de passe oublié ?' },
  { path: '/en/blog', signIn: 'Sign In', signUp: 'Sign Up', follow: 'Follow', title: 'Welcome Back', email: 'Email Address', forgot: 'Forgot your password?' },
];

for (const c of CASES) {
  test(`${c.path}: header, footer and sign-in speak the page language`, async ({ page }, info) => {
    test.skip(info.project.name === 'mobile-375', 'header buttons collapse into the mobile menu; covered on desktop');
    const errors = collectErrors(page);
    await page.goto(c.path);
    await expect(page.locator('header button', { hasText: c.signIn })).toBeVisible();
    await expect(page.locator('header button', { hasText: c.signUp })).toBeVisible();

    const footer = page.locator('footer');
    await expect(footer.getByText(c.follow, { exact: true })).toBeVisible();
    await expect(footer.locator('a[href*="facebook.com"]')).toHaveCount(1);
    await expect(footer.locator('a[href*="linkedin.com"], a[href*="spotify.com"], a[href*="twitter.com"], a[href*="youtube.com"]')).toHaveCount(0);

    await page.locator('header button', { hasText: c.signIn }).click();
    await expect(page.getByText(c.title, { exact: true })).toBeVisible();
    await expect(page.locator('label[for=login-email]')).toHaveText(c.email);
    await expect(page.getByRole('button', { name: c.forgot })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
