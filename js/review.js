/* Commentaarlaag voor de voorbeeldversie (GitHub Pages). Opmerkingen
   worden lokaal in de browser bewaard en met één knop als e-mail
   verstuurd of gekopieerd. Niet in productie gebruiken. */
(function () {
  "use strict";

  // Geen cookie-banner en geen tracking op de voorbeeldversie
  try { localStorage.setItem("cookie-consent", "declined"); } catch (e) {}

  var STORE = "rv-comments";
  var PAGE = location.pathname.split("/").pop() || "index.html";
  var MAIL_TO = ["miel", "kurris"].join("") + "@" + ["gmail", "com"].join(".");
  var picking = false;
  var hovered = null;
  var pins = [];

  function load() { try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(STORE, JSON.stringify(list)); } catch (e) {} }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }

  function describe(node) {
    var tag = node.tagName.toLowerCase();
    var text = (node.innerText || node.alt || "").replace(/\s+/g, " ").trim();
    if (text.length > 120) text = text.slice(0, 117) + "…";
    var section = node.closest("section, header, footer");
    var heading = section ? section.querySelector("h1, h2, h3") : null;
    var where = heading ? heading.innerText.trim() : (section ? section.tagName.toLowerCase() : "");
    return { tag: tag, text: text, where: where };
  }

  function pathTo(node) {
    var parts = [];
    while (node && node !== document.body) {
      var i = 1, s = node;
      while ((s = s.previousElementSibling)) if (s.tagName === node.tagName) i++;
      parts.unshift(node.tagName.toLowerCase() + ":nth-of-type(" + i + ")");
      node = node.parentElement;
    }
    return "body > " + parts.join(" > ");
  }

  function placePin(node, n, comment) {
    var pin = el("div", "rv-pin", String(n));
    pin.title = comment;
    document.body.appendChild(pin);
    function pos() {
      var r = node.getBoundingClientRect();
      pin.style.left = (window.scrollX + r.right - 13) + "px";
      pin.style.top = (window.scrollY + r.top - 13) + "px";
    }
    pos();
    pins.push(pos);
  }
  window.addEventListener("resize", function () { pins.forEach(function (f) { f(); }); });

  function toast(msg) {
    var t = el("div", "rv-toast", msg);
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  function openDialog(node) {
    var info = node ? describe(node) : null;
    var overlay = el("div", "rv-overlay");
    var dlg = el("div", "rv-dialog");
    dlg.setAttribute("role", "dialog");
    dlg.innerHTML =
      "<h2>" + (node ? "Opmerking bij dit stuk" : "Algemene opmerking") + "</h2>" +
      (info ? '<p class="rv-context rv-context--clip">' + (info.where ? "<strong>" + info.where + "</strong> · " : "") + (info.text || info.tag) + "</p>" : "") +
      '<label for="rv-naam">Je naam</label><input id="rv-naam" type="text" autocomplete="name" />' +
      '<label for="rv-tekst">Wat moet er veranderen?</label><textarea id="rv-tekst"></textarea>' +
      '<div class="rv-dialog__actions"><button type="button" class="rv-btn rv-btn--secondary" data-rv-cancel>Annuleren</button><button type="button" class="rv-btn rv-btn--primary" data-rv-send>Bewaar</button></div>';
    overlay.appendChild(dlg);
    document.body.appendChild(overlay);
    var naam = dlg.querySelector("#rv-naam");
    var tekst = dlg.querySelector("#rv-tekst");
    try { naam.value = localStorage.getItem("rv-naam") || ""; } catch (e) {}
    (naam.value ? tekst : naam).focus();

    function close() { overlay.remove(); }
    dlg.querySelector("[data-rv-cancel]").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    dlg.querySelector("[data-rv-send]").addEventListener("click", function () {
      if (!tekst.value.trim()) { tekst.focus(); return; }
      try { localStorage.setItem("rv-naam", naam.value); } catch (e) {}
      var list = load();
      var n = list.length + 1;
      var entry = {
        n: n,
        naam: naam.value.trim() || "anoniem",
        pagina: PAGE,
        sectie: info ? info.where : "",
        element: info ? (info.tag + ": " + info.text) : "algemeen",
        pad: node ? pathTo(node) : "",
        opmerking: tekst.value.trim(),
        tijd: new Date().toISOString()
      };
      list.push(entry); save(list);
      if (node) placePin(node, n, entry.opmerking);
      close();
      updateCount();
      toast("Opmerking " + n + " bewaard. Klaar? Klik dan op \u2018Verstuur opmerkingen\u2019.");
    });
  }

  function stopPicking() {
    picking = false;
    document.body.classList.remove("rv-picking");
    if (hovered) hovered.classList.remove("rv-hover");
    hovered = null;
    pickBtn.textContent = "Opmerking bij een stuk";
  }

  document.addEventListener("mouseover", function (e) {
    if (!picking) return;
    var t = e.target.closest("p, h1, h2, h3, h4, li, a, button, img, dl, address, .card, .info-block, .facts__item, .team-card, figure, label, select, textarea, input");
    if (!t || t.closest(".rv-bar, .rv-overlay, .rv-pin")) return;
    if (hovered && hovered !== t) hovered.classList.remove("rv-hover");
    hovered = t; t.classList.add("rv-hover");
  });
  document.addEventListener("click", function (e) {
    if (!picking) return;
    if (e.target.closest(".rv-bar, .rv-overlay, .rv-pin")) return;
    e.preventDefault(); e.stopPropagation();
    var t = hovered;
    stopPicking();
    if (t) openDialog(t);
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && picking) stopPicking(); });

  // Balk rechtsonder
  var bar = el("div", "rv-bar");
  bar.appendChild(el("span", "rv-bar__label", "Voorbeeldversie"));
  var pickBtn = el("button", "rv-btn", "Opmerking bij een stuk");
  pickBtn.type = "button";
  pickBtn.addEventListener("click", function () {
    if (picking) { stopPicking(); return; }
    picking = true;
    document.body.classList.add("rv-picking");
    pickBtn.textContent = "Klik op het stuk (Esc = stop)";
  });
  function compile() {
    var list = load();
    if (!list.length) return "";
    var lines = ["Opmerkingen bij de voorbeeldversie van tandpoort.be", ""];
    list.forEach(function (c) {
      lines.push(c.n + ". [" + c.pagina + (c.sectie ? " \u00b7 " + c.sectie : "") + "] " + c.element);
      lines.push("   " + c.naam + ": " + c.opmerking);
      lines.push("");
    });
    return lines.join("\n");
  }

  function openSendDialog() {
    var text = compile();
    var overlay = el("div", "rv-overlay");
    var dlg = el("div", "rv-dialog");
    dlg.setAttribute("role", "dialog");
    dlg.innerHTML =
      "<h2>Opmerkingen versturen</h2>" +
      (text
        ? '<p class="rv-context">Hieronder staan alle opmerkingen die je in deze browser bewaard hebt, ook van andere pagina\u2019s. \u2018Open in e-mail\u2019 zet ze in een mailtje klaar. Lukt dat niet, kopieer ze dan en plak ze in een mail of WhatsApp.</p>' +
          '<textarea id="rv-alles" readonly style="min-height:200px;font-size:0.85rem;"></textarea>'
        : '<p class="rv-context">Nog geen opmerkingen bewaard. Klik op \u2018Opmerking bij een stuk\u2019 en dan op de tekst of het blok waar het over gaat.</p>') +
      '<div class="rv-dialog__actions">' +
      (text ? '<button type="button" class="rv-btn rv-btn--secondary" data-rv-clear>Alles wissen</button><button type="button" class="rv-btn rv-btn--secondary" data-rv-copy>Kopieer</button><button type="button" class="rv-btn rv-btn--primary" data-rv-mail>Open in e-mail</button>' : "") +
      '<button type="button" class="rv-btn rv-btn--secondary" data-rv-cancel>Sluiten</button></div>';
    overlay.appendChild(dlg);
    document.body.appendChild(overlay);
    function close() { overlay.remove(); }
    dlg.querySelector("[data-rv-cancel]").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    if (!text) return;
    dlg.querySelector("#rv-alles").value = text;
    dlg.querySelector("[data-rv-copy]").addEventListener("click", function () {
      var ta = dlg.querySelector("#rv-alles"); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast("Gekopieerd."); }, function () { toast(ok ? "Gekopieerd." : "Kopi\u00ebren mislukt, selecteer de tekst zelf."); });
      else toast(ok ? "Gekopieerd." : "Kopi\u00ebren mislukt, selecteer de tekst zelf.");
    });
    dlg.querySelector("[data-rv-mail]").addEventListener("click", function () {
      location.href = "mailto:" + MAIL_TO + "?subject=" + encodeURIComponent("Opmerkingen voorbeeldversie tandpoort.be") + "&body=" + encodeURIComponent(text);
    });
    dlg.querySelector("[data-rv-clear]").addEventListener("click", function () {
      if (!confirm("Alle bewaarde opmerkingen wissen?")) return;
      save([]); close(); updateCount();
      document.querySelectorAll(".rv-pin").forEach(function (p) { p.remove(); });
      toast("Lijst gewist.");
    });
  }

  var sendBtn = el("button", "rv-btn rv-btn--secondary", "Verstuur opmerkingen");
  sendBtn.type = "button";
  sendBtn.addEventListener("click", openSendDialog);
  function updateCount() {
    var n = load().length;
    sendBtn.textContent = "Verstuur opmerkingen" + (n ? " (" + n + ")" : "");
  }

  var genBtn = el("button", "rv-btn rv-btn--secondary", "Algemene opmerking");
  genBtn.type = "button";
  genBtn.addEventListener("click", function () { openDialog(null); });
  bar.appendChild(pickBtn);
  bar.appendChild(genBtn);
  bar.appendChild(sendBtn);
  document.body.appendChild(bar);
  updateCount();

  // Eerdere opmerkingen van deze reviewer terug tonen
  load().forEach(function (c) {
    if (c.pagina !== PAGE || !c.pad) return;
    try { var n = document.querySelector(c.pad); if (n) placePin(n, c.n, c.opmerking); } catch (e) {}
  });
})();
