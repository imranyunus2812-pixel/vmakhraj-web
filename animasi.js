// ===== ANIMASI MASUK (teks dan elemen muncul apabila dipaparkan di skrin) =====
// - Tajuk muncul perkataan demi perkataan.
// - Kad, butang dan cip muncul berperingkat apabila masuk ke skrin (termasuk semasa skrol).
// - Animasi diulang setiap kali halaman (Belajar, Aktiviti, ...) dibuka.
// - Dimatikan jika peranti menetapkan "kurangkan gerakan" (prefers-reduced-motion).
// Guna sifat CSS `translate`/`scale` (bukan `transform`) supaya tidak mengganggu kesan hover atau kad yang berpusing.
const Animasi = (() => {
    const kurang = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (kurang || !('IntersectionObserver' in window)) return { view() { } };

    // Jenis animasi bagi setiap kumpulan elemen
    const JENIS = [
        ['kata', '.tajuk, .bel-tajuk, .hero-teks h1, .kepala3d h2, .in-kepala h2, .slaid-teks h2'],
        ['naik', '.bel-kecil-k, .lencana, .lencana-emas, .sub, .bel-sub, .bel-kecil, .bel-teks, .hero-teks p, .kepala3d p, .pemisah-emas, .ringkas, .detail-kepala, .akt-bar, .akt-stat, .cr-titik, .tk-kepala, .s-tanya, .ks-atas, .s-maklum, .belajar-pautan > p, .bel-rujuk, .status3d, .bar3d, .nota-telefon'],
        ['pop', '.c, .tk-kad, .kad-makhraj, .kl-kad, .sf-kad, .kad-aktiviti, .nod, .langkah-kad, .sk-baris, .kad-slaid, .in-mk, .in-misi > div, .in-kepala, .kad-soalan, .bel-nota, .tip, .kl-beza, .sf-ingat, .in-arahan, .pd-lihat, .pb-video, .stage3d, .cr-info, .s-besar, .hero-visual, .terapung, .kepala-kotak, .susun-pentas, .cr-unity, .legenda, .rumusan'],
        ['kiri', '.tk-baris, .tempat, .legenda li, .sk-bar, .in-tempat'],
        ['cip', '.kl-chip, .tj, .chip, .hm, .hh, .tag, .pilihan, .bakul, .cr-mk, .chip-pautan, .btn-utama, .btn-kaca, .btn-kembali, .pemain-chip, .seg, .km-mula, .in-h, .ubin, .bulat-kawal, .btn-gelap, .ka-tag']
    ];
    // Bahagian permainan yang bergerak sendiri: jangan diganggu
    const ABAI = '.lorong, .hero, .susun-ubin, .grid-ingat, .modal, #toast, .zon, .susun-mula, .dpad, .latar, .h-bekas, .atas';
    const SEMUA = JENIS.map(j => j[1]).join(', ');

    // Pecahkan teks tajuk kepada perkataan (huruf Arab dan teks bergradien dikekalkan sebagai satu unit)
    function pecahKata(el) {
        if (el.dataset.kata) return;
        el.dataset.kata = '1';
        let i = 0;
        const balut = n => {
            [...n.childNodes].forEach(c => {
                if (c.nodeType === 3) {
                    const bahagian = c.textContent.split(/(\s+)/);
                    if (bahagian.every(b => !b.trim())) return;
                    const frag = document.createDocumentFragment();
                    bahagian.forEach(b => {
                        if (!b) return;
                        if (!b.trim()) { frag.appendChild(document.createTextNode(b)); return; }
                        const s = document.createElement('span'); s.className = 'kata'; s.style.setProperty('--i', i++); s.textContent = b;
                        frag.appendChild(s);
                    });
                    c.replaceWith(frag);
                } else if (c.nodeType === 1) {
                    if (c.matches('.arab, .gradien, .maskot, svg, br, em, .bil')) {
                        if (c.tagName === 'BR') return;
                        c.classList.add('kata'); c.style.setProperty('--i', i++);
                    } else balut(c);
                }
            });
        };
        balut(el);
    }

    const io = new IntersectionObserver(entri => {
        const baru = entri.filter(e => e.isIntersecting).map(e => e.target)
            .sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return (ra.top - rb.top) || (ra.left - rb.left); });
        baru.forEach((el, i) => {
            el.style.setProperty('--tunda', Math.min(i * 55, 700) + 'ms');
            el.classList.add('nampak');
            io.unobserve(el);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    function tanda(el) {
        if (el.closest(ABAI) && !el.matches('.kad-soalan, .s-besar')) return;
        if (el.dataset.anim) return;
        const j = JENIS.find(([, sel]) => el.matches(sel));
        if (!j) return;
        el.dataset.anim = j[0];
        if (j[0] === 'kata') pecahKata(el);
        el.classList.add('muncul');
        io.observe(el);
        // Selepas animasi tamat, buang kelas supaya animasi lain (lantun, goyang, hover) berfungsi seperti biasa
        let tamat = 0;
        el.addEventListener('animationend', e => {
            if (!/^anim-/.test(e.animationName) || !el.classList.contains('nampak')) return;
            if (j[0] === 'kata') { if (++tamat < el.querySelectorAll('.kata').length) return; tamat = 0; }
            else if (e.target !== el) return;
            el.classList.remove('muncul', 'nampak');
        });
    }
    function imbas(akar) {
        if (!akar || akar.nodeType !== 1) return;
        if (akar.matches(SEMUA)) tanda(akar);
        akar.querySelectorAll(SEMUA).forEach(tanda);
    }
    // Main semula animasi untuk satu halaman
    function ulang(akar) {
        akar.querySelectorAll('[data-anim]').forEach(el => {
            if (el.closest(ABAI) && !el.matches('.kad-soalan, .s-besar')) return;
            el.classList.remove('nampak'); el.classList.add('muncul'); el.style.removeProperty('--tunda'); io.observe(el);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const main = document.querySelector('main');
        imbas(main);
        // Kandungan yang dibina semula (soalan kuiz, aktiviti, butiran makhraj) juga dianimasikan
        new MutationObserver(m => m.forEach(r => r.addedNodes.forEach(imbas))).observe(main, { childList: true, subtree: true });
        document.documentElement.classList.add('anim-sedia');
    });

    return { view(v) { const el = document.getElementById('view-' + v); if (el && document.documentElement.classList.contains('anim-sedia')) ulang(el); } };
})();