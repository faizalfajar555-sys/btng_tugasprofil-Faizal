const API = "https://api-web.dnccudinus.org/api/mobil";
const WA_NUMBER = "6281245123456"; // placeholder, ganti dengan nomor WhatsApp asli (format 62...)
const NO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23dde2e7'/%3E%3Ctext x='50%25' y='50%25' fill='%236b7785' font-family='sans-serif' font-size='28' text-anchor='middle'%3EFoto tidak tersedia%3C/text%3E%3C/svg%3E";

const $ = (s) => document.querySelector(s);
const grid = $("#grid"), info = $("#info"), form = $("#filters"), modal = $("#modal");
const rupiah = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const isSold = (c) => c.status !== "tersedia";

let cars = [];

async function load() {
  grid.innerHTML = '<div class="card sk"></div>'.repeat(6);
  info.textContent = "";
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error(json.message || "Format data tidak sesuai");
    cars = json.data;
    fillOptions();
    renderHero();
    render();
  } catch (err) {
    console.error(err);
    $("#heroSub").textContent = "Pilih, bandingkan, lalu hubungi kami lewat WhatsApp.";
    grid.innerHTML = '<div class="state"><p>Data mobil gagal dimuat. Periksa koneksi internet, lalu coba lagi.</p><button class="btn" id="retry" type="button">Coba lagi</button></div>';
  }
}

function fillOptions() {
  for (const key of ["brand", "transmisi", "bahan_bakar"]) {
    const select = form.elements[key];
    const values = [...new Set(cars.map((c) => c[key]).filter(Boolean))].sort();
    select.insertAdjacentHTML("beforeend", values.map((v) => `<option>${esc(v)}</option>`).join(""));
  }
}

function renderHero() {
  const available = cars.filter((c) => !isSold(c));
  const brands = new Set(cars.map((c) => c.brand)).size;
  $("#heroSub").textContent = `${available.length} unit tersedia dari ${brands} merek. Pilih, bandingkan, lalu hubungi kami lewat WhatsApp.`;
  const f = available[0];
  if (!f) return;
  const fig = $("#heroImg");
  fig.querySelector("img").src = f.foto;
  fig.querySelector("img").alt = f.nama;
  fig.querySelector("figcaption").innerHTML = `<span>${esc(f.nama)}</span><span>${rupiah(f.harga)}</span>`;
  fig.hidden = false;
  $("#heroBtn").dataset.id = f.id;
  $("#heroBtn").hidden = false;
}

function filtered() {
  const f = new FormData(form);
  const q = (f.get("q") || "").trim().toLowerCase();
  const sorters = {
    baru: (a, b) => b.id - a.id,
    murah: (a, b) => a.harga - b.harga,
    mahal: (a, b) => b.harga - a.harga,
    tahun: (a, b) => b.tahun - a.tahun,
  };
  return cars
    .filter((c) =>
      (!q || `${c.nama} ${c.brand}`.toLowerCase().includes(q)) &&
      (!f.get("brand") || c.brand === f.get("brand")) &&
      (!f.get("transmisi") || c.transmisi === f.get("transmisi")) &&
      (!f.get("bahan_bakar") || c.bahan_bakar === f.get("bahan_bakar")) &&
      (!f.get("tersedia") || !isSold(c)))
    .sort(sorters[f.get("urut")] || sorters.baru);
}

const card = (c) => `
  <article class="card${isSold(c) ? " is-sold" : ""}" data-id="${c.id}">
    <div class="photo">
      <img src="${esc(c.foto)}" alt="${esc(c.nama)}" loading="lazy">
      <span class="badge">${isSold(c) ? "Terjual" : "Tersedia"}</span>
    </div>
    <div class="body">
      <p class="brand">${esc(c.brand)}</p>
      <h3>${esc(c.nama)}</h3>
      <ul class="specs"><li>${esc(c.tahun)}</li><li>${esc(c.transmisi)}</li><li>${esc(c.bahan_bakar)}</li></ul>
      <p class="price">${rupiah(c.harga)}</p>
      <button class="btn ghost" type="button">Lihat detail</button>
    </div>
  </article>`;

function render() {
  const list = filtered();
  info.textContent = `Menampilkan ${list.length} dari ${cars.length} mobil`;
  grid.innerHTML = list.length
    ? list.map(card).join("")
    : '<div class="state"><p>Tidak ada mobil yang cocok dengan filter ini.</p><button class="btn" id="reset" type="button">Reset filter</button></div>';
}

function openModal(id) {
  const c = cars.find((x) => String(x.id) === String(id));
  if (!c) return;
  const text = encodeURIComponent(`Halo, saya tertarik dengan ${c.nama} (${c.tahun}) seharga ${rupiah(c.harga)}. Apakah masih tersedia?`);
  modal.innerHTML = `
    <button class="close" type="button" aria-label="Tutup">&times;</button>
    <img class="photo-m" src="${esc(c.foto)}" alt="${esc(c.nama)}">
    <div class="m-body">
      <p class="brand">${esc(c.brand)}</p>
      <h2>${esc(c.nama)}</h2>
      <p class="price">${rupiah(c.harga)}</p>
      <dl>
        <div><dt>Tahun</dt><dd>${esc(c.tahun)}</dd></div>
        <div><dt>Transmisi</dt><dd>${esc(c.transmisi)}</dd></div>
        <div><dt>Bahan bakar</dt><dd>${esc(c.bahan_bakar)}</dd></div>
        <div><dt>Status</dt><dd>${isSold(c) ? "Terjual" : "Tersedia"}</dd></div>
      </dl>
      ${isSold(c)
        ? '<button class="btn" type="button" disabled>Unit sudah terjual</button>'
        : `<a class="btn" href="https://wa.me/${WA_NUMBER}?text=${text}" target="_blank" rel="noopener">Tanya via WhatsApp</a>`}
    </div>`;
  modal.showModal();
}

// event
form.addEventListener("input", render);
form.addEventListener("submit", (e) => e.preventDefault());
form.addEventListener("reset", () => setTimeout(render)); // tunggu nilai form kembali ke awal

grid.addEventListener("click", (e) => {
  if (e.target.closest("#retry")) return load();
  if (e.target.closest("#reset")) return form.reset();
  const el = e.target.closest("[data-id]");
  if (el) openModal(el.dataset.id);
});

$("#heroBtn").addEventListener("click", (e) => openModal(e.currentTarget.dataset.id));
modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest(".close")) modal.close(); });

// foto gagal dimuat: ganti sekali dengan gambar cadangan
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName === "IMG" && !img.dataset.failed) { img.dataset.failed = "1"; img.src = NO_IMG; }
}, true);

$("#waTop").href = `https://wa.me/${WA_NUMBER}`;
load();

(async () => {
  const nav = document.querySelector('header:not(.sl-hero), nav');
  const grid = document.getElementById('sl-grid');
  const filter = document.getElementById('sl-filter');
  const rp = n => 'Rp ' + n.toLocaleString('id-ID');
  let data = [];

  // Navbar berubah saat scroll
  addEventListener('scroll', () => nav && nav.classList.toggle('scrolled', scrollY > 40), { passive: true });

  // Animasi muncul saat scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
  }), { threshold: .12 });

  // Efek 3D tilt pada kartu
  document.addEventListener('mousemove', e => {
    const c = e.target.closest('.sl-card'); if (!c) return;
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
  });
  document.addEventListener('mouseout', e => {
    const c = e.target.closest('.sl-card');
    if (c && !c.contains(e.relatedTarget)) c.style.transform = '';
  });

  // Tampilkan kartu dari API
  const render = brand => {
    grid.innerHTML = data.filter(m => brand === 'Semua' || m.brand === brand).map(m => `
      <article class="sl-card reveal ${m.status === 'sold' ? 'sold' : ''}">
        <div class="sl-img">
          <img src="${m.foto}" alt="${m.nama}" loading="lazy">
          <span class="sl-badge">${m.status === 'sold' ? 'Terjual' : 'Tersedia'}</span>
        </div>
        <div class="sl-body">
          <small>${m.brand} • ${m.tahun}</small>
          <h3>${m.nama}</h3>
          <p>${m.transmisi} • ${m.bahan_bakar}</p>
          <strong>${rp(m.harga)}</strong>
        </div>
      </article>`).join('');
    grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
  };

  if (!grid) return;
  try {
    const res = await fetch('https://api-web.dnccudinus.org/api/mobil');
    data = (await res.json()).data;
    const brands = ['Semua', ...new Set(data.map(m => m.brand))];
    filter.innerHTML = brands.map((b, i) => `<button class="sl-btn${i ? '' : ' active'}">${b}</button>`).join('');
    filter.onclick = e => {
      if (e.target.tagName !== 'BUTTON') return;
      filter.querySelector('.active').classList.remove('active');
      e.target.classList.add('active');
      render(e.target.textContent);
    };
    render('Semua');
  } catch {
    grid.innerHTML = '<p>Gagal memuat data mobil.</p>';
  }
})();