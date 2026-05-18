'use strict';

const KECEPATAN_KETIK = 16;

const BALASAN_DEMO = [
    'Menarik! Coba kita lihat dari sudut pandang lain.',
    'Kalau secara logika, ini bisa dijelaskan begini...',
    'Ada 2 kemungkinan utama yang bisa kita pertimbangkan.',
    'Good question! Ini klasik trade-off yang sering muncul.',
    'Nah, ini yang sering orang skip. Mari kita bahas lebih detail.',
    'Oke, gue cek dulu ya. Tunggu sebentar.',
    'Noted! Saya proses sekarang.',
];

const kondisi = {
    sedangMemuat:   false,
    sesiBaruDibuka: true,
    hitungIdChat:   0,
    idChatAktif:    null,
    riwayatPesan: {},
};

const el = {
    sidebar:          document.getElementById('sidebar'),
    tombolSidebar:    document.getElementById('tombol-sidebar'),
    tombolChatBaru:   document.getElementById('tombol-obrolan-baru'),
    riwayatChat:      document.getElementById('riwayat-chat'),
    labelBelumChat:   document.getElementById('label-belumchat'),
    bubbleChat:       document.getElementById('bubble-chat'),
    sambutan:         document.getElementById('tampilan-sambutan'),
    input:            document.getElementById('input-pesan'),
    tombolKirim:      document.getElementById('tombol-kirim'),
    judulTopbar:      document.querySelector('.judul-topbar'),
    areaChat: document.querySelector('.area-chat'),
};

// ── Tampilan pesan ──────────────────────────────────────────────────────

function tampilkanPesan(pesan, animasi = false) {
    const dariUser = pesan.role === 'user';
    const gelembung = document.createElement('div');
    gelembung.className = dariUser ? 'pesan-user' : 'pesan-ai';

    if (!animasi) {
        gelembung.textContent = pesan.content;
    }
    
    el.bubbleChat.appendChild(gelembung);
    gulirKeBawah();

    if (kondisi.idChatAktif) {
        if (!kondisi.riwayatPesan[kondisi.idChatAktif]) {
            kondisi.riwayatPesan[kondisi.idChatAktif] = [];
        };
        kondisi.riwayatPesan[kondisi.idChatAktif].push(pesan);
    };
    if (animasi) efekMesinKetik(gelembung, pesan.content);
    return gelembung;
}

function tampilkanIndikatorMenulis() {
    const gelembung = document.createElement('div');
    gelembung.className = 'pesan-ai';

    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    gelembung.appendChild(dots);

    el.bubbleChat.appendChild(gelembung);
    gulirKeBawah();
    return { hapus: () => gelembung.remove() };
}

async function efekMesinKetik(elTarget, teks) {
    elTarget.textContent = '';
    for (let i = 0; i < teks.length; i++) {
        elTarget.textContent += teks[i];
        if (i % 3 === 0) gulirKeBawah();
        await jeda(KECEPATAN_KETIK);
    }
    gulirKeBawah();
}

function gulirKeBawah() {
    el.areaChat.scrollTop = el.areaChat.scrollHeight;
}

function jeda(ms) {
    return new Promise(res => setTimeout(res, ms));
}

// ── Sidebar ─────────────────────────────────────────────────────────────

function toggleSidebar() {
    el.sidebar.classList.toggle('tutup-sidebar');
}

// ── Riwayat chat ─────────────────────────────────────────────────────────

function setActiveChat(id) {
    el.riwayatChat.querySelectorAll('.chat-item').forEach(i => {
        i.classList.toggle('active', i.dataset.id === id);
    });
}

function tambahChatKeSidebar(id, judul) {
    el.labelBelumChat.classList.add('hidden');

    const judulPendek = judul.length > 36 ? judul.slice(0, 36).trimEnd() + '…' : judul;

    const item = document.createElement('button');
    item.className = 'chat-item active';
    item.dataset.id = id;
    item.textContent = judulPendek;
    item.title = judul;

    // FIX: klik chat lama dari sidebar → set kondisi yang bener
    item.addEventListener('click', () => {
        if (kondisi.sedangMemuat) return; // block kalau lagi loading

        setActiveChat(id);
        kondisi.idChatAktif = id;
        kondisi.sesiBaruDibuka = false; // ← ini yang missing sebelumnya

        el.bubbleChat.innerHTML = '';
        el.sambutan.classList.add('hidden');
        el.judulTopbar.textContent = judulPendek;

        const pesan = kondisi.riwayatPesan[id] || [];
        pesan.forEach(p => {
            const gelembung = document.createElement('div');
            gelembung.className = p.role === 'user' ? 'pesan-user' : 'pesan-ai';
            gelembung.textContent = p.content;
            el.bubbleChat.appendChild(gelembung);
        });
        gulirKeBawah();
    });

    setActiveChat(null); // clear semua active dulu
    el.riwayatChat.insertBefore(item, el.riwayatChat.firstChild);
    item.classList.add('active'); // set yang baru active
}

function adaChatDiSidebar() {
    return el.riwayatChat.querySelectorAll('.chat-item').length > 0;
}

// ── Kirim pesan ──────────────────────────────────────────────────────────

async function kirimPesan(isi) {
    if (!isi.trim() || kondisi.sedangMemuat) return;

    el.sambutan.classList.add('hidden');

    if (kondisi.sesiBaruDibuka) {
        kondisi.hitungIdChat += 1;
        kondisi.idChatAktif = String(kondisi.hitungIdChat);
        kondisi.sesiBaruDibuka = false;
        tambahChatKeSidebar(kondisi.idChatAktif, isi.trim());
        el.judulTopbar.textContent = isi.trim().length > 36
            ? isi.trim().slice(0, 36) + '…'
            : isi.trim();
    }

    tampilkanPesan({ role: 'user', content: isi.trim() });
    el.input.value = '';
    setMemuat(true);

    const menulis = tampilkanIndikatorMenulis();

    try {
        const balasan = await fakeAIResponse();
        menulis.hapus();
        tampilkanPesan({ role: 'assistant', content: balasan }, true);
    } catch (err) {
        menulis.hapus();
        tampilkanPesan({ role: 'assistant', content: 'Terjadi kesalahan. Coba lagi.' });
    } finally {
        setMemuat(false);
    }
}

async function fakeAIResponse() {
    await jeda(700 + Math.random() * 800);
    return BALASAN_DEMO[Math.floor(Math.random() * BALASAN_DEMO.length)];
}

function setMemuat(status) {
    kondisi.sedangMemuat = status;
    el.tombolKirim.disabled = status;
    el.input.disabled = status;
}

// ── Reset ────────────────────────────────────────────────────────────────

function resetPercakapan() {
    // FIX: batalkan loading kalau sedang jalan
    kondisi.sedangMemuat = false;
    kondisi.sesiBaruDibuka = true;
    kondisi.idChatAktif = null;

    el.bubbleChat.innerHTML = '';
    el.input.value = '';

    // FIX: reset state input yang mungkin ke-disable
    el.input.disabled = false;
    el.tombolKirim.disabled = false;

    el.sambutan.classList.remove('hidden');
    el.judulTopbar.textContent = 'Obrolan baru';

    // FIX: label "belum ada chat" hanya muncul kalau memang kosong
    if (!adaChatDiSidebar()) {
        el.labelBelumChat.classList.remove('hidden');
    }

    // Clear active dari semua item
    setActiveChat(null);
}

// ── Event listeners ──────────────────────────────────────────────────────

el.tombolSidebar.addEventListener('click', toggleSidebar);

el.tombolChatBaru.addEventListener('click', () => {
    resetPercakapan();
});

el.tombolKirim.addEventListener('click', () => kirimPesan(el.input.value));

el.input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        kirimPesan(el.input.value);
    }
});

document.querySelectorAll('.chip-pertanyaan').forEach(chip => {
    chip.addEventListener('click', () => kirimPesan(chip.textContent.trim()));
});

document.addEventListener('keydown', e => {
    // skip kalau lagi di input/textarea, atau pakai modifier key
    if (
        e.target === el.input ||
        e.ctrlKey || e.metaKey || e.altKey ||
        e.key === 'Enter' || e.key === 'Tab' ||
        e.key.startsWith('F') || // F1-F12
        e.key === 'Escape'
    ) return;

    el.input.focus();
});