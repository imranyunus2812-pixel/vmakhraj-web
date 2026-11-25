// ===== DATA MAKHRAJ HURUF =====
const NAMA_HURUF = {
    'ا': 'Alif', 'ء': 'Hamzah', 'ب': 'Ba', 'ت': 'Ta', 'ث': 'Tha', 'ج': 'Jim',
    'ح': 'Ha', 'خ': 'Kho', 'د': 'Dal', 'ذ': 'Zal', 'ر': 'Ra', 'ز': 'Zai',
    'س': 'Sin', 'ش': 'Syin', 'ص': 'Sad', 'ض': 'Dhad', 'ط': 'To', 'ظ': 'Zho',
    'ع': 'Ain', 'غ': 'Ghain', 'ف': 'Fa', 'ق': 'Qaf', 'ك': 'Kaf', 'ل': 'Lam',
    'م': 'Mim', 'ن': 'Nun', 'ه': 'Ha (ه)', 'و': 'Wau', 'ي': 'Ya'
};

const MAKHRAJ = [
    {
        id: 'jauf', nama: 'Al-Jauf', terjemah: 'Rongga mulut & tekak', arab: 'الجوف', warna: '#7C5CE0',
        ringkas: 'Bunyi keluar dari ruang kosong di dalam mulut dan tekak. Ini untuk huruf mad (panjang).',
        tempat: [
            { huruf: ['ا', 'و', 'ي'], info: 'Ruang kosong mulut dan tekak. Bunyi dipanjangkan 2 harakat, tanpa menyentuh bahagian mulut yang lain.' }
        ],
        tip: 'Buka mulut dan alirkan nafas dengan lembut, seperti menyebut "aaaa..." panjang.'
    },
    {
        id: 'halq', nama: 'Al-Halq', terjemah: 'Tekak', arab: 'الحلق', warna: '#10A672',
        ringkas: 'Bunyi keluar dari tekak. Ada 3 tempat: pangkal, tengah dan hujung tekak.',
        tempat: [
            { huruf: ['ء', 'ه'], info: 'Pangkal tekak (paling dalam).' },
            { huruf: ['ع', 'ح'], info: 'Tengah tekak.' },
            { huruf: ['غ', 'خ'], info: 'Hujung tekak (paling dekat dengan mulut).' }
        ],
        tip: 'Letakkan jari di leher dan rasa getaran semasa menyebut huruf-huruf ini.'
    },
    {
        id: 'lisan', nama: 'Al-Lisan', terjemah: 'Lidah', arab: 'اللسان', warna: '#DB2777',
        ringkas: 'Bunyi keluar dari lidah. Ini bahagian paling banyak, iaitu 10 tempat!',
        tempat: [
            { huruf: ['ق'], info: 'Pangkal lidah (paling belakang) bertemu lelangit atas.' },
            { huruf: ['ك'], info: 'Pangkal lidah, sedikit ke depan daripada Qaf, bertemu lelangit atas.' },
            { huruf: ['ج', 'ش', 'ي'], info: 'Tengah lidah bertemu lelangit atas.' },
            { huruf: ['ض'], info: 'Tepi lidah bertemu gigi geraham atas.' },
            { huruf: ['ل'], info: 'Tepi hujung lidah bertemu gusi gigi atas.' },
            { huruf: ['ن'], info: 'Hujung lidah bertemu gusi gigi atas (sedikit di bawah Lam).' },
            { huruf: ['ر'], info: 'Hujung lidah, sedikit ke belakang daripada Nun.' },
            { huruf: ['ط', 'د', 'ت'], info: 'Hujung lidah bertemu pangkal gigi seri atas.' },
            { huruf: ['ص', 'س', 'ز'], info: 'Hujung lidah hampir dengan hujung gigi seri bawah.' },
            { huruf: ['ظ', 'ذ', 'ث'], info: 'Hujung lidah bertemu hujung gigi seri atas.' }
        ],
        tip: 'Pandang cermin dan perhatikan di mana hujung lidah kamu berada.'
    },
    {
        id: 'syafatain', nama: 'Asy-Syafatain', terjemah: 'Dua bibir', arab: 'الشفتان', warna: '#D98E04',
        ringkas: 'Bunyi keluar dari dua bibir. Ada 2 tempat.',
        tempat: [
            { huruf: ['ف'], info: 'Hujung gigi seri atas bertemu bahagian dalam bibir bawah.' },
            { huruf: ['و', 'ب', 'م'], info: 'Dua bibir bertemu. Wau dengan bibir dibulatkan, Ba dan Mim dengan bibir dirapatkan.' }
        ],
        tip: 'Rapatkan bibir untuk Ba dan Mim, bulatkan bibir untuk Wau.'
    },
    {
        id: 'khaisyum', nama: 'Al-Khaisyum', terjemah: 'Pangkal hidung', arab: 'الخيشوم', warna: '#0E9BB5',
        ringkas: 'Bunyi dengung (ghunnah) keluar dari hidung. Untuk Nun dan Mim bertasydid, dan hukum tajwid yang berkaitan.',
        tempat: [
            { huruf: ['ن', 'م'], info: 'Pangkal hidung. Dengung ditahan selama 2 harakat bila bertasydid.' }
        ],
        tip: 'Pegang hidung perlahan-lahan semasa menyebut "nn..." atau "mm..." dan rasa getarannya.'
    }
];

// Istilah tajwid. Kunci = huruf dalam satu tempat disambung.
const ISTILAH = {
    'اوي': 'Al-Jauf (الجوف): huruf mad. Alif, Wau sukun selepas dammah, dan Ya sukun selepas kasrah.',
    'ءه': 'Aqsa al-Halq (أقصى الحلق): pangkal tekak. Huruf halqiyyah.',
    'عح': 'Wasat al-Halq (وسط الحلق): tengah tekak. Huruf halqiyyah.',
    'غخ': 'Adna al-Halq (أدنى الحلق): hujung tekak. Huruf halqiyyah.',
    'ق': 'Aqsa al-Lisan (أقصى اللسان) bersama lelangit lembut. Huruf lahawiyyah.',
    'ك': 'Aqsa al-Lisan, sedikit ke hadapan daripada Qaf. Huruf lahawiyyah.',
    'جشي': 'Wasat al-Lisan (وسط اللسان) bersama lelangit keras. Huruf syajariyyah.',
    'ض': 'Hafah al-Lisan (حافة اللسان): tepi lidah dengan geraham atas.',
    'ل': 'Hafah al-Lisan: tepi hujung lidah dengan gusi gigi atas. Huruf zalqiyyah.',
    'ن': 'Tharaf al-Lisan (طرف اللسان): hujung lidah dengan gusi gigi atas. Huruf zalqiyyah.',
    'ر': 'Tharaf al-Lisan, sedikit ke belakang daripada Nun. Huruf zalqiyyah.',
    'طدت': 'Huruf nit\'iyyah (نطعية): hujung lidah dengan pangkal gigi seri atas.',
    'صسز': 'Huruf asaliyyah (أسلية): hujung lidah dengan hujung gigi seri bawah.',
    'ظذث': 'Huruf litsawiyyah (لثوية): hujung lidah dengan hujung gigi seri atas.',
    'ف': 'Huruf syafawiyyah (شفوية): bahagian dalam bibir bawah dengan hujung gigi seri atas.',
    'وبم': 'Huruf syafawiyyah: dua bibir. Wau dibulatkan, Ba dan Mim dirapatkan.',
    'نم': 'Al-Khaisyum (الخيشوم): ghunnah, dengung 2 harakat pada Nun dan Mim bertasydid.'
};

// Nama pendek setiap tempat (untuk soalan game)
const TEMPAT_PENDEK = {
    'ءه': 'Pangkal tekak',
    'عح': 'Tengah tekak',
    'غخ': 'Hujung tekak',
    'ق': 'Pangkal lidah (paling belakang)',
    'ك': 'Pangkal lidah (agak ke depan)',
    'جشي': 'Tengah lidah',
    'ض': 'Tepi lidah + geraham atas',
    'ل': 'Tepi hujung lidah + gusi atas',
    'ن': 'Hujung lidah + gusi atas (Nun)',
    'ر': 'Hujung lidah, lebih ke belakang (Ra)',
    'طدت': 'Hujung lidah + pangkal gigi seri atas',
    'صسز': 'Hujung lidah + gigi seri bawah',
    'ظذث': 'Hujung lidah + hujung gigi seri atas',
    'ف': 'Gigi atas + bibir bawah',
    'وبم': 'Dua bibir'
};

// Huruf untuk soalan. Huruf yang ada di lebih dari satu makhraj (ي dan و) dikecualikan.
const HURUF_KUIZ = (() => {
    const senarai = [];
    MAKHRAJ.forEach(m => {
        if (m.id === 'khaisyum') return;
        m.tempat.forEach(t => t.huruf.forEach(h => {
            if (h === 'ي' || h === 'و') return;
            senarai.push({ huruf: h, makhraj: m.id });
        }));
    });
    return senarai;
})();

// Dunia pengembaraan
const DUNIA = [
    {
        id: 'jauf', nama: 'Gua Jauf & Khaisyum', ringkas: 'Rongga mulut dan hidung', huruf: 'ا',
        warna: '#7C5CE0', l1: '#1e1b4b', l2: '#7c3aed', tanah: '#3b2a6b', rumput: '#8b5cf6', bukit: '#2e1065'
    },
    {
        id: 'halq', nama: 'Hutan Al-Halq', ringkas: 'Rahsia di dalam tekak', huruf: 'ع',
        warna: '#10A672', l1: '#0f766e', l2: '#a7f3d0', tanah: '#4a3220', rumput: '#22c55e', bukit: '#065f46'
    },
    {
        id: 'syafatain', nama: 'Pantai Syafatain', ringkas: 'Misteri dua bibir', huruf: 'ب',
        warna: '#D98E04', l1: '#0ea5e9', l2: '#bae6fd', tanah: '#d6b36a', rumput: '#f5d68a', bukit: '#0369a1'
    },
    {
        id: 'lisan', nama: 'Gunung Al-Lisan', ringkas: '10 tempat di lidah', huruf: 'ل',
        warna: '#DB2777', l1: '#be185d', l2: '#fbcfe8', tanah: '#475569', rumput: '#e2e8f0', bukit: '#9d174d'
    },
    {
        id: 'istana', nama: 'Istana Makhraj', ringkas: 'Cabaran terakhir!', ikon: 'trophy',
        warna: '#E11D48', l1: '#7f1d1d', l2: '#fb923c', tanah: '#292524', rumput: '#f97316', bukit: '#450a0a'
    }
];

// Soalan khas untuk Gua Jauf & Khaisyum
const SOALAN_GUA = [
    {
        tanya: 'Huruf mad (ا و ي) keluar dari makhraj...', besar: 'ا', besarArab: true, huruf: 'ا',
        betul: 'Al-Jauf', salah: ['Al-Halq', 'Asy-Syafatain', 'Al-Khaisyum'],
        terang: 'Huruf mad keluar dari Al-Jauf, iaitu rongga mulut dan tekak.'
    },
    {
        tanya: 'Al-Jauf bermaksud...', besar: 'الجوف', besarArab: true,
        betul: 'Rongga mulut dan tekak', salah: ['Dua bibir', 'Pangkal hidung', 'Hujung lidah'],
        terang: 'Al-Jauf ialah rongga mulut dan tekak.'
    },
    {
        tanya: 'Bunyi dengung (ghunnah) keluar dari...', besar: 'الخيشوم', besarArab: true,
        betul: 'Al-Khaisyum', salah: ['Al-Jauf', 'Al-Lisan', 'Al-Halq'],
        terang: 'Ghunnah keluar dari Al-Khaisyum, iaitu pangkal hidung.'
    },
    {
        tanya: 'Huruf manakah yang berdengung apabila bertasydid?', besar: 'الخيشوم', besarArab: true, arab: true,
        betul: 'ن + م', salah: ['ب + ف', 'ل + ر', 'ع + ح'],
        terang: 'Nun dan Mim bertasydid dibaca dengan dengung.'
    },
    {
        tanya: 'Berapa harakat dengung (ghunnah) pada Nun dan Mim bertasydid?', besar: '٢', besarArab: true,
        betul: '2 harakat', salah: ['1 harakat', '4 harakat', '6 harakat'],
        terang: 'Ghunnah ditahan sekadar 2 harakat.'
    },
    {
        tanya: 'Apakah ciri bunyi huruf mad?', besar: 'الجوف', besarArab: true,
        betul: 'Keluar dari ruang kosong tanpa menyentuh bahagian mulut', salah: ['Dua bibir dirapatkan', 'Hujung lidah menyentuh gusi', 'Pangkal tekak ditutup'],
        terang: 'Huruf mad keluar dari ruang kosong (Al-Jauf) dan tidak bersandar pada tempat tertentu.'
    }
];