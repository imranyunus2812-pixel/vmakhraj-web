// ===== PAPAN SKOR (disimpan pada peranti ini sahaja: localStorage) =====
// Bergantung pada data.js, app.js dan aktiviti.js ($, $$, ik, M, DUNIA, bukaModal, tutupModal, papar, bunyi, urutMk)

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SKOR_KEY = 'makhraj_skor_v1';   // semua pemain dan mata mereka (kekal)
const SESI_KEY = 'makhraj_sesi_v1';   // pemain semasa (hilang apabila tab ditutup)
const AKT_SKOR = [
    { id: 'kuiz', nama: 'Kuiz' }, { id: 'padanan', nama: 'Padanan' }, { id: 'susun', nama: 'Susun' },
    { id: 'seret', nama: 'Seret' }, { id: 'cari', nama: 'Cari' }
];
const KUMPULAN_AKT = ['aktiviti', 'game', 'padanan', 'susun', 'seret', 'cari'];
const MAKS_JUMLAH = AKT_SKOR.length * 100;

const Skor = {
    data: { pemain: {} }, mod: null, id: null,

    // ----- simpanan -----
    muat() {
        try { const d = JSON.parse(localStorage.getItem(SKOR_KEY) || 'null'); if (d && d.pemain) this.data = d; } catch (e) { }
        try {
            const s = JSON.parse(sessionStorage.getItem(SESI_KEY) || 'null');
            if (s && s.mod === 'sahaja') this.mod = 'sahaja';
            else if (s && s.mod === 'skor' && this.data.pemain[s.id]) { this.mod = 'skor'; this.id = s.id; }
        } catch (e) { }
    },
    simpan() { try { localStorage.setItem(SKOR_KEY, JSON.stringify(this.data)); } catch (e) { } },
    simpanSesi() { try { sessionStorage.setItem(SESI_KEY, JSON.stringify({ mod: this.mod, id: this.id })); } catch (e) { } },
    pemain() { return this.mod === 'skor' && this.id ? this.data.pemain[this.id] || null : null; },

    // ----- mata -----
    mata(p) {
        const bintang = Object.values(p.kuiz || {}).reduce((a, b) => a + b, 0);
        const m = { bintang, kuiz: Math.round(bintang / (DUNIA.length * 3) * 100), padanan: p.padanan || 0, susun: p.susun || 0, seret: p.seret || 0, cari: p.cari || 0 };
        m.jumlah = AKT_SKOR.reduce((a, x) => a + m[x.id], 0);
        m.dimain = AKT_SKOR.filter(x => m[x.id] > 0).length;
        return m;
    },
    nota(html, kelas = '') { return `<p class="skor-nota ${kelas}">${html}</p>`; },
    // Dipanggil apabila aktiviti tamat. Pulangkan HTML kecil untuk ditunjuk dalam tetingkap keputusan.
    selesai(akt, mata) {
        mata = Math.max(0, Math.min(100, Math.round(mata)));
        const p = this.pemain();
        if (!p) return this.nota('Mod main sahaja: skor tidak disimpan.', 'sahaja');
        const lama = p[akt] || 0, baru = mata > lama;
        if (baru) p[akt] = mata;
        p.dikemas = Date.now(); this.simpan();
        return this.nota(`<b>${mata}</b> / 100 mata${baru && lama > 0 ? ' · rekod baharu!' : ''} · terbaik kamu <b>${p[akt]}</b>`);
    },
    selesaiKuiz(dunia, bintang) {
        const p = this.pemain();
        if (!p) return this.nota('Mod main sahaja: skor tidak disimpan.', 'sahaja');
        p.kuiz = p.kuiz || {}; p.kuiz[dunia] = Math.max(p.kuiz[dunia] || 0, bintang);
        p.dikemas = Date.now(); this.simpan();
        const m = this.mata(p);
        return this.nota(`Mata Kuiz: <b>${m.kuiz}</b> / 100 (${m.bintang} / ${DUNIA.length * 3} bintang)`);
    },
    // Rekod jawapan betul atau salah bagi setiap makhraj (untuk "Prestasi saya")
    jawapan(mk, betul) {
        const p = this.pemain(); if (!p || !mk) return;
        p.prestasi = p.prestasi || {};
        const r = p.prestasi[mk] = p.prestasi[mk] || { b: 0, j: 0 };
        r.j++; if (betul) r.b++;
        this.simpan();
    },

    // ----- tetingkap pilih pemain -----
    tanya() {
        const lama = Object.entries(this.data.pemain).sort((a, b) => (b[1].dikemas || 0) - (a[1].dikemas || 0)).slice(0, 6);
        const isi = $('#modal-isi');
        isi.innerHTML = `
          <div class="besar-ikon">${ik('user')}</div>
          <h2>Siapa yang bermain?</h2>
          <p>Masukkan nama panggilan untuk menyimpan skor di Papan Skor. Skor disimpan pada peranti ini sahaja.</p>
          <input id="sk-nama" class="sk-input" maxlength="16" placeholder="Nama panggilan" autocomplete="off" aria-label="Nama panggilan">
          <p class="sk-ralat" id="sk-ralat" role="alert"></p>
          ${lama.length ? `<p class="sk-lama-tajuk">Pemain sebelum ini</p><div class="sk-lama">${lama.map(([id, p]) => `<button class="kl-chip" data-lama="${esc(id)}">${esc(p.nama)}</button>`).join('')}</div>` : ''}
          <div class="modal-butang">
            <button class="btn-utama" id="sk-mula">Mula dan simpan skor</button>
            <button class="btn-kaca" id="sk-sahaja">Main sahaja (tanpa skor)</button>
            <button class="btn-teks" id="sk-balik">Kembali</button>
          </div>`;
        $('#modal').hidden = false;
        const input = $('#sk-nama'); setTimeout(() => input && input.focus(), 60);
        input.onkeydown = e => { if (e.key === 'Enter') this.daftar(input.value); };
        isi.onclick = e => {
            const l = e.target.closest('[data-lama]'); if (l) { bunyi('klik'); this.pilih(l.dataset.lama); return; }
            if (e.target.closest('#sk-mula')) { this.daftar(input.value); return; }
            if (e.target.closest('#sk-sahaja')) { bunyi('klik'); this.sahaja(); return; }
            if (e.target.closest('#sk-balik')) { this.tutup(); papar('home'); }
        };
    },
    tutup() { const isi = $('#modal-isi'); isi.onclick = null; tutupModal(); },
    daftar(mentah) {
        const nama = String(mentah || '').replace(/\s+/g, ' ').trim().slice(0, 16);
        if (!nama) { const r = $('#sk-ralat'); if (r) r.textContent = 'Sila masukkan nama panggilan.'; return; }
        const id = nama.toLowerCase();
        if (!this.data.pemain[id]) { this.data.pemain[id] = { nama, kuiz: {}, prestasi: {}, dikemas: Date.now() }; this.simpan(); }
        bunyi('klik'); this.pilih(id);
    },
    pilih(id) {
        if (!this.data.pemain[id]) return;
        this.mod = 'skor'; this.id = id; this.simpanSesi(); this.tutup(); this.selepasUbah();
    },
    sahaja() { this.mod = 'sahaja'; this.id = null; this.simpanSesi(); this.tutup(); this.selepasUbah(); },
    selepasUbah() {
        this.kemasBar();
        const v = document.body.dataset.tab; if (v === 'skor') this.render();
    },

    // ----- penunjuk pemain (chip) -----
    chipDalam() {
        const p = this.pemain();
        return p ? `${ik('user')} <b>${esc(p.nama)}</b> <small>Tukar</small>`
            : this.mod === 'sahaja' ? `${ik('user')} Main sahaja <small>Daftar skor</small>` : `${ik('user')} Pilih pemain`;
    },
    chipHtml() { return `<button class="pemain-chip" data-skor-tukar>${this.chipDalam()}</button>`; },
    kemasBar() {
        $$('[data-pemain-bar]').forEach(el => { el.innerHTML = this.chipHtml(); });
        $$('.akt-kepala .pemain-chip').forEach(el => { el.innerHTML = this.chipDalam(); });
    },

    // ----- padam -----
    padamSaya() {
        const p = this.pemain(); if (!p) return;
        bukaModal(`<div class="besar-ikon">${ik('trash')}</div><h2>Padam skor ${esc(p.nama)}?</h2>
          <p>Semua mata dan prestasi untuk nama ini akan dipadam daripada peranti ini. Tindakan ini tidak boleh dibatalkan.</p>
          <div class="modal-butang"><button class="btn-utama sk-bahaya" data-act="padam">Ya, padam</button><button class="btn-kaca" data-act="batal">Batal</button></div>`,
            { padam: () => { delete this.data.pemain[this.id]; this.simpan(); this.mod = null; this.id = null; this.simpanSesi(); this.kemasBar(); this.render(); } });
    },
    padamSemua() {
        bukaModal(`<div class="besar-ikon">${ik('trash')}</div><h2>Padam semua skor?</h2>
          <p>Semua pemain dan mata pada peranti ini akan dipadam. Gunakan ini hanya jika kamu pemilik komputer ini.</p>
          <div class="modal-butang"><button class="btn-utama sk-bahaya" data-act="padam">Ya, padam semua</button><button class="btn-kaca" data-act="batal">Batal</button></div>`,
            { padam: () => { this.data = { pemain: {} }; this.simpan(); this.mod = null; this.id = null; this.simpanSesi(); this.kemasBar(); this.render(); } });
    },

    // ----- halaman Papan Skor -----
    render() {
        const root = $('#view-skor'); if (!root) return;
        const aktif = this.pemain() ? this.id : null;
        const senarai = Object.entries(this.data.pemain).map(([id, p]) => ({ id, p, m: this.mata(p) })).filter(x => x.m.jumlah > 0)
            .sort((a, b) => b.m.jumlah - a.m.jumlah || b.m.dimain - a.m.dimain || (a.p.dikemas || 0) - (b.p.dikemas || 0) || a.p.nama.localeCompare(b.p.nama));
        const baris = senarai.map((x, i) => {
            const r = i + 1, saya = x.id === aktif, kelas = r === 1 ? 'emas' : r === 2 ? 'perak' : r === 3 ? 'gangsa' : 'biasa';
            return `<li class="sk-baris ${r <= 3 ? 'top' : ''} ${saya ? 'saya' : ''}">
              <span class="sk-rank ${kelas}">${r}</span>
              <div class="sk-info"><div class="sk-nama"><b>${esc(x.p.nama)}</b>${saya ? '<span class="sk-tag">Kamu</span>' : ''}</div>
                <div class="sk-pecah">${AKT_SKOR.map(a => `<span class="${x.m[a.id] ? '' : 'kosong'}"><small>${a.nama}</small>${x.m[a.id]}</span>`).join('')}</div></div>
              <div class="sk-jumlah"><b>${x.m.jumlah}</b><small>/ ${MAKS_JUMLAH}</small></div>
              ${saya ? `<button class="ikon-btn sk-padam" data-skor-padam aria-label="Padam skor saya" title="Padam skor saya">${ik('trash')}</button>` : ''}
            </li>`;
        }).join('');
        root.innerHTML = `
          <h2 class="tajuk">Papan Skor</h2>
          <p class="sub">Mata dikumpul daripada lima aktiviti (maksimum ${MAKS_JUMLAH}). Disimpan pada peranti ini sahaja.</p>
          <div class="pemain-bar" data-pemain-bar></div>
          <div class="sk-grid">
            <div class="sk-kiri">
              ${senarai.length ? `<ol class="sk-senarai">${baris}</ol>` : `<div class="c sk-kosong"><p>Belum ada skor. Cuba satu aktiviti dan nama kamu akan muncul di sini.</p><button class="btn-utama" data-view="aktiviti">Pergi ke Aktiviti</button></div>`}
              <details class="sk-cara"><summary>Bagaimana mata dikira?</summary>
                <ul><li><b>Kuiz:</b> semua bintang dunia (15 bintang = 100 mata).</li>
                <li><b>Padanan Kad:</b> semakin sedikit gerakan, semakin tinggi. Tahap lebih sukar memberi lebih banyak mata.</li>
                <li><b>Susun Huruf:</b> 5 mata bagi setiap huruf yang betul (maksimum 100).</li>
                <li><b>Seret Huruf:</b> semakin sedikit kesilapan, semakin tinggi.</li>
                <li><b>Cari di Model 3D:</b> 3 mata jika betul pada cubaan pertama, 2 pada cubaan kedua, 1 pada cubaan ketiga (petunjuk tolak 1).</li></ul></details>
              ${senarai.length ? `<button class="btn-teks" data-skor-semua>Padam semua skor </button>` : ''}
            </div>
            <aside class="sk-kanan">${this.prestasiHtml()}</aside>
          </div>`;
        this.kemasBar();
        root.onclick = e => {
            if (e.target.closest('[data-skor-padam]')) { bunyi('klik'); this.padamSaya(); return; }
            if (e.target.closest('[data-skor-semua]')) { bunyi('klik'); this.padamSemua(); return; }
            if (e.target.closest('[data-skor-masuk]')) { bunyi('klik'); this.tanya(); return; }
            const b = e.target.closest('[data-belajar-mk]'); if (b) { bunyi('klik'); papar('belajar'); bukaDetail(b.dataset.belajarMk); }
        };
    },
    prestasiHtml() {
        const p = this.pemain();
        if (!p) return `<div class="c sk-prestasi"><h3>Prestasi saya</h3>
          <p>${this.mod === 'sahaja' ? 'Kamu dalam mod main sahaja, jadi prestasi tidak direkod.' : 'Masukkan nama untuk melihat prestasi kamu bagi setiap makhraj.'}</p>
          <button class="btn-utama" data-skor-masuk>Masukkan nama</button></div>`;
        const m = this.mata(p);
        const bar = urutMk.map(id => {
            const r = (p.prestasi || {})[id], mk = M(id), ada = r && r.j >= 3, pct = ada ? Math.round(r.b / r.j * 100) : 0;
            return { id, mk, ada, pct, j: r ? r.j : 0, html: `<div class="sk-bar" style="--w:${mk.warna}"><span class="sk-bar-nama"><span class="arab">${mk.arab}</span>${mk.nama}</span>
              <div class="sk-trek"><i style="width:${pct}%"></i></div><span class="sk-bar-nilai">${ada ? pct + '%' : 'data kurang'}</span></div>` };
        });
        const lemah = bar.filter(x => x.ada && x.pct < 80).sort((a, b) => a.pct - b.pct)[0];
        return `<div class="c sk-prestasi"><h3>Prestasi saya</h3>
          <p class="sk-pemain-nama">${ik('user')} <b>${esc(p.nama)}</b> · ${m.jumlah} / ${MAKS_JUMLAH} mata</p>
          <h4>Ketepatan mengikut makhraj</h4>${bar.map(x => x.html).join('')}
          <p class="sk-kecil">Dikira daripada jawapan dalam semua aktiviti. Perlu sekurang-kurangnya 3 jawapan.</p>
          ${lemah ? `<div class="sk-saran">${ik('bulb')}<p>Perlu diulang kaji: <b>${lemah.mk.nama}</b> (${lemah.pct}%). <button class="btn-kecil" data-belajar-mk="${lemah.id}">Belajar ${lemah.mk.nama}</button></p></div>` : ''}
          <h4>Mata terbaik setiap aktiviti</h4>
          ${AKT_SKOR.map(a => `<div class="sk-bar mini"><span class="sk-bar-nama">${a.nama}</span><div class="sk-trek"><i style="width:${m[a.id]}%"></i></div><span class="sk-bar-nilai">${m[a.id]}</span></div>`).join('')}
          <div class="sk-tindakan"><button class="btn-kaca kecil" data-skor-masuk>${ik('user')} Tukar pemain</button><button class="btn-kaca kecil" data-skor-padam>${ik('trash')} Padam skor saya</button></div></div>`;
    }
};
Skor.muat();
document.addEventListener('click', e => { if (e.target.closest('[data-skor-tukar]')) { bunyi('klik'); Skor.tanya(); } });