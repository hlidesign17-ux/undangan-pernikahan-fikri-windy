document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".wedding-container");

  // Menggunakan threshold rendah (0.25) agar transisi terpicu lebih awal sebelum berhenti penuh
  const observerOptions = {
    root: container,
    rootMargin: "0px",
    threshold: 0.25,
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const section = entry.target;
      const animatedElements = section.querySelectorAll(".animated-element");

      if (entry.isIntersecting) {
        // 1. Aktifkan background image (Zoom Out halus + Fade In)
        section.classList.add("bg-in-view");

        // 2. Transisi masuk untuk teks & ikon
        animatedElements.forEach((el) => {
          const delay = el.getAttribute("data-delay") || 0;
          const duration = el.getAttribute("data-duration") || 800;

          el.style.transitionDuration = `${duration}ms`;
          el.style.transitionDelay = `${delay}ms`;

          requestAnimationFrame(() => {
            el.classList.add("in-view");
          });
        });
      } else {
        // Reset saat keluar dari area layar
        section.classList.remove("bg-in-view");

        animatedElements.forEach((el) => {
          el.style.transitionDelay = "0ms";
          el.style.transitionDuration = "300ms";
          el.classList.remove("in-view");
        });
      }
    });
  }, observerOptions);

  const sections = document.querySelectorAll(".wedding-section");
  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
});
