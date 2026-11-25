# V-Makhraj: Web App Belajar Makhraj Huruf

Web app mesra kanak-kanak dengan 4 bahagian: Utama, Belajar, Model 3D (Unity WebGL) dan Kuiz.

## Struktur folder

```
vmakhraj-web/
├── index.html
├── style.css
├── data.js          <- data makhraj & huruf (boleh edit)
├── app.js
├── vercel.json      <- hanya perlu jika Unity guna Brotli
└── unity/           <- BUILD UNITY KAMU DILETAK DI SINI
    ├── index.html
    ├── Build/
    └── TemplateData/
```

## Langkah 1: Export model dari Unity

1. Unity: File > Build Settings > pilih **WebGL** > Switch Platform.
2. Player Settings > Publishing Settings > **Compression Format: Disabled** (paling mudah). Jika guna Brotli/Gzip, tandakan juga **Decompression Fallback**, atau guna `vercel.json` yang disertakan (Brotli sahaja).
3. Tekan **Build**, pilih folder `unity` di dalam folder web app ini.
4. Pastikan `unity/index.html` wujud.

Tip: dalam `unity/index.html` yang dijana Unity, tetapkan `canvas` mengikut saiz penuh (width/height 100%) supaya muat dalam bingkai.

## Langkah 2 (pilihan): Kawal model 3D dari butang web

Butang "Tengok dalam 3D" dan butang makhraj menghantar mesej `{type:'makhraj', id:'halq'}` ke Unity. `id` ialah: `jauf`, `halq`, `lisan`, `syafatain`, `khaisyum`.

**a) Dalam `unity/index.html`** (selepas `createUnityInstance(...).then(...)` berjaya), tambah:

```js
createUnityInstance(canvas, config, onProgress).then((unityInstance) => {
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'makhraj') {
      unityInstance.SendMessage('GameManager', 'TunjukMakhraj', e.data.id);
    }
  });
});
```

**b) Dalam Unity**, buat GameObject bernama `GameManager` dengan skrip:

```csharp
using UnityEngine;

public class GameManager : MonoBehaviour
{
    // Dipanggil dari web: id = jauf / halq / lisan / syafatain / khaisyum
    public void TunjukMakhraj(string id)
    {
        switch (id)
        {
            case "jauf":      /* highlight / kamera ke rongga mulut */ break;
            case "halq":      /* highlight tekak */ break;
            case "lisan":     /* highlight lidah */ break;
            case "syafatain": /* highlight bibir */ break;
            case "khaisyum":  /* highlight hidung */ break;
        }
    }
}
```

Jika kamu tak mahu kawalan ini, abaikan langkah 2; model 3D tetap dipaparkan dan boleh diputar.

## Langkah 3: Cuba di komputer

Jangan buka `index.html` terus (fail WebGL perlu pelayan). Dalam folder projek, jalankan:

```
python -m http.server 8000
```
atau `npx serve`, kemudian buka http://localhost:8000

## Langkah 4: Hos di Vercel

1. `npm i -g vercel` kemudian jalankan `vercel` dalam folder ini, atau
2. Muat naik folder ke GitHub, kemudian import di vercel.com (Framework: Other, tiada build command).

## Mengedit kandungan

- **Makhraj, huruf, penerangan**: `data.js`
- **Jumlah soalan kuiz**: `JUMLAH_SOALAN` dalam `app.js`
- **Warna & gaya**: `style.css`

## Nota

- Sebutan huruf guna Web Speech API pelayar (suara Arab). Jika peranti tiada suara Arab, tiada bunyi keluar. Kamu boleh ganti dengan rakaman audio sendiri dalam fungsi `sebut()`.
- Skor terbaik disimpan dalam `localStorage` pelayar.
- Sila semak kandungan makhraj dengan guru/ustaz sebelum diterbitkan kepada kanak-kanak.
## Video perbandingan huruf keliru

Di bahagian **Belajar > Huruf keliru**, butang **Lihat perbandingan** membuka halaman video bagi kumpulan huruf itu.

- Letak video dalam `assets/video/` dengan nama `keliru-1.mp4` hingga `keliru-7.mp4` (ikut susunan kumpulan dalam `data2.js`: ث·س·ص, ح·ه, ع·ء, ذ·ظ·ز, ت·ط, ق·ك, ض·ظ).
- Atau tukar medan `video` dalam `KELIRU` (fail `data2.js`) kepada pautan YouTube.
- Jika video belum ada, halaman memaparkan ruang kosong sebagai peringatan.

## Aktiviti "Cari di Model 3D"

Aktiviti ini ada dua mod:

- **Kepala 2D**: tekan kawasan bernombor pada lakaran kepala (atau senarai makhraj di sebelah).
- **Model 3D**: model Unity dimuatkan terus dalam aktiviti. Pemain boleh jawab dengan butang makhraj di bawah model. Jika folder `unity/` belum ada, aktiviti memberitahu dan pemain masih boleh bermain.

Setiap pusingan ada 8 soalan dan 3 cubaan setiap soalan. Mata: 3 (cubaan pertama), 2 (kedua), 1 (ketiga); petunjuk menolak 1 mata.

### (Pilihan) Jawab dengan menekan bahagian pada model Unity

Web menghantar mesej ke Unity:

- `{ type: 'cari', huruf: 'ب', id: 'syafatain' }` setiap kali soalan baharu muncul
- `{ type: 'makhraj', id: 'syafatain' }` selepas soalan dijawab (untuk menyerlahkan jawapan)

**a) Dalam `unity/index.html`**, selepas `createUnityInstance(...)` berjaya:

```js
createUnityInstance(canvas, config, (p) => {
  parent.postMessage({ src: 'vmakhraj-unity', type: 'progress', value: p }, '*');
}).then((unityInstance) => {
  parent.postMessage({ src: 'vmakhraj-unity', type: 'ready' }, '*');
  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === 'makhraj') unityInstance.SendMessage('GameManager', 'TunjukMakhraj', d.id);
    if (d.type === 'cari')    unityInstance.SendMessage('GameManager', 'MulaCari', d.huruf);
  });
}).catch((err) => parent.postMessage({ src: 'vmakhraj-unity', type: 'error', message: String(err) }, '*'));
```

**b) Dalam Unity**, buat fail `Assets/Plugins/WebGL/HantarWeb.jslib`:

```js
mergeInto(LibraryManager.library, {
  HantarJawapan: function (idPtr) {
    var id = UTF8ToString(idPtr);
    window.parent.postMessage({ src: 'vmakhraj-unity', type: 'jawapan', id: id }, '*');
  }
});
```

**c)** Tambah dalam skrip `GameManager`, dan panggil `PilihBahagian("halq")` (dan sebagainya) apabila pemain menekan bahagian pada model:

```csharp
using System.Runtime.InteropServices;

[DllImport("__Internal")] private static extern void HantarJawapan(string id);

public void MulaCari(string huruf) { /* pilihan: reset sorotan, papar huruf */ }

public void PilihBahagian(string id)   // id: jauf / halq / lisan / syafatain / khaisyum
{
#if UNITY_WEBGL && !UNITY_EDITOR
    HantarJawapan(id);
#endif
}
```