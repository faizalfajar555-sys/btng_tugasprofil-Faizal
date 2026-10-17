
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Elemen navigasi
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const navItems = document.querySelectorAll(".nav-link");

  // Elemen tema
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = document.getElementById("themeLabel");

  // Elemen interaksi
  const messageButton = document.getElementById("messageButton");
  const welcomeText = document.getElementById("welcomeText");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const currentYear = document.getElementById("currentYear");

  // Pesan sambutan yang berganti melalui tombol.
  const welcomeMessages = [
    "Saya tertarik pada teknologi, kreativitas, dan pengembangan diri. Di sini, kamu bisa mengenal saya lebih dekat.",
    "Terima kasih sudah berkunjung! Semoga kita bisa saling berbagi ide dan inspirasi.",
    "Setiap hari adalah kesempatan baru untuk belajar, mencoba, dan menjadi lebih baik."
  ];

  let messageIndex = 0;

  // Tahun otomatis pada footer.
  currentYear.textContent = String(new Date().getFullYear());

  // =========================
  // Tema gelap dan terang
  // =========================
  function applyTheme(theme) {
    const isLight = theme === "light";

    document.documentElement.dataset.theme = isLight
      ? "light"
      : "dark";

    themeIcon.textContent = isLight ? "☾" : "☀";
    themeLabel.textContent = isLight ? "Gelap" : "Terang";
    themeToggle.setAttribute(
      "aria-label",
      isLight ? "Ganti ke tema gelap" : "Ganti ke tema terang"
    );

    const themeColor = isLight ? "#f7f8fc" : "#0b1020";
    const themeColorMeta = document.querySelector(
      'meta[name="theme-color"]'
    );

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", themeColor);
    }
  }

  // Baca tema tersimpan. Jika tidak tersedia, gunakan tema gelap.
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("portfolio-theme");
  } catch {
    // Website tetap berfungsi jika penyimpanan diblokir.
  }

  applyTheme(savedTheme === "light" ? "light" : "dark");

  themeToggle.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "light"
        ? "dark"
        : "light";

    applyTheme(nextTheme);

    try {
      localStorage.setItem("portfolio-theme", nextTheme);
    } catch {
      // Pergantian tema tetap berfungsi tanpa localStorage.
    }
  });

  // =========================
  // Menu navigasi mobile
  // =========================
  function closeMenu() {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka menu navigasi");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
    );
  });

  navItems.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Tutup menu dengan tombol Escape.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  // =========================
  // Navigasi aktif saat scroll
  // =========================
  const sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navItems.forEach((link) => {
            const isActive =
              link.getAttribute("href") === `#${entry.target.id}`;

            if (isActive) {
              link.classList.add("active");
              link.setAttribute("aria-current", "location");
            } else {
              link.classList.remove("active");
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  // =========================
  // Tombol interaktif sambutan
  // =========================
  messageButton.addEventListener("click", () => {
    messageIndex = (messageIndex + 1) % welcomeMessages.length;
    welcomeText.textContent = welcomeMessages[messageIndex];

    messageButton.innerHTML =
      '<span aria-hidden="true">✓</span> Sapa Lagi';
  });

  // =========================
  // Formulir kontak demo
  // =========================
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Validasi bawaan browser tetap aktif karena form
    // tidak menggunakan atribut novalidate.
    if (!contactForm.reportValidity()) {
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      formStatus.textContent =
        "Mohon lengkapi semua kolom sebelum melanjutkan.";
      return;
    }

    // textContent digunakan agar input pengguna tidak
    // ditafsirkan sebagai HTML.
    formStatus.textContent =
      `Terima kasih, ${name}! Pesan kamu sudah divalidasi ` +
      `di browser. Formulir ini masih berupa demo dan ` +
      `belum mengirim pesan ke server.`;

    contactForm.reset();
  });
});
