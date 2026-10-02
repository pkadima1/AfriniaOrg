/**
 * The app shell — one static page, built once, served for every known path.
 * WHY one page: during the migration every route of the existing React Router
 * app needs the same HTML; proxy.ts rewrites known paths to this page, so
 * Next.js stores one copy instead of one per URL (a per-URL cache would also
 * fill up with 404s for random URLs). Pages move to their own server-rendered
 * routes in M2.
 */
import { ClientApp } from '@/ClientApp';

export default function AppShell() {
  return (
    <div id="root">
      <ClientApp />
    </div>
  );
}
