# Requirements Document

## Introduction

To-Do List Life Dashboard adalah sebuah website produktivitas pribadi yang dibangun menggunakan HTML, CSS, dan Vanilla JavaScript tanpa framework. Website ini menyediakan tampilan dashboard terpadu yang menampilkan informasi waktu dan salam, timer fokus berbasis Pomodoro, daftar tugas harian, dan tautan cepat ke situs favorit. Semua data pengguna disimpan secara lokal di browser menggunakan Local Storage, sehingga tidak memerlukan backend atau koneksi internet untuk fungsi utamanya. Website dapat digunakan sebagai halaman web biasa maupun sebagai browser extension.

## Glossary

- **Dashboard**: Halaman utama yang menampilkan semua widget secara terpadu dalam satu tampilan.
- **Widget**: Komponen UI mandiri yang menampilkan satu jenis fungsionalitas (Greeting, Focus Timer, To-Do List, Quick Links).
- **Greeting_Widget**: Komponen yang menampilkan waktu, tanggal, dan pesan sapaan berdasarkan waktu hari.
- **Focus_Timer**: Komponen timer hitung mundur 25 menit untuk sesi kerja fokus.
- **Todo_Manager**: Komponen yang mengelola daftar tugas pengguna (tambah, edit, selesai, hapus).
- **Task**: Satu item tugas dalam daftar Todo_Manager dengan teks deskripsi dan status penyelesaian.
- **Quick_Links**: Komponen yang menyimpan dan menampilkan tautan cepat ke situs favorit pengguna.
- **Link**: Satu item tautan dalam Quick_Links dengan nama tampilan dan URL tujuan.
- **Storage_Manager**: Abstraksi atas Browser Local Storage API yang menangani semua operasi baca/tulis data persisten.
- **Local_Storage**: Browser Local Storage API, tempat semua data pengguna disimpan di sisi klien.

---

## Requirements

### Requirement 1: Tampilan Waktu dan Tanggal Real-Time

**User Story:** Sebagai pengguna, saya ingin melihat waktu dan tanggal saat ini secara real-time, sehingga saya dapat mengetahui informasi waktu tanpa meninggalkan halaman dashboard.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL menampilkan waktu saat ini dalam format jam dan menit (HH:MM).
2. THE Greeting_Widget SHALL menampilkan tanggal saat ini dengan format hari, tanggal, nama bulan, dan tahun (contoh: "Rabu, 08 Oktober 2026").
3. WHEN satu detik berlalu, THE Greeting_Widget SHALL memperbarui tampilan waktu sehingga selalu menampilkan waktu yang akurat.
4. WHEN halaman pertama kali dimuat, THE Greeting_Widget SHALL langsung menampilkan waktu dan tanggal saat itu tanpa penundaan.

---

### Requirement 2: Greeting Berdasarkan Waktu

**User Story:** Sebagai pengguna, saya ingin mendapatkan sapaan yang relevan dengan waktu hari ini, sehingga tampilan dashboard terasa lebih personal dan hangat.

#### Acceptance Criteria

1. WHEN waktu saat ini berada antara pukul 05:00 dan 11:59, THE Greeting_Widget SHALL menampilkan pesan "Selamat Pagi 🌅".
2. WHEN waktu saat ini berada antara pukul 12:00 dan 17:59, THE Greeting_Widget SHALL menampilkan pesan "Selamat Siang ☀️".
3. WHEN waktu saat ini berada antara pukul 18:00 dan 21:59, THE Greeting_Widget SHALL menampilkan pesan "Selamat Sore 🌇".
4. WHEN waktu saat ini berada antara pukul 22:00 dan 04:59, THE Greeting_Widget SHALL menampilkan pesan "Selamat Malam 🌙".
5. WHEN waktu berganti melewati batas jam dari satu periode ke periode berikutnya, THE Greeting_Widget SHALL memperbarui pesan sapaan secara otomatis tanpa memuat ulang halaman.

---

### Requirement 3: Focus Timer — Kontrol Timer

**User Story:** Sebagai pengguna, saya ingin menjalankan timer hitung mundur 25 menit, sehingga saya dapat menggunakan teknik Pomodoro untuk meningkatkan fokus kerja.

#### Acceptance Criteria

1. WHEN halaman dimuat, THE Focus_Timer SHALL menampilkan durasi awal 25:00 (25 menit, 0 detik) dalam format MM:SS.
2. WHEN pengguna menekan tombol Start, THE Focus_Timer SHALL mulai menghitung mundur dari waktu yang sedang ditampilkan.
3. WHILE Focus_Timer sedang berjalan, THE Focus_Timer SHALL memperbarui tampilan setiap satu detik.
4. WHEN pengguna menekan tombol Stop, THE Focus_Timer SHALL menghentikan hitungan mundur dan mempertahankan sisa waktu yang ditampilkan.
5. WHEN pengguna menekan tombol Reset, THE Focus_Timer SHALL menghentikan hitungan mundur dan mengembalikan tampilan ke 25:00.
6. WHEN Focus_Timer mencapai 00:00, THE Focus_Timer SHALL menghentikan hitungan mundur secara otomatis dan menampilkan notifikasi bahwa sesi fokus telah selesai.

---

### Requirement 4: Focus Timer — State Tombol

**User Story:** Sebagai pengguna, saya ingin tombol kontrol timer menunjukkan aksi yang relevan dengan kondisi timer saat ini, sehingga saya tidak bingung mengenai apa yang bisa dilakukan.

#### Acceptance Criteria

1. WHILE Focus_Timer sedang berjalan, THE Focus_Timer SHALL menonaktifkan tombol Start sehingga tidak dapat ditekan kembali.
2. WHILE Focus_Timer sedang berhenti atau belum dimulai, THE Focus_Timer SHALL menonaktifkan tombol Stop sehingga tidak dapat ditekan.
3. WHEN Focus_Timer mencapai 00:00, THE Focus_Timer SHALL menonaktifkan tombol Start dan tombol Stop.

---

### Requirement 5: Menambah Task

**User Story:** Sebagai pengguna, saya ingin menambahkan tugas baru ke daftar, sehingga saya dapat mencatat hal-hal yang perlu saya kerjakan.

#### Acceptance Criteria

1. THE Todo_Manager SHALL menyediakan sebuah input field dan tombol tambah untuk memasukkan tugas baru.
2. WHEN pengguna mengetik deskripsi tugas dan menekan tombol tambah atau tombol Enter, THE Todo_Manager SHALL membuat Task baru dan menambahkannya ke daftar.
3. WHEN Task baru berhasil ditambahkan, THE Todo_Manager SHALL mengosongkan input field dan memindahkan fokus kembali ke input field.
4. WHEN pengguna mencoba menambahkan Task dengan deskripsi yang hanya terdiri dari spasi atau kosong, THE Todo_Manager SHALL mencegah penambahan dan mempertahankan kondisi daftar yang ada.
5. WHEN Task baru berhasil ditambahkan, THE Storage_Manager SHALL menyimpan seluruh daftar tugas ke Local_Storage secara langsung.

---

### Requirement 6: Menampilkan dan Mengelola Task

**User Story:** Sebagai pengguna, saya ingin melihat semua tugas saya dan menandai tugas yang sudah selesai, sehingga saya dapat memantau progres pekerjaan hari ini.

#### Acceptance Criteria

1. THE Todo_Manager SHALL menampilkan semua Task yang ada dalam daftar secara berurutan.
2. WHEN pengguna mencentang checkbox sebuah Task, THE Todo_Manager SHALL memperbarui status Task tersebut menjadi selesai dan menampilkan teks dengan garis coret (strikethrough).
3. WHEN pengguna menghapus centang checkbox sebuah Task, THE Todo_Manager SHALL memperbarui status Task tersebut kembali menjadi belum selesai dan menghapus garis coret.
4. WHEN status Task berubah, THE Storage_Manager SHALL menyimpan perubahan ke Local_Storage secara langsung.

---

### Requirement 7: Mengedit Task

**User Story:** Sebagai pengguna, saya ingin mengubah deskripsi tugas yang sudah ada, sehingga saya dapat memperbaiki kesalahan ketik atau memperbarui konteks tugas.

#### Acceptance Criteria

1. THE Todo_Manager SHALL menyediakan tombol edit pada setiap Task.
2. WHEN pengguna menekan tombol edit pada sebuah Task, THE Todo_Manager SHALL menampilkan input field yang terisi dengan teks Task yang ada sehingga pengguna dapat memodifikasinya.
3. WHEN pengguna mengkonfirmasi perubahan (menekan tombol simpan atau Enter), THE Todo_Manager SHALL memperbarui deskripsi Task dengan teks baru yang tidak kosong dan tidak hanya spasi.
4. WHEN pengguna mengkonfirmasi perubahan dengan teks yang kosong atau hanya spasi, THE Todo_Manager SHALL membatalkan proses edit dan mempertahankan deskripsi Task yang lama.
5. WHEN pengguna membatalkan proses edit (menekan tombol batal atau tombol Escape), THE Todo_Manager SHALL menutup mode edit tanpa mengubah deskripsi Task.
6. WHEN deskripsi Task berhasil diperbarui, THE Storage_Manager SHALL menyimpan perubahan ke Local_Storage secara langsung.

---

### Requirement 8: Menghapus Task

**User Story:** Sebagai pengguna, saya ingin menghapus tugas dari daftar, sehingga saya dapat membersihkan item yang sudah tidak relevan.

#### Acceptance Criteria

1. THE Todo_Manager SHALL menyediakan tombol hapus pada setiap Task.
2. WHEN pengguna menekan tombol hapus pada sebuah Task, THE Todo_Manager SHALL menghapus Task tersebut dari daftar dan memperbaharui tampilan.
3. WHEN sebuah Task dihapus, THE Storage_Manager SHALL menyimpan perubahan ke Local_Storage secara langsung.

---

### Requirement 9: Persistensi Data To-Do List

**User Story:** Sebagai pengguna, saya ingin tugas-tugas saya tetap ada saat saya menutup dan membuka kembali browser, sehingga saya tidak kehilangan data yang sudah saya masukkan.

#### Acceptance Criteria

1. WHEN halaman dimuat, THE Todo_Manager SHALL membaca data Task dari Local_Storage dan menampilkan semua Task yang tersimpan.
2. IF data Task di Local_Storage tidak ditemukan atau kosong, THEN THE Todo_Manager SHALL menampilkan daftar kosong tanpa error.
3. IF data Task di Local_Storage memiliki format yang tidak valid, THEN THE Storage_Manager SHALL mengembalikan array kosong dan mencatat error ke konsol tanpa menghentikan aplikasi.

---

### Requirement 10: Menambah Quick Link

**User Story:** Sebagai pengguna, saya ingin menyimpan tautan ke situs favorit saya, sehingga saya dapat mengaksesnya dengan cepat dari dashboard.

#### Acceptance Criteria

1. THE Quick_Links SHALL menyediakan form dengan input nama dan input URL untuk menambahkan Link baru.
2. WHEN pengguna mengisi nama dan URL lalu mengkonfirmasi, THE Quick_Links SHALL membuat Link baru dan menampilkannya di antara tautan yang ada.
3. WHEN pengguna mencoba menambahkan Link dengan nama atau URL yang kosong atau hanya spasi, THE Quick_Links SHALL mencegah penambahan.
4. WHEN pengguna memasukkan URL tanpa awalan protokol (contoh: "google.com"), THE Quick_Links SHALL secara otomatis menambahkan awalan "https://" sebelum menyimpan URL tersebut.
5. WHEN Link baru berhasil ditambahkan, THE Storage_Manager SHALL menyimpan seluruh daftar Link ke Local_Storage secara langsung.

---

### Requirement 11: Menggunakan dan Menghapus Quick Link

**User Story:** Sebagai pengguna, saya ingin membuka situs dari Quick Links dan menghapus tautan yang tidak lagi saya butuhkan, sehingga daftar tautan tetap relevan dan berguna.

#### Acceptance Criteria

1. THE Quick_Links SHALL menampilkan setiap Link sebagai elemen yang dapat diklik dengan nama yang ditampilkan.
2. WHEN pengguna mengklik sebuah Link, THE Quick_Links SHALL membuka URL yang tersimpan di tab baru browser.
3. THE Quick_Links SHALL menyediakan tombol hapus pada setiap Link.
4. WHEN pengguna menekan tombol hapus pada sebuah Link, THE Quick_Links SHALL menghapus Link tersebut dari daftar dan memperbarui tampilan.
5. WHEN sebuah Link dihapus, THE Storage_Manager SHALL menyimpan perubahan ke Local_Storage secara langsung.

---

### Requirement 12: Persistensi Data Quick Links

**User Story:** Sebagai pengguna, saya ingin tautan favorit saya tetap tersimpan saat saya menutup dan membuka kembali browser, sehingga saya tidak perlu menambahkannya ulang setiap kali.

#### Acceptance Criteria

1. WHEN halaman dimuat, THE Quick_Links SHALL membaca data Link dari Local_Storage dan menampilkan semua Link yang tersimpan.
2. IF data Link di Local_Storage tidak ditemukan atau kosong, THEN THE Quick_Links SHALL menampilkan daftar kosong tanpa error.
3. IF data Link di Local_Storage memiliki format yang tidak valid, THEN THE Storage_Manager SHALL mengembalikan array kosong dan mencatat error ke konsol tanpa menghentikan aplikasi.

---

### Requirement 13: Struktur File dan Kode

**User Story:** Sebagai developer, saya ingin proyek memiliki struktur file yang bersih dan mudah dipahami, sehingga kode mudah dirawat dan diperluas.

#### Acceptance Criteria

1. THE Dashboard SHALL terdiri dari tepat satu file HTML di root direktori proyek.
2. THE Dashboard SHALL terdiri dari tepat satu file CSS yang ditempatkan di dalam direktori `css/`.
3. THE Dashboard SHALL terdiri dari tepat satu file JavaScript yang ditempatkan di dalam direktori `js/`.
4. THE Dashboard SHALL dapat dijalankan secara langsung di browser modern (Chrome, Firefox, Edge, Safari) hanya dengan membuka file HTML tanpa proses build atau instalasi dependensi.
