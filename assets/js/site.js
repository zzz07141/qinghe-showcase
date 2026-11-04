/* ============================================================
   青禾集 · 交互
   列表渲染、筛选、阅读器、灯箱、移动端菜单。
   ============================================================ */

(function () {
  "use strict";

  const store = window.QINGHE || {};
  const SITE = store.SITE || {};
  const ESSAYS = store.ESSAYS || [];
  const ARTWORKS = store.ARTWORKS || [];
  const WORKS = store.WORKS || [];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const escapeHTML = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const SITE_DEFAULTS = {
    name: "青禾集",
    mark: "青禾",
    english: "QINGHE COLLECTION",
    className: "六年级（3）班",
    term: "2026 秋季",
    termShort: "2026 秋",
    teacher: "林老师",
    school: "青禾小学",
    email: "hello@qinghe.class",
  };

  function applySite() {
    if (SITE.intro) {
      $$(".hero-intro").forEach((node) => (node.textContent = SITE.intro));
    }
    if (SITE.themeTitle) {
      $$(".hero-foot-theme").forEach((node) => (node.textContent = SITE.themeTitle));
      const themeKicker = $(".quote-feature .kicker");
      if (themeKicker) {
        themeKicker.textContent = `本期主题 · ${SITE.themeTitle}`;
      }
      $$(".quote-feature-seal").forEach((node) => (node.textContent = SITE.themeTitle));
    }

    const pairs = Object.keys(SITE_DEFAULTS)
      .filter((key) => SITE[key] && SITE[key] !== SITE_DEFAULTS[key])
      .map((key) => [SITE_DEFAULTS[key], SITE[key]])
      .sort((a, b) => b[0].length - a[0].length);

    if (!pairs.length) return;

    const lookup = new Map(pairs);
    const pattern = new RegExp(
      pairs.map(([from]) => from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
      "g"
    );
    const swap = (value) => value.replace(pattern, (match) => lookup.get(match));

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.parentElement || node.parentElement.closest("script, style")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      node.nodeValue = swap(node.nodeValue);
    }

    document.title = swap(document.title);
    $$('meta[name="description"]').forEach((meta) => {
      meta.setAttribute("content", swap(meta.getAttribute("content") || ""));
    });
    if (SITE.name) {
      $$(".brand").forEach((link) => link.setAttribute("aria-label", `${SITE.name}首页`));
    }
    if (SITE.email) {
      $$('a[href^="mailto:"]').forEach((link) => {
        link.href = `mailto:${SITE.email}`;
      });
    }
  }

  const byId = (id) => WORKS.find((work) => work.id === id);
  const essays = () => ESSAYS.slice();
  const art = () => ARTWORKS.slice();

  function countAuthors(items) {
    return new Set(
      items
        .map((item) => String(item.author || "").trim())
        .filter(Boolean)
    ).size;
  }

  function applyTotals() {
    const totals = {
      works: WORKS.length,
      essays: ESSAYS.length,
      artworks: ARTWORKS.length,
      authors: countAuthors(WORKS),
      essayAuthors: countAuthors(ESSAYS),
      artAuthors: countAuthors(ARTWORKS),
    };

    $$("[data-total]").forEach((node) => {
      const key = node.dataset.total;
      if (Object.prototype.hasOwnProperty.call(totals, key)) {
        node.textContent = String(totals[key]);
      }
    });
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function essayCard(work, index, options = {}) {
    const dark = Boolean(options.dark);
    const tags = (work.tags || [])
      .map((tag) => `<span class="essay-tag">${escapeHTML(tag)}</span>`)
      .join("");
    return `
      <article class="essay-card${dark ? " essay-card--dark" : ""} reveal" data-work-card="${escapeHTML(work.id)}">
        <button class="work-open" type="button" data-open-essay="${escapeHTML(work.id)}" aria-label="阅读作文《${escapeHTML(work.title)}》">
          <span class="essay-card-top">
            <span class="essay-card-index">${pad(index + 1)}</span>
            <span class="essay-chip">${escapeHTML(work.category)}</span>
          </span>
          <span class="essay-card-title">${escapeHTML(work.title)}</span>
          <span class="essay-card-excerpt">${escapeHTML(work.excerpt)}</span>
          ${dark && work.quote ? `<span class="essay-card-quote">「${escapeHTML(work.quote)}」</span>` : ""}
          <span class="essay-card-foot">
            <span class="essay-card-author"><strong>${escapeHTML(work.author)}</strong><span>${escapeHTML(work.age || "")}</span></span>
            <span class="essay-card-tags">${tags}</span>
            <span class="foot-arrow" aria-hidden="true">↗</span>
          </span>
        </button>
      </article>`;
  }

  function artTile(work, index, options = {}) {
    const eager = Boolean(options.eager);
    return `
      <article class="art-tile reveal" data-art-card="${escapeHTML(work.id)}" data-category="${escapeHTML(work.category)}">
        <button class="art-open" type="button" data-open-art="${escapeHTML(work.id)}" aria-label="查看绘画《${escapeHTML(work.title)}》">
          <span class="art-tile-frame">
            <img src="${escapeHTML(work.src)}" alt="${escapeHTML(work.title)}，${escapeHTML(work.description || "")}" ${eager ? "" : 'loading="lazy"'} decoding="async">
          </span>
          <span class="art-tile-caption">
            <strong>${escapeHTML(work.title)}</strong>
            <span>${escapeHTML(work.author)} · ${escapeHTML(work.medium)}</span>
          </span>
          <span class="art-tile-note">${escapeHTML(work.excerpt || "")}</span>
        </button>
      </article>`;
  }

  /* ---------- 渲染首页 ---------- */

  function renderHome() {
    const essayHost = $("[data-home-essays]");
    if (essayHost) {
      const featured = ESSAYS.filter((work) => work.featured).slice(0, 3);
      essayHost.innerHTML = featured.map((work, i) => essayCard(work, i, { dark: i === 0 })).join("");
    }

    const artHost = $("[data-home-art]");
    if (artHost) {
      const featured = ARTWORKS.filter((work) => work.featured).slice(0, 4);
      artHost.innerHTML = featured.map((work, i) => artTile(work, i, { eager: i < 2 })).join("");
    }
  }

  /* ---------- 作文页 ---------- */

  function initEssayPage() {
    const grid = $("[data-essay-grid]");
    if (!grid) return;

    grid.innerHTML = ESSAYS.map((work, i) => essayCard(work, i)).join("");

    const filterHost = $("[data-essay-filters]");
    const categories = ["全部", ...new Set(ESSAYS.map((work) => work.category))];
    filterHost.innerHTML = categories
      .map(
        (category, i) =>
          `<button class="filter-btn${i === 0 ? " is-active" : ""}" type="button" data-filter="${escapeHTML(category)}" aria-pressed="${i === 0}">${escapeHTML(category)}</button>`
      )
      .join("");

    const input = $("[data-essay-search]");
    const clear = $("[data-essay-clear]");
    const count = $("[data-essay-count]");
    const empty = $("[data-essay-empty]");
    let activeCategory = "全部";

    function update() {
      const query = (input?.value || "").trim().toLowerCase();
      let visible = 0;
      $$(".essay-card", grid).forEach((card) => {
        const work = byId(card.dataset.workCard);
        if (!work) return;
        const matchesCategory = activeCategory === "全部" || work.category === activeCategory;
        const haystack = [work.title, work.author, work.category, work.excerpt, ...(work.tags || [])]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const show = matchesCategory && matchesQuery;
        card.hidden = !show;
        if (show) visible += 1;
      });

      if (count) count.textContent = pad(visible);
      if (empty) empty.hidden = visible !== 0;
      if (clear) clear.classList.toggle("is-visible", Boolean(query));
    }

    filterHost.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      activeCategory = button.dataset.filter;
      $$("[data-filter]", filterHost).forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      update();
    });

    input?.addEventListener("input", update);
    clear?.addEventListener("click", () => {
      input.value = "";
      input.focus();
      update();
    });

    update();
  }

  /* ---------- 画廊页 ---------- */

  function initGalleryPage() {
    const grid = $("[data-gallery-grid]");
    if (!grid) return;

    grid.innerHTML = ARTWORKS.map((work, i) => artTile(work, i, { eager: i < 3 })).join("");

    const filterHost = $("[data-gallery-filters]");
    const categories = ["全部", ...new Set(ARTWORKS.map((work) => work.category))];
    filterHost.innerHTML = categories
      .map(
        (category, i) =>
          `<button class="filter-btn${i === 0 ? " is-active" : ""}" type="button" data-filter="${escapeHTML(category)}" aria-pressed="${i === 0}">${escapeHTML(category)}</button>`
      )
      .join("");

    const count = $("[data-gallery-count]");
    let activeCategory = "全部";

    function update() {
      grid.classList.toggle("is-filtered", activeCategory !== "全部");
      let visible = 0;
      $$(".art-tile", grid).forEach((card) => {
        const show = activeCategory === "全部" || card.dataset.category === activeCategory;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (count) count.textContent = pad(visible);
    }

    filterHost.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      activeCategory = button.dataset.filter;
      $$("[data-filter]", filterHost).forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      update();
    });

    update();
  }

  /* ---------- 滚动出现 ---------- */

  let revealObserver = null;

  function initReveal() {
    const items = $$(".reveal:not(.is-in)");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-in"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
      );
    }
    items.forEach((item) => revealObserver.observe(item));
  }

  /* ---------- 页头与菜单 ---------- */

  function initHeader() {
    const header = $("[data-header]");
    const toggle = $("[data-menu-toggle]");
    const menu = $("[data-mobile-menu]");
    const page = document.body.dataset.page;

    $$("[data-nav]").forEach((link) => {
      if (link.dataset.nav === page) link.setAttribute("aria-current", "page");
    });

    const onScroll = () => {
      header?.classList.toggle("is-scrolled", window.scrollY > 18);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function closeMenu() {
      if (!menu || !toggle) return;
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "打开菜单");
      document.body.classList.remove("is-locked");
    }

    function openMenu() {
      if (!menu || !toggle) return;
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "关闭菜单");
      document.body.classList.add("is-locked");
      const first = $("a", menu);
      window.setTimeout(() => first?.focus(), 240);
    }

    toggle?.addEventListener("click", () => {
      if (toggle.getAttribute("aria-expanded") === "true") closeMenu();
      else openMenu();
    });

    $("[data-menu-close]")?.addEventListener("click", closeMenu);

    $$("a", menu || document.createElement("div")).forEach((link) => link.addEventListener("click", closeMenu));

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu?.classList.contains("is-open")) closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && menu?.classList.contains("is-open")) closeMenu();
    });
  }

  /* ---------- 通用弹层 ---------- */

  const dialogState = {
    lastFocus: null,
    active: null,
  };

  function lockBody() {
    document.body.classList.add("is-locked");
  }

  function unlockBody() {
    if (!$(".reader.is-open") && !$(".lightbox.is-open") && !$(".mobile-menu.is-open")) {
      document.body.classList.remove("is-locked");
    }
  }

  function trapFocus(event, container) {
    if (event.key !== "Tab" || !container) return;
    const focusable = $$(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    ).filter((item) => item.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function rememberFocus() {
    dialogState.lastFocus = document.activeElement;
  }

  function restoreFocus() {
    if (dialogState.lastFocus && typeof dialogState.lastFocus.focus === "function") {
      dialogState.lastFocus.focus({ preventScroll: true });
    }
  }

  /* ---------- 阅读器 ---------- */

  let reader;
  let readerScroll;
  let readerProgress;
  let readerTitle;
  let readerKicker;
  let readerMeta;
  let readerBody;
  let readerNav;
  let currentEssayIndex = -1;

  function buildReader() {
    reader = document.createElement("div");
    reader.className = "reader";
    reader.setAttribute("aria-hidden", "true");
    reader.innerHTML = `
      <div class="reader-backdrop" data-close-reader></div>
      <article class="reader-panel" role="dialog" aria-modal="true" aria-labelledby="readerTitle" aria-describedby="readerBody">
        <div class="reader-progress" aria-hidden="true"><span></span></div>
        <button class="reader-close" type="button" data-close-reader aria-label="关闭阅读器">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <div class="reader-scroll" data-reader-scroll>
          <header class="reader-head">
            <p class="reader-kicker" data-reader-kicker></p>
            <h1 class="reader-title" id="readerTitle" data-reader-title></h1>
            <div class="reader-meta" data-reader-meta></div>
          </header>
          <div class="reader-body" id="readerBody" data-reader-body></div>
          <aside class="reader-comment" data-reader-comment>
            <p class="reader-comment-label">老师批注</p>
            <p data-reader-comment-text></p>
          </aside>
          <nav class="reader-nav" data-reader-nav aria-label="作文切换"></nav>
        </div>
      </article>`;
    document.body.appendChild(reader);

    readerScroll = $("[data-reader-scroll]", reader);
    readerProgress = $(".reader-progress span", reader);
    readerTitle = $("[data-reader-title]", reader);
    readerKicker = $("[data-reader-kicker]", reader);
    readerMeta = $("[data-reader-meta]", reader);
    readerBody = $("[data-reader-body]", reader);
    readerNav = $("[data-reader-nav]", reader);

    reader.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-reader]")) closeReader();
    });

    readerScroll.addEventListener("scroll", updateReaderProgress, { passive: true });
    readerNav.addEventListener("click", (event) => {
      const button = event.target.closest("[data-reader-go]");
      if (button) openEssay(button.dataset.readerGo, true);
    });
  }

  function updateReaderProgress() {
    if (!readerScroll || !readerProgress) return;
    const max = readerScroll.scrollHeight - readerScroll.clientHeight;
    const progress = max > 0 ? Math.min(1, readerScroll.scrollTop / max) : 0;
    readerProgress.style.width = `${progress * 100}%`;
  }

  function renderReader(work) {
    if (!reader || !work) return;
    const index = ESSAYS.findIndex((item) => item.id === work.id);
    currentEssayIndex = index;

    readerKicker.textContent = `青禾集 · ${work.category} · ${work.date.replaceAll("-", ".")}`;
    readerTitle.textContent = work.title;
    readerMeta.innerHTML = `
      <strong>${escapeHTML(work.author)}</strong>
      <span>${escapeHTML(work.age || "")}</span>
      <span class="dot" aria-hidden="true"></span>
      <span>${escapeHTML(work.category)}</span>
      <span class="dot" aria-hidden="true"></span>
      <span>约 ${escapeHTML(String(work.readTime || Math.max(1, Math.ceil((work.body || []).join("").length / 350))))} 分钟</span>`;

    const quoteAt = Math.min(2, (work.body || []).length - 1);
    readerBody.innerHTML = (work.body || [])
      .map((paragraph, i) => {
        const quote = i === quoteAt && work.quote
          ? `<blockquote class="reader-quote">「${escapeHTML(work.quote)}」</blockquote>`
          : "";
        return `<p>${escapeHTML(paragraph)}</p>${quote}`;
      })
      .join("");

    $("[data-reader-comment-text]", reader).textContent = work.comment || "";

    const prev = ESSAYS[index - 1];
    const next = ESSAYS[index + 1];
    readerNav.innerHTML = `
      <button type="button" data-reader-go="${prev ? escapeHTML(prev.id) : ""}" ${prev ? "" : "disabled"}>
        <small>上一篇</small>
        <strong>${prev ? escapeHTML(prev.title) : "已经是第一篇"}</strong>
      </button>
      <button type="button" data-reader-go="${next ? escapeHTML(next.id) : ""}" ${next ? "" : "disabled"}>
        <small>下一篇</small>
        <strong>${next ? escapeHTML(next.title) : "已经是最后一篇"}</strong>
      </button>`;

    readerScroll.scrollTop = 0;
    updateReaderProgress();
  }

  function openReader() {
    if (!reader) return;
    reader.classList.add("is-open");
    reader.setAttribute("aria-hidden", "false");
    lockBody();
    dialogState.active = "reader";
    const close = $(".reader-close", reader);
    window.setTimeout(() => close?.focus({ preventScroll: true }), 120);
  }

  function openEssay(id, keepFocus = false) {
    const work = byId(id);
    if (!work || work.type !== "essay") return;
    if (!reader) buildReader();
    if (!keepFocus) rememberFocus();
    renderReader(work);
    openReader();
    const hash = `#${work.id}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
  }

  function closeReader() {
    if (!reader || !reader.classList.contains("is-open")) return;
    reader.classList.remove("is-open");
    reader.setAttribute("aria-hidden", "true");
    dialogState.active = null;
    if (window.location.hash.startsWith("#essay-")) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    unlockBody();
    restoreFocus();
  }

  /* ---------- 灯箱 ---------- */

  let lightbox;
  let lightboxImg;
  let lightboxTitle;
  let lightboxMeta;
  let lightboxComment;
  let lightboxIndex;
  let currentArtIndex = -1;

  function buildLightbox() {
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
      <div class="lightbox-backdrop" data-close-lightbox></div>
      <div role="dialog" aria-modal="true" aria-labelledby="lightboxTitle">
        <button class="lightbox-close" type="button" data-close-lightbox aria-label="关闭画作">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <div class="lightbox-figure"><img data-lightbox-img alt=""></div>
        <div class="lightbox-caption">
          <div class="lightbox-caption-copy">
            <h2 id="lightboxTitle" data-lightbox-title></h2>
            <p data-lightbox-meta></p>
            <p class="lightbox-comment" data-lightbox-comment></p>
          </div>
          <span class="lightbox-index" data-lightbox-index></span>
        </div>
        <button class="lightbox-arrow lightbox-arrow--prev" type="button" data-lightbox-prev aria-label="上一幅">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
        <button class="lightbox-arrow lightbox-arrow--next" type="button" data-lightbox-next aria-label="下一幅">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>`;
    document.body.appendChild(lightbox);

    lightboxImg = $("[data-lightbox-img]", lightbox);
    lightboxTitle = $("[data-lightbox-title]", lightbox);
    lightboxMeta = $("[data-lightbox-meta]", lightbox);
    lightboxComment = $("[data-lightbox-comment]", lightbox);
    lightboxIndex = $("[data-lightbox-index]", lightbox);

    lightbox.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-lightbox]")) closeLightbox();
      if (event.target.closest("[data-lightbox-prev]")) stepArt(-1);
      if (event.target.closest("[data-lightbox-next]")) stepArt(1);
    });
  }

  function renderLightbox(work) {
    const index = ARTWORKS.findIndex((item) => item.id === work.id);
    currentArtIndex = index;
    lightboxImg.src = work.src;
    lightboxImg.alt = `${work.title}，${work.description || ""}`;
    lightboxTitle.textContent = work.title;
    lightboxMeta.textContent = `${work.author} · ${work.age || ""} · ${work.medium} · ${work.size} · ${work.year}`;
    lightboxComment.textContent = work.comment || work.description || "";
    lightboxIndex.textContent = `${pad(index + 1)} / ${pad(ARTWORKS.length)}`;
    $$("[data-lightbox-prev]", lightbox).forEach((btn) => (btn.disabled = index <= 0));
    $$("[data-lightbox-next]", lightbox).forEach((btn) => (btn.disabled = index >= ARTWORKS.length - 1));
    lightbox.setAttribute("aria-label", `画作：${work.title}`);
  }

  function openLightbox(id) {
    const work = byId(id);
    if (!work || work.type !== "art") return;
    if (!lightbox) buildLightbox();
    rememberFocus();
    renderLightbox(work);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    lockBody();
    dialogState.active = "lightbox";
    window.setTimeout(() => $(".lightbox-close", lightbox)?.focus({ preventScroll: true }), 80);
    const hash = `#${work.id}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    dialogState.active = null;
    if (window.location.hash.startsWith("#art-")) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    unlockBody();
    restoreFocus();
  }

  function stepArt(direction) {
    const nextIndex = currentArtIndex + direction;
    if (nextIndex < 0 || nextIndex >= ARTWORKS.length) return;
    renderLightbox(ARTWORKS[nextIndex]);
    const hash = `#${ARTWORKS[nextIndex].id}`;
    history.replaceState(null, "", hash);
  }

  /* ---------- 全局事件 ---------- */

  function initGlobalEvents() {
    document.addEventListener("click", (event) => {
      const essayButton = event.target.closest("[data-open-essay]");
      if (essayButton) {
        event.preventDefault();
        openEssay(essayButton.dataset.openEssay);
        return;
      }
      const artButton = event.target.closest("[data-open-art]");
      if (artButton) {
        event.preventDefault();
        openLightbox(artButton.dataset.openArt);
      }
    });

    window.addEventListener("keydown", (event) => {
      if (dialogState.active === "reader") {
        if (event.key === "Escape") closeReader();
        trapFocus(event, $(".reader-panel"));
      }
      if (dialogState.active === "lightbox") {
        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") stepArt(-1);
        if (event.key === "ArrowRight") stepArt(1);
        trapFocus(event, $(".lightbox [role='dialog']"));
      }
    });
  }

  function openFromHash() {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const work = byId(hash);
    if (!work) return;
    window.setTimeout(() => {
      if (work.type === "essay") openEssay(work.id);
      if (work.type === "art") openLightbox(work.id);
    }, 120);
  }

  function init() {
    $$("[data-year]").forEach((node) => (node.textContent = new Date().getFullYear()));
    applySite();
    applyTotals();
    initHeader();
    renderHome();
    initEssayPage();
    initGalleryPage();
    initReveal();
    initGlobalEvents();
    openFromHash();

    // 筛选或搜索后，新出现的卡片也要被观察。
    const mutationObserver = new MutationObserver(() => initReveal());
    $$("[data-essay-grid], [data-gallery-grid], [data-home-essays], [data-home-art]").forEach((host) => {
      mutationObserver.observe(host, { childList: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
