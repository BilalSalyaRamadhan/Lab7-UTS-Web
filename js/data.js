// Data dummy (pengganti database) dalam format Array JSON
const dataPengguna = [
  { nama: "Budi Santoso", email: "budi@mail.com", password: "123456" },
  { nama: "Sari Dewi", email: "sari@mail.com", password: "abcdef" }
];

const dataKatalogBuku = [
  { kode: "BK001", judul: "Pemrograman Web Dasar", kategori: "Teknologi", harga: 85000, stok: 24 },
  { kode: "BK002", judul: "Logika dan Algoritma", kategori: "Teknologi", harga: 72000, stok: 15 },
  { kode: "BK003", judul: "Laskar Pelangi", kategori: "Novel", harga: 69000, stok: 40 },
  { kode: "BK004", judul: "Bumi Manusia", kategori: "Novel", harga: 98000, stok: 8 },
  { kode: "BK005", judul: "Pengantar Ekonomi Mikro", kategori: "Ekonomi", harga: 91000, stok: 12 }
];

const dataTracking = [
  { noDO: "DO2026001", nama: "Budi Santoso", ekspedisi: "JNE", tanggalKirim: "2026-10-28", paket: "Reguler", total: 154000, status: 3 },
  { noDO: "DO2026002", nama: "Sari Dewi", ekspedisi: "SiCepat", tanggalKirim: "2026-10-30", paket: "Express", total: 98000, status: 2 },
  { noDO: "DO2026003", nama: "Andi Wijaya", ekspedisi: "J&T", tanggalKirim: "2026-11-01", paket: "Reguler", total: 240000, status: 1 }
];

// 0 = Diproses, 1 = Dikemas, 2 = Dikirim, 3 = Tiba
const tahapPengiriman = ["Diproses", "Dikemas", "Dikirim", "Tiba di tujuan"];