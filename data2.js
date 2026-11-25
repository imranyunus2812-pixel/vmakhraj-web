// ===== DATA TAMBAHAN: takrif, sifat, huruf keliru, ayat, audio, kepala =====
// Teks diolah semula (parafrasa) daripada "Makhraj dan Sifat-sifat Huruf" (Mohd Nazri Ahmad, AnyFlip).
// PERLU disemak oleh ustaz sebelum digunakan secara rasmi.

// Nama fail audio bagi setiap huruf: letak fail dalam assets/audio/ (cth. assets/audio/ba.mp3)
// Jika fail tiada, laman guna suara pelayar sebagai ganti.
const FAIL_AUDIO = {
    'ا': 'alif', 'ء': 'hamzah', 'ب': 'ba', 'ت': 'ta', 'ث': 'tha', 'ج': 'jim',
    'ح': 'ha', 'خ': 'kho', 'د': 'dal', 'ذ': 'zal', 'ر': 'ra', 'ز': 'zai',
    'س': 'sin', 'ش': 'syin', 'ص': 'sad', 'ض': 'dhad', 'ط': 'to', 'ظ': 'zho',
    'ع': 'ain', 'غ': 'ghain', 'ف': 'fa', 'ق': 'qaf', 'ك': 'kaf', 'ل': 'lam',
    'م': 'mim', 'ن': 'nun', 'ه': 'ha2', 'و': 'wau', 'ي': 'ya'
};

// ----- Takrif makhraj -----
const TAKRIF = {
    kad: [
        { t: 'Maksud makhraj', p: 'Makhraj ialah tempat bunyi sesuatu huruf hijaiyah keluar. Setiap huruf mempunyai tempat keluarnya sendiri, dan tempat itulah yang membezakannya daripada huruf yang lain.' },
        { t: 'Makhraj muhaqqaq', p: 'Tempat keluar yang boleh dikenal pasti dengan tepat. Huruf-huruf yang bunyinya keluar dari tekak, lidah dan bibir termasuk dalam jenis ini.' },
        { t: 'Makhraj muqaddar', p: 'Tempat keluar yang tidak dapat dipastikan dengan tepat, hanya dianggarkan. Contohnya tiga bunyi mad: alif selepas baris fathah, ya sukun selepas kasrah dan wau sukun selepas dammah.' }
    ],
    amKhas: 'Makhraj am ialah kawasan besar tempat huruf keluar, dan jumlahnya lima. Di dalam setiap kawasan itu ada tempat yang lebih tepat, dipanggil makhraj khas, dan jumlahnya 17.',
    jumlah: 'Jumlah keseluruhan ialah 30 bunyi huruf: 28 huruf hijaiyah bersama bunyi mad dan bunyi ghunnah.'
};

// ----- Sifat huruf -----
const SIFAT_INTRO = {
    maksud: 'Sifat huruf ialah ciri khas pada sesuatu huruf. Dalam ilmu tajwid, ia menerangkan bagaimana nafas atau suara ditekan atau dilepaskan apabila huruf disebut: kuat atau lemah, nyaring atau senyap, tinggi atau rendah.',
    lazimah: 'Ciri asal yang sentiasa ada pada huruf tersebut.',
    aridhah: 'Ciri yang datang kemudian dan boleh berubah mengikut keadaan.',
    jumlah: 'Ada 20 sifat huruf: 11 sifat yang berlawanan (berpasangan) dan 9 sifat tunggal.'
};

const SIFAT_PASANGAN = [
    {
        id: 'jahr', tajuk: 'Jahr dan Hams', ringkas: 'Nafas tertahan atau terlepas ketika huruf disebut.',
        item: [
            { nama: 'Jahr', makna: 'Nyata, terang', teks: 'Nafas tertahan semasa huruf disebut kerana tekanan yang kuat pada makhrajnya.', warna: '#0E9BB5', huruf: null },
            { nama: 'Hams', makna: 'Senyap, tersembunyi', teks: 'Nafas terlepas semasa huruf disebut kerana huruf itu lemah dan tidak kuat berpegang pada makhrajnya.', warna: '#DB2777', huruf: 'فحثهشخصسكت' }
        ],
        ingat: 'فَحَثَّهُ شَخْصٌ سَكَتَ', nota: 'Ayat ini mengumpulkan 10 huruf hams. Huruf selain itu ialah jahr.'
    },
    {
        id: 'syiddah', tajuk: 'Syiddah, Tawassut dan Rakhawah', ringkas: 'Suara tertahan, sederhana atau mengalir ketika huruf disebut.',
        item: [
            { nama: 'Syiddah', makna: 'Kuat', teks: 'Suara tertahan semasa huruf disebut kerana tekanan yang kuat pada makhrajnya.', warna: '#E11D48', huruf: 'ءجدقطبكت' },
            { nama: 'Tawassut', makna: 'Sederhana', teks: 'Suara berada di antara syiddah dan rakhawah: tidak terlalu tertahan dan tidak terlalu terlepas.', warna: '#D98E04', huruf: 'لنعمر' },
            { nama: 'Rakhawah', makna: 'Lembut', teks: 'Suara terlepas semasa huruf disebut kerana tekanan yang lemah pada makhrajnya.', warna: '#10A672', huruf: null }
        ],
        ingat: 'أَجِدُ قَطٍ بَكَتْ  ·  لِنْ عُمَرْ', nota: 'Ayat pertama untuk 8 huruf syiddah, ayat kedua untuk 5 huruf tawassut. Selebihnya ialah rakhawah.'
    },
    {
        id: 'istila', tajuk: "Isti'la' dan Istifal", ringkas: 'Pangkal lidah terangkat (tebal) atau direndahkan (nipis).',
        item: [
            { nama: "Isti'la'", makna: 'Tinggi, terangkat', teks: 'Sebahagian besar pangkal lidah terangkat ke lelangit semasa huruf disebut, jadi bunyinya tebal.', warna: '#7C5CE0', huruf: 'خصضغطقظ' },
            { nama: 'Istifal', makna: 'Rendah, menurun', teks: 'Lidah direndahkan dan mendatar. Huruf disebut nipis, sama ada berbaris atau sukun.', warna: '#0E9BB5', huruf: null }
        ],
        ingat: 'خُصَّ ضَغْطٍ قِظْ', nota: "Ayat ini mengumpulkan 7 huruf isti'la'. Huruf selain itu ialah istifal."
    },
    {
        id: 'itbaq', tajuk: 'Itbaq dan Infitah', ringkas: 'Lidah melekap pada lelangit atau dijarakkan daripadanya.',
        item: [
            { nama: 'Itbaq', makna: 'Menghimpit, melekap', teks: "Tepi lidah melekap ke lelangit sehingga suara terhimpit di antara keduanya. Bacaannya lebih kuat daripada isti'la'.", warna: '#DB2777', huruf: 'صضطظ' },
            { nama: 'Infitah', makna: 'Renggang, terbuka', teks: 'Lidah berjauhan daripada lelangit, jadi suara keluar dengan lapang. Bunyinya ringan dan nipis.', warna: '#D98E04', huruf: null }
        ],
        ingat: null, nota: 'Hanya 4 huruf itbaq. Semua huruf lain ialah infitah.'
    },
    {
        id: 'izlaq', tajuk: 'Izlaq dan Ismat', ringkas: 'Huruf yang mudah dan lancar disebut, atau yang kurang lancar.',
        item: [
            { nama: 'Izlaq', makna: 'Lancar, tergelincir', teks: 'Huruf ringan dan disebut dengan senang serta lancar kerana suaranya keluar dari hujung lidah atau bibir.', warna: '#10A672', huruf: 'فرمنلب' },
            { nama: 'Ismat', makna: 'Tertegah', teks: 'Huruf tertegah daripada keluar dengan segera. Sebutannya kurang lancar kerana makhrajnya jauh daripada hujung lidah atau bibir.', warna: '#7C5CE0', huruf: null }
        ],
        ingat: 'فَرَّ مِنْ لُبِّ', nota: 'Ayat ini mengumpulkan 6 huruf izlaq. Huruf selain itu ialah ismat.'
    }
];

const SIFAT_TUNGGAL = [
    { nama: 'Qalqalah', makna: 'Bergerak, bergetar', teks: 'Bunyi lantunan yang kuat pada makhraj kerana tekanan yang kuat, lalu dilepaskan dalam masa yang singkat. Ada tiga bahagian: sughra (sukun di tengah kalimah), kubra (sukun di hujung kalimah) dan akhbar (waqaf pada huruf bertasydid).', huruf: 'قطبجد' },
    { nama: 'Sofir', makna: 'Bersiul, berdesir', teks: 'Huruf disebut dengan bunyi desiran yang kuat, seakan-akan bunyi siulan.', huruf: 'صسز' },
    { nama: 'Tafasyi', makna: 'Berhamburan', teks: 'Angin tersebar di antara gigi hadapan dan lelangit keras semasa huruf disebut.', huruf: 'ش' },
    { nama: 'Istitolah', makna: 'Memanjang', teks: 'Makhraj huruf memanjang di sepanjang tepi lidah sehingga sampai ke makhraj huruf lam.', huruf: 'ض' },
    { nama: 'Inhiraf', makna: 'Melencong', teks: 'Lidah dilenturkan dan bunyinya melencong ke makhraj huruf yang berdekatan dengannya.', huruf: 'لر' },
    { nama: 'Takrir', makna: 'Getaran, berulang', teks: 'Hujung lidah bergetar semasa huruf disebut. Cukup satu getaran sahaja dan hujung lidah tidak dibiarkan bergetar berlebihan.', huruf: 'ر' },
    { nama: 'Lin', makna: 'Lembut', teks: 'Suara mengalun lembut apabila huruf itu sukun dan huruf sebelumnya berbaris fathah.', huruf: 'وي' },
    { nama: 'Ghunnah', makna: 'Dengung', teks: 'Suara sengau yang keluar dari pangkal hidung, terutama apabila huruf berbaris dan bertasydid.', huruf: 'نم' },
    { nama: "Khafa'", makna: 'Tersembunyi', teks: 'Suara huruf kelihatan tersembunyi semasa disebut. Ia boleh dijelaskan dengan menyebut baris huruf itu sendiri.', huruf: 'ه' }
];

const SIFAT_TAHAP = [
    { nama: 'Sifat kuat', warna: '#E11D48', isi: ['Jahr', 'Syiddah', "Isti'la'", 'Itbaq', 'Qalqalah', 'Sofir', 'Tafasyi', 'Istitolah', 'Inhiraf', 'Takrir', 'Ghunnah'] },
    { nama: 'Sifat lemah', warna: '#0E9BB5', isi: ['Hams', 'Rakhawah', 'Istifal', 'Infitah', 'Lin', "Khafa'"] },
    { nama: 'Sifat pertengahan', warna: '#D98E04', isi: ['Tawassut', 'Izlaq', 'Ismat'] }
];

// ----- Huruf keliru -----
// video: fail sendiri (cth. 'assets/video/keliru-1.mp4') ATAU pautan YouTube (cth. 'https://youtu.be/XXXXXXXXXXX').
// Kosongkan ('') jika belum ada video. Boleh tambah poster: 'assets/video/keliru-1.jpg'.
const KELIRU = [
    {
        tajuk: 'ث · س · ص', video: 'assets/video/keliru-1.mp4',
        beza: 'ث dan س sama-sama nipis, tetapi hujung lidah untuk ث menyentuh gigi atas, manakala س dan ص hujung lidahnya berada di belakang gigi bawah. ص berbeza daripada س kerana pangkal lidah terangkat sehingga bunyinya tebal.',
        item: [
            { h: 'ث', mk: 'lisan', tempat: 'Hujung lidah dikeluarkan sedikit lalu bertemu hujung gigi seri atas.', sifat: ['Hams', 'Rakhawah', 'Istifal', 'Infitah', 'Ismat'] },
            { h: 'س', mk: 'lisan', tempat: 'Lidah didatarkan dan hujung lidah diletakkan di belakang gigi seri bawah.', sifat: ['Hams', 'Rakhawah', 'Istifal', 'Infitah', 'Ismat', 'Sofir'] },
            { h: 'ص', mk: 'lisan', tempat: 'Sama seperti س, tetapi pangkal lidah turut ditekan ke lelangit untuk menghasilkan bunyi tebal.', sifat: ['Hams', 'Rakhawah', "Isti'la'", 'Itbaq', 'Ismat', 'Sofir'] }
        ]
    },
    {
        tajuk: 'ح · ه', video: 'assets/video/keliru-2.mp4',
        beza: 'Kedua-duanya keluar dari tekak dengan nafas yang terlepas. ح keluar dari tengah tekak dan suaranya ditekan di situ, manakala ه keluar dari pangkal tekak yang lebih dalam.',
        item: [
            { h: 'ح', mk: 'halq', tempat: 'Suara ditekan ke tengah tekak, iaitu dinding tekak yang menyempitkan laluan suara.', sifat: ['Hams', 'Rakhawah', 'Istifal', 'Infitah', 'Ismat'] },
            { h: 'ه', mk: 'halq', tempat: 'Suara ditekan ke pangkal tekak, di kawasan pita suara.', sifat: ['Hams', 'Rakhawah', 'Istifal', 'Infitah', 'Ismat', "Khafa'"] }
        ]
    },
    {
        tajuk: 'ع · ء', video: 'assets/video/keliru-3.mp4',
        beza: 'Kedua-duanya keluar dari tekak. ع keluar dari tengah tekak dan suaranya sederhana (tawassut), manakala ء keluar dari pangkal tekak dan suaranya tertahan seketika (syiddah).',
        item: [
            { h: 'ع', mk: 'halq', tempat: 'Suara ditekan ke tengah tekak, tempat dinding tekak menyempitkan laluan suara.', sifat: ['Jahr', 'Tawassut', 'Istifal', 'Infitah', 'Ismat'] },
            { h: 'ء', mk: 'halq', tempat: 'Suara ditekan ke pangkal tekak, di kawasan pita suara.', sifat: ['Jahr', 'Syiddah', 'Istifal', 'Infitah', 'Ismat'] }
        ]
    },
    {
        tajuk: 'ذ · ظ · ز', video: 'assets/video/keliru-4.mp4',
        beza: 'ذ dan ظ keluar apabila hujung lidah bertemu hujung gigi seri atas, dan ظ tebal kerana pangkal lidah terangkat. ز keluar dari hujung lidah di belakang gigi bawah dan mempunyai bunyi desiran (sofir).',
        item: [
            { h: 'ذ', mk: 'lisan', tempat: 'Hujung lidah dikeluarkan sedikit lalu bertemu hujung gigi seri atas.', sifat: ['Jahr', 'Rakhawah', 'Istifal', 'Infitah', 'Ismat'] },
            { h: 'ظ', mk: 'lisan', tempat: 'Sama seperti ذ, tetapi pangkal lidah turut ditekan ke lelangit untuk bunyi tebal.', sifat: ['Jahr', 'Rakhawah', "Isti'la'", 'Itbaq', 'Ismat'] },
            { h: 'ز', mk: 'lisan', tempat: 'Lidah didatarkan dan hujung lidah diletakkan di belakang gigi seri bawah.', sifat: ['Jahr', 'Rakhawah', 'Istifal', 'Infitah', 'Ismat', 'Sofir'] }
        ]
    },
    {
        tajuk: 'ت · ط', video: 'assets/video/keliru-5.mp4',
        beza: 'Kedua-duanya keluar apabila hujung lidah ditekan ke pangkal gigi seri atas. ت nipis, manakala ط tebal kerana lidah turut ditekan ke lelangit. ط juga mempunyai sifat jahr dan qalqalah.',
        item: [
            { h: 'ت', mk: 'lisan', tempat: 'Hujung lidah ditekan ke pangkal gigi seri atas.', sifat: ['Syiddah', 'Hams', 'Istifal', 'Infitah', 'Ismat'] },
            { h: 'ط', mk: 'lisan', tempat: 'Sama seperti ت, tetapi lidah turut ditekan ke lelangit untuk bunyi tebal.', sifat: ['Jahr', 'Syiddah', "Isti'la'", 'Itbaq', 'Ismat', 'Qalqalah'] }
        ]
    },
    {
        tajuk: 'ق · ك', video: 'assets/video/keliru-6.mp4',
        beza: 'Kedua-duanya keluar dari pangkal lidah yang menekan lelangit lembut. ق keluar lebih dalam, hampir dengan anak tekak, dan bunyinya tebal. ك sedikit lebih ke hadapan dan bunyinya nipis.',
        item: [
            { h: 'ق', mk: 'lisan', tempat: 'Pangkal lidah diangkat dan ditekan ke lelangit lembut, hampir dengan anak tekak.', sifat: ['Jahr', 'Syiddah', "Isti'la'", 'Infitah', 'Ismat', 'Qalqalah'] },
            { h: 'ك', mk: 'lisan', tempat: 'Pangkal lidah ditekan ke lelangit lembut, sedikit lebih ke hadapan daripada ق.', sifat: ['Syiddah', 'Hams', 'Istifal', 'Infitah', 'Ismat'] }
        ]
    },
    {
        tajuk: 'ض · ظ', video: 'assets/video/keliru-7.mp4',
        beza: 'ض keluar dari tepi lidah yang ditekan ke gigi geraham atas, manakala ظ keluar dari hujung lidah yang bertemu gigi seri atas. Kedua-duanya tebal.',
        item: [
            { h: 'ض', mk: 'lisan', tempat: 'Tepi lidah, di sebelah kiri atau kanan, ditekan ke gigi geraham atas.', sifat: ['Jahr', "Isti'la'", 'Itbaq', 'Rakhawah', 'Ismat', 'Istitolah'] },
            { h: 'ظ', mk: 'lisan', tempat: 'Hujung lidah bertemu hujung gigi seri atas, dengan pangkal lidah terangkat.', sifat: ['Jahr', 'Rakhawah', "Isti'la'", 'Itbaq', 'Ismat'] }
        ]
    }
];

// ----- Huruf dalam ayat (untuk Kuiz). Huruf berwarna = "mid". Harakat mesti sekali dengan huruf. -----
const AYAT = [
    { rujuk: 'Al-Fatihah, ayat 1', sebelum: '', mid: 'بِ', selepas: 'سْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', mk: 'syafatain', huruf: 'ب' },
    { rujuk: 'Al-Fatihah, ayat 2', sebelum: 'ٱلْ', mid: 'حَ', selepas: 'مْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', mk: 'halq', huruf: 'ح' },
    { rujuk: 'Al-Fatihah, ayat 3', sebelum: 'ٱلرَّ', mid: 'حْ', selepas: 'مَٰنِ ٱلرَّحِيمِ', mk: 'halq', huruf: 'ح' },
    { rujuk: 'Al-Fatihah, ayat 4', sebelum: 'مَٰلِ', mid: 'كِ', selepas: ' يَوْمِ ٱلدِّينِ', mk: 'lisan', huruf: 'ك' },
    { rujuk: 'Al-Fatihah, ayat 5', sebelum: 'إِيَّاكَ نَ', mid: 'عْ', selepas: 'بُدُ وَإِيَّاكَ نَسْتَعِينُ', mk: 'halq', huruf: 'ع' },
    { rujuk: 'Al-Fatihah, ayat 6', sebelum: 'ٱ', mid: 'هْ', selepas: 'دِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', mk: 'halq', huruf: 'ه' },
    { rujuk: 'Al-Fatihah, ayat 7', sebelum: 'صِرَٰطَ ٱلَّذِينَ أَنْعَ', mid: 'مْ', selepas: 'تَ عَلَيْهِمْ', mk: 'syafatain', huruf: 'م' },
    { rujuk: 'Al-Fatihah, ayat 7', sebelum: '', mid: 'غَ', selepas: 'يْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ', mk: 'halq', huruf: 'غ' }
];

// ----- Kedudukan kawasan pada kepala (peratus daripada lebar/tinggi gambar) -----
// Kepala dilukis menghadap ke kiri (lihat KEPALA_SVG). Jika kamu letak gambar sebenar di assets/kepala.png,
// laraskan nombor ini supaya bulatan berada di tempat yang betul.
const ZON_KEPALA = {
    khaisyum:  { x: 36, y: 36, no: 1 },   // rongga hidung
    syafatain: { x: 21, y: 54, no: 2 },   // bibir
    lisan:     { x: 41, y: 59, no: 3 },   // lidah
    jauf:      { x: 56, y: 50, no: 4 },   // rongga mulut dan tekak
    halq:      { x: 69, y: 75, no: 5 }    // kerongkong
};
// Lakaran keratan sisi kepala (viewBox 0 0 200 240). Setiap bahagian ada data-mk supaya boleh diserlahkan.
const KEPALA_SVG = `
  <path class="kp-kulit" d="M122 14C164 12 190 46 190 92C190 124 178 146 166 160L168 238H100L98 204C84 202 70 196 62 186C56 180 54 172 58 166L52 160C46 154 48 148 54 144L46 138C40 132 42 126 48 122L46 114C42 110 44 104 50 102L34 94C28 90 32 84 38 82L48 74C48 40 80 16 122 14Z"/>
  <path class="kp-bahagian" data-mk="khaisyum" d="M50 84C66 76 104 76 132 84C134 90 132 96 128 98C104 96 72 96 54 96C48 94 46 88 50 84Z"/>
  <path class="kp-lelangit" d="M52 108C76 102 112 102 134 108C142 112 146 120 146 128"/>
  <path class="kp-bahagian" data-mk="jauf" d="M60 112C84 106 116 106 136 114C144 120 146 130 144 140C130 126 104 120 76 124C68 120 62 118 60 112Z"/>
  <path class="kp-bahagian" data-mk="lisan" d="M60 140C70 128 98 122 122 128C134 132 140 142 138 156C130 166 108 170 90 166C74 162 62 152 60 140Z"/>
  <path class="kp-bahagian" data-mk="halq" d="M142 120C152 126 156 140 152 160L148 238H124L130 168C134 156 136 140 134 130C136 124 138 120 142 120Z"/>
  <path class="kp-bahagian" data-mk="syafatain" d="M46 116C52 114 58 116 58 122C58 128 54 132 48 132C42 130 42 120 46 116ZM50 140C56 138 62 140 62 146C62 152 56 156 50 154C44 152 44 142 50 140Z"/>
  <path class="kp-gigi" d="M54 110v8M60 110v8M56 142v-6M62 142v-6"/>
  <circle class="kp-mata" cx="76" cy="62" r="3.5"/>
  <path class="kp-telinga" d="M150 86C160 84 166 94 164 106C162 116 154 120 148 116"/>`;