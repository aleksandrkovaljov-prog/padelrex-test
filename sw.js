/* Padelrex service worker: network-first for own pages/files (always fresh when online), cache as offline fallback.
   Firebase / Google requests are not touched. */
const CACHE = "padelrex-test-v1";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(["v3.html", "icon-192.png"]).catch(() => {}))); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url); if (u.origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(res => { if (res && res.ok) { const cp = res.clone(); const key = u.pathname.endsWith(".html") ? new Request(u.origin + u.pathname) : r; caches.open(CACHE).then(c => c.put(key, cp)); } return res; })
    .catch(() => caches.match(u.pathname.endsWith(".html") ? new Request(u.origin + u.pathname) : r).then(m => m || caches.match("v3.html"))));
});
