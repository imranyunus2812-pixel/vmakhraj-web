// ===== UTILITI =====
// Ikon SVG (set ikon ada dalam index.html). Contoh: ik('star', 'isi')
const ik = (nama, kelas = '') => `<svg class="ik ${kelas}" aria-hidden="true"><use href="#i-${nama}"/></svg>`;
const bintangSvg = (n, jumlah = 3) => ik('star', 'isi').repeat(n) + ik('star', 'pudar').repeat(jumlah - n);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rawak = a => a[Math.floor(Math.random() * a.length)];
// Kocok Fisher-Yates: setiap susunan mempunyai peluang yang sama
const kocok = a => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    return b;
};

let audioCtx;
function bunyi(jenis) {
    if (window.BISU) return;
    const urutan = {
        klik: [520], betul: [660, 880], salah: [300, 220], cp: [523, 659, 784],
        menang: [523, 659, 784, 1047], kalah: [392, 330, 262]
    }[jenis] || [520];
    try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        urutan.forEach((f, i) => {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.frequency.value = f; o.type = 'sine';
            const t = audioCtx.currentTime + i * 0.14;
            g.gain.setValueAtTime(0.14, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            o.connect(g); g.connect(audioCtx.destination);
            o.start(t); o.stop(t + 0.3);
        });
    } catch (e) { /* abaikan */ }
}

function sebut(huruf) {
    if (window.BISU) return;
    // Suara komputer (ganti jika tiada fail audio)
    const tts = () => {
        const teks = huruf === 'ا' ? 'أَ' : huruf + 'َ';
        // Dalam aplikasi Android (APK): guna suara TextToSpeech Android
        if (window.AndroidTTS) { try { window.AndroidTTS.sebut(teks); } catch (e) { } return; }
        if (!('speechSynthesis' in window)) return;
        const u = new SpeechSynthesisUtterance(teks);
        u.lang = 'ar-SA'; u.rate = 0.7;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
    };
    // Utamakan rakaman sebenar: assets/audio/<nama>.mp3 (lihat FAIL_AUDIO dalam data2.js)
    const fail = typeof FAIL_AUDIO !== 'undefined' && FAIL_AUDIO[huruf];
    if (!fail) { tts(); return; }
    let sekali = false; const ganti = () => { if (!sekali) { sekali = true; tts(); } };
    try {
        if (window._audioSemasa) window._audioSemasa.pause();
        const au = window._audioSemasa = new Audio(`assets/audio/${fail}.mp3`);
        au.addEventListener('error', ganti, { once: true });
        const p = au.play(); if (p && p.catch) p.catch(ganti);
    } catch (e) { ganti(); }
}

function confetti(n = 18) {
    const warna = ['#F0D58C', '#D9B563', '#22D3EE', '#34D399', '#A78BFA', '#F472B6'];
    for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'confetti'; s.style.background = rawak(warna);
        s.style.left = Math.random() * 100 + 'vw';
        s.style.animationDuration = 1.2 + Math.random() * 1.5 + 's';
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 3000);
    }
}

// ===== PROFIL PEMAIN (dikongsi game) =====
function muatProfil() {
    try { return JSON.parse(localStorage.getItem('makhraj_profil') || 'null'); } catch (e) { return null; }
}

// ===== KEMAJUAN (localStorage) =====
function muatSim() {
    try { return Object.assign({ buka: 1, bintang: {} }, JSON.parse(localStorage.getItem('makhraj_adv') || '{}')); }
    catch (e) { return { buka: 1, bintang: {} }; }
}
let Sim = muatSim();
function simpanSim() { try { localStorage.setItem('makhraj_adv', JSON.stringify(Sim)); } catch (e) { } }

// ===== SEJARAH NAVIGASI (butang Kembali) =====
// Setiap kali pengguna berpindah tempat, tempat lama (halaman, skrol, makhraj yang dibuka) disimpan.
// Butang Kembali di bahagian atas, dan butang back telefon/pelayar, membawa pengguna ke tempat sebelumnya.
const Nav = {
    sejarah: [], akhir: 0, pulihSedang: false,
    keadaan() {
        return { view: document.body.dataset.tab || 'home', y: window.scrollY, detail: detailSemasa };
    },
    simpan() {
        if (this.pulihSedang) return;
        this.sejarah.push(this.keadaan());
        if (this.sejarah.length > 50) this.sejarah.shift();
        this.kemasButang();
    },
    // Butang Kembali hanya di luar halaman Utama
    kemasButang() { const b = $('#bar-kembali'); if (b) b.hidden = (document.body.dataset.tab || 'home') === 'home'; },
    // Dipanggil oleh butang Kembali: guna sejarah pelayar supaya butang back telefon turut serasi
    kembali() {
        bunyi('klik');
        if (this.sejarah.length) history.back();
        else papar('home', { tanpaSejarah: true }); // tiada sejarah (cth. buka terus dari pautan): ke Utama
    },
    pulih() {
        const k = this.sejarah.pop(); this.kemasButang();
        if (!k) return false;
        tutupModal();
        this.pulihSedang = true;
        papar(k.view, { tanpaSejarah: true });
        if (k.view === 'belajar' && k.detail) bukaDetail(k.detail);
        this.pulihSedang = false;
        // pulihkan kedudukan skrol selepas halaman siap dilukis
        setTimeout(() => window.scrollTo({ top: k.y, behavior: 'instant' }), 60);
        return true;
    }
};
window.addEventListener('popstate', () => {
    if (!Nav.pulih()) { // tiada sejarah dalaman: ikut alamat (#hash)
        const h = location.hash.slice(1);
        if (h && h !== document.body.dataset.tab && $('#view-' + h)) papar(h, { tanpaSejarah: true });
    }
});
let detailSemasa = null;

// ===== NAVIGASI =====
function papar(view, opsyen = {}) {
    const lama = document.body.dataset.tab;
    const tukar = lama && lama !== view;
    if (tukar && !opsyen.tanpaSejarah && !Nav.pulihSedang) {
        Nav.simpan(); Nav.akhir = performance.now();
        history.pushState({ v: view }, '', '#' + view);
    } else if (location.hash !== '#' + view) history.replaceState({ v: view }, '', '#' + view);
    if (view !== 'game') G.tok++; // hentikan animasi game yang tertangguh
    $$('.view').forEach(v => v.classList.toggle('aktif', v.id === 'view-' + view));
    const dalamAktiviti = ['aktiviti', 'game', 'padanan', 'susun', 'seret', 'cari'].includes(view);
    const navAktif = dalamAktiviti ? 'aktiviti' : view === 'perbandingan' ? 'belajar' : view;
    $$('.nav-btn').forEach(b => b.classList.toggle('aktif', b.dataset.view === navAktif));
    document.body.dataset.tab = view; // bukan data-view: pendengar klik global mencari [data-view]
    Nav.kemasButang();
    if (view !== 'model3d') keluarPenuh3D();
    window.scrollTo({ top: 0, behavior: tukar ? 'smooth' : 'instant' });
    if (view === 'belajar') tutupDetail();
    if (view === 'game') tunjukPeta();
    if (view === 'home') kemasHome();
    if (typeof Aktiviti !== 'undefined') Aktiviti.papar(view);
}
document.addEventListener('click', e => {
    const t = e.target.closest('[data-view]');
    if (t) { bunyi('klik'); papar(t.dataset.view); }
});

function kemasHome() {
    const jumlah = Object.values(Sim.bintang).reduce((a, b) => a + b, 0);
    const sb = $('#stat-bintang'), sd = $('#stat-dunia'); // kotak statistik tiada di halaman Utama baharu
    if (sb) sb.textContent = `${jumlah}/${DUNIA.length * 3}`;
    if (sd) sd.textContent = `${Object.keys(Sim.bintang).length}/${DUNIA.length}`;
}

// ===== TEMA (cerah / gelap) =====
function setTema(t, animasi) {
    const h = document.documentElement;
    if (animasi) { h.classList.add('tukar-tema'); setTimeout(() => h.classList.remove('tukar-tema'), 400); }
    h.dataset.tema = t;
    try { localStorage.setItem('makhraj_tema', t); } catch (e) { }
    const m = $('meta[name="theme-color"]'); if (m) m.content = t === 'cerah' ? '#7CC6EE' : '#0B1233';
    const b = $('#btn-tema');
    if (b) { const lain = t === 'cerah' ? 'gelap' : 'cerah'; b.title = `Tukar ke tema ${lain}`; b.setAttribute('aria-label', `Tukar ke tema ${lain}`); }
}
function bina_tema() {
    setTema(document.documentElement.dataset.tema === 'gelap' ? 'gelap' : 'cerah');
    const b = $('#btn-tema'); if (!b) return;
    b.onclick = () => { bunyi('klik'); setTema(document.documentElement.dataset.tema === 'cerah' ? 'gelap' : 'cerah', true); };
}

// ===== SLAID HALAMAN UTAMA =====
function bina_slaid() {
    const baris = $('#slaid-baris'); if (!baris) return;
    const kad = $$('.kad-slaid', baris), no = $('#slaid-no');
    let i = 0;
    const set = (n, skrol = true) => {
        i = (n + kad.length) % kad.length;
        kad.forEach((k, j) => k.classList.toggle('aktif', j === i));
        no.textContent = `${i + 1}/${kad.length}`;
        if (skrol && baris.scrollWidth > baris.clientWidth + 4) // telefon: slaid melintang
            baris.scrollTo({ left: kad[i].offsetLeft - (baris.clientWidth - kad[i].offsetWidth) / 2, behavior: 'smooth' });
    };
    $('#slaid-kiri').onclick = () => { bunyi('klik'); set(i - 1); };
    $('#slaid-kanan').onclick = () => { bunyi('klik'); set(i + 1); };
    kad.forEach((k, j) => {
        k.addEventListener('mouseenter', () => set(j, false));
        k.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); k.click(); } });
    });
    let t; baris.addEventListener('scroll', () => { // telefon: kemas kini nombor semasa diseret
        clearTimeout(t); t = setTimeout(() => {
            const tengah = baris.scrollLeft + baris.clientWidth / 2;
            let dekat = 0, jarak = 1e9;
            kad.forEach((k, j) => { const d = Math.abs(k.offsetLeft + k.offsetWidth / 2 - tengah); if (d < jarak) { jarak = d; dekat = j; } });
            if (dekat !== i) set(dekat, false);
        }, 80);
    });
    set(0, false);
}

// ===== BELAJAR =====
function bina_belajar() {
    const grid = $('#grid-makhraj');
    grid.innerHTML = MAKHRAJ.map((m, i) => `
    <button class="kad-makhraj" data-id="${m.id}" style="--w:${m.warna}">
      <span class="arab-nama arab">${m.arab}</span>
      <span class="km-no">${i + 1}</span>
      <strong>${m.nama}</strong>
      <small>${m.terjemah}</small>
      <span class="huruf-mini arab">${[...new Set(m.tempat.flatMap(t => t.huruf))].map(h => `<span class="hm">${h}</span>`).join('')}</span>
      <span class="km-mula">Mula belajar ${ik('arrow-right')}</span>
    </button>`).join('');
    grid.addEventListener('click', e => {
        const k = e.target.closest('.kad-makhraj');
        if (k) { bunyi('klik'); bukaDetail(k.dataset.id); }
    });
}

function bukaDetail(id) {
    // Buka makhraj dari dalam halaman Belajar = satu langkah baharu (boleh Kembali)
    if (!Nav.pulihSedang && document.body.dataset.tab === 'belajar' && detailSemasa !== id && performance.now() - Nav.akhir > 400) {
        Nav.simpan(); history.pushState({ v: 'belajar' }, '', '#belajar');
    }
    detailSemasa = id;
    const m = MAKHRAJ.find(x => x.id === id);
    const d = $('#detail-makhraj');
    d.style.setProperty('--w', m.warna);
    d.innerHTML = `
    <div class="detail-kepala">
      <span class="arab-nama besar arab">${m.arab}</span>
      <div><h2>${m.nama}</h2><p>${m.terjemah}</p></div>
    </div>
    <p class="ringkas">${m.ringkas}</p>
    ${m.tempat.map((t, i) => `
      <div class="tempat">
        <div class="tempat-no">${i + 1}</div>
        <div class="tempat-isi">
          <p>${t.info}</p>
          <p class="istilah">${ISTILAH[t.huruf.join('')] || ''}</p>
          <div class="chip-baris">
            ${t.huruf.map(h => `<button class="chip arab" data-h="${h}">${h}<small>${NAMA_HURUF[h]}</small></button>`).join('')}
          </div>
        </div>
      </div>`).join('')}
    <div class="tip">${ik('bulb')} <b>Tip:</b> ${m.tip}</div>
    <button class="btn-utama" id="btn-3d">${ik('cube')} Tengok dalam 3D</button>`;
    $('#grid-makhraj').hidden = true;
    if (!Nav.pulihSedang) window.scrollTo({ top: 0, behavior: 'instant' }); // supaya butang Kembali kelihatan
    $$('.bel-lain').forEach(e => e.hidden = true);
    d.hidden = false;
    $('#btn-3d').onclick = () => { papar('model3d'); hantarKe3D(m.id); };
    $$('.chip', d).forEach(c => c.onclick = () => {
        sebut(c.dataset.h); c.classList.add('lantun');
        setTimeout(() => c.classList.remove('lantun'), 500);
    });
}
function tutupDetail() {
    detailSemasa = null;
    $('#detail-makhraj').hidden = true;
    $('#grid-makhraj').hidden = false;
    $$('.bel-lain').forEach(e => e.hidden = false);
}

// ===== MODEL 3D (UNITY WEBGL) =====
const TIP3D = [
    'Makhraj bermaksud tempat keluarnya huruf.',
    'Ada 5 makhraj umum: Al-Jauf, Al-Halq, Al-Lisan, Asy-Syafatain dan Al-Khaisyum.',
    'Lidah mempunyai 10 tempat keluar huruf. Paling banyak!',
    'Huruf mad (ا و ي) keluar dari rongga mulut, iaitu Al-Jauf.',
    'Dengung (ghunnah) keluar dari pangkal hidung.',
    'Sebut huruf perlahan-lahan dan rasa di mana lidah dan bibir bertemu.'
];
const CINCIN = 326.7; // lilitan bulatan jejari 52
const M3D = { state: 'idle', stage: null, frame: null, tipT: 0, tipI: 0, dapatMesej: false, tunggu: 0 };

function set3D(state) {
    M3D.state = state;
    M3D.stage.dataset.state = state;
    $('.bar3d').dataset.state = state;
    $('#status-teks').textContent = { idle: 'Belum dimuatkan', loading: 'Memuatkan model…', ready: 'Sedia digunakan', error: 'Ralat pemuatan' }[state];
    $('#btn-muat-semula3d').disabled = state === 'idle';
    clearInterval(M3D.tipT);
    if (state === 'loading') mulaTip();
}
function mulaTip() {
    const el = $('#tip3d');
    M3D.tipI = Math.floor(Math.random() * TIP3D.length);
    const tunjuk = () => {
        el.classList.remove('masuk'); void el.offsetWidth;
        el.innerHTML = ik('bulb') + ' ' + TIP3D[M3D.tipI++ % TIP3D.length];
        el.classList.add('masuk');
    };
    tunjuk(); M3D.tipT = setInterval(tunjuk, 4200);
}
function progress3D(p) {
    const pct = Math.round(Math.max(0, Math.min(1, p)) * 100);
    $('#peratus').textContent = pct + '%';
    $('#cincin-isi').style.strokeDashoffset = CINCIN * (1 - pct / 100);
}
function ralat3D(mesej) {
    if (M3D.state === 'ready') { console.error(mesej); return; }
    clearTimeout(M3D.tunggu);
    $('#ralat3d').textContent = String(mesej || 'Sebab tidak diketahui.').split('\n')[0].slice(0, 240);
    set3D('error'); bunyi('salah');
}

async function mula3D() {
    if (M3D.state === 'loading' || M3D.state === 'ready') return;
    bunyi('klik');
    M3D.dapatMesej = false; progress3D(0); set3D('loading');
    // Telefon (menegak atau melintang): terus skrin penuh (mesti dalam gerakan sentuhan pengguna)
    if (matchMedia('(max-width: 760px) and (orientation: portrait), (max-height: 520px) and (orientation: landscape) and (pointer: coarse)').matches) penuh3D(true);
    try {
        const r = await fetch('unity/index.html', { method: 'HEAD', cache: 'no-store' });
        if (!r.ok) return ralat3D('Folder unity/ tidak dijumpai. Letakkan hasil build Unity WebGL dalam folder unity/ (mesti ada unity/index.html dan unity/Build).');
    } catch (e) { /* teruskan: biar iframe yang cuba */ }
    M3D.frame.src = 'unity/index.html';
}
function muatSemula3D() {
    clearTimeout(M3D.tunggu);
    M3D.frame.src = 'about:blank';
    M3D.state = 'idle';
    mula3D();
}

// --- Skrin penuh (API sebenar, atau CSS untuk iPhone) ---
function dalamPenuh3D() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement) || M3D.stage.classList.contains('penuh-css');
}
function segerak3D() {
    const fs = dalamPenuh3D();
    M3D.stage.classList.toggle('is-penuh', fs);
    document.body.classList.toggle('kunci-skrol', M3D.stage.classList.contains('penuh-css'));
    $('#btn-penuh3d').innerHTML = fs ? ik('minimize') + ' Keluar skrin penuh' : ik('maximize') + ' Skrin penuh';
    if (!fs) { try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (e) { } }
}
function penuh3D(on) {
    const st = M3D.stage;
    if (on) {
        const req = st.requestFullscreen || st.webkitRequestFullscreen;
        if (req && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
            let p; try { p = req.call(st); } catch (e) { p = Promise.reject(e); }
            Promise.resolve(p).then(() => {
                if (matchMedia('(pointer: coarse)').matches) {
                    try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }); } catch (e) { }
                }
            }).catch(() => { st.classList.add('penuh-css'); segerak3D(); });
        } else st.classList.add('penuh-css');
    } else {
        const ex = document.exitFullscreen || document.webkitExitFullscreen;
        if ((document.fullscreenElement || document.webkitFullscreenElement) && ex) { try { ex.call(document); } catch (e) { } }
        st.classList.remove('penuh-css');
    }
    segerak3D();
}
function keluarPenuh3D() { if (M3D.stage && dalamPenuh3D()) penuh3D(false); }

function bina_3d() {
    M3D.stage = $('#stage3d'); M3D.frame = $('#unity-frame');
    $('#pautan-belajar').innerHTML = MAKHRAJ.map(m =>
        `<button class="chip-pautan" style="--w:${m.warna}" data-id="${m.id}"><span class="arab">${m.arab}</span>${m.nama}</button>`).join('');
    $('#pautan-belajar').addEventListener('click', e => {
        const b = e.target.closest('[data-id]'); if (!b) return;
        bunyi('klik'); papar('belajar'); bukaDetail(b.dataset.id);
    });

    $('#btn-mula3d').onclick = mula3D;
    $('#btn-cuba3d').onclick = muatSemula3D;
    $('#btn-muat-semula3d').onclick = () => { bunyi('klik'); muatSemula3D(); };
    $('#btn-penuh3d').onclick = () => { bunyi('klik'); penuh3D(!dalamPenuh3D()); };
    $('#btn-keluar-penuh').onclick = () => { bunyi('klik'); penuh3D(false); };
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, segerak3D));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && M3D.stage.classList.contains('penuh-css')) penuh3D(false); });

    // Status daripada unity/index.html (progress, ready, error)
    window.addEventListener('message', e => {
        if (e.source !== M3D.frame.contentWindow) return;
        const d = e.data; if (!d || d.src !== 'vmakhraj-unity') return;
        M3D.dapatMesej = true;
        if (d.type === 'progress' && M3D.state === 'loading') progress3D(d.value);
        else if (d.type === 'ready') { clearTimeout(M3D.tunggu); progress3D(1); set3D('ready'); }
        else if (d.type === 'error') ralat3D(d.message);
    });
    // Jika unity/index.html masih templat lalai Unity (tiada laporan status), dedahkan iframe selepas 10 saat
    M3D.frame.addEventListener('load', () => {
        const s = M3D.frame.getAttribute('src');
        if (!s || s === 'about:blank') return;
        clearTimeout(M3D.tunggu);
        M3D.tunggu = setTimeout(() => { if (M3D.state === 'loading' && !M3D.dapatMesej) set3D('ready'); }, 10000);
    });
    set3D('idle');
}
// Dari halaman Belajar: hantar pilihan makhraj kepada Unity (hanya jika diaktifkan dalam unity/index.html)
function hantarKe3D(id) {
    if (M3D.state === 'ready' && M3D.frame && M3D.frame.contentWindow) M3D.frame.contentWindow.postMessage({ type: 'makhraj', id }, '*');
}

// ===== PENJANA SOALAN =====
const M = id => MAKHRAJ.find(m => m.id === id);
const kunciT = t => t.huruf.join('');
const hurufBoleh = t => { const f = t.huruf.filter(h => h !== 'ي' && h !== 'و'); return f.length ? f : t.huruf; };

// Huruf ini keluar dari makhraj mana?
function qHurufMakhraj(s) {
    const betul = M(s.makhraj);
    const lain = kocok(MAKHRAJ.filter(m => m.id !== betul.id && m.id !== 'khaisyum')).slice(0, 3);
    return {
        tanya: 'Huruf ini keluar dari makhraj mana?', besar: s.huruf, besarArab: true, huruf: s.huruf, mk: betul.id,
        pilihan: kocok([betul, ...lain]).map(m => ({ teks: m.nama, betul: m.id === betul.id })),
        terang: `${s.huruf} (${NAMA_HURUF[s.huruf]}) keluar dari ${betul.nama} (${betul.terjemah}).`
    };
}
// Pilih huruf yang keluar dari makhraj tertentu
function qMakhrajHuruf(m) {
    const dalam = HURUF_KUIZ.filter(h => h.makhraj === m.id);
    const luar = kocok(HURUF_KUIZ.filter(h => h.makhraj !== m.id)).slice(0, 3);
    const betul = rawak(dalam);
    return {
        tanya: `Pilih huruf yang keluar dari ${m.nama}`, besar: m.arab, besarArab: true, mk: m.id,
        pilihan: kocok([betul, ...luar]).map(h => ({ teks: h.huruf, arab: true, betul: h === betul })),
        terang: `${betul.huruf} (${NAMA_HURUF[betul.huruf]}) keluar dari ${m.nama} (${m.terjemah}).`
    };
}
// Huruf ini keluar dari bahagian mana?
function qTempat(m, t) {
    const h = rawak(hurufBoleh(t));
    const betul = TEMPAT_PENDEK[kunciT(t)];
    let lain = kocok(m.tempat.filter(x => x !== t).map(x => TEMPAT_PENDEK[kunciT(x)]).filter(Boolean)).slice(0, 3);
    if (lain.length < 3) {
        const tambah = kocok(Object.values(TEMPAT_PENDEK).filter(v => v !== betul && !lain.includes(v)));
        while (lain.length < 3) lain.push(tambah.pop());
    }
    return {
        tanya: 'Di mana huruf ini keluar?', besar: h, besarArab: true, huruf: h, mk: m.id,
        pilihan: kocok([betul, ...lain]).map(teks => ({ teks, betul: teks === betul })),
        terang: `${h} (${NAMA_HURUF[h]}) keluar dari ${betul.toLowerCase()} (${m.nama}).`
    };
}
// Pilih huruf dari bahagian tertentu
function qTempatHuruf(m, t) {
    const betulH = rawak(hurufBoleh(t));
    const label = TEMPAT_PENDEK[kunciT(t)];
    const salah = kocok(HURUF_KUIZ.filter(x => !t.huruf.includes(x.huruf))).slice(0, 3);
    return {
        tanya: `Pilih huruf dari: ${label}`, besar: m.arab, besarArab: true, mk: m.id,
        pilihan: kocok([{ huruf: betulH }, ...salah]).map(x => ({ teks: x.huruf, arab: true, betul: x.huruf === betulH })),
        terang: `${betulH} (${NAMA_HURUF[betulH]}) keluar dari ${label.toLowerCase()} (${m.nama}).`
    };
}
// Huruf dalam ayat (data AYAT dalam data2.js)
function qAyat() {
    const x = rawak(AYAT), betul = M(x.mk);
    const lain = kocok(['jauf', 'halq', 'lisan', 'syafatain'].filter(id => id !== x.mk)).slice(0, 3).map(M);
    return {
        tanya: 'Huruf berwarna emas keluar dari makhraj mana?', mk: x.mk,
        besarHtml: `<span class="ayat-teks">${x.sebelum}<mark>${x.mid}</mark>${x.selepas}</span><small>${x.rujuk}</small>`, huruf: x.huruf,
        pilihan: kocok([betul, ...lain]).map(m => ({ teks: m.nama, betul: m.id === betul.id })),
        terang: `${x.huruf} (${NAMA_HURUF[x.huruf]}) dalam ${x.rujuk} keluar dari ${betul.nama} (${betul.terjemah}).`
    };
}
function statik(s) {
    return {
        tanya: s.tanya, besar: s.besar, besarArab: !!s.besarArab, huruf: s.huruf,
        pilihan: kocok([s.betul, ...s.salah]).map(t => ({ teks: t, arab: !!s.arab, betul: t === s.betul })),
        terang: s.terang
    };
}

// Dengar dan pilih huruf (bunyi sahaja, huruf disembunyikan)
function qDengar(mkId) {
    const calon = HURUF_KUIZ.filter(x => !mkId || x.makhraj === mkId);
    const betul = rawak(calon), m = M(betul.makhraj), t = m.tempat.find(x => x.huruf.includes(betul.huruf));
    // pengganggu: utamakan huruf dari makhraj yang sama (lebih mencabar), kemudian huruf lain
    const sama = kocok(HURUF_KUIZ.filter(x => x.makhraj === betul.makhraj && x.huruf !== betul.huruf));
    const lain = kocok(HURUF_KUIZ.filter(x => x.makhraj !== betul.makhraj));
    const salah = [...sama.slice(0, 2), ...lain].slice(0, 3);
    return {
        tanya: 'Dengar baik-baik. Huruf manakah yang disebut?', dengar: true, huruf: betul.huruf, mk: m.id,
        pilihan: kocok([betul, ...salah]).map(x => ({ teks: x.huruf, arab: true, betul: x === betul })),
        terang: `Itu bunyi ${betul.huruf} (${NAMA_HURUF[betul.huruf]}), keluar dari ${(TEMPAT_PENDEK[kunciT(t)] || m.terjemah).toLowerCase()} (${m.nama}).`
    };
}
// Huruf keliru: kenal pasti huruf berdasarkan cara sebutannya
function qKeliru(k) {
    const it = rawak(k.item), m = M(it.mk);
    let calon = k.item.map(x => x.h);
    const tambah = kocok(HURUF_KUIZ.filter(x => x.makhraj === it.mk && !calon.includes(x.huruf))).map(x => x.huruf);
    while (calon.length < 4 && tambah.length) calon.push(tambah.pop());
    return {
        tanya: 'Huruf keliru! Huruf manakah yang disebut begini?', besarHtml: `<span class="ks-petikan">${it.tempat}</span>`, mk: it.mk,
        pilihan: kocok(calon).map(h => ({ teks: h, arab: true, betul: h === it.h })),
        terang: `${it.h} (${NAMA_HURUF[it.h]}) dari ${m.nama}: ${it.tempat}`
    };
}
// Label jenis soalan dan tahap kesukaran (soalan disusun dari mudah ke sukar)
const JENIS = {
    statik: ['Kefahaman', 1], makhraj: ['Kenal makhraj', 1], tempat: ['Tempat keluar', 2],
    ayat: ['Huruf dalam ayat', 2], dengar: ['Dengar & pilih', 3], keliru: ['Huruf keliru', 3]
};
const tanda = (q, j) => Object.assign(q, { jenis: JENIS[j][0], tahap: JENIS[j][1], kod: j });
const keliruUntuk = mk => KELIRU.filter(k => k.item.every(x => x.mk === mk));
function binaSoalan(d) {
    const huruf = h => HURUF_KUIZ.find(x => x.huruf === h);
    let q;
    if (d.id === 'jauf') {
        q = kocok(SOALAN_GUA).map(x => tanda(statik(x), 'statik'));
        q.forEach(x => { x.mk = /Khaisyum|dengung|ghunnah|Nun dan Mim/i.test(x.tanya + x.terang) ? 'khaisyum' : 'jauf'; });
    } else if (d.id === 'halq') {
        const m = M('halq'), t = kocok(m.tempat), [k1, k2] = kocok(keliruUntuk('halq'));
        q = [tanda(qTempat(m, t[0]), 'tempat'), tanda(qTempat(m, t[1]), 'tempat'), tanda(qTempatHuruf(m, t[2]), 'tempat'),
            tanda(qDengar('halq'), 'dengar'), tanda(qKeliru(k1), 'keliru'), tanda(qKeliru(k2), 'keliru')];
    } else if (d.id === 'syafatain') {
        const m = M('syafatain'), [a, b] = kocok(m.tempat);
        q = [tanda(qHurufMakhraj(huruf('ف')), 'makhraj'), tanda(qMakhrajHuruf(m), 'makhraj'), tanda(qTempat(m, a), 'tempat'),
            tanda(qTempat(m, b), 'tempat'), tanda(qTempatHuruf(m, rawak([a, b])), 'tempat'), tanda(qDengar('syafatain'), 'dengar')];
    } else if (d.id === 'lisan') {
        const m = M('lisan'), t = kocok(m.tempat), k = kocok(keliruUntuk('lisan'));
        q = [tanda(qTempat(m, t[0]), 'tempat'), tanda(qTempat(m, t[1]), 'tempat'), tanda(qTempatHuruf(m, t[2]), 'tempat'),
            tanda(qDengar('lisan'), 'dengar'), tanda(qKeliru(k[0]), 'keliru'), tanda(qKeliru(k[1]), 'keliru')];
    } else { // Istana: campuran semua
        const lisan = M('lisan');
        q = [tanda(qHurufMakhraj(rawak(HURUF_KUIZ)), 'makhraj'), tanda(qMakhrajHuruf(M(rawak(['jauf', 'halq', 'lisan', 'syafatain']))), 'makhraj'),
            tanda(qAyat(), 'ayat'), tanda(qTempatHuruf(lisan, rawak(lisan.tempat)), 'tempat'), tanda(qDengar(), 'dengar'), tanda(qKeliru(rawak(KELIRU)), 'keliru')];
    }
    // kocok, kemudian susun mengikut tahap (mudah dahulu)
    return kocok(q).sort((a, b) => a.tahap - b.tahap);
}

// Ringkasan pembelajaran setiap dunia (dipaparkan sebelum bermain)
const MK_DUNIA = { jauf: ['jauf', 'khaisyum'], halq: ['halq'], syafatain: ['syafatain'], lisan: ['lisan'], istana: ['jauf', 'halq', 'lisan', 'syafatain', 'khaisyum'] };

// ===== GAME PENGEMBARAAN =====
const SUSUNAN = ['start', 'ob', 'ob', 'cp', 'ob', 'ob', 'cp', 'ob', 'ob', 'finish'];
const G = { tok: 0, d: null, idx: 0, soalan: [], cells: [], pos: 0, cp: 0, hati: 3, salah: 0, kunci: false, n: 0 };

function tunggu(ms, fn) { const t = G.tok; setTimeout(() => { if (t === G.tok) fn(); }, ms); }

// Lambang dunia: huruf Arab, atau ikon jika ada
function lambang(d) { return d.ikon ? ik(d.ikon) : `<span class="arab">${d.huruf}</span>`; }

function tunjukPeta() {
    G.tok++;
    $('#peta').hidden = false; $('#arena').hidden = true; $('#intro-dunia').hidden = true;
    $('#denai').innerHTML = DUNIA.map((d, i) => {
        const buka = i < Sim.buka, b = Sim.bintang[d.id] || 0;
        return `<button class="nod ${buka ? '' : 'kunci'} ${i % 2 ? 'kanan' : 'kiri'}" data-i="${i}" ${buka ? '' : 'disabled'} style="--a:${d.warna}">
      <span class="nod-bulat">${buka ? lambang(d) : ik('lock')}</span>
      <span class="nod-teks"><b>${i + 1}. ${d.nama}</b><small>${d.ringkas}</small>
      <span class="bintang-baris">${bintangSvg(b)}</span></span></button>`;
    }).join('');
}

// Ulang kaji ringkas sebelum masuk dunia
function tunjukIntro(i) {
    const d = DUNIA[i];
    if (!$('#peta').hidden) { Nav.simpan(); history.pushState({ v: 'game' }, '', '#game'); }
    G.tok++;
    $('#peta').hidden = true; $('#arena').hidden = true;
    const el = $('#intro-dunia'); el.hidden = false; el.style.setProperty('--w', d.warna);
    const ringkas = d.id === 'istana';
    const kad = MK_DUNIA[d.id].map(id => {
        const m = M(id);
        const tempat = m.tempat.map(t => {
            const hs = id === 'khaisyum' ? t.huruf.map(h => h + 'ّ') : t.huruf;
            return `<div class="in-tempat">${ringkas ? '' : `<p>${TEMPAT_PENDEK[kunciT(t)] || t.info}</p>`}
              <div class="in-huruf">${hs.map((h, j) => `<button class="in-h arab" data-h="${t.huruf[j]}" title="Dengar ${NAMA_HURUF[t.huruf[j]]}">${h}</button>`).join('')}</div></div>`;
        }).join('');
        return `<article class="in-mk" style="--w:${m.warna}">
            <header><span class="arab">${m.arab}</span><div><b>${m.nama}</b><small>${m.terjemah}</small></div></header>
            <div class="in-senarai ${ringkas ? 'ringkas' : ''}">${tempat}</div>
            ${ringkas ? '' : `<p class="in-tip">${ik('bulb')} ${m.tip}</p>`}</article>`;
    }).join('');
    const jenis = [...new Set(binaSoalan(d).map(q => q.jenis))];
    el.innerHTML = `
      <div class="in-kepala">
        <span class="nod-bulat" style="--a:${d.warna}">${lambang(d)}</span>
        <div><small>Dunia ${i + 1} daripada ${DUNIA.length}</small><h2>${d.nama}</h2><p>${d.ringkas}</p></div>
      </div>
      <p class="in-arahan">${ik('book')} <span><b>Ulang kaji dahulu.</b> Tekan huruf untuk dengar sebutannya, kemudian mulakan pengembaraan.</span></p>
      <div class="in-grid ${MK_DUNIA[d.id].length > 2 ? 'banyak' : ''}">${kad}</div>
      <div class="in-misi">
        <div><b>${ik('gem')} 6 halangan</b><small>Jawab betul untuk melompat</small></div>
        <div><b>${ik('heart', 'isi')} 3 nyawa</b><small>Ada checkpoint jika terjatuh</small></div>
        <div><b>${ik('bulb')} 2 bantuan 50:50</b><small>Buang dua jawapan salah</small></div>
        <div><b>${ik('quiz')} Jenis soalan</b><small>${jenis.join(' · ')}</small></div>
      </div>
      <div class="in-butang"><button class="btn-utama" id="btn-mula-dunia">${ik('play', 'isi')} Mula pengembaraan</button></div>`;
    el.onclick = e => {
        const h = e.target.closest('.in-h'); if (h) { sebut(h.dataset.h); h.classList.add('lantun'); setTimeout(() => h.classList.remove('lantun'), 500); return; }
        if (e.target.closest('#btn-mula-dunia')) { bunyi('klik'); mulaDunia(i); }
    };
    window.scrollTo({ top: 0, behavior: 'instant' });
}

function mulaDunia(i) {
    const d = DUNIA[i];
    // Dari peta terus ke arena = satu langkah baharu (Kembali akan bawa ke peta)
    if (!$('#peta').hidden) { Nav.simpan(); history.pushState({ v: 'game' }, '', '#game'); }
    G.tok++;
    Object.assign(G, { d, idx: i, soalan: binaSoalan(d), pos: 0, cp: 0, hati: 3, salah: 0, kunci: false, bantu: 2, streak: 0, log: [] });
    G.cells = []; let n = 0;
    SUSUNAN.forEach(t => G.cells.push({ t, n: t === 'ob' ? n++ : -1 }));

    $('#peta').hidden = true; $('#intro-dunia').hidden = true; $('#arena').hidden = false;
    const p = $('#pentas');
    ['l1', 'l2', 'tanah', 'rumput', 'bukit'].forEach(k => p.style.setProperty('--' + k, d[k]));
    $('#hud-nama').textContent = d.nama;
    $('#lorong').innerHTML = G.cells.map((c, k) => {
        const ikon = c.t === 'ob' ? `<span style="color:${d.rumput}">${ik('gem')}</span>` : c.t === 'cp' ? ik('flag') : c.t === 'finish' ? ik('trophy') : '';
        return `<div class="sel ${c.t}" data-k="${k}"><span class="ikon">${ikon}</span></div>`;
    }).join('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    $('#lorong').style.transition = 'none';
    gerak(null);
    setTimeout(() => { $('#lorong').style.transition = ''; }, 50);
    kemasHud();
    tunjukSoalan();
}

function selEl(k) { return $(`.sel[data-k="${k}"]`); }
function ulangAnim(el, kelas, ms) {
    el.classList.remove('lompat', 'lari', 'langgar');
    void el.offsetWidth;
    el.classList.add(kelas);
    setTimeout(() => el.classList.remove(kelas), ms);
}
// Gerakkan lorong supaya hero berada di sel G.pos
function gerak(anim) {
    const lor = $('#lorong'), hero = $('#hero');
    const W = selEl(0).offsetWidth, heroX = hero.offsetLeft;
    lor.style.transform = `translateX(${heroX - (G.pos * W + W / 2)}px)`;
    if (anim === 'lompat') ulangAnim(hero, 'lompat', 900);
    if (anim === 'lari') ulangAnim(hero, 'lari', 900);
}
function kemasHud() {
    $('#hud-hati').innerHTML = ik('heart', 'isi').repeat(G.hati) + ik('heart', 'pudar').repeat(3 - G.hati);
    const lepas = G.cells.slice(0, G.pos + 1).filter(c => c.t === 'ob').length;
    $('#hud-halangan').innerHTML = `Halangan ${lepas}/6 · Checkpoint ${G.cp ? ik('check') : '–'}`;
}

function tunjukSoalan() {
    const depan = G.cells[G.pos + 1];
    if (!depan || depan.t !== 'ob') return;
    G.n = depan.n; G.kunci = false; G.guna5050 = false;
    const q = G.soalan[G.n];
    $('#s-no').textContent = `Soalan ${G.n + 1} / ${G.soalan.length}`;
    $('#s-jenis').textContent = q.jenis || '';
    $('#s-tanya').textContent = q.tanya;
    const b = $('#s-besar');
    b.classList.remove('ayat', 'dengar', 'petikan', 'panjang', 'arab');
    if (q.dengar) { b.innerHTML = `${ik('volume')}<small>Dengar</small>`; b.classList.add('dengar'); }
    else if (q.besarHtml && q.besarHtml.includes('ks-petikan')) { b.innerHTML = q.besarHtml; b.classList.add('petikan'); }
    else if (q.besarHtml) { b.innerHTML = q.besarHtml; b.classList.add('arab', 'ayat'); }
    else { b.textContent = q.besar; b.classList.toggle('arab', !!q.besarArab); b.classList.toggle('panjang', q.besar.length > 2); }
    b.title = q.huruf ? 'Tekan untuk dengar' : '';
    b.onclick = () => { if (q.huruf) { sebut(q.huruf); b.classList.add('lantun'); setTimeout(() => b.classList.remove('lantun'), 500); } };
    $('#s-maklum').textContent = q.dengar ? 'Tekan butang bunyi untuk dengar semula.' : 'Jawab dengan betul untuk melompat melepasi halangan!';
    $('#s-maklum').className = 's-maklum';
    $('#s-terang').hidden = true;
    $('#btn-lagi').hidden = true;
    kemasBantu();
    $('#s-pilihan').innerHTML = q.pilihan.map((o, i) =>
        `<button class="pilihan ${o.arab ? 'arab' : ''}" data-i="${i}">${o.teks}</button>`).join('');
    if (q.huruf) sebut(q.huruf);
}

function kemasBantu() {
    const bt = $('#btn-bantu'); if (!bt) return;
    const q = G.soalan[G.n];
    $('#bantu-baki').textContent = G.bantu;
    bt.disabled = G.kunci || G.bantu <= 0 || G.guna5050 || !q || q.pilihan.length < 4;
}
// Bantuan 50:50: buang dua jawapan salah
function bantu5050() {
    const q = G.soalan[G.n];
    if (G.kunci || G.bantu <= 0 || G.guna5050 || q.pilihan.length < 4) return;
    G.bantu--; G.guna5050 = true; bunyi('klik');
    const salah = kocok(q.pilihan.map((o, i) => o.betul ? -1 : i).filter(i => i >= 0)).slice(0, 2);
    const btns = $$('#s-pilihan .pilihan');
    salah.forEach(i => { btns[i].disabled = true; btns[i].classList.add('buang'); });
    $('#s-maklum').textContent = 'Dua jawapan salah sudah dibuang. Pilih antara yang tinggal!';
    kemasBantu();
}

function jawab(i) {
    if (G.kunci) return; G.kunci = true;
    const q = G.soalan[G.n];
    const btns = $$('#s-pilihan .pilihan');
    btns.forEach(b => b.disabled = true);
    const betulIdx = q.pilihan.findIndex(o => o.betul);
    const betul = i === betulIdx;
    if (q.mk && typeof Skor !== 'undefined') Skor.jawapan(q.mk, betul);
    G.log.push({ tanya: q.tanya, jenis: q.jenis, betul, terang: q.terang, jawapan: q.pilihan[betulIdx].teks, arab: q.pilihan[betulIdx].arab });
    kemasBantu();
    const maklum = $('#s-maklum');
    if (betul) {
        G.streak++;
        bunyi('betul'); btns[i].classList.add('betul');
        maklum.innerHTML = `<b>${rawak(['Hebat!', 'Pandai!', 'Betul!', 'Mantap!', 'Syabas!'])}</b> ${q.terang}`;
        maklum.className = 's-maklum ok';
        confetti(10);
        if (G.streak === 3 || G.streak === 5) toast(`${ik('star', 'isi')} ${G.streak} betul berturut-turut!`);
        maju();
    } else {
        G.streak = 0;
        bunyi('salah'); btns[i].classList.add('salah'); btns[betulIdx].classList.add('betul');
        G.hati--; G.salah++; kemasHud();
        ulangAnim($('#hero'), 'langgar', 600);
        const sel = selEl(G.pos + 1); sel.classList.add('goyang');
        setTimeout(() => sel.classList.remove('goyang'), 500);
        maklum.textContent = 'Aduh, terlanggar halangan! Jom faham dahulu:';
        maklum.className = 's-maklum';
        // Penerangan pembelajaran
        const jwp = q.pilihan[betulIdx];
        $('#s-terang').innerHTML = `<div class="ks-terang-jawab"><small>Jawapan betul</small><b class="${jwp.arab ? 'arab' : ''}">${jwp.teks}</b>
            ${q.huruf ? `<button class="btn-kaca kecil" id="s-dengar">${ik('volume')} Dengar</button>` : ''}</div>
          <p>${ik('bulb')} <span>${q.terang}</span></p>`;
        $('#s-terang').hidden = false;
        const dg = $('#s-dengar'); if (dg) dg.onclick = () => sebut(q.huruf);
        if (G.hati <= 0) tunggu(2600, jatuh);
        else $('#btn-lagi').hidden = false;
    }
}

// Soalan serupa (jenis dan makhraj yang sama) untuk cuba lagi
function lagi() {
    const q = G.soalan[G.n];
    let calon = [];
    for (let k = 0; k < 4 && !calon.length; k++)
        calon = binaSoalan(G.d).filter(x => x.kod === q.kod && x.tanya + x.terang !== q.tanya + q.terang && (!q.mk || x.mk === q.mk));
    G.soalan[G.n] = calon[0] || binaSoalan(G.d)[G.n];
    tunjukSoalan();
}

function maju() {
    G.pos++;
    gerak('lompat');
    const sel = selEl(G.pos);
    tunggu(450, () => sel.classList.add('lepas'));
    tunggu(1000, () => { kemasHud(); langkahAuto(); });
}
function langkahAuto() {
    const next = G.cells[G.pos + 1];
    if (!next) return;
    if (next.t === 'cp') {
        G.pos++; gerak('lari');
        tunggu(800, () => {
            G.cp = G.pos; selEl(G.pos).classList.add('dicapai');
            bunyi('cp'); toast(ik('flag') + ' Checkpoint dicapai!'); kemasHud();
            tunggu(1100, tunjukSoalan);
        });
    } else if (next.t === 'finish') {
        G.pos++; gerak('lari');
        tunggu(900, menang);
    } else tunjukSoalan();
}

function toast(teks) {
    const t = $('#toast'); t.innerHTML = teks; t.hidden = false;
    clearTimeout(toast.id); toast.id = setTimeout(() => t.hidden = true, 2200);
}

// ===== MODAL =====
function bukaModal(html, aksi = {}) {
    $('#modal-isi').innerHTML = html;
    $('#modal').hidden = false;
    $$('#modal-isi [data-act]').forEach(b => b.onclick = () => { bunyi('klik'); tutupModal(); aksi[b.dataset.act] && aksi[b.dataset.act](); });
}
function tutupModal() { $('#modal').hidden = true; }

function jatuh() {
    bunyi('kalah');
    const ada = G.cp > 0;
    bukaModal(`
    <div class="besar-ikon">${ik('alert')}</div>
    <h2>Kamu terjatuh!</h2>
    <p>${ada ? 'Jangan risau, kamu kembali ke checkpoint terakhir.' : 'Kamu kembali ke permulaan. Cuba lagi!'}</p>
    <div class="modal-butang"><button class="btn-utama" data-act="sambung">Teruskan</button>
    <button class="btn-kaca" data-act="peta">${ik('map')} Ke peta</button></div>`, {
        sambung() {
            G.pos = G.cp; G.hati = 3;
            $$('.sel').forEach(s => s.classList.remove('lepas'));
            G.cells.forEach((c, k) => { if (k < G.pos && c.t === 'ob') selEl(k).classList.add('lepas'); });
            gerak('lari'); kemasHud();
            tunggu(900, tunjukSoalan);
        },
        peta() { papar('game'); }
    });
}

function menang() {
    const bintang = G.salah === 0 ? 3 : G.salah <= 2 ? 2 : 1;
    const d = G.d;
    Sim.bintang[d.id] = Math.max(Sim.bintang[d.id] || 0, bintang);
    Sim.buka = Math.min(DUNIA.length, Math.max(Sim.buka, G.idx + 2));
    simpanSim();
    bunyi('menang'); confetti(45);
    const akhir = G.idx === DUNIA.length - 1;
    const skorNota = typeof Skor !== 'undefined' ? Skor.selesaiKuiz(d.id, bintang) : '';
    const jum = G.log.length, betul = G.log.filter(x => x.betul).length;
    const salahUnik = G.log.filter(x => !x.betul).filter((x, i, a) => a.findIndex(y => y.terang === x.terang) === i);
    const rumusan = salahUnik.length
        ? `<details class="rumusan" open><summary>${ik('book')} Perkara untuk diingat (${salahUnik.length})</summary>
            <ul>${salahUnik.map(x => `<li><small>${x.jenis}</small><span>${x.terang}</span></li>`).join('')}</ul></details>`
        : `<p class="rumusan-ok">${ik('check')} Semua soalan dijawab betul pada cubaan pertama. Hebat!</p>`;
    bukaModal(`
    <div class="besar-ikon">${ik('trophy')}</div>
    <h2>${akhir ? 'Pengembaraan Tamat!' : 'Syabas!'}</h2>
    <div class="bintang-besar">${bintangSvg(bintang)}</div>
    <p>${akhir ? 'Tahniah! Kamu pakar makhraj huruf!' : `${d.nama} berjaya ditawan!`}</p>
    <div class="rumusan-stat"><div><b>${betul}/${jum}</b><small>jawapan betul</small></div><div><b>${G.salah}</b><small>kesilapan</small></div><div><b>${2 - G.bantu}</b><small>bantuan diguna</small></div></div>
    ${rumusan}
    ${skorNota}
    <div class="modal-butang">
      ${akhir ? '' : `<button class="btn-utama" data-act="seterusnya">Dunia seterusnya ${ik('arrow-right')}</button>`}
      <button class="btn-kaca" data-act="ulang">${ik('refresh')} Main semula</button>
      <button class="btn-kaca" data-act="peta">${ik('map')} Ke peta</button>
    </div>`, {
        seterusnya() { tunjukIntro(G.idx + 1); },
        ulang() { mulaDunia(G.idx); },
        peta() { papar('game'); }
    });
}

// ===== MULA =====
document.addEventListener('DOMContentLoaded', () => {
    bina_tema(); bina_belajar(); bina_3d(); bina_slaid();
    // Ukur ketinggian header supaya sub-menu yang melekat (sticky) duduk tepat di bawahnya
    const atas = $('.atas');
    const ukurAtas = () => document.documentElement.style.setProperty('--tinggi-atas', atas.offsetHeight + 'px');
    ukurAtas();
    if ('ResizeObserver' in window) new ResizeObserver(ukurAtas).observe(atas); else window.addEventListener('resize', ukurAtas);
    $('#denai').addEventListener('click', e => {
        const n = e.target.closest('.nod');
        if (n && !n.disabled) { bunyi('klik'); tunjukIntro(+n.dataset.i); }
    });
    $('#s-pilihan').addEventListener('click', e => {
        const b = e.target.closest('.pilihan'); if (b) jawab(+b.dataset.i);
    });
    $('#btn-lagi').onclick = () => { bunyi('klik'); lagi(); };
    $('#btn-bantu').onclick = bantu5050;
    $('#btn-peta').onclick = () => {
        const t = Nav.sejarah[Nav.sejarah.length - 1];
        if (t && t.view === 'game') { Nav.kembali(); return; }
        bunyi('klik'); tunjukPeta();
    };
    $('#btn-reset').onclick = () => {
        if (confirm('Padam semua kemajuan pengembaraan?')) { Sim = { buka: 1, bintang: {} }; simpanSim(); tunjukPeta(); }
    };
    $('#btn-kembali').onclick = () => Nav.kembali();
    document.addEventListener('keydown', e => { // Alt + ← juga kembali
        if (e.altKey && e.key === 'ArrowLeft' && document.body.dataset.tab !== 'home') { e.preventDefault(); Nav.kembali(); }
    });
    const awal = location.hash.slice(1);
    papar(['home', 'belajar', 'model3d', 'aktiviti', 'game', 'padanan', 'susun', 'seret', 'cari', 'perbandingan', 'skor'].includes(awal) ? awal : 'home');
});
// ===== PWA: daftar service worker (bukan dalam aplikasi Android, yang memuatkan fail terus dari APK) =====
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && location.hostname !== 'appassets.androidplatform.net') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
}
