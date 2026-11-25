// ===== PEMBURU MAKHRAJ: game jelajah peta =====
const Hunter = (() => {
    const WW = 1800, WH = 1200;
    const MULA = { x: 1500, y: 900 };

    const ZON = [
        {
            id: 'jauf', nama: 'Al-Jauf', banner: 'ZON AL-JAUF', emoji: '🕳️', x: 40, y: 40, w: 520, h: 520, warna: '#8B5CF6',
            hias: ['☁️', '🌬️', '🪨', '🕳️'], bintang: [{ x: 200, y: 300 }, { x: 400, y: 430 }]
        },
        {
            id: 'halq', nama: 'Al-Halq', banner: 'ZON AL-HALQ', emoji: '🗣️', x: 640, y: 40, w: 520, h: 520, warna: '#10B981',
            hias: ['🌲', '🌿', '🍃', '🍄'], bintang: [{ x: 800, y: 330 }, { x: 1000, y: 440 }]
        },
        {
            id: 'lisan', nama: 'Al-Lisan', banner: 'ZON AL-LISAN', emoji: '👅', x: 1240, y: 40, w: 520, h: 520, warna: '#EC4899',
            hias: ['🍦', '🍭', '🍓', '🍒'], bintang: [{ x: 1380, y: 300 }, { x: 1620, y: 430 }]
        },
        {
            id: 'syafatain', nama: 'Asy-Syafatain', banner: 'ZON ASY-SYAFATAIN', emoji: '👄', x: 40, y: 640, w: 520, h: 520, warna: '#F59E0B',
            hias: ['🌴', '🐚', '🦀', '🏖️'], bintang: [{ x: 200, y: 880 }, { x: 420, y: 1010 }]
        },
        {
            id: 'khaisyum', nama: 'Al-Khaisyum', banner: 'ZON AL-KHAISYUM', emoji: '👃', x: 640, y: 640, w: 520, h: 520, warna: '#06B6D4',
            hias: ['🌸', '🌺', '🌼', '🦋'], bintang: [{ x: 820, y: 900 }, { x: 1000, y: 1010 }]
        },
        {
            id: 'mula', nama: 'Taman Permulaan', banner: 'TAMAN PERMULAAN', emoji: '🏁', x: 1240, y: 640, w: 520, h: 520, warna: '#6366F1',
            hias: ['⛲', '🌳', '🪴', '🌷'], bintang: []
        }
    ];

    const WATAK = [
        { e: '🧒', n: 'Ali' }, { e: '👧', n: 'Aisyah' }, { e: '🧑‍🚀', n: 'Angkasa' }, { e: '🦸', n: 'Wira' }, { e: '🧙', n: 'Pendeta' },
        { e: '🥷', n: 'Ninja' }, { e: '🧚', n: 'Pari-pari' }, { e: '🐱', n: 'Kucing' }, { e: '🦊', n: 'Rubah' }, { e: '🐼', n: 'Panda' }
    ];

    // Hiasan zon (posisi tetap, dijana dengan benih)
    function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    ZON.forEach((z, zi) => {
        const r = rng(zi * 97 + 13); z.hp = []; let cuba = 0;
        while (z.hp.length < 9 && cuba++ < 300) {
            const x = z.x + 50 + r() * (z.w - 100), y = z.y + 120 + r() * (z.h - 170);
            if (z.bintang.some(b => Math.hypot(b.x - x, b.y - y) < 95)) continue;
            if (Math.hypot(MULA.x - x, MULA.y - y) < 95) continue;
            if (z.hp.some(p => Math.hypot(p.x - x, p.y - y) < 85)) continue;
            z.hp.push({ x, y, e: z.hias[Math.floor(r() * z.hias.length)] });
        }
    });

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const getar = () => { try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { } };
    let ctx, vw = 0, vh = 0, raf = 0, last = 0, aktif = false, sedangMain = false, dah = false;
    let S = null, profil = muatProfil() || { nama: '', watak: 0 };
    const kekunci = {}, dp = {}; let larian = false;

    function simpanProfil() { try { localStorage.setItem('makhraj_profil', JSON.stringify(profil)); } catch (e) { } }

    // ----- Soalan -----
    function soalanZon(id) {
        if (id === 'jauf') return kocok([0, 1, 5]).slice(0, 2).map(i => statik(SOALAN_GUA[i]));
        if (id === 'khaisyum') return kocok([2, 3, 4]).slice(0, 2).map(i => statik(SOALAN_GUA[i]));
        const m = M(id), [a, b] = kocok(m.tempat);
        return [qTempat(m, a), qTempatHuruf(m, b)];
    }

    // ----- Skrin profil -----
    function init() {
        if (dah) return; dah = true;
        ctx = $('#h-kanvas').getContext('2d');
        $('#h-watak').innerHTML = WATAK.map((w, i) => `<button class="watak" data-i="${i}"><span>${w.e}</span><small>${w.n}</small></button>`).join('');
        $('#h-watak').addEventListener('click', e => {
            const b = e.target.closest('.watak'); if (!b) return;
            bunyi('klik'); profil.watak = +b.dataset.i; tanda();
        });
        $('#h-mula').onclick = () => {
            const nama = $('#h-nama').value.trim();
            const medan = $('#h-nama').closest('.medan');
            if (!nama) { medan.classList.remove('ralat'); void medan.offsetWidth; medan.classList.add('ralat'); $('#h-nama').focus(); bunyi('salah'); return; }
            profil.nama = nama; simpanProfil(); bunyi('klik'); mulaPermainan();
        };
        $('#h-bunyi').onclick = () => { window.BISU = !window.BISU; $('#h-bunyi').textContent = window.BISU ? '🔇' : '🔊'; if (window.BISU) speechSynthesis.cancel(); };
        $('#h-ulang').onclick = () => { bunyi('klik'); mulaPermainan(); };
        $('#h-keluar').onclick = () => { bunyi('klik'); sedangMain = false; henti(); tunjukProfil(); };
        $('#h-lari').onclick = () => { larian = !larian; $('#h-lari').classList.toggle('aktif', larian); };
        $('#h-jeda').onclick = () => {
            if (!S || S.tamat || !$('#modal').hidden) return;
            S.jedaManual = !S.jedaManual; S.jeda = S.jedaManual;
            $('#h-jeda-tanda').hidden = !S.jedaManual; $('#h-jeda').classList.toggle('aktif', S.jedaManual);
            bunyi('klik'); if (!S.jeda) last = performance.now();
        };

        // D-pad sentuhan: jari boleh digelongsor dan arah serong dibenarkan
        const pad = $('.dpad');
        let padAktif = false;
        const sorot = () => $$('.dpad [data-d]').forEach(b => b.classList.toggle('tekan', !!dp[b.dataset.d]));
        const hitung = e => {
            const r = pad.getBoundingClientRect();
            const x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
            dp.kiri = x < -0.12; dp.kanan = x > 0.12; dp.atas = y < -0.12; dp.bawah = y > 0.12;
            sorot();
        };
        const lepas = () => { padAktif = false; dp.kiri = dp.kanan = dp.atas = dp.bawah = false; sorot(); };
        pad.addEventListener('pointerdown', e => { e.preventDefault(); try { pad.setPointerCapture(e.pointerId); } catch (x) { } padAktif = true; getar(); hitung(e); });
        pad.addEventListener('pointermove', e => { if (padAktif) { e.preventDefault(); hitung(e); } });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => pad.addEventListener(ev, lepas));
        document.addEventListener('contextmenu', e => { if (e.target.closest('.konsol, .h-bekas')) e.preventDefault(); });
        $$('.bulat').forEach(b => b.addEventListener('pointerdown', getar));
        $('#h-penuh').onclick = () => {
            const el = document.documentElement;
            if (document.fullscreenElement) document.exitFullscreen();
            else (el.requestFullscreen || el.webkitRequestFullscreen || (() => { })).call(el);
        };
        window.addEventListener('keydown', e => {
            if (!aktif || (S && S.jeda)) return;
            if (e.target.tagName === 'INPUT') return;
            const k = e.key.toLowerCase();
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'shift'].includes(k)) {
                kekunci[k] = true; if (k.startsWith('arrow')) e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => { kekunci[e.key.toLowerCase()] = false; });
        window.addEventListener('blur', () => { Object.keys(kekunci).forEach(k => kekunci[k] = false); });
        window.addEventListener('resize', () => { if (aktif) saiz(); });
    }

    function tanda() { $$('#h-watak .watak').forEach((b, i) => b.classList.toggle('pilih', i === profil.watak)); }
    function tunjukProfil() {
        $('#h-profil').hidden = false; $('#h-main').hidden = true;
        document.body.classList.remove('main-hunter');
        $('#h-nama').value = profil.nama || ''; tanda();
    }
    function tunjukMain() {
        $('#h-profil').hidden = true; $('#h-main').hidden = false;
        document.body.classList.add('main-hunter');
        window.scrollTo(0, 0); saiz();
    }

    function saiz() {
        const k = $('#h-kanvas'), r = k.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
        k.width = Math.max(1, r.width * dpr); k.height = Math.max(1, r.height * dpr);
        vw = r.width; vh = r.height; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ----- Permainan -----
    function mulaPermainan() {
        S = { hati: 3, pts: 0, kumpul: 0, jeda: false, tamat: false, p: { x: MULA.x, y: MULA.y, gerak: false }, zon: '', bintang: [] };
        let no = 0;
        ZON.filter(z => z.bintang.length).forEach(z => {
            const qs = soalanZon(z.id);
            z.bintang.forEach((p, i) => S.bintang.push({ no: ++no, x: p.x, y: p.y, zon: z, idx: i, q: qs[i], ambil: false, cd: 0 }));
        });
        $('#h-jeda-tanda').hidden = true; $('#h-jeda').classList.remove('aktif');
        sedangMain = true; tunjukMain(); hud(); mulaGelung();
    }

    function hud() {
        $('#h-hati').textContent = '❤️'.repeat(S.hati) + '🖤'.repeat(3 - S.hati);
        $('#h-pts').textContent = `${S.pts} pts`;
        $('#h-bintang').textContent = `${S.kumpul}/10`;
    }

    function zonSemasa() {
        const p = S.p;
        const z = ZON.find(z => p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h);
        return z ? z.nama : 'Jalan Raya Makhraj';
    }

    function mulaGelung() { aktif = true; cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(gelung); }
    function henti() { aktif = false; cancelAnimationFrame(raf); document.body.classList.remove('main-hunter'); }
    function masuk() {
        init();
        if (sedangMain && S && !S.tamat) { tunjukMain(); mulaGelung(); } else tunjukProfil();
    }
    function hentiLuar() { henti(); }

    function gelung(t) {
        if (!aktif) return;
        const dt = Math.min(0.05, (t - last) / 1000); last = t;
        kemas(dt, t); lukis(t);
        raf = requestAnimationFrame(gelung);
    }

    function kemas(dt, t) {
        if (S.jeda || S.tamat) { S.p.gerak = false; return; }
        const kiri = kekunci.arrowleft || kekunci.a || dp.kiri, kanan = kekunci.arrowright || kekunci.d || dp.kanan;
        const atas = kekunci.arrowup || kekunci.w || dp.atas, bawah = kekunci.arrowdown || kekunci.s || dp.bawah;
        let dx = (kanan ? 1 : 0) - (kiri ? 1 : 0), dy = (bawah ? 1 : 0) - (atas ? 1 : 0);
        S.p.gerak = !!(dx || dy);
        if (S.p.gerak) {
            const l = Math.hypot(dx, dy); dx /= l; dy /= l;
            const v = (larian || kekunci.shift) ? 340 : 195;
            S.p.x = clamp(S.p.x + dx * v * dt, 24, WW - 24);
            S.p.y = clamp(S.p.y + dy * v * dt, 40, WH - 24);
        }
        const nama = zonSemasa();
        if (nama !== S.zon) { S.zon = nama; $('#h-zon').textContent = nama; }
        for (const b of S.bintang) {
            if (!b.ambil && b.cd < t && Math.hypot(b.x - S.p.x, b.y - S.p.y) < 40) { tanya(b); break; }
        }
    }

    // ----- Soalan dalam modal -----
    function tanya(b) {
        S.jeda = true; bunyi('klik');
        Object.keys(kekunci).forEach(k => kekunci[k] = false); Object.keys(dp).forEach(k => dp[k] = false);
        const q = b.q, isi = $('#modal-isi');
        isi.innerHTML = `
      <small class="m-zon">${b.zon.emoji} Zon ${b.zon.nama} · Soalan ${b.no}/10</small>
      <h3 class="s-tanya">${q.tanya}</h3>
      <button class="s-besar ${q.besarArab ? 'arab' : ''}" id="m-besar">${q.besar}</button>
      <div class="s-pilihan">${q.pilihan.map((o, i) => `<button class="pilihan ${o.arab ? 'arab' : ''}" data-i="${i}">${o.teks}</button>`).join('')}</div>
      <p class="s-maklum" id="m-maklum"></p>`;
        $('#modal').hidden = false;
        if (q.huruf) { $('#m-besar').onclick = () => sebut(q.huruf); sebut(q.huruf); }
        let kunci = false;
        const btns = $$('#modal-isi .pilihan');
        btns.forEach((btn, i) => btn.onclick = () => {
            if (kunci) return; kunci = true;
            const betulIdx = q.pilihan.findIndex(o => o.betul), betul = i === betulIdx;
            btns.forEach(x => x.disabled = true);
            btns[betulIdx].classList.add('betul');
            if (betul) { bunyi('betul'); confetti(10); $('#m-maklum').textContent = rawak(['Hebat! 🎉', 'Pandai! 🌟', 'Betul! 👏']) + ' ' + q.terang; }
            else { btn.classList.add('salah'); bunyi('salah'); $('#m-maklum').textContent = 'Belum tepat. ' + q.terang; }
            setTimeout(() => selesai(b, betul), betul ? 1300 : 2400);
        });
    }

    function selesai(b, betul) {
        $('#modal').hidden = true;
        if (!S || S.tamat) return;
        S.jeda = false; last = performance.now();
        if (betul) {
            b.ambil = true; S.kumpul++; S.pts += 10; hud();
            if (S.kumpul >= 10) menang();
        } else {
            S.hati--; b.cd = performance.now() + 2500; b.q = soalanZon(b.zon.id)[b.idx]; hud();
            if (S.hati <= 0) kalah();
        }
    }

    function menang() {
        S.tamat = true; sedangMain = false;
        const bintang = Math.max(1, S.hati);
        let terbaik = 0;
        try { terbaik = +localStorage.getItem('makhraj_hunter_terbaik') || 0; if (S.pts > terbaik) { terbaik = S.pts; localStorage.setItem('makhraj_hunter_terbaik', terbaik); } } catch (e) { }
        bunyi('menang'); confetti(45);
        bukaModal(`
      <div class="besar-emoji">${WATAK[profil.watak].e}🏆</div>
      <h2>Tahniah, ${profil.nama}!</h2>
      <div class="bintang-besar">${'★'.repeat(bintang)}${'☆'.repeat(3 - bintang)}</div>
      <p>Semua 10 bintang dikumpul! Skor: <b>${S.pts} pts</b><br>Skor terbaik: ${terbaik} pts</p>
      <div class="modal-butang"><button class="btn-utama" data-act="main">🔄 Main semula</button>
      <button class="btn-kaca" data-act="keluar">👤 Tukar watak</button></div>`, {
            main() { mulaPermainan(); },
            keluar() { tunjukProfil(); henti(); }
        });
    }

    function kalah() {
        S.tamat = true; sedangMain = false; bunyi('kalah');
        bukaModal(`
      <div class="besar-emoji">😵</div>
      <h2>Nyawa habis!</h2>
      <p>Kamu kumpul ${S.kumpul}/10 bintang dan ${S.pts} pts. Jangan putus asa, cuba lagi!</p>
      <div class="modal-butang"><button class="btn-utama" data-act="main">🔄 Cuba lagi</button>
      <button class="btn-kaca" data-act="belajar">📖 Belajar dulu</button></div>`, {
            main() { mulaPermainan(); },
            belajar() { henti(); papar('belajar'); }
        });
    }

    // ----- Lukisan -----
    function rr(c, x, y, w, h, r) {
        c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    }
    const EMOJI = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';

    function lukis(t) {
        const c = ctx; c.clearRect(0, 0, vw, vh);
        const px = S.p.x, py = S.p.y;
        const cx = vw >= WW ? (WW - vw) / 2 : clamp(px - vw / 2, 0, WW - vw);
        const cy = vh >= WH ? (WH - vh) / 2 : clamp(py - vh / 2, 0, WH - vh);
        c.fillStyle = '#0f766e'; c.fillRect(0, 0, vw, vh);
        c.save(); c.translate(-cx, -cy);

        // rumput berjalur
        for (let x = 0; x < WW; x += 100) { c.fillStyle = (x / 100) % 2 ? '#6ee7b7' : '#5eead4'; c.fillRect(x, 0, 100, WH); }
        // jalan
        c.fillStyle = '#cbd5e1';
        c.fillRect(0, 560, WW, 80); c.fillRect(560, 0, 80, WH); c.fillRect(1160, 0, 80, WH);
        c.strokeStyle = '#f59e0b'; c.lineWidth = 5; c.setLineDash([26, 22]);
        c.beginPath(); c.moveTo(0, 600); c.lineTo(WW, 600); c.moveTo(600, 0); c.lineTo(600, WH); c.moveTo(1200, 0); c.lineTo(1200, WH); c.stroke();
        c.setLineDash([]);

        // zon
        ZON.forEach(z => {
            rr(c, z.x, z.y, z.w, z.h, 28); c.fillStyle = '#fff7ed'; c.fill(); c.lineWidth = 8; c.strokeStyle = z.warna; c.stroke();
            rr(c, z.x + 16, z.y + 16, z.w - 32, 52, 14); c.fillStyle = z.warna; c.fill();
            c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 4;
            c.fillStyle = '#fff'; c.font = '700 22px Fredoka, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
            c.fillText(`${z.emoji}  ${z.banner}`, z.x + 32, z.y + 43); c.restore();
            c.font = '34px ' + EMOJI; c.textAlign = 'center';
            z.hp.forEach(h => c.fillText(h.e, h.x, h.y));
        });
        // pokok tepi
        c.font = '46px ' + EMOJI; c.textAlign = 'center';
        for (let x = 80; x < WW; x += 180) { c.fillText('🌳', x, 18); c.fillText('🌳', x + 60, WH - 14); }

        // bintang
        S.bintang.forEach(b => {
            if (b.ambil) return;
            const d = 1 + Math.sin(t / 260 + b.no) * 0.08;
            const g = c.createRadialGradient(b.x, b.y, 4, b.x, b.y, 46);
            g.addColorStop(0, 'rgba(255,214,102,.75)'); g.addColorStop(1, 'rgba(255,214,102,0)');
            c.fillStyle = g; c.beginPath(); c.arc(b.x, b.y, 46, 0, 7); c.fill();
            c.font = `${Math.round(50 * d)}px ` + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillText('⭐', b.x, b.y + Math.sin(t / 300 + b.no) * 4);
            c.beginPath(); c.arc(b.x + 24, b.y - 24, 15, 0, 7); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#f59e0b'; c.stroke();
            c.fillStyle = '#b45309'; c.font = '700 15px Fredoka, sans-serif'; c.fillText(b.no, b.x + 24, b.y - 23);
        });

        // pemain
        const bob = S.p.gerak ? Math.sin(t / 55) * 3 : 0;
        c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(px, py + 24, 20, 7, 0, 0, 7); c.fill();
        c.font = '46px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(WATAK[profil.watak].e, px, py - 4 + bob);
        c.font = '600 14px Fredoka, sans-serif';
        const lebar = c.measureText(profil.nama).width + 22;
        rr(c, px - lebar / 2, py - 56, lebar, 22, 11); c.fillStyle = 'rgba(255,255,255,.95)'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#10b981'; c.stroke();
        c.fillStyle = '#064e3b'; c.fillText(profil.nama, px, py - 45);

        c.restore();
    }

    return { masuk, henti: hentiLuar };
})();