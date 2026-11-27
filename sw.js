// ===== SERVICE WORKER V-Makhraj =====
// Strategi "rangkaian dahulu": sentiasa ambil fail terbaharu dari pelayan (sesuai semasa masih dikemas kini),
// dan simpan salinan supaya aplikasi masih boleh dibuka tanpa internet.
// Folder unity/ dan video tidak disimpan kerana saiznya besar.
const CACHE = 'vmakhraj-v1';
const ASAS = [
    './', './index.html', './style.css', './data.js', './data2.js', './app.js', './skor.js', './aktiviti.js', './animasi.js',
    './manifest.webmanifest', './assets/ikon/ikon-192.png', './assets/ikon/ikon-512.png'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASAS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
    const req = e.request, url = new URL(req.url);
    if (req.method !== 'GET') return;
    if (url.origin === location.origin && (url.pathname.includes('/unity/') || url.pathname.includes('/assets/video/'))) return;
    const bolehSimpan = url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
    if (!bolehSimpan) return;
    e.respondWith(
        fetch(req).then(res => {
            if (res.ok && res.type !== 'opaque') { const salin = res.clone(); caches.open(CACHE).then(c => c.put(req, salin)); }
            return res;
        }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
    );
});