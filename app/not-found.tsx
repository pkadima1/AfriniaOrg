/**
 * Not-found page (HTTP 404). Renders the same app, so visitors see its
 * translated "Not Found" screen — and retired pages of the old site still
 * lead people to the homepage — while crawlers get a real 404 status.
 */
import { ClientApp } from '@/ClientApp';

export default function NotFound() {
  return (
    <div id="root">
      <ClientApp />
    </div>
  );
}
