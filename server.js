// Import library yang dibutuhkan
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

// Inisialisasi aplikasi Express
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Koneksi ke database SQLite
const db = new sqlite3.Database('./pjok_kelas5.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("❌ Error saat koneksi ke database:", err.message);
    } else {
        console.log('✅ Terhubung ke database SQLite.');
        // Buat tabel jika belum ada -> TAMBAHKAN kolom class_name
        db.run(`CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            class_name TEXT NOT NULL, 
            score INTEGER NOT NULL,
            correctAnswers INTEGER NOT NULL,
            totalQuestions INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("❌ Error saat membuat tabel:", err.message);
            }
        });
    }
});

// === API ENDPOINTS ===

// 1. Endpoint untuk MENYIMPAN hasil kuis -> TAMBAHKAN penerimaan className
app.post('/api/submit', (req, res) => {
    const { name, className, score, correctAnswers, totalQuestions } = req.body;

    // Validasi input
    if (!name || !className || score === undefined || correctAnswers === undefined || totalQuestions === undefined) {
        return res.status(400).json({ error: 'Data yang dikirim tidak lengkap.' });
    }

    const sql = `INSERT INTO history (name, class_name, score, correctAnswers, totalQuestions) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, className, score, correctAnswers, totalQuestions], function(err) {
        if (err) {
            console.error("❌ Error saat menyimpan data:", err.message);
            return res.status(500).json({ error: 'Gagal menyimpan data ke database.' });
        }
        res.status(201).json({ message: 'Hasil berhasil disimpan!', id: this.lastID });
    });
});

// 2. Endpoint untuk MENGAMBIL semua riwayat -> TAMBAHKAN pengambilan class_name
app.get('/api/history', (req, res) => {
    const sql = `SELECT id, name, class_name, score, correctAnswers, totalQuestions, strftime('%d-%m-%Y %H:%M', timestamp, 'localtime') as timestamp FROM history ORDER BY id DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("❌ Error saat mengambil data:", err.message);
            return res.status(500).json({ error: 'Gagal mengambil riwayat dari database.' });
        }
        res.json({
            message: 'Riwayat berhasil diambil',
            data: rows
        });
    });
});

// Menjalankan server
app.listen(port, () => {
    console.log(`🚀 Server berjalan di http://localhost:${port}`);
    console.log('Sekarang, buka file index.html di browser Anda.');
});