document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("wedding-app");
  let audioPlayer = null;
  let musicBtn = null;

  // 1. Memuat file data.json
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      renderSections(data.sections);
      initAudioPlayer(data.musicUrl);
      initIntersectionObserver();
    })
    .catch((error) => console.error("Error memuat data.json:", error));

  // 2. Audio Player dengan Ikon Doodle Line Art Musik
  function initAudioPlayer(musicUrl) {
    if (!musicUrl) return;

    audioPlayer = new Audio(musicUrl);
    audioPlayer.loop = true;

    musicBtn = document.createElement("button");
    musicBtn.className = "music-btn";
    musicBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;
    musicBtn.title = "Matikan / Putar Musik";
    document.body.appendChild(musicBtn);

    const playPromise = audioPlayer.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          musicBtn.classList.add("playing");
        })
        .catch(() => {
          const enableAudioOnInteraction = () => {
            audioPlayer.play().then(() => {
              musicBtn.classList.add("playing");
            });
            window.removeEventListener("click", enableAudioOnInteraction);
            window.removeEventListener("touchstart", enableAudioOnInteraction);
            window.removeEventListener("scroll", enableAudioOnInteraction);
          };

          window.addEventListener("click", enableAudioOnInteraction);
          window.addEventListener("touchstart", enableAudioOnInteraction);
          window.addEventListener("scroll", enableAudioOnInteraction);
        });
    }

    musicBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (audioPlayer.paused) {
        audioPlayer.play();
        musicBtn.classList.add("playing");
      } else {
        audioPlayer.pause();
        musicBtn.classList.remove("playing");
      }
    });
  }

  // 3. Merender Elemen HTML dari JSON + Membaca Nama Tamu dari URL
  function renderSections(sections) {
    container.innerHTML = "";

    // AMRIL PARAMETER NAMA TAMU DARI URL (Contoh: ?to=Budi+Santoso)
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get("to") || urlParams.get("nama"); // Bisa ?to=... atau ?nama=...

    sections.forEach((sec) => {
      const sectionEl = document.createElement("section");
      sectionEl.id = sec.id;
      sectionEl.className = "wedding-section";

      sectionEl.dataset.bgBreathe = sec.bgBreathe ?? true;
      sectionEl.dataset.breatheDuration = sec.breatheDuration || 12;

      let topContentHtml = "";
      let centerContentHtml = "";
      let bottomContentHtml = "";
      let iconsHtml = "";

      if (sec.content) {
        sec.content.forEach((item) => {
          const animAttr = `data-anim="${item.animation?.type || "fade-up"}" data-delay="${item.animation?.delay || 0}" data-duration="${item.animation?.duration || 800}"`;

          const fontSizeStyle = item.style?.fontSize
            ? `font-size: ${item.style.fontSize};`
            : "";
          const fontFamilyStyle = item.style?.fontFamily
            ? `font-family: ${item.style.fontFamily};`
            : "";
          const colorStyle = item.style?.color
            ? `color: ${item.style.color};`
            : "";
          const transformStyle = `transform: translate3d(${item.transformX || 0}px, ${item.transformY || 0}px, 0) rotate(${item.rotate || 0}deg); ${fontSizeStyle} ${fontFamilyStyle} ${colorStyle}`;

          // LOGIKA PENGGANTIAN TEKS PENERIMA UNDANGAN
          let contentText = item.text;
          if (item.id === "s1-footer") {
            if (guestName) {
              // Jika ada nama di URL, tampilkan nama tamu
              contentText = `Kepada Yth. Bapak/Ibu/Saudara/i<br><strong style="font-size: 1.2em; display: inline-block; margin-top: 4px;">${decodeURIComponent(guestName)}</strong>`;
            } else {
              // Jika tidak ada nama di URL (default)
              contentText = item.text;
            }
          }

          let elementHtml = "";

          if (item.type === "button") {
            const btnClass = item.id.includes("map") ? "map-btn" : "social-btn";
            const targetUrl =
              item.url ||
              (item.id.includes("map") ? "#map" : "https://instagram.com");
            elementHtml = `<a href="${targetUrl}" target="_blank" class="animated-element ${btnClass}" style="${transformStyle}" ${animAttr}>${contentText}</a>`;
          } else if (item.type === "info_item") {
            elementHtml = `
              <div class="animated-element info-item" style="${transformStyle}" ${animAttr}>
                <span class="info-icon">${item.icon}</span>
                <span>${contentText}</span>
              </div>`;
          } else {
            const cssClass = getItemClass(item.id);
            elementHtml = `<div class="animated-element ${cssClass}" style="${transformStyle}" ${animAttr}>${contentText}</div>`;
          }

          if (
            item.id.includes("sub") ||
            item.id.includes("header") ||
            item.id.includes("main") ||
            item.id.includes("title") ||
            item.id.includes("amp")
          ) {
            topContentHtml += elementHtml;
          } else if (item.type === "info_item" || item.id.includes("map")) {
            centerContentHtml += elementHtml;
          } else {
            bottomContentHtml += elementHtml;
          }
        });
      }

      if (sec.icons) {
        sec.icons.forEach((ic, idx) => {
          let posClass = `heart-pos-${sec.id.replace("section", "")}`;
          if (sec.id === "section1")
            posClass = idx === 0 ? "heart-pos-1" : "heart-pos-2";

          const transformStyle = `transform: translate3d(${ic.transformX || 0}px, ${ic.transformY || 0}px, 0) rotate(${ic.rotate || 0}deg); color: ${ic.color || ic.style?.color || "#D32F2F"};`;

          iconsHtml += `<span class="animated-element icon-heart ${posClass}" style="${transformStyle}" data-anim="${ic.animation.type}" data-delay="${ic.animation.delay}">${ic.symbol}</span>`;
        });
      }

      const isPaddedBox = sec.id === "section2" ? "padded-box" : "";

      sectionEl.innerHTML = `
        ${topContentHtml ? `<div class="content-wrapper top-content">${topContentHtml}</div>` : ""}
        ${centerContentHtml ? `<div class="content-wrapper center-content info-list">${centerContentHtml}</div>` : ""}
        ${iconsHtml}
        ${bottomContentHtml ? `<div class="content-wrapper bottom-content ${isPaddedBox}">${bottomContentHtml}</div>` : ""}
      `;

      container.appendChild(sectionEl);
    });
  }

  function getItemClass(id) {
    if (id.includes("sub") || id.includes("header")) return "sub-header";
    if (id.includes("main")) return "main-title";
    if (id.includes("title")) return "section-title";
    if (id.includes("name")) return "name-title";
    if (id.includes("tag") || id.includes("badge")) return "accent-text";
    if (id.includes("body")) return "body-text";
    if (id.includes("quote")) return "quote-text";
    if (id.includes("parent")) return "parent-text";
    if (id.includes("footer")) return "footer-text";
    if (id.includes("amp")) return "ampersand";
    return "";
  }

  // 4. Animasi Scroll
  function initIntersectionObserver() {
    const observerOptions = {
      root: container,
      rootMargin: "0px",
      threshold: 0.2,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const section = entry.target;
        const animatedElements = section.querySelectorAll(".animated-element");

        if (entry.isIntersecting) {
          section.classList.add("bg-in-view");

          if (section.dataset.bgBreathe === "true") {
            section.style.setProperty(
              "--breathe-duration",
              `${section.dataset.breatheDuration || 12}s`,
            );
            section.classList.add("bg-breathe-active");
          }

          animatedElements.forEach((el, index) => {
            const baseDelay = parseInt(el.getAttribute("data-delay")) || 0;
            const finalDelay = baseDelay + index * 80;
            const duration = el.getAttribute("data-duration") || 950;

            el.style.transitionDuration = `${duration}ms`;
            el.style.transitionDelay = `${finalDelay}ms`;

            requestAnimationFrame(() => el.classList.add("in-view"));
          });
        } else {
          section.classList.remove("bg-in-view");
          section.classList.remove("bg-breathe-active");

          animatedElements.forEach((el) => {
            el.style.transitionDelay = "0ms";
            el.style.transitionDuration = "400ms";
            el.classList.remove("in-view");
          });
        }
      });
    }, observerOptions);

    document
      .querySelectorAll(".wedding-section")
      .forEach((sec) => sectionObserver.observe(sec));
  }
});
