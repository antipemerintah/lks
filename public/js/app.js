'use strict';

const KECEPATAN_KETIK = 16;

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
    areaChat:         document.querySelector('.area-chat'),
};

// ── Tampilan pesan ──────────────────────────────────────────────────────

function tampilkanPesan(pesan, animasi = false) {
    const dariUser = pesan.role === 'user';
    const gelembung = document.createElement('div');
    gelembung.className = dariUser ? 'pesan-user' : 'pesan-ai';

    if (!animasi) {
        if (!dariUser && pesan.isHTML) {
            gelembung.innerHTML = pesan.content;
        } else {
            gelembung.textContent = pesan.content;
        }
    }

    el.bubbleChat.appendChild(gelembung);
    gulirKeBawah();

    if (kondisi.idChatAktif) {
        if (!kondisi.riwayatPesan[kondisi.idChatAktif]) {
            kondisi.riwayatPesan[kondisi.idChatAktif] = [];
        }
        kondisi.riwayatPesan[kondisi.idChatAktif].push(pesan);
    }

    if (animasi) efekMesinKetik(gelembung, pesan.content, pesan.isHTML);
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

async function efekMesinKetik(elTarget, teks, isHTML = false) {
    if (isHTML) {
        elTarget.innerHTML = '';
        elTarget.innerHTML = teks;
        gulirKeBawah();
        return;
    }
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

    item.addEventListener('click', () => {
        if (kondisi.sedangMemuat) return;

        setActiveChat(id);
        kondisi.idChatAktif = id;
        kondisi.sesiBaruDibuka = false;

        el.bubbleChat.innerHTML = '';
        el.sambutan.classList.add('hidden');
        el.judulTopbar.textContent = judulPendek;

        const pesan = kondisi.riwayatPesan[id] || [];
        pesan.forEach(p => {
            const gelembung = document.createElement('div');
            gelembung.className = p.role === 'user' ? 'pesan-user' : 'pesan-ai';
            if (p.isHTML) {
                gelembung.innerHTML = p.content;
            } else {
                gelembung.textContent = p.content;
            }
            el.bubbleChat.appendChild(gelembung);
        });
        gulirKeBawah();
    });

    setActiveChat(null);
    el.riwayatChat.insertBefore(item, el.riwayatChat.firstChild);
    item.classList.add('active');
}

function adaChatDiSidebar() {
    return el.riwayatChat.querySelectorAll('.chat-item').length > 0;
}

// ── API ──────────────────────────────────────────────────────────────────

async function tanyaAPI(pertanyaan) {
    const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ question: pertanyaan })
    });

    const data = await response.json();

    if (!data.success) {
        return { teks: '❌ ' + data.error, isHTML: false };
    }

    if (!data.data || data.data.length === 0) {
        return { teks: 'Tidak ada data ditemukan.', isHTML: false };
    }

    const kolom = Object.keys(data.data[0]);

    let html = `<div style="overflow-x:auto;width:100%">`;
    html += `<table style="border-collapse:collapse;width:100%;font-size:13px">`;

    // Header
    html += `<thead><tr>`;
    kolom.forEach(k => {
        html += `<th style="border:1px solid #ddd;padding:8px 12px;background:#f0f0f0;text-align:left;white-space:nowrap">${k}</th>`;
    });
    html += `</tr></thead>`;

    // Rows
    html += `<tbody>`;
    data.data.forEach((row, i) => {
        const bg = i % 2 === 0 ? '#fff' : '#fafafa';
        html += `<tr style="background:${bg}">`;
        kolom.forEach(k => {
            html += `<td style="border:1px solid #ddd;padding:8px 12px">${row[k] ?? '-'}</td>`;
        });
        html += `</tr>`;
    });
    html += `</tbody></table></div>`;
    html += `<div style="margin-top:8px;font-size:11px;color:#aaa">SQL: ${data.sql}</div>`;

    return { teks: html, isHTML: true };
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
        const { teks, isHTML } = await tanyaAPI(isi.trim());
        menulis.hapus();
        tampilkanPesan({ role: 'assistant', content: teks, isHTML }, !isHTML);
    } catch (err) {
        menulis.hapus();
        tampilkanPesan({ role: 'assistant', content: 'Terjadi kesalahan. Coba lagi.' });
    } finally {
        setMemuat(false);
    }
}

function setMemuat(status) {
    kondisi.sedangMemuat = status;
    el.tombolKirim.disabled = status;
    el.input.disabled = status;
}

// ── Reset ────────────────────────────────────────────────────────────────

function resetPercakapan() {
    kondisi.sedangMemuat = false;
    kondisi.sesiBaruDibuka = true;
    kondisi.idChatAktif = null;

    el.bubbleChat.innerHTML = '';
    el.input.value = '';

    el.input.disabled = false;
    el.tombolKirim.disabled = false;

    el.sambutan.classList.remove('hidden');
    el.judulTopbar.textContent = 'Obrolan baru';

    if (!adaChatDiSidebar()) {
        el.labelBelumChat.classList.remove('hidden');
    }

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
    if (
        e.target === el.input ||
        e.ctrlKey || e.metaKey || e.altKey ||
        e.key === 'Enter' || e.key === 'Tab' ||
        e.key.startsWith('F') ||
        e.key === 'Escape'
    ) return;

    el.input.focus();
});