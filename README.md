# SmartPark - IoT Parking Management System

![Status](https://img.shields.io/badge/Status-Completed-success)
![Stack](https://img.shields.io/badge/Stack-MERN_(MySQL)-blue)
![Realtime](https://img.shields.io/badge/Realtime-Socket.IO-orange)

**SmartPark** adalah solusi manajemen parkir *end-to-end* yang dirancang untuk mensimulasikan integrasi IoT (Internet of Things) dengan aplikasi web modern. Proyek ini dibangun sebagai bagian dari **Fullstack Developer Internship Case Study**, yang menunjukkan kemampuan dalam membangun arsitektur *Scalable*, *Real-time*, dan *Secure*.

Aplikasi ini memfasilitasi komunikasi dua arah antara **Admin (Simulator Sensor)** dan **User (Pengunjung)** dengan latensi mendekati nol menggunakan WebSocket.

---

## Case Study Fulfillment (Penyelesaian Studi Kasus)

Berikut adalah daftar fitur yang diimplementasikan untuk memenuhi dan melampaui kriteria teknis studi kasus:

| Kriteria / Fitur | Status | Implementasi Teknis |
| :--- | :---: | :--- |
| **Authentication** | ✓ | Menggunakan **JWT (JSON Web Token)** dengan pemisahan role (Admin/User) melalui Middleware aman. |
| **CRUD Operations** | ✓ | Manajemen Gedung Parkir (*Parking Lots*) dinamis; Admin dapat menambah gedung dengan penamaan slot kustom (Prefix). |
| **IoT Simulation** | ✓ | Panel kontrol Admin untuk mengubah status sensor fisik (Available $\leftrightarrow$ Occupied) secara manual. |
| **Real-time Updates** | ✓ | Integrasi **Socket.IO** untuk sinkronisasi status slot di semua klien tanpa refresh halaman. |
| **Booking Logic** | ✓ | (Bonus) Sistem reservasi cerdas yang mencegah *double-booking* dan monopoli slot oleh satu user. |
| **Automation** | ✓ | (Bonus) **Cron Job** backend yang otomatis membatalkan booking jika user tidak *Check-in* dalam batas waktu (1 menit). |
| **UI/UX** | ✓ | Desain responsif dengan indikator visual (Traffic Light Stats, Progress Bar, & Countdown Timer). |

---

## Architecture & Design Decisions

Proyek ini dibangun dengan prinsip **Clean Architecture** dan **Separation of Concerns** untuk memastikan kode mudah dipelihara (*maintainable*) dan dikembangkan (*scalable*).

### Struktur Direktori Lengkap
Berikut adalah struktur file aktual dari proyek ini:

```bash
SMARTPARK-CASESTUDY/
├── package.json              # Root Configuration (Concurrently Script)
├── README.md                 # Project Documentation
│
├── backend/                  # Server-side Application
│   ├── config/
│   │   └── database.js       # MySQL Connection Pool
│   ├── controllers/          # Business Logic Layer
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   ├── booking.controller.js
│   │   └── user.controller.js
│   ├── database/
│   │   └── seed.js           # Database Seeder (Initial Data)
│   ├── middleware/           # Security Layer
│   │   ├── auth.js           # JWT Verification
│   │   └── role.js           # Role-based Access Control
│   ├── models/               # Data Access Layer (SQL Queries)
│   │   ├── ParkingLot.js
│   │   ├── ParkingSpot.js
│   │   └── User.js
│   ├── routes/               # API Endpoints
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   └── user.routes.js
│   ├── .env                  # Environment Variables (DB & JWT Secret)
│   ├── package.json          # Backend Dependencies
│   └── server.js             # Entry Point, Socket.IO & Cron Jobs
│
└── frontend/                 # Client-side Application
    ├── public/
    │   └── index.html        # HTML Entry Point
    ├── src/
    │   ├── components/forms/ # Reusable Forms
    │   │   ├── AuthForm.js
    │   │   └── LotForm.js
    │   ├── context/          # Global State Management
    │   │   └── AuthContext.js
    │   ├── pages/            # View / Page Logic
    │   │   ├── Admin/        # Admin Views (Dashboard, Management, IoT)
    │   │   ├── Auth/         # Login & Register Views
    │   │   └── User/         # User Views (List, Booking Detail)
    │   ├── services/         # API & Real-time Services
    │   │   ├── api.js        # Axios Instance
    │   │   └── socket.js     # Socket.IO Singleton Instance
    │   ├── App.js            # Main Component & Routing
    │   ├── index.css         # Global Styles
    │   └── index.js          # React DOM Render
    ├── .env.local            # Frontend Environment Variables
    └── package.json          # Frontend Dependencies
```

### Keputusan Desain (Design Patterns)

1.  **MVC (Model-View-Controller) pada Backend:**
    * **Model:** (`/models`) Menangani interaksi langsung dengan database MySQL (Raw SQL Queries).
    * **Controller:** (`/controllers`) Menangani logika bisnis, validasi input, dan respon HTTP.
    * **Routes:** (`/routes`) Hanya berfungsi sebagai pintu masuk (*routing*) tanpa logika bisnis.
    * *Alasan:* Memisahkan logika database, logika bisnis, dan routing agar kode terorganisir, mudah di-debug, dan pengujian terisolasi.

2.  **Service Layer Pattern pada Frontend:**
    * Semua logika pemanggilan API (`Axios`) dan WebSocket (`Socket.IO`) dipisah ke dalam folder `/services`. Komponen UI (`pages`) hanya memanggil fungsi abstraksi seperti `api.getLots()`.
    * *Alasan:* Jika endpoint URL Backend berubah, perubahan hanya perlu dilakukan di satu file (`api.js`), tidak perlu mencari di seluruh komponen UI.

3.  **Singleton Pattern untuk WebSocket:**
    * Koneksi Socket.IO diinisialisasi satu kali di `socket.js` dan diekspor (*export instance*) ke seluruh aplikasi.
    * *Alasan:* Mencegah *multiple connection* yang berlebihan (memory leak) dan memastikan data real-time tetap konsisten/tersinkronisasi di semua komponen.

4.  **Centralized State Management:**
    * Menggunakan **React Context API** (`AuthContext`) untuk menyimpan status Login User & Token JWT.
    * *Alasan:* Menghindari *Props Drilling* (melempar data user dari komponen paling atas ke bawah secara manual) yang membuat kode berantakan.

---

### Database Design

Aplikasi ini menggunakan basis data relasional (**MySQL**) yang dirancang untuk performa tinggi pada operasi *read/write* yang intensif (real-time updates).

#### Schema Overview (ERD)

Berdasarkan struktur aktual yang digunakan, berikut adalah definisi skema database:

##### 1. Tabel `users`
Menyimpan data otentikasi pengguna dan peran (Role-based access).

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | INT(11) | Primary Key. |
| `username` | VARCHAR(50) | Identitas unik pengguna. |
| `email` | VARCHAR(100) | Alamat email pengguna. |
| `password_hash` | VARCHAR(255) | Password yang telah dienkripsi (hashed). |
| `role` | ENUM | Pilihan: `'USER'`, `'ADMIN'`. |
| `created_at` | TIMESTAMP | Waktu pendaftaran. |

##### 2. Tabel `parking_lots`
Merepresentasikan entitas fisik gedung atau area parkir.

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | INT(11) | Primary Key. |
| `name` | VARCHAR(100) | Nama gedung (misal: "Grand Indonesia"). |
| `total_capacity` | INT(11) | Batas maksimum slot dalam gedung tersebut. |
| `created_at` | TIMESTAMP | Waktu pembuatan area. |

##### 3. Tabel `parking_spots` Tabel inti yang menyimpan status real-time setiap slot parkir (sensor).

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | INT(11) | Primary Key. |
| `lot_id` | INT(11) | Foreign Key ke tabel `parking_lots`. |
| `spot_number` | VARCHAR(10) | Label visual slot (misal: "A-1", "VIP-2"). |
| `status` | ENUM | Status sensor: `'AVAILABLE'`, `'OCCUPIED'`, `'RESERVED'`. |
| `user_id` | INT(11) | ID User yang sedang memegang slot (Booking/Parkir). |
| `booking_time` | DATETIME | *Timestamp* saat tombol booking ditekan (untuk logika Timer). |
| `updated_at` | TIMESTAMP | Waktu terakhir status berubah. |

#### Design Decisions (Keputusan Desain Database)

1.  **Direct State Mapping:**
    Status slot (`AVAILABLE`/`OCCUPIED`/`RESERVED`) disimpan langsung di tabel `parking_spots`, bukan di tabel transaksi terpisah.
    * *Alasan:* Aplikasi ini membutuhkan kecepatan baca (*Read Heavy*) untuk dashboard real-time. Melakukan query langsung ke satu tabel jauh lebih cepat daripada melakukan *Complex Joins* ke tabel riwayat transaksi setiap kali ada update via Socket.IO.

2.  **Embedded Booking Logic:**
    Kolom `booking_time` dan `user_id` ditanam langsung di tabel slot (`parking_spots`).
    * *Alasan:* Memudahkan implementasi fitur **Auto-Cancel**. *Cron Job* cukup memindai satu tabel untuk mencari slot yang `status = 'RESERVED'` dan `booking_time < NOW() - 1 MINUTE`, tanpa perlu mencocokkan ID dengan tabel lain.

3.  **Relasi Antar Tabel:**
    * `parking_lots` **(1) ↔ (N)** `parking_spots` (One-to-Many).
    * `users` **(1) ↔ (1)** `parking_spots` (Pada satu waktu, user hanya boleh memiliki 1 slot aktif untuk mencegah monopoli).

## API Design (RESTful)

Backend menyediakan API RESTful yang terstruktur dengan format respon JSON standar. Keamanan dijamin menggunakan **JWT Middleware** pada *protected routes*.

### Base URL: `http://localhost:5000/api`

#### 1. Authentication (`/auth`)
| Method | Endpoint | Access | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Mendaftarkan pengguna baru (Admin/User). |
| `POST` | `/auth/login` | Public | Otentikasi & menerima JWT Token. |

#### 2. Admin Operations (`/admin`)
*Memerlukan Token JWT dengan Role `ADMIN`.*

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/admin/lots` | Mengambil daftar gedung beserta **statistik real-time** (Count per status). |
| `POST` | `/admin/lots` | Membuat gedung baru & generate slot otomatis (Support Custom Prefix). |
| `PUT` | `/admin/lots/:id` | Mengupdate nama gedung. |
| `DELETE` | `/admin/lots/:id` | Menghapus gedung beserta seluruh slot di dalamnya (Cascade). |
| `PUT` | `/admin/spots/:id` | **IoT Simulation:** Mengubah status sensor slot (`AVAILABLE` ↔ `OCCUPIED`). |

#### 3. User Operations (`/lots`)
*Memerlukan Token JWT dengan Role `USER` (Kecuali GET).*

| Method | Endpoint | Access | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/lots` | Public | Mengambil daftar gedung dan ketersediaan slot (Public View). |
| `GET` | `/lots/:id` | Public | Mengambil detail denah slot satu gedung. |
| `POST` | `/lots/book` | User | **Booking Slot:** Mengubah status menjadi `RESERVED` & menyalakan Timer. |
| `POST` | `/lots/cancel` | User | **Cancel Booking:** Mengembalikan status menjadi `AVAILABLE`. |

### Real-time Events (Socket.IO)

Selain HTTP Request, sistem menggunakan WebSocket untuk komunikasi dua arah:

* **Event:** `spotUpdate`
* **Trigger:** Terjadi saat Admin mengubah status IoT, User melakukan Booking, atau Auto-Cancel aktif.
* **Payload:** Object JSON berisi data slot terbaru (`id`, `status`, `user_id`, `booking_time`).
* **Listener:** Semua Client (Admin Dashboard & User Device) mendengarkan event ini untuk update UI instan.

## Challenges & Solutions

Selama pengembangan sistem ini, terdapat beberapa tantangan teknis utama yang berhasil diselesaikan untuk memastikan integritas data dan pengalaman pengguna yang mulus.

### 1. The "Ghost Booking" Problem 
**Tantangan:**
Bagaimana menangani skenario di mana User melakukan booking slot (status berubah menjadi `RESERVED`) tetapi tidak pernah datang ke lokasi? Tanpa intervensi, slot tersebut akan terkunci selamanya dan tidak bisa digunakan oleh pelanggan lain, menyebabkan kerugian kapasitas.

**Solusi: The "Cinderella" Protocol (Automated Cron Job)**
Saya mengimplementasikan *background task scheduler* menggunakan `node-cron`.
* **Mekanisme:** Setiap 1 menit, "Satpam Digital" berjalan di server backend.
* **Logika:** Mencari semua slot dengan status `RESERVED` di mana `booking_time` sudah berlalu lebih dari batas waktu (misal: 1 menit).
* **Aksi:** Secara otomatis mereset status kembali ke `AVAILABLE`, menghapus `user_id`, dan memancarkan event Socket.IO agar tampilan Frontend kembali hijau seketika.

### 2. Handling Race Conditions (Anti-Double Booking) 
**Tantangan:**
Dalam sistem real-time, ada kemungkinan dua pengguna menekan tombol "Booking" pada slot yang sama secara bersamaan (dalam hitungan milidetik). Hal ini bisa menyebabkan satu slot dimiliki oleh dua user (inkonsistensi data).

**Solusi: Strict Backend Validation**
Frontend blocking saja tidak cukup. Saya menerapkan validasi berlapis di `booking.controller.js`:
1.  **Validasi Status:** Sebelum melakukan update query, sistem mengecek ulang apakah status slot di database *benar-benar* `AVAILABLE`.
2.  **Validasi Kepemilikan:** Sistem mengecek apakah User ID tersebut sudah memiliki booking aktif di slot lain (aturan *One User, One Slot*).
3.  **Atomic Update:** Transaksi database dilakukan hanya jika semua validasi lolos.

### 3. Real-time Latency Gap 
**Tantangan:**
Aplikasi manajemen parkir tradisional mengharuskan Admin me-refresh halaman untuk melihat apakah ada mobil masuk (booking baru). Latensi ini tidak dapat diterima untuk simulasi IoT.

**Solusi: Event-Driven Architecture (Socket.IO)**
Saya meninggalkan metode *HTTP Polling* (yang boros resource) dan beralih ke WebSocket.
* **Singleton Pattern:** Menggunakan satu *instance* Socket.IO yang digunakan bersama oleh semua controller.
* **Broadcast Strategy:** Segera setelah Database berhasil di-update (baik oleh User Booking, Admin IoT, atau Cron Job), server memancarkan event `spotUpdate` yang membawa *payload* data terbaru. UI di sisi klien bereaksi terhadap event ini tanpa perlu request ulang ke server.

---

## Installation & Configuration

Ikuti panduan lengkap di bawah ini untuk mengatur proyek di komputer lokal Anda.

### 1. Prasyarat (Prerequisites)
Pastikan software berikut sudah terinstall dan berjalan di komputer Anda:
* **Node.js** (Versi 14.x atau lebih baru). [Download disini](https://nodejs.org/).
* **MySQL Server** (Bisa menggunakan XAMPP, Laragon, atau MySQL Workbench). Pastikan service MySQL sudah **Running**.
* **Git** (Untuk mengunduh kode).

### 2. Clone & Install Dependencies
Kita akan mengunduh kode dan menginstal library yang dibutuhkan untuk Backend (Node.js) dan Frontend (React) sekaligus.

1.  Buka terminal (Git Bash / PowerShell / CMD).
2.  Jalankan perintah berikut:

```bash
# 1. Clone repository ini ke komputer Anda
git clone [https://github.com/username-anda/smartpark-casestudy.git](https://github.com/username-anda/smartpark-casestudy.git)

# 2. Masuk ke folder proyek
cd smartpark-casestudy

# 3. Install semua dependensi (Otomatis install untuk root, backend, dan frontend)
npm run install-all
```
> *Catatan: Jika perintah `npm run install-all` gagal, Anda bisa menginstall manual dengan masuk ke folder `backend` lalu ketik `npm install`, kemudian masuk ke folder `frontend` dan ketik `npm install`.*

### 3. Konfigurasi Environment Variables (.env)
Aplikasi membutuhkan file konfigurasi untuk bisa terhubung ke database. File ini bersifat rahasia sehingga tidak disertakan dalam download (gitignore).

1.  Masuk ke folder **`backend`**.
2.  Buat file baru bernama **`.env`** (tanpa nama depan, hanya ekstensi .env).
3.  Buka file tersebut dengan text editor dan salin kode berikut:

```env
# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=          # KOSONGKAN jika menggunakan XAMPP default. Jika ada password, tulis disini.
DB_NAME=smartpark_db

# Security Configuration
JWT_SECRET=rahasia_kunci_smartpark_dev_123
```
4.  Simpan file tersebut.

### 4. Setup Database (Automated Seeding)
Anda **TIDAK PERLU** mengimport file SQL secara manual. Proyek ini dilengkapi dengan script `seed.js` yang akan membangun struktur database dan mengisi data awal secara otomatis.

1.  Buka **phpMyAdmin** (`http://localhost/phpmyadmin`) atau Terminal MySQL.
2.  Buat database kosong baru dengan nama: `smartpark_db`.
3.  Kembali ke terminal (pastikan Anda berada di **root folder** `smartpark-casestudy`).
4.  Jalankan perintah "Magic" berikut:

```bash
node backend/database/seed.js
```

**Apa yang terjadi setelah perintah ini?**
* ✓ Script akan menghapus tabel lama (jika ada).
* ✓ Membuat tabel `users`, `parking_lots`, dan `parking_spots`.
* ✓ Membuat akun **Admin** dan **User** default (password sudah di-hash).
* ✓ Membuat Gedung "Mall Grand Indonesia" beserta slot parkirnya.
* ✓ Jika sukses, akan muncul pesan: *"SEEDING SELESAI! Database siap digunakan."*

### 5. Menjalankan Aplikasi
Sekarang semuanya sudah siap. Jalankan aplikasi dengan satu perintah:

```bash
# Pastikan Anda di root folder
npm start
```

Perintah ini akan menjalankan dua server sekaligus:
* **Frontend (React):** Otomatis terbuka di `http://localhost:3000`
* **Backend (API & Socket):** Berjalan di background pada `http://localhost:5000`

---

### Akun Default (Login Credentials)
Gunakan akun berikut untuk masuk ke aplikasi setelah proses seeding:

| Role | Email | Password | Akses Fitur |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@smartpark.com` | `admin123` | Dashboard, Manage Lots, IoT Simulation |
| **USER** | `user@smartpark.com` | `user123` | Booking Slot, View Maps |

---