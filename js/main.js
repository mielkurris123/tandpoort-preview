(function () {
  "use strict";

  const nav = document.getElementById("siteNav");
  const toggle = document.getElementById("navToggle");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll(".site-nav__mobile a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const form = document.getElementById("sollicitatieForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      const required = form.querySelectorAll("[required]");
      let valid = true;
      required.forEach(function (input) {
        if (!input.value.trim()) {
          valid = false;
          input.style.borderColor = "#c0392b";
        } else {
          input.style.borderColor = "";
        }
      });
      if (!valid) {
        e.preventDefault();
        const firstInvalid = form.querySelector("[required]:invalid, [style*='c0392b']");
        if (firstInvalid) firstInvalid.focus();
      }
    });
  }

  // ---------- Cookie consent + GTM loader ----------
  const STORAGE_KEY = "cookie-consent";
  const GTM_ID = "GTM-PG8WM25F";
  const isPrivacyPage = /\/privacy(\.html)?$/.test(location.pathname);

  function loadGTM() {
    if (window.__gtmLoaded) return;
    window.__gtmLoaded = true;
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      const f = d.getElementsByTagName(s)[0];
      const j = d.createElement(s);
      const dl = l !== "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", GTM_ID);
  }

  // Privacy page: never load GTM, never show banner
  if (isPrivacyPage) return;

  const consent = localStorage.getItem(STORAGE_KEY);
  if (consent === "accepted") {
    loadGTM();
    return;
  }
  if (consent === "declined") return;

  // No decision yet → show banner
  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie-toestemming");
  banner.innerHTML =
    '<div class="cookie-banner__inner">' +
    '<p>We gebruiken Google Analytics (via Google Tag Manager) om bezoekersgedrag te meten en de site te verbeteren. Daarvoor plaatsen we cookies. <a href="privacy.html">Meer info</a>.</p>' +
    '<div class="cookie-banner__actions">' +
    '<button type="button" class="btn btn--ghost" data-cookie-decline>Weigeren</button>' +
    '<button type="button" class="btn btn--primary" data-cookie-accept>Accepteren</button>' +
    "</div></div>";
  document.body.appendChild(banner);

  banner.querySelector("[data-cookie-accept]").addEventListener("click", function () {
    localStorage.setItem(STORAGE_KEY, "accepted");
    banner.remove();
    loadGTM();
  });
  banner.querySelector("[data-cookie-decline]").addEventListener("click", function () {
    localStorage.setItem(STORAGE_KEY, "declined");
    banner.remove();
  });
})();
