const API = 'https://api-web.dnccudinus.org/api/mobil';
const $ = id => document.getElementById(id);
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data = [];
/* Kontak (nilai contoh, ganti nanti) */
const WA_NOMOR = '62800000000';       // format: 62 + nomor tanpa 0 di depan
const EMAIL = 'MF Showroom@gmail.com';
const waLink = teks => `https://wa.me/${WA_NOMOR}?text=${encodeURIComponent(teks)}`;

$('kEmail').href = `mailto:${EMAIL}?subject=${encodeURIComponent('Tanya unit - MF Showroom')}`;
$('kWa').href = waLink('Halo MF Showroom, saya ingin bertanya tentang unit mobil.');

/* Navbar */
addEventListener('scroll', () => $('nav').classList.toggle('scrolled', scrollY > 40), { passive: true });

/* Animasi muncul saat scroll */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
}), { threshold: .12 });

/* Efek miring 3D pada kartu */
document.addEventListener('mousemove', e => {
  const c = e.target.closest('.card'); if (!c) return;
  const r = c.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  c.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
});
document.addEventListener('mouseout', e => {
  const c = e.target.closest('.card');
  if (c && !c.contains(e.relatedTarget)) c.style.transform = '';
});

/* Isi pilihan filter dari data */
const isiPilihan = (id, label, key) => {
  const nilai = [...new Set(data.map(m => m[key]).filter(Boolean))].sort();
  $(id).innerHTML = `<option value="">${label}</option>` + nilai.map(v => `<option>${esc(v)}</option>`).join('');
};

/* Saring, urutkan, tampilkan */
function render() {
  const q = $('cari').value.trim().toLowerCase();
  let hasil = data.filter(m =>
    (!q || `${m.nama} ${m.brand}`.toLowerCase().includes(q)) &&
    (!$('fBrand').value || m.brand === $('fBrand').value) &&
    (!$('fTrans').value || m.transmisi === $('fTrans').value) &&
    (!$('fBbm').value || m.bahan_bakar === $('fBbm').value) &&
    (!$('fSedia').checked || m.status === 'tersedia'));

  const urut = { baru: (a, b) => b.id - a.id, murah: (a, b) => a.harga - b.harga,
                 mahal: (a, b) => b.harga - a.harga, tahun: (a, b) => b.tahun - a.tahun }[$('urut').value];
  hasil.sort(urut);

  $('hitung').textContent = `${hasil.length} unit ditemukan`;
  $('grid').innerHTML = hasil.length ? hasil.map(m => `
    <article class="card ${m.status === 'sold' ? 'sold' : ''}">
      <div class="img" role="button" tabindex="0" data-id="${esc(m.id)}" aria-label="Lihat detail ${esc(m.nama)}">
        <img src="${esc(m.foto)}" alt="${esc(m.nama)}" loading="lazy" onerror="this.style.display='none'">
        <span class="badge">${m.status === 'sold' ? 'Terjual' : 'Tersedia'}</span>
      </div>
      <div class="body">
        <small>${esc(m.brand)} • ${esc(m.tahun)}</small>
        <h3>${esc(m.nama)}</h3>
        <p>${esc(m.transmisi)} • ${esc(m.bahan_bakar)}</p>
        <strong>${rp(m.harga)}</strong>
      </div>
    </article>`).join('')
    : '<p class="msg">Tidak ada mobil yang cocok. Ubah atau reset filter.</p>';
  $('grid').querySelectorAll('.card').forEach(el => io.observe(el));
}

['cari', 'fBrand', 'fTrans', 'fBbm', 'urut', 'fSedia'].forEach(id => $(id).addEventListener(id === 'cari' ? 'input' : 'change', render));
$('reset').onclick = () => {
  ['cari', 'fBrand', 'fTrans', 'fBbm'].forEach(id => $(id).value = '');
  $('urut').value = 'baru'; $('fSedia').checked = false; render();
};

/* Modal detail mobil */
const modal = $('modal');
const SKIP = new Set(['id','ruang','nama','brand','foto','harga','status','tahun','transmisi','bahan_bakar','created_at','updated_at']);
const judul = k => k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const tgl = s => s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

function bukaDetail(id) {
  const m = data.find(x => String(x.id) === String(id));
  if (!m) return;
  const sold = m.status === 'sold';

  $('mFoto').src = m.foto || ''; $('mFoto').alt = m.nama;
  $('mFoto').style.display = '';
  $('mFoto').onerror = function () { this.style.display = 'none'; };
  $('mBadge').textContent = sold ? 'Terjual' : 'Tersedia';
  document.querySelector('.m-img').classList.toggle('sold', sold);
  $('mMerek').textContent = `${m.brand ?? ''} • ${m.tahun ?? ''}`;
  $('mNama').textContent = m.nama;
  $('mHarga').textContent = rp(m.harga);

  const spek = [
    ['Merek', m.brand], ['Tahun', m.tahun],
    ['Transmisi', m.transmisi], ['Bahan bakar', m.bahan_bakar],
    ['Status', sold ? 'Terjual' : 'Tersedia'], ['Ditambahkan', tgl(m.created_at)]
  ];
  $('mSpek').innerHTML = spek.map(([k, v]) =>
    `<div><dt>${esc(k)}</dt><dd>${esc(v ?? '-')}</dd></div>`).join('');
  $('mWa').href = waLink(`Halo MF Showroom, saya tertarik dengan ${m.nama} (${m.tahun}) harga ${rp(m.harga)}. Apakah masih tersedia?`);

  modal.showModal();
}

document.addEventListener('click', e => {
  const el = e.target.closest('.img[data-id]');
  if (el) bukaDetail(el.dataset.id);
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.img[data-id]')) {
    e.preventDefault(); bukaDetail(e.target.dataset.id);
  }
});
$('mTutup').onclick = () => modal.close();
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); }); // klik area gelap = tutup
/* Ambil data dari API */
(async () => {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(res.status);
    data = (await res.json()).data || [];
    isiPilihan('fBrand', 'Semua merek', 'brand');
    isiPilihan('fTrans', 'Semua transmisi', 'transmisi');
    isiPilihan('fBbm', 'Semua bahan bakar', 'bahan_bakar');
    render();
  } catch {
    $('grid').innerHTML = '<p class="msg">Data mobil gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.</p>';
  }
})();
