<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    <title>Navas AI</title>
</head>
<body>
    <div class="pembungkus">

        <div class="sidebar" id="sidebar">
            <div class="sidebar-atas">
                <div class="logo-sidebar">
                    <i class="bi bi-robot"></i>
                    <span>Navas</span>
                </div>
                <button class="obrolan-baru" id="tombol-obrolan-baru">
                    + Obrolan baru
                </button>
            </div>

            <div class="sidebar-tengah">
                <p class="label-terbaru">Terbaru</p>
                <p class="label-belumchat" id="label-belumchat">Belum ada chat</p>
                <div class="riwayat-chat" id="riwayat-chat"></div>
            </div>

            <div class="sidebar-bawah">
                <i class="bi bi-person-fill foto-profile"></i>
                <div class="nama-badge">
                    <span>SMK TELKOM JAKARTA</span>
                    <span>Premium</span>
                </div>
            </div>
        </div>

        <div class="mainchat">
            <div class="mainchat-atas">
                <button id="tombol-sidebar"><i class="bi bi-layout-sidebar"></i></button>
                <span class="judul-topbar">Obrolan baru</span>
            </div>

            <div class="area-chat">
                <div class="mainchat-tengah" id="tampilan-sambutan">
                    <i class="bi bi-robot ikon-sambutan"></i>
                    <div class="sambutan">
                        <h1 class="judul-sambutan">Mau kita bantuin?</h1>
                        <p class="teks-sambutan">Kerjain tugas bareng Navas</p>
                    </div>
                    <div class="kumpulan-pertanyaan">
                        <button class="chip-pertanyaan">Tampilkan 10 data tanggal 10 juni 2024</button>
                        <button class="chip-pertanyaan">Harga barang GREEN CANDY</button>
                        <button class="chip-pertanyaan">Harga barang BLUE CANDY</button>
                    </div>
                </div>

                <div id="bubble-chat"></div>
            </div>

            <div class="mainchat-bawah">
                <div class="input-send">
                    <input type="text" id="input-pesan" placeholder="Kirim pesan...">
                    <button class="tombol-kirim" id="tombol-kirim">
                        <i class="bi bi-send"></i>
                    </button>
                </div>
                <p>Navas dapat melakukan kesalahan. Sebaiknya double check untuk hasil yang lebih maksimal</p>
            </div>
        </div>

    </div>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>