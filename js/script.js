const rupiah = n => "Rp " + Number(n).toLocaleString("id-ID");
const ambil = (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
const simpan = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const halaman = document.body.dataset.page;

// Proteksi halaman: wajib login kecuali halaman login
const user = JSON.parse(localStorage.getItem("user") || "null");
const perluLogin = halaman !== "login" && !user;
if (perluLogin) location.replace("index.html");

function logout() { localStorage.removeItem("user"); location.href = "index.html"; }
function bukaModal(id) { document.getElementById(id).classList.add("show"); }
function tutupModal(id) { document.getElementById(id).classList.remove("show"); }

/* ---------- LOGIN ---------- */
function initLogin() {
  const semua = () => dataPengguna.concat(ambil("penggunaBaru", []));
  document.getElementById("formLogin").addEventListener("submit", e => {
    e.preventDefault();
    const email = e.target.email.value.trim(), pw = e.target.password.value;
    const cocok = semua().find(u => u.email === email && u.password === pw);
    if (!cocok) { alert("Email/password yang anda masukkan salah"); return; }
    localStorage.setItem("user", JSON.stringify(cocok));
    location.href = "dashboard.html";
  });
  document.getElementById("formLupa").addEventListener("submit", e => {
    e.preventDefault();
    alert("Tautan reset password dikirim ke " + e.target.email.value);
    tutupModal("modalLupa");
  });
  document.getElementById("formDaftar").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target;
    if (semua().some(u => u.email === f.email.value)) { alert("Email sudah terdaftar."); return; }
    const baru = ambil("penggunaBaru", []);
    baru.push({ nama: f.nama.value, email: f.email.value, password: f.password.value });
    simpan("penggunaBaru", baru);
    alert("Pendaftaran berhasil. Silakan login.");
    f.reset(); tutupModal("modalDaftar");
  });
}

/* ---------- DASHBOARD ---------- */
function initDashboard() {
  const j = new Date().getHours();
  const sapa = j < 11 ? "pagi" : j < 15 ? "siang" : j < 18 ? "sore" : "malam";
  document.getElementById("greeting").textContent = `Selamat ${sapa}, ${user.nama}`;
}

/* ---------- STOK ---------- */
function barisStok(b) {
  const tr = document.createElement("tr");
  [b.kode, b.judul, b.kategori, rupiah(b.harga), b.stok].forEach(v => {
    const td = document.createElement("td"); td.textContent = v; tr.appendChild(td);
  });
  const td = document.createElement("td");
  const btn = document.createElement("button");
  btn.className = "btn small gold"; btn.textContent = "Tambah ke pesanan";
  btn.onclick = () => {
    const k = ambil("keranjang", []);
    const ada = k.find(i => i.kode === b.kode);
    ada ? ada.qty++ : k.push({ kode: b.kode, judul: b.judul, harga: b.harga, qty: 1 });
    simpan("keranjang", k);
    alert(`"${b.judul}" ditambahkan ke pesanan.`);
  };
  td.appendChild(btn); tr.appendChild(td);
  return tr;
}
function initStok() {
  const tbody = document.getElementById("tbodyStok");
  const katalog = ambil("katalog", dataKatalogBuku);
  katalog.forEach(b => tbody.appendChild(barisStok(b)));
  document.getElementById("formStok").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target;
    if (katalog.some(x => x.kode === f.kode.value.trim())) { alert("Kode buku sudah ada."); return; }
    const b = { kode: f.kode.value.trim(), judul: f.judul.value, kategori: f.kategori.value, harga: +f.harga.value, stok: +f.stok.value };
    katalog.push(b);
    simpan("katalog", katalog);
    tbody.appendChild(barisStok(b));
    f.reset();
  });
}

/* ---------- CHECKOUT ---------- */
function initCheckout() {
  const katalog = ambil("katalog", dataKatalogBuku);
  const pilih = document.getElementById("pilihBuku");
  katalog.forEach(b => pilih.add(new Option(`${b.judul} (${rupiah(b.harga)})`, b.kode)));
  let keranjang = ambil("keranjang", []);
  const hitung = () => keranjang.reduce((s, i) => s + i.harga * i.qty, 0);

  function gambar() {
    const tbody = document.getElementById("tbodyKeranjang");
    tbody.innerHTML = "";
    if (!keranjang.length) tbody.innerHTML = '<tr><td colspan="5">Pesanan masih kosong. Pilih buku di atas.</td></tr>';
    keranjang.forEach((i, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${i.judul}</td><td>${rupiah(i.harga)}</td>
        <td><input type="number" min="1" value="${i.qty}" aria-label="Jumlah ${i.judul}"></td>
        <td>${rupiah(i.harga * i.qty)}</td>
        <td><button class="btn small danger">Hapus</button></td>`;
      tr.querySelector("input").onchange = e => { i.qty = Math.max(1, +e.target.value); simpan("keranjang", keranjang); gambar(); };
      tr.querySelector("button").onclick = () => { keranjang.splice(idx, 1); simpan("keranjang", keranjang); gambar(); };
      tbody.appendChild(tr);
    });
    document.getElementById("totalBayar").textContent = "Total: " + rupiah(hitung());
  }

  document.getElementById("btnTambah").onclick = () => {
    const b = katalog.find(x => x.kode === pilih.value);
    if (!b) return;
    const ada = keranjang.find(i => i.kode === b.kode);
    ada ? ada.qty++ : keranjang.push({ kode: b.kode, judul: b.judul, harga: b.harga, qty: 1 });
    simpan("keranjang", keranjang); gambar();
  };

  document.getElementById("formPesan").addEventListener("submit", e => {
    e.preventDefault();
    if (!keranjang.length) { alert("Tambahkan minimal satu buku ke pesanan."); return; }
    const f = e.target;
    const history = ambil("history", []);
    const noDO = "DO" + Date.now().toString().slice(-7);
    history.push({
      noDO, nama: f.nama.value, alamat: f.alamat.value, ekspedisi: f.ekspedisi.value,
      paket: f.paket.value, pembayaran: f.pembayaran.value, tanggalKirim: new Date().toISOString().slice(0, 10),
      total: hitung(), status: 0, item: keranjang.map(i => `${i.judul} x${i.qty}`).join(", ")
    });
    simpan("history", history);
    keranjang = []; simpan("keranjang", keranjang);
    alert("Pesanan berhasil dibuat. Nomor Delivery Order Anda: " + noDO);
    f.reset(); document.getElementById("namaPemesan").value = user.nama;
    gambar(); gambarHistory();
  });

  function gambarHistory() {
    const tbody = document.getElementById("tbodyHistory");
    const h = ambil("history", []);
    tbody.innerHTML = h.length ? "" : '<tr><td colspan="5">Belum ada transaksi.</td></tr>';
    h.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${t.noDO}</td><td>${t.tanggalKirim}</td><td>${t.item}</td><td>${t.pembayaran}</td><td>${rupiah(t.total)}</td>`;
      tbody.appendChild(tr);
    });
  }
  document.getElementById("namaPemesan").value = user.nama;
  gambar(); gambarHistory();
}

/* ---------- TRACKING ---------- */
function initTracking() {
  document.getElementById("formCari").addEventListener("submit", e => {
    e.preventDefault();
    const no = e.target.noDO.value.trim().toUpperCase();
    const data = dataTracking.concat(ambil("history", [])).find(d => d.noDO === no);
    const hasil = document.getElementById("hasil");
    if (!data) { hasil.innerHTML = `<p class="msg">Nomor DO "${no}" tidak ditemukan. Coba DO2026001.</p>`; return; }
    const langkah = tahapPengiriman.map((t, i) =>
      `<div class="step ${i <= data.status ? "done" : ""}"><i>${i <= data.status ? "✓" : i + 1}</i>${t}</div>`).join("");
    const persen = (data.status / (tahapPengiriman.length - 1)) * 100;
    hasil.innerHTML = `
      <h2>${data.nama}</h2>
      <div class="steps">${langkah}</div>
      <div class="progress" role="progressbar" aria-valuenow="${persen}" aria-valuemin="0" aria-valuemax="100"><div style="width:${persen}%"></div></div>
      <p><strong>Status: ${tahapPengiriman[data.status]}</strong></p>
      <table>
        <tr><th>Ekspedisi</th><td>${data.ekspedisi}</td></tr>
        <tr><th>Tanggal kirim</th><td>${data.tanggalKirim}</td></tr>
        <tr><th>Jenis paket</th><td>${data.paket}</td></tr>
        <tr><th>Total pembayaran</th><td>${rupiah(data.total)}</td></tr>
      </table>`;
  });
}

/* ---------- JALANKAN ---------- */
const inisialisasi = { login: initLogin, dashboard: initDashboard, stok: initStok, checkout: initCheckout, tracking: initTracking };
if (!perluLogin) {
  if (inisialisasi[halaman]) inisialisasi[halaman]();
  else console.error('data-page tidak dikenal: "' + halaman + '"');
}