/**
 * spa.tsx — browser entry of the existing React Router app (formerly main.tsx).
 * WHY: during the migration Next.js renders this app in the browser only
 * (see ClientApp.tsx). Pages move out of it into server-rendered Next.js
 * routes in M2; when none are left, this file and App.tsx are deleted.
 */
import './i18n';

export { default } from './App';
