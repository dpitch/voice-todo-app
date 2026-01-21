import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Custom caching strategies for offline support
const offlineCache: RuntimeCaching[] = [
  // Cache the app shell (main page) for offline access
  {
    matcher: ({ request, sameOrigin }) =>
      sameOrigin && request.mode === "navigate",
    handler: new NetworkFirst({
      cacheName: "pages-cache",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
      ],
      networkTimeoutSeconds: 3,
    }),
  },
  // Cache static assets (icons, images) with CacheFirst strategy
  {
    matcher: /\/icons\/.*\.png$/i,
    handler: new CacheFirst({
      cacheName: "pwa-icons",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    }),
  },
  // Cache manifest.json
  {
    matcher: /\/manifest\.json$/i,
    handler: new CacheFirst({
      cacheName: "manifest-cache",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 1,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    }),
  },
  // Convex API requests - NetworkOnly since they are real-time
  // Convex handles its own caching and sync mechanisms
  {
    matcher: /\.convex\.cloud/i,
    handler: new NetworkOnly(),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...offlineCache, ...defaultCache],
});

serwist.addEventListeners();
