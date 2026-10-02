'use client';
/**
 * ClientApp.tsx — mounts the existing React Router app inside Next.js.
 * WHY: the app reads window, localStorage and Firebase Auth at import time, so
 * it must never run on the server (ssr: false). This is the official
 * "migrate from Vite" step: identical behaviour first, server rendering
 * page by page in M2. Used by app/page.tsx and app/not-found.tsx.
 */
import dynamic from 'next/dynamic';

const Spa = dynamic(() => import('@/spa'), { ssr: false });

export function ClientApp() {
  return <Spa />;
}
