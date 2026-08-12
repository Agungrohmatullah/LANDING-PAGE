const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const menuFilePath = path.join(__dirname, '../data/menu.json');
const testimonialsFilePath = path.join(__dirname, '../data/testimonials.json');
const reservationsFilePath = path.join(__dirname, '../data/reservations.json');

// Helper function to read JSON files
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Helper function to write JSON files
const writeJsonFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// GET /api/menu
router.get('/menu', (req, res) => {
  const menu = readJsonFile(menuFilePath);
  res.json({ success: true, data: menu });
});

// GET /api/testimonials
router.get('/testimonials', (req, res) => {
  const testimonials = readJsonFile(testimonialsFilePath);
  res.json({ success: true, data: testimonials });
});

// POST /api/reservations
router.post('/reservations', (req, res) => {
  const { nama, email, telepon, tanggal, waktu, jumlah_tamu, catatan } = req.body;

  // Validasi field wajib
  if (!nama || !email || !telepon || !tanggal || !waktu || !jumlah_tamu) {
    return res.status(400).json({ success: false, error: 'Semua field wajib harus diisi!' });
  }

  // Validasi format email sederhana
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Format email tidak valid!' });
  }

  // Validasi telepon numeric
  const phoneRegex = /^[0-9+\-\s]+$/;
  if (!phoneRegex.test(telepon)) {
    return res.status(400).json({ success: false, error: 'Nomor telepon hanya boleh berisi angka dan karakter valid!' });
  }

  // Validasi tanggal tidak boleh masa lalu
  const reservationDate = new Date(tanggal);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (reservationDate < today) {
    return res.status(400).json({ success: false, error: 'Tanggal reservasi tidak boleh di masa lalu!' });
  }

  const reservations = readJsonFile(reservationsFilePath);

  const newReservation = {
    id: 'RES-' + Date.now(),
    nama,
    email,
    telepon,
    tanggal,
    waktu,
    jumlah_tamu: parseInt(jumlah_tamu, 10),
    catatan: catatan || '',
    timestamp: new Date().toISOString()
  };

  reservations.push(newReservation);
  writeJsonFile(reservationsFilePath, reservations);

  res.status(201).json({
    success: true,
    message: 'Reservasi berhasil disimpan!',
    data: newReservation
  });
});

module.exports = router;