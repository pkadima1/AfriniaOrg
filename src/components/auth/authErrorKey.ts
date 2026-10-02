/**
 * authErrorKey.ts — turns a Firebase Auth error into a translation key.
 * WHY: Firebase errors read like "Firebase: Error (auth/invalid-credential).",
 * in English, whatever the page language. Visitors see a clear message in
 * their language instead; anything unrecognised falls back to "unexpected".
 * Used by: AuthModal (sign in, sign up, password reset).
 */

const CODE_TO_KEY: Record<string, string> = {
  'auth/invalid-credential': 'auth.errors.invalidCredentials',
  'auth/wrong-password': 'auth.errors.invalidCredentials',
  'auth/user-not-found': 'auth.errors.invalidCredentials',
  'auth/invalid-login-credentials': 'auth.errors.invalidCredentials',
  'auth/email-already-in-use': 'auth.errors.emailInUse',
  'auth/invalid-email': 'auth.errors.invalidEmail',
  'auth/weak-password': 'auth.errors.passwordTooShort',
  'auth/too-many-requests': 'auth.errors.tooManyRequests',
  'auth/network-request-failed': 'auth.errors.network',
};

export function authErrorKey(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code;
  return (typeof code === 'string' && CODE_TO_KEY[code]) || 'auth.errors.unexpected';
}
