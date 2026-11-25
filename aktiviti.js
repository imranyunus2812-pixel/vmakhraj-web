// ===== BELAJAR TAMBAHAN + AKTIVITI =====
// Bergantung pada data.js, data2.js dan app.js (fungsi $, $$, kocok, rawak, bunyi, sebut, ik, bukaModal, papar ...)

const SEMUA_HURUF = Object.keys(NAMA_HURUF);
const hurufHtml = arr => [...arr].map(h => `<span class="hh arab">${h}</span>`).join('');
const urutMk = ['jauf', 'halq', 'lisan', 'syafatain', 'khaisyum'];

// Kumpulan huruf untuk aktiviti: setiap huruf + dua bunyi ghunnah (Al-Khaisyum)
const POOL = [
    ...HURUF_KUIZ.map(x => ({ tampil: x.huruf, h: x.huruf, mk: x.makhraj })),
    { tampil: 'نّ', h: 'ن', mk: 'khaisyum' },
    { tampil: 'مّ', h: 'م', mk: 'khaisyum' }
];
const pilihPool = (n, minMk) => {
    let p;
    do { p = kocok(POOL).slice(0, n); }
    while (new Set(p.map(x => x.mk)).size < minMk || new Set(p.map(x => x.h)).size < n);
    return p;
};

// ================= BELAJAR: TAKRIF =================
function bina_takrif() {
    const el = $('#takrif-isi'); if (!el) return;
    const baris = MAKHRAJ.map(m => {
        const huruf = m.id === 'jauf' ? 'Bunyi mad' : m.id === 'khaisyum' ? 'Ghunnah'
            : new Set(m.tempat.flatMap(t => t.huruf)).size + ' huruf';
        return `<button class="tk-baris" data-id="${m.id}" style="--w:${m.warna}">
            <span class="tk-arab arab">${m.arab}</span>
            <span class="tk-nama"><b>${m.nama}</b><small>${m.terjemah}</small></span>
            <span class="tk-nilai">${m.tempat.length}<small>tempat khas</small></span>
            <span class="tk-nilai">${huruf}</span>
        </button>`;
    }).join('');
    el.innerHTML = `
      <div class="tk-grid">${TAKRIF.kad.map((k, i) => `<article class="tk-kad"><span class="tk-no">${i + 1}</span><h3>${k.t}</h3><p>${k.p}</p></article>`).join('')}</div>
      <h3 class="bel-kecil">Makhraj am dan makhraj khas</h3>
      <p class="bel-teks">${TAKRIF.amKhas}</p>
      <div class="tk-jadual">
        <div class="tk-kepala"><span>Makhraj am</span><span>Makhraj khas</span><span>Huruf</span></div>
        ${baris}
        <div class="tk-jumlah"><span class="tj tj-1"><b>5</b> kawasan</span><span class="tj tj-2"><b>17</b> tempat khas</span><span class="tj tj-3"><b>30</b> bunyi huruf</span></div>
      </div>
      <p class="bel-nota nota-maskot"><span class="maskot" aria-hidden="true"></span> <span><b>Tahukah kamu?</b> ${TAKRIF.jumlah} Tekan satu baris untuk belajar makhraj itu.</span></p>`;
    el.addEventListener('click', e => {
        const b = e.target.closest('.tk-baris'); if (b) { bunyi('klik'); bukaDetail(b.dataset.id); }
    });
}

// ================= BELAJAR: HURUF KELIRU =================
function bina_keliru() {
    const chip = $('#keliru-pilih'), panel = $('#keliru-panel'); if (!chip) return;
    chip.innerHTML = KELIRU.map((k, i) => `<button class="kl-chip arab" data-i="${i}">${k.tajuk}</button>`).join('');
    const papar_ = i => {
        $$('.kl-chip', chip).forEach((c, j) => c.classList.toggle('aktif', j === i));
        const k = KELIRU[i];
        panel.innerHTML = `<div class="kl-lajur kl-${k.item.length}">` + k.item.map(it => {
            const m = M(it.mk);
            return `<article class="kl-kad" style="--w:${m.warna}">
              <header><span class="kl-huruf arab">${it.h}</span>
                <div><b>${NAMA_HURUF[it.h]}</b><small>${m.nama}</small></div>
                <button class="ikon-btn" data-h="${it.h}" aria-label="Dengar ${NAMA_HURUF[it.h]}">${ik('volume')}</button></header>
              <p class="kl-tempat">${it.tempat}</p>
              <div class="kl-sifat">${it.sifat.map(s => `<span class="tag">${s}</span>`).join('')}</div>
              <button class="btn-kecil kl-banding" data-i="${i}" data-h="${it.h}">${ik('play')} Lihat perbandingan</button>
            </article>`;
        }).join('') + `</div><div class="kl-beza">${ik('bulb')}<p><b>Beza utama:</b> ${k.beza}</p></div>`;
    };
    chip.addEventListener('click', e => { const c = e.target.closest('.kl-chip'); if (c) { bunyi('klik'); papar_(+c.dataset.i); } });
    panel.addEventListener('click', e => {
        const s = e.target.closest('.ikon-btn'); if (s) { sebut(s.dataset.h); return; }
        const b = e.target.closest('.kl-banding'); if (b) { bunyi('klik'); Perbandingan.buka(+b.dataset.i, b.dataset.h); }
    });
    papar_(0);
}

// ================= BELAJAR: PERBANDINGAN HURUF KELIRU (halaman video) =================
// Video setiap kumpulan diset dalam data2.js (medan "video" dalam KELIRU).
// Boleh guna fail sendiri (cth. assets/video/keliru-1.mp4) atau pautan YouTube.
const Perbandingan = {
    i: 0, sorot: null,
    buka(i, h) {
        this.i = i; this.sorot = h || null;
        try { sessionStorage.setItem('makhraj_banding', String(i)); } catch (e) { }
        papar('perbandingan');
    },
    masuk() {
        try { const s = +sessionStorage.getItem('makhraj_banding'); if (KELIRU[s]) this.i = s; } catch (e) { }
        this.render();
    },
    henti() { $$('#view-perbandingan video').forEach(v => v.pause()); const f = $('#view-perbandingan iframe'); if (f) f.src = 'about:blank'; },
    youtube(url) {
        const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
        return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : null;
    },
    videoHtml(k) {
        const slot = teks => `<div class="pb-kosong">${ik('play')}<b>Video belum diletakkan</b><small>${teks}</small></div>`;
        if (!k.video) return slot(`Isi medan <code>video</code> untuk "${k.tajuk}" dalam data2.js`);
        const yt = this.youtube(k.video);
        if (yt) return `<iframe src="${yt}" title="Perbandingan ${k.tajuk}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
        return `<video controls playsinline preload="metadata" ${k.poster ? `poster="${k.poster}"` : ''}>
            <source src="${k.video}" type="video/mp4"></video>
          <div class="pb-kosong pb-ralat" hidden>${ik('alert')}<b>Fail video tidak dijumpai</b><small>${k.video}</small></div>`;
    },
    render() {
        const root = $('#view-perbandingan'); if (!root) return;
        const k = KELIRU[this.i];
        root.innerHTML = `
          <div class="akt-kepala">
            <div><h2 class="tajuk">Perbandingan <span class="arab">${k.tajuk}</span></h2>
            <p class="sub">Tonton video, kemudian bandingkan tempat keluar dan sifat setiap huruf.</p></div></div>
          <div class="kl-pilih">${KELIRU.map((x, j) => `<button class="kl-chip arab ${j === this.i ? 'aktif' : ''}" data-pb="${j}">${x.tajuk}</button>`).join('')}</div>
          <div class="pb-video">${this.videoHtml(k)}</div>
          <div class="kl-beza">${ik('bulb')}<p><b>Beza utama:</b> ${k.beza}</p></div>
          <div class="kl-lajur kl-${k.item.length} pb-kad">${k.item.map(it => {
              const m = M(it.mk);
              return `<article class="kl-kad ${it.h === this.sorot ? 'pb-sorot' : ''}" style="--w:${m.warna}">
                <header><span class="kl-huruf arab">${it.h}</span>
                  <div><b>${NAMA_HURUF[it.h]}</b><small>${m.nama}</small></div>
                  <button class="ikon-btn" data-h="${it.h}" aria-label="Dengar ${NAMA_HURUF[it.h]}">${ik('volume')}</button></header>
                <p class="kl-tempat">${it.tempat}</p>
                <div class="kl-sifat">${it.sifat.map(s => `<span class="tag">${s}</span>`).join('')}</div>
              </article>`;
          }).join('')}</div>`;
        const v = $('video', root);
        if (v) v.addEventListener('error', () => { v.hidden = true; $('.pb-ralat', root).hidden = false; }, true);
        root.onclick = e => {
            const c = e.target.closest('[data-pb]'); if (c) { bunyi('klik'); this.henti(); this.i = +c.dataset.pb; this.sorot = null; try { sessionStorage.setItem('makhraj_banding', c.dataset.pb); } catch (x) { } this.render(); return; }
            const s = e.target.closest('.ikon-btn'); if (s) { sebut(s.dataset.h); return; }
        };
    }
};

// ================= BELAJAR: SIFAT HURUF =================
function bina_sifat() {
    const el = $('#sifat-isi'); if (!el) return;
    el.innerHTML = `
      <div class="tk-grid">
        <article class="tk-kad"><span class="tk-no">1</span><h3>Maksud sifat huruf</h3><p>${SIFAT_INTRO.maksud}</p></article>
        <article class="tk-kad"><span class="tk-no">2</span><h3>Sifat lazimah</h3><p>${SIFAT_INTRO.lazimah}</p></article>
        <article class="tk-kad"><span class="tk-no">3</span><h3>Sifat 'aridhah</h3><p>${SIFAT_INTRO.aridhah}</p></article>
      </div>
      <p class="bel-nota">${ik('bulb')} <span>${SIFAT_INTRO.jumlah}</span></p>
      <h3 class="bel-kecil">Sifat berlawanan <span class="bil">11</span></h3>
      <div class="kl-pilih" id="sifat-pilih">${SIFAT_PASANGAN.map((g, i) => `<button class="kl-chip" data-i="${i}">${g.tajuk}</button>`).join('')}</div>
      <div id="sifat-panel"></div>
      <h3 class="bel-kecil">Sifat tunggal <span class="bil">9</span></h3>
      <div class="sf-tunggal">${SIFAT_TUNGGAL.map(s => `<article class="sf-kad kecil"><header><b>${s.nama}</b><small>${s.makna}</small></header><p>${s.teks}</p><div class="sf-huruf">${hurufHtml(s.huruf)}</div></article>`).join('')}</div>
      <h3 class="bel-kecil">Tahap sifat</h3>
      <div class="sf-tahap">${SIFAT_TAHAP.map(t => `<article class="sf-kad kecil" style="--w:${t.warna}"><header><b>${t.nama}</b></header><div class="kl-sifat">${t.isi.map(x => `<span class="tag">${x}</span>`).join('')}</div></article>`).join('')}</div>`;
    const pilih = $('#sifat-pilih'), panel = $('#sifat-panel');
    const papar_ = i => {
        $$('.kl-chip', pilih).forEach((c, j) => c.classList.toggle('aktif', j === i));
        const g = SIFAT_PASANGAN[i];
        const dipakai = g.item.flatMap(x => x.huruf ? [...x.huruf] : []);
        panel.innerHTML = `<p class="bel-teks">${g.ringkas}</p>
          <div class="sf-lajur sf-${g.item.length}">${g.item.map(it => {
            const hs = it.huruf ? [...it.huruf] : SEMUA_HURUF.filter(h => !dipakai.includes(h));
            return `<article class="sf-kad" style="--w:${it.warna}"><header><b>${it.nama}</b><small>${it.makna}</small></header>
              <p>${it.teks}</p><div class="sf-huruf">${hurufHtml(hs)}</div>
              <small class="sf-bil">${hs.length} huruf${it.huruf ? '' : ' (selebihnya)'}</small></article>`;
        }).join('')}</div>
          ${g.ingat ? `<div class="sf-ingat"><span class="arab">${g.ingat}</span><small>${g.nota}</small></div>` : `<p class="bel-nota">${ik('bulb')} <span>${g.nota}</span></p>`}`;
    };
    pilih.addEventListener('click', e => { const c = e.target.closest('.kl-chip'); if (c) { bunyi('klik'); papar_(+c.dataset.i); } });
    papar_(0);
}

// Menu kecil di atas halaman Belajar
function bina_subnav() {
    const n = $('#bel-nav'); if (!n) return;
    n.addEventListener('click', e => {
        const b = e.target.closest('[data-ke]'); if (!b) return;
        bunyi('klik'); const t = document.getElementById(b.dataset.ke);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    // Tandakan bahagian yang sedang dilihat
    const butang = $$('[data-ke]', n);
    const tanda = id => butang.forEach(b => b.classList.toggle('aktif', b.dataset.ke === id));
    tanda(butang[0] && butang[0].dataset.ke);
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(en => {
            const nampak = en.filter(x => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
            if (nampak) tanda(nampak.target.id);
        }, { rootMargin: '-30% 0px -60% 0px' });
        butang.forEach(b => { const s = document.getElementById(b.dataset.ke); if (s) io.observe(s); });
    }
}

// ================= KEPALA (dikongsi Seret huruf dan Cari) =================
function kepalaHtml() {
    const zon = Object.entries(ZON_KEPALA).map(([id, z]) =>
        `<button class="zon" data-id="${id}" style="left:${z.x}%;top:${z.y}%" aria-label="${M(id).nama}"><b>${z.no}</b></button>`).join('');
    return `<div class="kepala-kotak">
      <svg class="kepala-svg" viewBox="0 0 200 240" aria-hidden="true">${KEPALA_SVG}</svg>
      <img class="kepala-img" src="assets/kepala.png" alt="" onload="this.parentElement.classList.add('ada')" onerror="this.remove()">
      ${zon}</div>`;
}
function legendaHtml() {
    return `<ul class="legenda">${Object.entries(ZON_KEPALA).sort((a, b) => a[1].no - b[1].no).map(([id, z]) =>
        `<li data-id="${id}" style="--w:${M(id).warna}"><b>${z.no}</b><span>${M(id).nama}</span><span class="lg-huruf arab"></span></li>`).join('')}</ul>`;
}
const tajukAkt = (judul, ayat) => `<div class="akt-kepala"><div><h2 class="tajuk">${judul}</h2><p class="sub">${ayat}</p></div>${typeof Skor !== 'undefined' ? Skor.chipHtml() : ''}</div>`;
const rekod = (k, nilai, kecilLebihBaik) => {
    Sim.rekod = Sim.rekod || {};
    const lama = Sim.rekod[k];
    const baru = lama === undefined || (kecilLebihBaik ? nilai < lama : nilai > lama);
    if (baru) { Sim.rekod[k] = nilai; simpanSim(); }
    return Sim.rekod[k];
};

// ================= PADANAN KAD =================
const Padanan = {
    N: 6, kad: [], terbuka: [], pasang: 0, gerak: 0, saat: 0, tim: null, kunci: false,
    masuk() { this.mula(this.N); }, // sentiasa permainan baharu (kad dikocok)
    henti() { clearInterval(this.tim); this.tim = null; clearInterval(this.tLihat); this.tLihat = null; },
    mula(N) {
        this.henti(); this.siap = true; this.N = N;
        Object.assign(this, { terbuka: [], pasang: 0, gerak: 0, saat: 0, kunci: false });
        // Kad makhraj hanya 5 makhraj am. Setiap makhraj muncul sekali dahulu; jika lebih 5 pasang,
        // makhraj yang ada banyak huruf diulang (Al-Jauf hanya ada satu huruf, iaitu ا).
        const susunMk = [...kocok(urutMk), ...kocok(['halq', 'lisan', 'syafatain', 'khaisyum'])].slice(0, N);
        const guna = new Set(), kad = [];
        susunMk.forEach((mk, i) => {
            const pilihan = kocok(POOL.filter(x => x.mk === mk && !guna.has(x.tampil)));
            const x = pilihan[0]; guna.add(x.tampil);
            const m = M(mk);
            kad.push({ p: i, mk, jenis: 'h', h: x.tampil, sebut: x.h });
            kad.push({ p: i, mk, jenis: 't', arab: m.arab, nama: m.nama, terjemah: m.terjemah });
        });
        this.kad = kocok(kad);
        const best = (Sim.rekod || {})['padanan' + N];
        const root = $('#view-padanan');
        root.innerHTML = tajukAkt('Padanan Kad', 'Balikkan dua kad. Padankan huruf dengan makhrajnya.') + `
          <div class="akt-bar">
            <div class="seg">${[4, 6, 8].map(n => `<button class="g-seg ${n === N ? 'aktif' : ''}" data-n="${n}">${n} pasang</button>`).join('')}</div>
            <div class="akt-stat"><span>Gerakan <b id="pd-gerak">0</b></span><span>Masa <b id="pd-masa">0:00</b></span><span>Terbaik <b>${best === undefined ? '-' : best}</b></span></div>
          </div>
          <div class="pd-lihat" id="pd-lihat" role="status"></div>
          <div class="grid-ingat lihat" id="pd-grid">${this.kad.map((k, i) => `
            <button class="kad-ingat" data-i="${i}" aria-label="Kad ${i + 1}">
              <span class="depan">${ik('quiz')}</span>
              <span class="belakang ${k.jenis}">${k.jenis === 'h' ? `<span class="arab">${k.h}</span>` : `<span class="arab pd-mk-arab">${k.arab}</span><b class="pd-mk-nama">${k.nama}</b><small>${k.terjemah}</small>`}</span>
            </button>`).join('')}</div>`;
        root.onclick = e => {
            const s = e.target.closest('.g-seg'); if (s) { bunyi('klik'); this.mula(+s.dataset.n); return; }
            if (e.target.closest('#pd-langkau')) { bunyi('klik'); this.tutupSemua(); return; }
            const c = e.target.closest('.kad-ingat'); if (c) this.balik(c);
        };
        this.tunjukSemua();
    },
    // Semua kad dibuka dahulu supaya pemain boleh ingat isinya, kemudian ditutup
    tunjukSemua() {
        this.kunci = true;
        $$('#pd-grid .kad-ingat').forEach(k => k.classList.add('buka'));
        let baki = this.N + 1; // 4 pasang = 5 saat, 6 = 7 saat, 8 = 9 saat
        const kemas = () => {
            const el = $('#pd-lihat'); if (!el) return;
            el.innerHTML = `${ik('bulb')} <span>Ingat kedudukan setiap kad! Kad akan ditutup dalam <b>${baki}</b> saat.</span>
              <button class="btn-kaca kecil" id="pd-langkau">Saya dah sedia</button>`;
        };
        kemas();
        this.tLihat = setInterval(() => { baki--; if (baki <= 0) this.tutupSemua(); else kemas(); }, 1000);
    },
    tutupSemua() {
        clearInterval(this.tLihat); this.tLihat = null;
        $$('#pd-grid .kad-ingat').forEach(k => k.classList.remove('buka'));
        const g = $('#pd-grid'); if (g) g.classList.remove('lihat');
        const el = $('#pd-lihat'); if (el) { el.innerHTML = `${ik('play')} <span>Mula! Balikkan dua kad untuk mencari pasangan.</span>`; el.classList.add('mula'); }
        setTimeout(() => { this.kunci = false; }, 450); // tunggu animasi tutup selesai
    },
    balik(el) {
        if (this.kunci || el.classList.contains('buka') || el.classList.contains('padan')) return;
        if (!this.tim) this.tim = setInterval(() => {
            this.saat++; const m = $('#pd-masa'); if (m) m.textContent = `${Math.floor(this.saat / 60)}:${String(this.saat % 60).padStart(2, '0')}`;
        }, 1000);
        const k = this.kad[+el.dataset.i];
        el.classList.add('buka'); bunyi('klik'); if (k.jenis === 'h') sebut(k.sebut);
        this.terbuka.push(el);
        if (this.terbuka.length < 2) return;
        this.gerak++; $('#pd-gerak').textContent = this.gerak;
        const [a, b] = this.terbuka, ka = this.kad[+a.dataset.i], kb = this.kad[+b.dataset.i];
        // Padan jika satu kad huruf dan satu kad makhraj yang sama (mana-mana huruf dari makhraj itu)
        const padan = ka.jenis !== kb.jenis && ka.mk === kb.mk;
        if (ka.jenis !== kb.jenis && typeof Skor !== 'undefined') Skor.jawapan((ka.jenis === 'h' ? ka : kb).mk, padan);
        if (padan) {
            [a, b].forEach(x => { x.classList.remove('buka'); x.classList.add('padan'); });
            this.terbuka = []; this.pasang++; bunyi('betul');
            if (this.pasang === this.N) this.tamat();
        } else {
            this.kunci = true; bunyi('salah');
            setTimeout(() => { a.classList.remove('buka'); b.classList.remove('buka'); this.terbuka = []; this.kunci = false; }, 950);
        }
    },
    tamat() {
        clearInterval(this.tim); this.tim = null;
        const N = this.N, bintang = this.gerak <= N + 2 ? 3 : this.gerak <= N * 2 ? 2 : 1;
        const terbaik = rekod('padanan' + N, this.gerak, true);
        const w = N === 8 ? 1 : N === 6 ? 0.85 : 0.7;
        const nota = typeof Skor !== 'undefined' ? Skor.selesai('padanan', Math.min(100, 100 * N / this.gerak * w)) : '';
        bunyi('menang'); confetti(30);
        bukaModal(`<div class="besar-ikon">${ik('trophy')}</div><h2>Semua padan!</h2>
          <div class="bintang-besar">${bintangSvg(bintang)}</div>
          <p>${this.gerak} gerakan dalam ${Math.floor(this.saat / 60)}:${String(this.saat % 60).padStart(2, '0')}. Terbaik: ${terbaik} gerakan.</p>
          ${nota}
          <div class="modal-butang"><button class="btn-utama" data-act="ulang">Main semula</button><button class="btn-kaca" data-act="hub">Ke Aktiviti</button></div>`,
            { ulang: () => this.mula(N), hub: () => papar('aktiviti') });
    }
};

// ================= SUSUN HURUF =================
const Susun = {
    on: false, y: 0, laju: 70, skor: 0, hati: 3, akhir: 0, tok: 0, item: null, last: 0, raf: 0,
    masuk() { this.henti(); this.render(); },
    henti() { this.on = false; this.tok++; cancelAnimationFrame(this.raf); },
    render() {
        const root = $('#view-susun');
        const best = (Sim.rekod || {}).susun;
        root.innerHTML = tajukAkt('Susun Huruf', 'Huruf jatuh dari atas. Tekan bakul makhraj yang betul sebelum ia sampai ke bawah.') + `
          <div class="akt-bar"><div class="akt-stat"><span>Masa <b id="sn-masa">60</b></span><span>Skor <b id="sn-skor">0</b></span><span>Terbaik <b>${best === undefined ? '-' : best}</b></span></div>
            <div class="hud-hati" id="sn-hati"></div></div>
          <div class="susun-pentas" id="sn-pentas"><div class="susun-ubin arab" id="sn-ubin" hidden></div>
            <div class="susun-mula" id="sn-mula"><button class="btn-utama" id="sn-btn">${ik('play', 'isi')} Mula</button><p class="s-maklum">Tekan bakul atau kekunci 1 hingga 5.</p></div></div>
          <div class="bakul-baris">${urutMk.map((id, i) => { const m = M(id); return `<button class="bakul" data-id="${id}" style="--w:${m.warna}"><b>${i + 1}</b><span class="arab">${m.arab}</span><small>${m.nama}</small></button>`; }).join('')}</div>`;
        this.hati = 3; this.kemasHati();
        root.onclick = e => {
            if (e.target.closest('#sn-btn')) { bunyi('klik'); this.mula(); return; }
            const b = e.target.closest('.bakul'); if (b) this.jawab(b.dataset.id);
        };
    },
    kemasHati() { const h = $('#sn-hati'); if (h) h.innerHTML = ik('heart', 'isi').repeat(this.hati) + ik('heart', 'pudar').repeat(3 - this.hati); },
    mula() {
        this.tok++; this.on = true; this.skor = 0; this.hati = 3; this.laju = 70; this.dek = kocok(POOL); this.item = null;
        this.akhir = performance.now() + 60000; this.last = performance.now();
        $('#sn-mula').hidden = true; $('#sn-skor').textContent = 0; this.kemasHati();
        // Telefon: skrol supaya ruang permainan dan bakul kelihatan sepenuhnya
        if (innerWidth <= 760) {
            const bar = $('#view-susun .akt-bar'), atas = $('.atas');
            if (bar) window.scrollTo({ top: bar.getBoundingClientRect().top + scrollY - (atas ? atas.offsetHeight : 64) - 6, behavior: 'smooth' });
        }
        this.seterusnya();
        const tok = this.tok, loop = t => { if (!this.on || tok !== this.tok) return; this.tick(t); this.raf = requestAnimationFrame(loop); };
        this.raf = requestAnimationFrame(loop);
    },
    seterusnya() {
        if (!this.dek || !this.dek.length) {
            this.dek = kocok(POOL);
            if (this.item && this.dek[0].h === this.item.h) this.dek.push(this.dek.shift());
        }
        this.item = this.dek.shift(); this.y = -10;
        const u = $('#sn-ubin'); u.textContent = this.item.tampil; u.hidden = false;
        u.style.left = (15 + Math.random() * 70) + '%'; this.letak();
    },
    letak() { $('#sn-ubin').style.transform = `translate(-50%, ${this.y}px)`; },
    tick(t) {
        const dt = Math.min(0.05, (t - this.last) / 1000); this.last = t;
        const baki = Math.max(0, Math.ceil((this.akhir - t) / 1000)); $('#sn-masa').textContent = baki;
        if (baki <= 0) { this.tamat(); return; }
        const had = $('#sn-pentas').clientHeight - $('#sn-ubin').offsetHeight - 6;
        this.y += this.laju * dt; this.letak();
        if (this.y >= had) this.salah(null);
    },
    jawab(id) {
        if (!this.on) return;
        const b = $(`.bakul[data-id="${id}"]`);
        if (typeof Skor !== 'undefined') Skor.jawapan(this.item.mk, id === this.item.mk);
        if (id === this.item.mk) {
            this.skor++; this.laju += 7; $('#sn-skor').textContent = this.skor; bunyi('betul');
            this.kelip(b, 'betul'); this.seterusnya();
        } else { this.kelip(b, 'salah'); this.salah(id); }
    },
    salah(id) {
        this.hati--; this.kemasHati(); bunyi('salah');
        if (id === null) { if (typeof Skor !== 'undefined') Skor.jawapan(this.item.mk, false); const bk = $(`.bakul[data-id="${this.item.mk}"]`); this.kelip(bk, 'betul'); }
        if (this.hati <= 0) this.tamat(); else this.seterusnya();
    },
    kelip(el, k) { el.classList.add(k); setTimeout(() => el.classList.remove(k), 350); },
    tamat() {
        if (!this.on) return; this.on = false; this.tok++; cancelAnimationFrame(this.raf);
        const terbaik = rekod('susun', this.skor, false);
        const nota = typeof Skor !== 'undefined' ? Skor.selesai('susun', this.skor * 5) : '';
        bunyi('menang'); confetti(20);
        bukaModal(`<div class="besar-ikon">${ik('basket')}</div><h2>Tamat!</h2>
          <p>Kamu menyusun <b>${this.skor}</b> huruf dengan betul. Terbaik: ${terbaik}.</p>
          ${nota}
          <div class="modal-butang"><button class="btn-utama" data-act="ulang">Main semula</button><button class="btn-kaca" data-act="hub">Ke Aktiviti</button></div>`,
            { ulang: () => this.render(), hub: () => papar('aktiviti') });
    }
};
document.addEventListener('keydown', e => {
    if (!Susun.on) return; const n = +e.key; if (n >= 1 && n <= 5) Susun.jawab(urutMk[n - 1]);
});

// ================= SERET HURUF =================
const Seret = {
    ubin: [], salah: 0, letak: 0, pilih: null, drag: null,
    masuk() { this.mula(); }, // sentiasa permainan baharu (dikocok)
    henti() { },
    mula() {
        this.siap = true; this.ubin = pilihPool(6, 4); this.salah = 0; this.letak = 0; this.pilih = null;
        const root = $('#view-seret');
        root.innerHTML = tajukAkt('Seret Huruf', 'Seret huruf ke kawasan yang betul pada kepala. Boleh juga tekan huruf, kemudian tekan bulatan.') + `
          <div class="akt-dua">
            <div class="akt-kiri">${kepalaHtml()}</div>
            <div class="akt-kanan">${legendaHtml()}
              <p class="akt-mesej" id="sr-mesej">Pilih huruf dan letakkan di tempat keluarnya.</p>
              <div class="dulang" id="sr-dulang">${this.ubin.map((u, i) => `<div class="ubin arab" data-i="${i}" tabindex="0" role="button" aria-label="Huruf ${u.h}">${u.tampil}</div>`).join('')}</div>
              <button class="btn-kaca kecil" id="sr-baharu">${ik('refresh')} Pusingan baharu</button>
            </div></div>`;
        const dulang = $('#sr-dulang');
        dulang.onpointerdown = e => {
            const t = e.target.closest('.ubin'); if (!t || t.classList.contains('letak')) return;
            this.drag = { t, sx: e.clientX, sy: e.clientY, gerak: false };
            t.setPointerCapture(e.pointerId); t.classList.add('seret');
        };
        dulang.onpointermove = e => {
            const d = this.drag; if (!d) return;
            const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
            if (Math.abs(dx) + Math.abs(dy) > 8) d.gerak = true;
            d.t.style.transform = `translate(${dx}px, ${dy}px)`;
            $$('#view-seret .zon').forEach(z => z.classList.remove('hampir'));
            const z = this.zonDi(e.clientX, e.clientY); if (z) z.classList.add('hampir');
        };
        dulang.onpointerup = e => {
            const d = this.drag; if (!d) return; this.drag = null;
            d.t.classList.remove('seret'); d.t.style.transform = '';
            $$('#view-seret .zon').forEach(z => z.classList.remove('hampir'));
            if (d.gerak) { const z = this.zonDi(e.clientX, e.clientY); if (z) this.semak(d.t, z); }
            else { // ketik: pilih huruf
                $$('.ubin', dulang).forEach(x => x.classList.remove('pilih'));
                this.pilih = this.pilih === d.t ? null : d.t; if (this.pilih) d.t.classList.add('pilih');
                const u = this.ubin[+d.t.dataset.i]; sebut(u.h);
            }
        };
        root.onclick = e => {
            const z = e.target.closest('.zon'); if (z && this.pilih) { this.semak(this.pilih, z); return; }
            if (e.target.closest('#sr-baharu')) { bunyi('klik'); this.mula(); }
        };
    },
    zonDi(x, y) {
        let dekat = null, jarak = 1e9;
        $$('#view-seret .zon').forEach(z => {
            const r = z.getBoundingClientRect(), d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
            if (d < jarak) { jarak = d; dekat = z; }
        });
        return jarak < 40 ? dekat : null;
    },
    semak(t, z) {
        const u = this.ubin[+t.dataset.i], id = z.dataset.id, mesej = $('#sr-mesej');
        if (typeof Skor !== 'undefined') Skor.jawapan(u.mk, u.mk === id);
        if (u.mk === id) {
            t.classList.add('letak'); t.classList.remove('pilih'); this.pilih = null; this.letak++; bunyi('betul');
            z.classList.add('betul'); setTimeout(() => z.classList.remove('betul'), 600);
            $(`.legenda li[data-id="${id}"] .lg-huruf`).textContent += ' ' + u.tampil;
            mesej.textContent = `Betul! ${NAMA_HURUF[u.h]} keluar dari ${M(id).nama}.`;
            if (this.letak === this.ubin.length) this.tamat();
        } else {
            this.salah++; bunyi('salah');
            [t, z].forEach(x => { x.classList.add('goyang'); setTimeout(() => x.classList.remove('goyang'), 450); });
            mesej.textContent = 'Belum tepat. Cuba kawasan yang lain.';
        }
    },
    tamat() {
        const bintang = this.salah === 0 ? 3 : this.salah <= 2 ? 2 : 1;
        const nota = typeof Skor !== 'undefined' ? Skor.selesai('seret', Math.max(10, 100 - 12 * this.salah)) : '';
        bunyi('menang'); confetti(30);
        bukaModal(`<div class="besar-ikon">${ik('trophy')}</div><h2>Semua tepat!</h2><div class="bintang-besar">${bintangSvg(bintang)}</div>
          <p>${this.salah} kesilapan.</p>${nota}<div class="modal-butang"><button class="btn-utama" data-act="ulang">Pusingan baharu</button><button class="btn-kaca" data-act="hub">Ke Aktiviti</button></div>`,
            { ulang: () => this.mula(), hub: () => papar('aktiviti') });
    }
};

// ================= CARI DI MODEL 3D =================
// Mod "Kepala 2D": tekan kawasan pada lakaran kepala.
// Mod "Model 3D": model Unity dimuatkan dalam aktiviti. Pemain jawab dengan menekan bahagian pada model
// (jika Unity dikemas kini, lihat README) atau dengan butang makhraj di bawah model.
const tempatHuruf = (h, mk) => { const m = M(mk); return m.tempat.find(t => t.huruf.includes(h)) || m.tempat[0]; };
const Cari = {
    N: 8, soalan: [], i: 0, mata: 0, salah: 0, cubaan: 0, kunci: false, petunjuk: false, mod: '2d', u: 'idle', frame: null,
    masuk() { this.mula(); }, // sentiasa permainan baharu (dikocok)
    henti() { },
    mula() {
        this.siap = true; this.soalan = pilihPool(this.N, 4);
        Object.assign(this, { i: 0, mata: 0, salah: 0, kunci: false });
        const root = $('#view-cari');
        root.innerHTML = tajukAkt('Cari di Model 3D', 'Dengar huruf, kemudian cari tempat ia keluar pada kepala atau model 3D.') + `
          <div class="akt-bar">
            <div class="seg" role="tablist">
              <button class="g-seg ${this.mod === '2d' ? 'aktif' : ''}" data-mod="2d">Kepala 2D</button>
              <button class="g-seg ${this.mod === '3d' ? 'aktif' : ''}" data-mod="3d">${ik('cube')} Model 3D</button>
            </div>
            <div class="akt-stat"><span>Soalan <b id="cr-no">1/${this.N}</b></span><span>Mata <b id="cr-mata">0</b></span><span>Silap <b id="cr-salah">0</b></span></div>
          </div>
          <div class="cr-titik" id="cr-titik">${this.soalan.map((_, j) => `<i data-j="${j}"></i>`).join('')}</div>
          <div class="akt-dua cari-grid">
            <div class="akt-kiri">
              <div class="cr-panggung" id="cr-2d" ${this.mod === '2d' ? '' : 'hidden'}>${kepalaHtml()}</div>
              <div class="cr-panggung" id="cr-3d" ${this.mod === '3d' ? '' : 'hidden'}>
                <div class="cr-unity" id="cr-unity" data-u="idle">
                  <iframe id="cr-frame" title="Model 3D untuk aktiviti Cari" allow="fullscreen; autoplay"></iframe>
                  <div class="cr-unity-lapis" id="cr-unity-lapis"></div>
                </div>
                <div class="cr-jawab">${urutMk.map(id => `<button class="cr-mk" data-id="${id}" style="--w:${M(id).warna}"><span class="arab">${M(id).arab}</span>${M(id).nama}</button>`).join('')}</div>
              </div>
            </div>
            <div class="akt-kanan">
              <div class="c cari-soal">
                <p class="s-maklum cr-label">Huruf ini keluar dari mana?</p>
                <button class="s-besar arab" id="cr-huruf" aria-label="Dengar huruf"></button>
                <p class="cr-dengar">${ik('volume')} Tekan huruf untuk dengar</p>
                <p class="akt-mesej" id="cr-mesej"></p>
                <div class="cr-butang">
                  <button class="btn-kaca kecil" id="cr-petunjuk">${ik('bulb')} Petunjuk</button>
                  <button class="btn-utama" id="cr-seterus" hidden>Seterusnya ${ik('arrow-right')}</button>
                </div>
              </div>
              <div class="cr-info" id="cr-info" hidden></div>
              ${legendaHtml()}
            </div>
          </div>`;
        this.frame = $('#cr-frame');
        if (this.mod === '3d') this.mula3D();
        this.tunjuk();
        root.onclick = e => {
            const md = e.target.closest('[data-mod]'); if (md) { bunyi('klik'); this.tukarMod(md.dataset.mod); return; }
            const z = e.target.closest('.zon'); if (z) { this.semak(z.dataset.id); return; }
            const k = e.target.closest('.cr-mk'); if (k) { this.semak(k.dataset.id); return; }
            const lg = e.target.closest('.legenda li'); if (lg && this.mod === '2d') { this.semak(lg.dataset.id); return; }
            if (e.target.closest('#cr-huruf')) { sebut(this.soalan[this.i].h); return; }
            if (e.target.closest('#cr-petunjuk')) { this.beriPetunjuk(); return; }
            if (e.target.closest('#cr-seterus')) { bunyi('klik'); this.seterusnya(); return; }
            if (e.target.closest('#cr-muat3d')) { bunyi('klik'); this.mula3D(true); return; }
            if (e.target.closest('#cr-ke2d')) { bunyi('klik'); this.tukarMod('2d'); return; }
            const b = e.target.closest('[data-belajar]'); if (b) { bunyi('klik'); papar('belajar'); bukaDetail(b.dataset.belajar); }
        };
    },

    // ----- mod paparan -----
    tukarMod(mod) {
        if (mod === this.mod) return;
        this.mod = mod;
        $$('#view-cari [data-mod]').forEach(b => b.classList.toggle('aktif', b.dataset.mod === mod));
        $('#cr-2d').hidden = mod !== '2d'; $('#cr-3d').hidden = mod !== '3d';
        $('.legenda', $('#view-cari')).classList.toggle('boleh', mod === '2d');
        if (mod === '3d') this.mula3D();
    },
    setU(st, html = '') {
        this.u = st; const w = $('#cr-unity'); if (!w) return;
        w.dataset.u = st; $('#cr-unity-lapis').innerHTML = html;
    },
    async mula3D(paksa) {
        if (!paksa && (this.u === 'loading' || this.u === 'ready')) return;
        this.setU('loading', `<div class="cr-pusing"></div><p>Memuatkan model 3D…</p><small>Fail besar, disyorkan guna WiFi.</small>`);
        try {
            const r = await fetch('unity/index.html', { method: 'HEAD', cache: 'no-store' });
            if (!r.ok) throw new Error('tiada');
        } catch (e) {
            this.setU('error', `${ik('alert')}<p><b>Model 3D belum tersedia</b></p>
              <small>Letakkan hasil build Unity WebGL dalam folder <code>unity/</code>. Buat masa ini kamu boleh jawab dengan butang makhraj di bawah, atau guna kepala 2D.</small>
              <div class="cr-butang"><button class="btn-kaca kecil" id="cr-muat3d">${ik('refresh')} Cuba lagi</button><button class="btn-kaca kecil" id="cr-ke2d">Guna kepala 2D</button></div>`);
            return;
        }
        this.frame.onload = () => {
            if (this.frame.getAttribute('src') === 'about:blank') return;
            clearTimeout(this.tunggu);
            // templat Unity lalai tidak menghantar status: anggap sedia selepas 10 saat
            this.tunggu = setTimeout(() => { if (this.u === 'loading') this.sedia3D(); }, 10000);
        };
        this.frame.src = 'unity/index.html';
    },
    sedia3D() { clearTimeout(this.tunggu); this.setU('ready'); this.hantar({ type: 'cari', huruf: this.soalan[this.i].h, id: this.soalan[this.i].mk }); },
    hantar(msg) { if (this.u === 'ready' && this.frame && this.frame.contentWindow) this.frame.contentWindow.postMessage(msg, '*'); },
    dariUnity(d) {
        if (d.type === 'progress' && this.u === 'loading') { const p = $('#cr-unity-lapis p'); if (p) p.textContent = `Memuatkan model 3D… ${Math.round(d.value * 100)}%`; }
        else if (d.type === 'ready') this.sedia3D();
        else if (d.type === 'error') this.setU('error', `${ik('alert')}<p><b>Model 3D tidak dapat dimuatkan</b></p><small>${esc(String(d.message || '')).slice(0, 200)}</small>
            <div class="cr-butang"><button class="btn-kaca kecil" id="cr-muat3d">${ik('refresh')} Cuba lagi</button><button class="btn-kaca kecil" id="cr-ke2d">Guna kepala 2D</button></div>`);
        else if (d.type === 'jawapan' && d.id) this.semak(d.id);
    },

    // ----- soalan -----
    tunjuk() {
        const q = this.soalan[this.i];
        Object.assign(this, { kunci: false, cubaan: 0, petunjuk: false });
        $('#cr-no').textContent = `${this.i + 1}/${this.N}`;
        $('#cr-huruf').textContent = q.tampil;
        $('#cr-mesej').textContent = q.mk === 'khaisyum' ? 'Huruf ini bertasydid (berdengung). Di mana bunyinya keluar?' : 'Tekan bahagian yang betul pada kepala atau model.';
        $('#cr-mesej').className = 'akt-mesej';
        $('#cr-petunjuk').hidden = false; $('#cr-petunjuk').disabled = false; $('#cr-seterus').hidden = true;
        $('#cr-info').hidden = true;
        $$('#cr-titik i').forEach((t, j) => t.classList.toggle('kini', j === this.i));
        $$('#view-cari .zon, #view-cari .cr-mk, #view-cari .legenda li').forEach(x => x.classList.remove('betul', 'salah-pernah', 'tunjuk'));
        $$('#view-cari .kp-bahagian').forEach(x => x.classList.remove('nyala'));
        $('.legenda', $('#view-cari')).classList.toggle('boleh', this.mod === '2d');
        this.hantar({ type: 'cari', huruf: q.h, id: q.mk });
        sebut(q.h);
    },
    beriPetunjuk() {
        if (this.kunci || this.petunjuk) return;
        bunyi('klik'); this.petunjuk = true;
        const q = this.soalan[this.i];
        const t = q.mk === 'khaisyum' ? 'Rasa getaran di hidung semasa bunyi dengung.' : TEMPAT_PENDEK[kunciT(tempatHuruf(q.h, q.mk))] || M(q.mk).terjemah;
        $('#cr-mesej').innerHTML = `${ik('bulb')} Petunjuk: <b>${t}</b> (mata soalan ini dikurangkan)`;
        $('#cr-petunjuk').disabled = true;
    },
    nyala(id, kelas) {
        const z = $(`#view-cari .zon[data-id="${id}"]`), k = $(`#view-cari .cr-mk[data-id="${id}"]`), l = $(`#view-cari .legenda li[data-id="${id}"]`);
        [z, k, l].forEach(x => x && x.classList.add(kelas));
        if (kelas === 'betul' || kelas === 'tunjuk') $$(`#view-cari .kp-bahagian[data-mk="${id}"]`).forEach(p => p.classList.add('nyala'));
        return z;
    },
    semak(id) {
        if (this.kunci) return;
        const q = this.soalan[this.i];
        if (typeof Skor !== 'undefined') Skor.jawapan(q.mk, id === q.mk);
        this.cubaan++;
        if (id === q.mk) {
            const dapat = Math.max(0, (this.cubaan === 1 ? 3 : this.cubaan === 2 ? 2 : 1) - (this.petunjuk ? 1 : 0));
            this.mata += dapat; bunyi('betul'); confetti(8);
            this.nyala(id, 'betul');
            this.selesaiSoalan(true, dapat);
        } else {
            this.salah++; bunyi('salah');
            const z = this.nyala(id, 'salah-pernah');
            [z, $(`#view-cari .cr-mk[data-id="${id}"]`)].forEach(x => { if (x) { x.classList.add('goyang'); setTimeout(() => x.classList.remove('goyang'), 450); } });
            $('#cr-salah').textContent = this.salah;
            if (this.cubaan >= 3) { this.nyala(q.mk, 'tunjuk'); this.hantar({ type: 'makhraj', id: q.mk }); this.selesaiSoalan(false, 0); return; }
            $('#cr-mesej').innerHTML = `Belum tepat, <b>${M(id).nama}</b> bukan jawapannya. ${this.cubaan === 2 ? 'Satu cubaan lagi!' : 'Cuba lagi.'}`;
            $('#cr-mesej').className = 'akt-mesej salah';
        }
    },
    selesaiSoalan(betul, dapat) {
        this.kunci = true;
        const q = this.soalan[this.i], m = M(q.mk), t = tempatHuruf(q.h, q.mk);
        $('#cr-mata').textContent = this.mata;
        const titik = $(`#cr-titik i[data-j="${this.i}"]`); if (titik) titik.classList.add(betul ? (dapat >= 3 ? 'ok' : 'separa') : 'gagal');
        $('#cr-mesej').innerHTML = betul ? `${rawak(['Hebat!', 'Betul!', 'Pandai!', 'Mantap!'])} <b>+${dapat}</b> mata`
            : `Jawapannya <b>${m.nama}</b>. Tidak mengapa, cuba ingat untuk soalan seterusnya.`;
        $('#cr-mesej').className = 'akt-mesej ' + (betul ? 'betul' : 'salah');
        const info = $('#cr-info');
        info.style.setProperty('--w', m.warna);
        info.innerHTML = `<header><span class="arab">${q.tampil}</span><div><b>${NAMA_HURUF[q.h]}${q.mk === 'khaisyum' ? ' bertasydid' : ''}</b><small>${m.nama} · ${m.terjemah}</small></div></header>
          <p>${t.info}</p>${ISTILAH[kunciT(t)] ? `<p class="cr-istilah">${ISTILAH[kunciT(t)]}</p>` : ''}
          <button class="btn-kecil" data-belajar="${q.mk}">${ik('book')} Belajar ${m.nama}</button>`;
        info.hidden = false;
        $('#cr-petunjuk').hidden = true;
        const btn = $('#cr-seterus'); btn.hidden = false;
        btn.innerHTML = this.i + 1 >= this.N ? `Lihat keputusan ${ik('trophy')}` : `Seterusnya ${ik('arrow-right')}`;
        if (this.u === 'ready') this.hantar({ type: 'makhraj', id: q.mk });
    },
    seterusnya() { this.i++; if (this.i >= this.N) this.tamat(); else this.tunjuk(); },
    tamat() {
        const maks = this.N * 3, pct = Math.round(this.mata / maks * 100);
        const bintang = pct >= 85 ? 3 : pct >= 60 ? 2 : 1;
        const terbaik = rekod('cari', this.mata, false);
        const nota = typeof Skor !== 'undefined' ? Skor.selesai('cari', pct) : '';
        bunyi('menang'); confetti(30);
        bukaModal(`<div class="besar-ikon">${ik('target')}</div><h2>Selesai!</h2><div class="bintang-besar">${bintangSvg(bintang)}</div>
          <p><b>${this.mata}</b> / ${maks} mata, ${this.salah} kesilapan. Terbaik: ${terbaik} mata.</p>${nota}
          <div class="modal-butang"><button class="btn-utama" data-act="ulang">Main semula</button><button class="btn-kaca" data-act="hub">Ke Aktiviti</button></div>`,
            { ulang: () => this.mula(), hub: () => papar('aktiviti') });
    }
};
// Mesej daripada model Unity (dalam halaman Model 3D atau dalam aktiviti Cari)
window.addEventListener('message', e => {
    const d = e.data; if (!d || d.src !== 'vmakhraj-unity') return;
    if (Cari.frame && e.source === Cari.frame.contentWindow) { Cari.dariUnity(d); return; }
    if (M3D.frame && e.source === M3D.frame.contentWindow && d.type === 'jawapan' && Cari.siap && document.body.dataset.tab === 'cari') Cari.semak(d.id);
});

// ================= PENGURUS PAPARAN =================
const Aktiviti = {
    modul: { perbandingan: Perbandingan, padanan: Padanan, susun: Susun, seret: Seret, cari: Cari },
    papar(view) {
        if (typeof Skor !== 'undefined') {
            if (KUMPULAN_AKT.includes(view) && Skor.mod === null) Skor.tanya();
            if (view === 'skor') Skor.render();
            Skor.kemasBar();
        }
        Object.entries(this.modul).forEach(([k, m]) => { if (k !== view) m.henti(); });
        if (this.modul[view]) this.modul[view].masuk();
    }
};

document.addEventListener('DOMContentLoaded', () => { bina_takrif(); bina_keliru(); bina_sifat(); bina_subnav(); });
