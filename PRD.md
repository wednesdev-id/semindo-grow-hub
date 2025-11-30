# PRODUCT REQUIREMENT DOCUMENT (PRD) - SEMINDO
**Beyond Solutions for SMEs**

## 1. Overview
Semindo (Sinergi UMKM Indonesia) adalah platform konsultan dan enabler berbasis teknologi tinggi yang membantu UMKM di Indonesia melakukan akselerasi usaha melalui digitalisasi, pendampingan, pembiayaan, pelatihan, dan akses pasar.

Platform ini mencakup ekosistem lengkap mulai dari assessment, dashboard personal, LMS, konsultasi, pembiayaan, marketplace, hingga ekspor.

## 2. Purpose of the Product
Produk ini bertujuan untuk:
1.  Memberikan gambaran kondisi UMKM secara cepat dan akurat.
2.  Meningkatkan literasi digital dan manajemen usaha.
3.  Menghubungkan UMKM dengan modal, pasar, mentor, dan peluang ekspor.
4.  Membangun ekosistem kolaboratif antara UMKM, pemerintah, bank, marketplace, dan komunitas bisnis.
5.  Menjadi pusat data pertumbuhan UMKM di Indonesia.

## 3. Target User
### Primary
*   **UMKM (Mikro, Kecil, Menengah)**: Pengguna utama yang ingin mengembangkan bisnis.

### Secondary
*   **Konsultan & Mentor**: Profesional yang mendampingi UMKM.
*   **Bank/Fintech (Mitra Keuangan)**: Penyedia modal usaha.
*   **Marketplace & Buyer**: Mitra pemasaran dan ekspor.
*   **Pemerintah/Lembaga**: Pembuat kebijakan dan pemantau pertumbuhan ekonomi.
*   **Admin Semindo**: Pengelola operasional platform.

## 4. Core Features & Implementation Plan (By Menu Module)

### 4.1. Dashboard
**Goal**: Memberikan ringkasan eksekutif dan akses cepat ke fitur utama berdasarkan role user.

**Sub-Features:**
*   **Overview Sistem**: Ringkasan status usaha, notifikasi penting, dan shortcut.
*   **Aktivitas Terbaru**: Log aktivitas user terkini.
*   **Statistik Pengguna**: Grafik pertumbuhan user (untuk Admin) atau performa bisnis (untuk UMKM).
*   **Status Server**: Monitoring kesehatan sistem (untuk Admin).

**Implementation Plan:**
*   [ ] **Frontend**: Buat widget modular (Cards, Charts) yang bisa di-load dinamis berdasarkan role.
*   [ ] **Backend**: API `/dashboard/summary` yang mengembalikan data agregat.
*   [ ] **Database**: Query optimasi untuk analytics real-time.

### 4.2. User Management
**Goal**: Mengelola seluruh pengguna platform dengan kontrol akses berbasis peran (RBAC).

**Sub-Features:**
*   **Semua Pengguna**: List user dengan filter, search, dan pagination.
*   **Manajemen Role & Permission**: Konfigurasi role dinamis dan hak akses granular.
*   **Verifikasi User**: Workflow approval untuk user baru (KYC UMKM/Mentor).
*   **Activity Logs**: Audit trail aktivitas user untuk keamanan.

**Implementation Plan:**
*   [ ] **Database**: Tabel `users`, `roles`, `permissions`, `role_permissions`, `user_roles`.
*   [ ] **Backend**: Middleware `requirePermission`, API CRUD Users & Roles.
*   [ ] **Frontend**: Tabel data advanced (TanStack Table), Form modal untuk edit user/role.

### 4.3. UMKM Database
**Goal**: Sentralisasi data profil dan perkembangan UMKM.

**Sub-Features:**
*   **Daftar UMKM**: Direktori lengkap UMKM terdaftar.
*   **Segmentasi (Pemula/Madya/Utama)**: Kategorisasi otomatis berdasarkan omzet/aset.
*   **Region Mapping**: Visualisasi sebaran UMKM (Peta).
*   **Status Self-Assessment**: Hasil scoring kesiapan usaha (F1).
*   **Status Program**: Tracking keikutsertaan dalam program inkubasi.
*   **Histori Pendampingan**: Log sesi mentoring.
*   **Dokumen & Verifikasi**: Repositori dokumen legalitas (NIB, NPWP).

**Implementation Plan:**
*   [ ] **Database**: Tabel `umkm_profiles`, `assessments`, `documents`.
*   [ ] **Backend**: API untuk upload dokumen, scoring engine assessment.
*   [ ] **Frontend**: Form wizard untuk profil, Peta interaktif (Leaflet/Mapbox).

### 4.4. Mentor Management
**Goal**: Mengelola jaringan konsultan dan mentor.

**Sub-Features:**
*   **Daftar Mentor**: Direktori profil mentor dan keahlian.
*   **Bidang Keahlian**: Kategori spesialisasi (Pemasaran, Keuangan, Legal, dll).
*   **Penugasan Mentor**: Matching mentor dengan UMKM.
*   **Performa Mentor**: Rating dan ulasan dari UMKM.
*   **Jadwal Mentoring**: Kalender ketersediaan.

**Implementation Plan:**
*   [ ] **Database**: Tabel `mentors`, `mentor_expertise`, `mentoring_sessions`.
*   [ ] **Backend**: Algoritma matching mentor-UMKM.
*   [ ] **Frontend**: Profil card mentor, Kalender booking (React Big Calendar).

### 4.5. Program Management
**Goal**: Mengelola program inkubasi dan pelatihan terstruktur.

**Sub-Features:**
*   **Daftar Program**: Katalog program aktif.
*   **Kurikulum & Materi**: Silabus program.
*   **Batch & Peserta**: Manajemen angkatan dan peserta.
*   **Pendaftaran Program**: Form registrasi program.
*   **Sertifikat Program**: Generator sertifikat kelulusan.

**Implementation Plan:**
*   [ ] **Database**: Tabel `programs`, `batches`, `program_participants`.
*   [ ] **Backend**: Workflow pendaftaran dan seleksi peserta.
*   [ ] **Frontend**: Landing page program, Dashboard progress peserta.

### 4.6. LMS Manager (Learning Management System)
**Goal**: Platform edukasi mandiri (F3).

**Sub-Features:**
*   **Kursus & Materi**: Manajemen konten video/teks.
*   **Modul & Kuis**: Struktur pembelajaran dan evaluasi.
*   **Progress Belajar**: Tracking penyelesaian materi.
*   **Sertifikat Kompetensi**: Penghargaan otomatis setelah lulus kuis.

**Implementation Plan:**
*   [ ] **Database**: Tabel `courses`, `modules`, `lessons`, `quizzes`, `user_progress`.
*   [ ] **Backend**: Streaming video support, Grading engine untuk kuis.
*   [ ] **Frontend**: Video player, Quiz interface, PDF Certificate generator.

### 4.7. Marketplace Manager
**Goal**: Fasilitasi pemasaran produk UMKM (F6).

**Sub-Features:**
*   **Produk UMKM**: Katalog produk global.
*   **Pesanan Masuk**: Manajemen order.
*   **Pembayaran**: Integrasi payment gateway.
*   **Pengiriman**: Tracking logistik.
*   **Ulasan Produk**: Feedback customer.

**Implementation Plan:**
*   [ ] **Database**: Tabel `products`, `orders`, `order_items`, `payments`.
*   [ ] **Backend**: Integrasi Payment Gateway (Midtrans/Xendit), RajaOngkir API.
*   [ ] **Frontend**: Product Grid, Cart, Checkout flow.

### 4.8. Financing Manager
**Goal**: Hub akses permodalan (F5).

**Sub-Features:**
*   **Mitra Pembiayaan**: Daftar bank/fintech partner.
*   **Pengajuan Pinjaman**: Form aplikasi kredit.
*   **Status Pengajuan**: Tracking approval workflow.
*   **Laporan Penyaluran**: Rekapitulasi dana tersalurkan.

**Implementation Plan:**
*   [ ] **Database**: Tabel `financing_partners`, `loan_applications`.
*   [ ] **Backend**: Credit scoring engine (AI-based), Secure document handling.
*   [ ] **Frontend**: Simulasi kredit, Dashboard status pengajuan.

### 4.9. Export Hub Manager
**Goal**: Fasilitasi akses pasar global (F7).

**Sub-Features:**
*   **Persyaratan Ekspor**: Database regulasi per negara.
*   **Negara Tujuan**: Profil pasar potensial.
*   **Dokumen Ekspor**: Generator invoice/packing list standar ekspor.
*   **Logistik Ekspor**: Integrasi dengan forwarder.

**Implementation Plan:**
*   [ ] **Database**: Tabel `export_requirements`, `target_countries`.
*   [ ] **Backend**: Matching engine produk vs kebutuhan negara.
*   [ ] **Frontend**: Wizard kesiapan ekspor, Kalkulator biaya logistik.

### 4.10. Consultation Management
**Goal**: Platform konsultasi on-demand (F4).

**Sub-Features:**
*   **Jadwal Konsultasi**: Booking slot waktu.
*   **Chat & Video Call**: Komunikasi real-time.
*   **Catatan Konsultasi**: Resume hasil sesi.
*   **Feedback & Rating**: Evaluasi kepuasan.

**Implementation Plan:**
*   [ ] **Database**: Tabel `consultation_slots`, `chat_messages`.
*   [ ] **Backend**: WebSocket untuk chat, WebRTC/Zoom API untuk video.
*   [ ] **Frontend**: Chat UI, Video conference integration.

### 4.11. Community Platform Manager
**Goal**: Forum diskusi dan jejaring (F8).

**Sub-Features:**
*   **Forum Diskusi**: Thread per topik.
*   **Event & Webinar**: Kalender kegiatan komunitas.
*   **Berita & Artikel**: Konten edukasi/berita terkini.
*   **Grup Komunitas**: Sub-grup berdasarkan minat/lokasi.

**Implementation Plan:**
*   [ ] **Database**: Tabel `forum_threads`, `posts`, `events`.
*   [ ] **Backend**: Moderation tools, Notification system.
*   [ ] **Frontend**: Forum layout, Event calendar registration.

### 4.12. Analytics & Reporting
**Goal**: Business Intelligence untuk monitoring ekosistem (F9).

**Sub-Features:**
*   **UMKM Analytics**: Demografi dan pertumbuhan UMKM.
*   **Program Analytics**: Efektivitas program inkubasi.
*   **LMS Analytics**: Tingkat partisipasi pembelajaran.
*   **Mentoring Analytics**: Aktivitas konsultasi.
*   **Financing Analytics**: Penyaluran modal.
*   **Marketplace Analytics**: Transaksi penjualan.
*   **Export Analytics**: Volume perdagangan ekspor.
*   **KPI Dashboard**: Monitoring target utama platform.
*   **Data Visualization**: Grafik interaktif.

**Implementation Plan:**
*   [ ] **Database**: Data warehouse / Read replicas untuk query berat.
*   [ ] **Backend**: Aggregation jobs (Cron), Export to Excel/PDF.
*   [ ] **Frontend**: Recharts/ApexCharts, Filter periode & dimensi.

### 4.13. System Settings
**Goal**: Konfigurasi global platform.

**Sub-Features:**
*   **Pengaturan Umum**: Nama situs, logo, kontak.
*   **Tampilan & Branding**: Tema warna, layout.
*   **Notifikasi**: Template email/WA.
*   **API Keys**: Manajemen akses pihak ketiga.
*   **Integrasi Pihak Ketiga**: Konfigurasi payment/shipping gateway.
*   **Backup & Restore**: Manajemen data cadangan.
*   **Environment Variables**: Config server.

**Implementation Plan:**
*   [ ] **Database**: Tabel `settings`.
*   [ ] **Backend**: Caching configuration (Redis).
*   [ ] **Frontend**: Form settings dengan preview live.

### 4.14. Logs & Security
**Goal**: Monitoring keamanan dan audit sistem.

**Sub-Features:**
*   **Login History**: Catatan akses user.
*   **Activity Logs**: Audit trail perubahan data.
*   **Error Logs**: Monitoring bug sistem.
*   **Security Audit**: Laporan kerentanan.
*   **Firewall & IP Block**: Kontrol akses jaringan.
*   **API Access Logs**: Monitoring traffic API.
*   **Backup Logs**: Status backup database.

**Implementation Plan:**
*   [ ] **Database**: Tabel `audit_logs`, `error_logs`.
*   [ ] **Backend**: Middleware logger (Winston/Morgan), Rate limiting.
*   [ ] **Frontend**: Log viewer dengan filter & search.

### 4.15. Tools
**Goal**: Utilitas bantu untuk admin dan developer.

**Sub-Features:**
*   **Import / Export Data**: Migrasi data massal (CSV/Excel).
*   **Data Cleaner**: Hapus data sampah/duplikat.
*   **Bulk Editor**: Edit banyak data sekaligus.
*   **Sandbox Mode**: Mode testing tanpa efek ke production.
*   **Cache Manager**: Clear/view system cache.

**Implementation Plan:**
*   [ ] **Backend**: Job queue (BullMQ) untuk proses berat.
*   [ ] **Frontend**: UI progress bar untuk long-running tasks.

## 5. Technical Architecture
*   **Frontend**: React.js (Vite), Tailwind CSS, Shadcn UI.
*   **Backend**: Node.js (Express/NestJS), Prisma ORM.
*   **Database**: PostgreSQL.
*   **Authentication**: JWT, OAuth2.
*   **Infrastructure**: Docker, Nginx.

## 6. Security Requirements
1.  **Data Encryption**: AES-256 untuk data sensitif (PII).
2.  **Transmission Security**: SSL/TLS (HTTPS) wajib.
3.  **Access Control**: Strict RBAC (Role-Based Access Control).
4.  **Audit Trail**: Mencatat *who, what, when* untuk setiap aksi write/delete.
5.  **Input Validation**: Sanitasi semua input untuk mencegah SQL Injection & XSS.
