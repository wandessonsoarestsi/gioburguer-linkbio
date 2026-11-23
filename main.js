/* Gio Burger · link na bio — JS principal (sem dependências na primeira tela) */
(function () {
  "use strict";
  var C = window.GB_CONFIG || {};
  var doc = document;
  var $ = function (s) { return doc.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); };
  var UA = navigator.userAgent || "";
  var IN_APP = /Instagram|FBAN|FBAV|FB_IAB|Line\/|TikTok|musical_ly/i.test(UA);
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn = navigator.connection || {};
  var SLOW = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "");

  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------------- 1. UTM: captura e repasse ---------------- */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"];
  var utm = {};
  (function () {
    var q = new URLSearchParams(location.search);
    UTM_KEYS.forEach(function (k) { if (q.get(k)) utm[k] = q.get(k); });
    if (Object.keys(utm).length) store("gb_utm", JSON.stringify(utm));
    else { try { utm = JSON.parse(store("gb_utm") || "{}") || {}; } catch (e) { utm = {}; } }
    if (!Object.keys(utm).length) utm = { utm_source: IN_APP && /Instagram/i.test(UA) ? "instagram" : "linkbio", utm_medium: "bio", utm_campaign: "linkbio" };
  })();

  function buildUrl(key) {
    var raw = (C.links || {})[key];
    if (!raw) return "#";
    if ((C.passUtmTo || []).indexOf(key) === -1) return raw;
    try {
      var u = new URL(raw);
      Object.keys(utm).forEach(function (k) { if (!u.searchParams.has(k)) u.searchParams.set(k, utm[k]); });
      return u.toString();
    } catch (e) { return raw; }
  }

  /* ---------------- 2. Links + rastreamento ---------------- */
  var desktop = !IN_APP && matchMedia("(pointer:fine)").matches;
  function wireLinks(root) {
    $$((root || "") + " [data-link]").forEach(function (a) {
      if (a.dataset.wired) return;
      a.dataset.wired = "1";
      a.href = buildUrl(a.dataset.link);
      // Dentro do Instagram/Facebook: mesma aba (o webview abre apps como WhatsApp/iFood/Maps corretamente).
      if (desktop) { a.target = "_blank"; a.rel = "noopener"; }
    });
  }
  wireLinks();
  // mídia configurável (caso o nome do arquivo seja diferente do padrão)
  (function () {
    var lg = $("#logoImg"), hp = $("#heroPoster");
    if (C.logo && lg && lg.getAttribute("src") !== C.logo) lg.src = C.logo;
    if (C.hero && C.hero.poster && hp && hp.getAttribute("src") !== C.hero.poster) hp.src = C.hero.poster;
  })();

  // filas de eventos já disponíveis antes dos scripts de GA4/Pixel carregarem
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  var T = C.tracking || {};
  if (T.metaPixelId && !window.fbq) {
    var f = window.fbq = function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
    f.push = f; f.loaded = true; f.version = "2.0"; f.queue = [];
    window._fbq = f;
    fbq("init", T.metaPixelId); fbq("track", "PageView");
  }
  if (T.ga4Id) { gtag("js", new Date()); gtag("config", T.ga4Id, utm); }

  function track(name, a) {
    var data = { button_name: name, link_url: a && a.href, link_key: a && a.dataset.link };
    try {
      dataLayer.push({ event: "gb_click", button_name: name, link_key: data.link_key });
      if (T.ga4Id) gtag("event", "click_button", { button_name: name, link_key: data.link_key, link_url: data.link_url, transport_type: "beacon" });
      if (window.fbq) {
        fbq("trackCustom", "ClickButton", { button_name: name, link_key: data.link_key });
        if (data.link_key === "site" || data.link_key === "ifood") fbq("track", "InitiateCheckout", { content_name: name });
        if (data.link_key === "whatsapp") fbq("track", "Contact", { content_name: name });
      }
    } catch (e) {}
  }

  doc.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-track]");
    if (a) track(a.dataset.track, a);
  });
  // feedback de toque (iOS precisa de um listener touchstart para :active funcionar)
  doc.addEventListener("touchstart", function () {}, { passive: true });
  doc.addEventListener("pointerdown", function (e) {
    var b = e.target.closest && e.target.closest(".cta,.row,.way,.pill,.item,.rv-all,.g-chip,.made-by,.sticky-bar a,.parma,.social a,.top-cta");
    if (!b) return;
    b.classList.add("pressed");
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (x) {} }
    var up = function () { b.classList.remove("pressed"); doc.removeEventListener("pointerup", up); doc.removeEventListener("pointercancel", up); };
    doc.addEventListener("pointerup", up); doc.addEventListener("pointercancel", up);
  }, { passive: true });

  /* ---------------- 3. Aberto agora / abre às 17h ---------------- */
  function updateStatus() {
    var H = C.hours || { timezone: "America/Fortaleza", open: 17, close: 23, days: [0, 1, 2, 3, 4, 5, 6] };
    var parts = {};
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: H.timezone, hour: "numeric", minute: "numeric", weekday: "short", hour12: false })
        .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    } catch (e) { return; }
    var h = parseInt(parts.hour, 10) % 24, m = parseInt(parts.minute, 10);
    var wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
    var mins = h * 60 + m, open = H.open * 60, close = H.close * 60;
    var isOpen = H.days.indexOf(wd) > -1 && mins >= open && mins < close;
    var el = $("#status"), txt = $("#statusText");
    el.classList.toggle("open", isOpen);
    if (isOpen) txt.textContent = "ABERTO AGORA";
    else if (H.days.indexOf(wd) > -1 && mins < open) txt.textContent = "ABRE ÀS " + H.open + "H";
    else txt.textContent = "ABRE AMANHÃ ÀS " + H.open + "H";
    if (H.days.length === 7 && !isOpen && mins >= close) txt.textContent = "ABRE AMANHÃ ÀS " + H.open + "H";
  }
  updateStatus();
  setInterval(updateStatus, 60000);
  if (C.address) $("#address").textContent = C.address;

  /* ---------------- 4. Cardápio ---------------- */
  (function () {
    var box = $("#menu");
    if (!box || !C.menu) return;
    var esc = function (s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var slug = function (s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""); };
    box.innerHTML = C.menu.map(function (it, i) {
      var words = esc(it.name).split(" "), last = words.pop();
      var ph = it.image
        ? '<div class="ph">' + (it.tag ? '<span class="tag">' + esc(it.tag) + "</span>" : "") + '<img src="' + esc(it.image) + '" alt="' + esc(it.name) + '" width="600" height="600" loading="lazy" decoding="async"></div>'
        : '<div class="ph type">' + (it.tag ? '<span class="tag">' + esc(it.tag) + "</span>" : "") + "<b>" + words.join(" ") + "<em>" + last + "</em></b></div>";
      return '<a class="item" data-link="site" data-track="cardapio_' + slug(it.name) + '">' + ph +
        '<div class="num">' + (i < 9 ? "0" : "") + (i + 1) + "</div><h3>" + esc(it.name) + "</h3><p>" + esc(it.desc) + "</p>" +
        '<div class="foot"><span class="price">' + esc(it.price) + '</span><span class="go">Pedir <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></a>';
    }).join("");
    wireLinks("#menu");
  })();

  /* ---------------- 4b. Avaliações do Google ---------------- */
  (function () {
    var R = C.reviews;
    if (!R) return;
    document.querySelectorAll(".js-rating").forEach(function (e) { if (R.rating) e.textContent = R.rating; });
    document.querySelectorAll(".js-count").forEach(function (e) { if (R.count) e.textContent = R.count; });
    var box = $("#reviewList");
    if (!box || !R.items || !R.items.length) return;
    var esc = function (s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>';
    var stars = '<span class="stars" role="img" aria-label="5 estrelas">' + star + star + star + star + star + "</span>";
    box.innerHTML = R.items.map(function (r) {
      return '<figure class="rv">' + stars + "<blockquote>“" + esc(r.text) + "”</blockquote>" +
        "<figcaption><i>" + esc(r.name).charAt(0).toUpperCase() + "</i><span><b>" + esc(r.name) + "</b>Avaliação no Google</span></figcaption></figure>";
    }).join("");
  })();

  /* ---------------- 5. Barra fixa ---------------- */
  (function () {
    var bar = $("#stickyBar"), links = $("#links");
    if (!("IntersectionObserver" in window) || !bar || !links) return;
    new IntersectionObserver(function (en) {
      var e = en[0];
      var passed = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle("show", passed);
      bar.setAttribute("aria-hidden", passed ? "false" : "true");
      $$("#stickyBar a").forEach(function (a) { a.tabIndex = passed ? 0 : -1; });
    }, { threshold: 0 }).observe(links);
  })();

  /* ---------------- 6. Pós-carregamento: vídeo, analytics, animação ---------------- */
  function idle(fn, t) { (window.requestIdleCallback || function (f) { return setTimeout(f, 1); })(fn, { timeout: t || 2000 }); }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = doc.createElement("script"); s.src = src; s.async = true; s.onload = res; s.onerror = rej; doc.head.appendChild(s);
    });
  }

  function afterLoad() {
    // vídeo da capa: só depois da primeira tela, e nunca em economia de dados / reduced-motion
    var H = C.hero || {};
    if (H.video && !SLOW && !REDUCED) {
      var v = doc.createElement("video");
      v.muted = true; v.defaultMuted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", "");
      v.preload = "auto"; v.poster = $("#heroPoster").currentSrc || $("#heroPoster").src;
      v.style.opacity = "0"; v.style.transition = "opacity .6s";
      if (H.videoWebm) { var s1 = doc.createElement("source"); s1.src = H.videoWebm; s1.type = "video/webm"; v.appendChild(s1); }
      var s2 = doc.createElement("source"); s2.src = H.video; s2.type = "video/mp4"; v.appendChild(s2);
      v.addEventListener("playing", function () { v.style.opacity = "1"; }, { once: true });
      $("#heroMedia").appendChild(v);
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }
    // analytics
    idle(function () {
      if (T.ga4Id) loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(T.ga4Id)).catch(function () {});
      if (T.metaPixelId) loadScript("https://connect.facebook.net/en_US/fbevents.js").catch(function () {});
    }, 3000);
    Cinema.init();
  }
  if (doc.readyState === "complete") setTimeout(afterLoad, 50);
  else window.addEventListener("load", function () { setTimeout(afterLoad, 50); });

  /* ======================================================================
     CENA DE ROLAGEM — a foto do burger dá zoom com o scroll, os títulos
     trocam e no final entra o combo (GSAP ScrollTrigger, com fallback nativo).
     ====================================================================== */
  var Cinema = (function () {
    var section = $("#cinema"), canvas = $("#stackCanvas"), ctx = canvas && canvas.getContext("2d");
    var S = C.stack || {};
    var heads = { h1: $(".h-1"), stack: $(".h-stack"), h3: $(".h-3"), end: $(".h-end") };
    var combo = $("#combo"), comboImg = $("#comboImg"), bar = $("#progressBar");
    var imgs = [], W = 0, H = 0, dpr = 1, curP = 0, lastP = -1, staticMode = REDUCED || SLOW;
    var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
    var range = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
    var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var vis = function (p, a, b, f) { f = f || .05; return range(p, a, a + f) * (1 - range(p, b - f, b)); };

    function size() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastP = -1;
    }

    function sampleBg(im) { // cor média do topo da foto
      try {
        var c = doc.createElement("canvas"); c.width = c.height = 8;
        var x = c.getContext("2d"); x.drawImage(im, 0, 0, im.naturalWidth, im.naturalHeight * .2, 0, 0, 8, 8);
        var d = x.getImageData(0, 0, 8, 1).data, r = 0, g = 0, b = 0;
        for (var i = 0; i < 32; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
        return "rgb(" + Math.round(r / 8) + "," + Math.round(g / 8) + "," + Math.round(b / 8) + ")";
      } catch (e) { return "#222"; }
    }

    // janelas de cada cena no scroll (0..1)
    var WIN = [[0, .3], [.3, .56], [.56, .8]];
    function drawPhoto(im, alpha, t, leave) {
      if (!im || !im.complete || !im.naturalWidth || alpha <= 0) return;
      var wide = !staticMode && W >= 960 && W > H;
      var base = staticMode ? W : wide ? Math.min(H * .8, W * .46) : Math.min(W * 1.04, H * .64);
      var s = base * (1.06 + .14 * t);
      var x = wide ? W * .5 + (Math.min(W, 1280) * .5 - s) / 2 : (W - s) / 2;
      var y = staticMode ? 0 : wide ? (H - base) / 2 + H * .04 - (s - base) / 2 - H * .3 * leave : H - base - H * .05 - (s - base) / 2 - H * .3 * leave;
      ctx.globalAlpha = alpha;
      if (!wide) { ctx.fillStyle = im._bg || "#222"; ctx.fillRect(x + 2, y + s * .3, s - 4, H); }
      ctx.drawImage(im, x, y, s, s);
      if (!staticMode) {
        var tf = ctx.createLinearGradient(0, y - 1, 0, y + s * .38);
        tf.addColorStop(0, "#000"); tf.addColorStop(.3, "rgba(0,0,0,.45)"); tf.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = tf; ctx.fillRect(0, Math.max(0, y - 2), W, s * .38 + 2);
        var sf = ctx.createLinearGradient(x, 0, x + s, 0);
        sf.addColorStop(0, "#000"); sf.addColorStop(.1, "rgba(0,0,0,0)"); sf.addColorStop(.9, "rgba(0,0,0,0)"); sf.addColorStop(1, "#000");
        ctx.fillStyle = sf; ctx.fillRect(x, y, s, s);
        var bf = ctx.createLinearGradient(0, H * .82, 0, H);
        bf.addColorStop(0, "rgba(0,0,0,0)"); bf.addColorStop(1, "rgba(0,0,0,.85)");
        ctx.fillStyle = bf; ctx.fillRect(0, H * .82, W, H * .18);
      }
      ctx.globalAlpha = 1;
    }

    function draw(p) {
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
      if (staticMode) { drawPhoto(imgs[0], 1, 0, 0); return; }
      var leave = ease(range(p, .76, .9)), fade = 1 - range(p, .8, .9), n = imgs.length;
      imgs.forEach(function (im, i) {
        var w = WIN[i] || WIN[WIN.length - 1], f = .05;
        var a = (i === 0 ? 1 : range(p, w[0] - f / 2, w[0] + f / 2)) * (i === n - 1 ? fade : 1 - range(p, w[1] - f / 2, w[1] + f / 2));
        drawPhoto(im, a, range(p, w[0], w[1] + .1), i === n - 1 ? leave : 0);
      });
    }

    function setHead(el, o) {
      if (!el) return;
      el.style.opacity = o.toFixed(3);
      el.style.transform = "translate3d(" + ((1 - o) * -40) + "px," + ((1 - o) * 24) + "px,0)";
      el.style.pointerEvents = o > .6 ? "auto" : "none";
    }

    function render(p) {
      curP = p;
      if (Math.abs(p - lastP) < .0004) return;
      lastP = p;
      draw(p);
      setHead(heads.h1, p < .02 ? 1 : vis(p, -1, .26, .07));
      setHead(heads.stack, vis(p, .3, .56, .06));
      setHead(heads.h3, vis(p, .58, .78, .05));
      setHead(heads.end, range(p, .84, .92));
      var c = ease(range(p, .76, .9));
      combo.style.opacity = c.toFixed(3);
      combo.style.transform = "translateY(" + (30 - 30 * c) + "%) scale(" + (1.1 - .1 * c) + ")";
      bar.style.width = (p * 100).toFixed(1) + "%";
      var r = section.getBoundingClientRect();
      doc.body.classList.toggle("in-cinema", r.top < innerHeight * .5 && r.bottom > innerHeight * .5);
    }

    function progress() {
      var r = section.getBoundingClientRect(), total = r.height - innerHeight;
      return clamp(-r.top / (total || 1), 0, 1);
    }
    var ticking = false, gsapOn = false;
    function onScroll() {
      if (gsapOn || ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; render(progress()); });
    }

    function init() {
      if (!section || !ctx) return;
      comboImg.src = S.combo || "";
      imgs = (S.scenes || []).map(function (src, i) {
        var im = new Image(); im.decoding = "async";
        im.onload = function () { im._bg = sampleBg(im); lastP = -1; staticMode ? (size(), draw(0)) : render(curP); };
        if (i === 0 || !staticMode) im.src = src;
        return im;
      });
      if (staticMode) {
        section.classList.add("is-static");
        var redraw = function () { size(); draw(0); };
        redraw(); window.addEventListener("resize", redraw);
        return;
      }
      size(); render(progress());
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", function () { size(); render(curP); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        var base = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/";
        loadScript(base + "gsap.min.js").then(function () { return loadScript(base + "ScrollTrigger.min.js"); }).then(function () {
          gsap.registerPlugin(ScrollTrigger);
          var st = { p: 0 };
          gsap.fromTo(st, { p: 0 }, { p: 1, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: .6 }, onUpdate: function () { render(st.p); } });
          gsapOn = true;
        }).catch(function () { /* sem GSAP: o modo nativo segue funcionando */ });
      }, { rootMargin: "120% 0px" });
      io.observe(section);
    }
    return { init: init };
  })();
})();
