/* ============================================================
   风禾有章 · 交互
   渲染、风格筛选、搜索、阅读器、分类索引、移动端菜单。
   ============================================================ */

(function () {
  "use strict";

  const store = window.QINGHE || {};
  const SITE = store.SITE || {};
  const ESSAYS = store.ESSAYS || [];
  const WORKS = store.WORKS || ESSAYS;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const STYLE_ORDER = ["风物", "心绪", "生长"];
  const STYLE_NOTES = {
    风物: "目光停在枝叶、光影、雨雾与村庄的晨昏里。",
    心绪: "树影与心事互相照见，风一吹，句子就有了温度。",
    生长: "由树及人，写时间、陪伴，也写少年自己的成长。",
  };

  const escapeHTML = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const SITE_DEFAULTS = {
    name: "风禾有章",
    mark: "风禾",
    english: "FENGHE ANTHOLOGY",
    className: "高一（1）班 · 高一（3）班",
    term: "2026 秋",
    termShort: "2026 秋",
    teacher: "中高一体部语文组",
    school: "中高一体部",
  };

  function applySite() {
    if (SITE.intro) {
      $$(".hero-intro").forEach((node) => (node.textContent = SITE.intro));
    }
    if (SITE.themeTitle) {
      $$(".hero-foot-theme").forEach((node) => (node.textContent = SITE.themeTitle));
      const themeKicker = $(".quote-feature .kicker");
      if (themeKicker) themeKicker.textContent = `本期主题 · ${SITE.themeTitle}`;
      $$(".quote-feature-seal").forEach(
        (node) => (node.textContent = SITE.themeSeal || SITE.themeTitle)
      );
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
    while ((node = walker.nextNode())) node.nodeValue = swap(node.nodeValue);

    document.title = swap(document.title);
    $$('meta[name="description"]').forEach((meta) => {
      meta.setAttribute("content", swap(meta.getAttribute("content") || ""));
    });
    if (SITE.name) {
      $$(".brand").forEach((link) => link.setAttribute("aria-label", `${SITE.name}首页`));
    }
  }

  const byId = (id) => WORKS.find((work) => work.id === id);

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
      authors: countAuthors(WORKS),
      essayAuthors: countAuthors(ESSAYS),
    };

    $$("[data-total]").forEach((node) => {
      const key = node.dataset.total;
      if (Object.prototype.hasOwnProperty.call(totals, key)) {
        node.textContent = String(totals[key]);
      }
    });

    const categoryCounts = {};
    ESSAYS.forEach((work) => {
      categoryCounts[work.category] = (categoryCounts[work.category] || 0) + 1;
    });
    $$("[data-category-count]").forEach((node) => {
      node.textContent = String(categoryCounts[node.dataset.categoryCount] || 0);
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
        <button class="work-open" type="button" data-open-essay="${escapeHTML(work.id)}" aria-label="阅读《${escapeHTML(work.title)}》">
          <span class="essay-card-top">
            <span class="essay-card-index">${pad(index + 1)}</span>
            <span class="essay-chip">${escapeHTML(work.category)}</span>
          </span>
          ${work.image ? `<span class="essay-card-image"><img src="${escapeHTML(work.image)}" alt="${escapeHTML(work.imageAlt || work.title + "配图")}" loading="lazy" decoding="async"></span>` : ""}
          <span class="essay-card-title">${escapeHTML(work.title)}</span>
          <span class="essay-card-excerpt">${escapeHTML(work.excerpt)}</span>
          ${dark && work.quote ? `<span class="essay-card-quote">「${escapeHTML(work.quote)}」</span>` : ""}
          <span class="essay-card-foot">
            <span class="essay-card-author"><strong>${escapeHTML(work.author)}</strong><span>${escapeHTML(work.className || "")}</span></span>
            <span class="essay-card-tags">${tags}</span>
            <span class="foot-arrow" aria-hidden="true">↗</span>
          </span>
        </button>
      </article>`;
  }

  /* ---------- 首页 ---------- */

  function renderHome() {
    const host = $("[data-home-essays]");
    if (!host) return;
    const featured = ESSAYS.filter((work) => work.featured).slice(0, 3);
    host.innerHTML = featured.map((work, i) => essayCard(work, i, { dark: i === 0 })).join("");
  }

  /* ---------- 习作集 ---------- */

  function initEssayPage() {
    const grid = $("[data-essay-grid]");
    if (!grid) return;

    grid.innerHTML = ESSAYS.map((work, i) => essayCard(work, i)).join("");

    const filterHost = $("[data-essay-filters]");
    const extras = [...new Set(ESSAYS.map((work) => work.category))].filter(
      (category) => !STYLE_ORDER.includes(category)
    );
    const categories = ["全部", ...STYLE_ORDER, ...extras];
    const requested = new URLSearchParams(window.location.search).get("style");
    let activeCategory = categories.includes(requested) ? requested : "全部";

    filterHost.innerHTML = categories
      .map(
        (category) =>
          `<button class="filter-btn${category === activeCategory ? " is-active" : ""}" type="button" data-filter="${escapeHTML(category)}" aria-pressed="${category === activeCategory}">${escapeHTML(category)}</button>`
      )
      .join("");

    const input = $("[data-essay-search]");
    const clear = $("[data-essay-clear]");
    const count = $("[data-essay-count]");
    const empty = $("[data-essay-empty]");

    function update() {
      const query = (input?.value || "").trim().toLowerCase();
      let visible = 0;
      $$(".essay-card", grid).forEach((card) => {
        const work = byId(card.dataset.workCard);
        if (!work) return;
        const matchesCategory = activeCategory === "全部" || work.category === activeCategory;
        const haystack = [
          work.title,
          work.author,
          work.className,
          work.category,
          work.excerpt,
          ...(work.tags || []),
        ]
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

  /* ---------- 分类索引 ---------- */

  function initCategoryPage() {
    const host = $("[data-category-index]");
    if (!host) return;

    host.innerHTML = STYLE_ORDER.map((category, index) => {
      const items = ESSAYS.filter((work) => work.category === category);
      const list = items
        .map(
          (work) => `
            <a class="category-item" href="essays.html?style=${encodeURIComponent(category)}#${escapeHTML(work.id)}">
              <span class="category-item-title">${escapeHTML(work.title)}</span>
              <span class="category-item-meta">${escapeHTML(work.author)} · ${escapeHTML(work.className || "")}</span>
              <span class="category-item-arrow" aria-hidden="true">↗</span>
            </a>`
        )
        .join("");
      return `
        <section class="category-block reveal">
          <header class="category-block-head">
            <span class="category-no">${pad(index + 1)}</span>
            <h2>${escapeHTML(category)}</h2>
            <p>${escapeHTML(STYLE_NOTES[category] || "")}</p>
            <span class="category-count">${items.length} 篇</span>
          </header>
          <div class="category-list">${list}</div>
        </section>`;
    }).join("");
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
    $$("a", menu || document.createElement("div")).forEach((link) =>
      link.addEventListener("click", closeMenu)
    );

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu?.classList.contains("is-open")) closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && menu?.classList.contains("is-open")) closeMenu();
    });
  }

  /* ---------- 弹层通用 ---------- */

  const dialogState = { lastFocus: null, active: null };

  function lockBody() {
    document.body.classList.add("is-locked");
  }

  function unlockBody() {
    if (!$(".reader.is-open") && !$(".mobile-menu.is-open")) {
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
          <figure class="reader-illustration" data-reader-figure hidden>
            <img data-reader-image alt="">
            <figcaption data-reader-caption></figcaption>
          </figure>
          <div class="reader-body" id="readerBody" data-reader-body></div>
          <aside class="reader-comment" data-reader-comment hidden>
            <p class="reader-comment-label">编辑手记</p>
            <p data-reader-comment-text></p>
          </aside>
          <nav class="reader-nav" data-reader-nav aria-label="篇目切换"></nav>
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
    const readTime = work.readTime || Math.max(1, Math.ceil((work.body || []).join("").length / 350));

    readerKicker.textContent = `风禾有章 · ${work.category}`;
    readerTitle.textContent = work.title;
    readerMeta.innerHTML = `
      <strong>${escapeHTML(work.author)}</strong>
      <span>${escapeHTML(work.className || "")}</span>
      <span class="dot" aria-hidden="true"></span>
      <span>${escapeHTML(work.category)}</span>
      <span class="dot" aria-hidden="true"></span>
      <span>约 ${escapeHTML(String(readTime))} 分钟</span>`;

    const quoteAt = Math.min(2, (work.body || []).length - 1);
    const quoteInBody = (work.body || []).some((paragraph) =>
      paragraph.includes(work.quote || "__never__")
    );
    const figure = $("[data-reader-figure]", reader);
    const figureImage = $("[data-reader-image]", reader);
    const figureCaption = $("[data-reader-caption]", reader);
    if (work.image) {
      figure.hidden = false;
      figureImage.src = work.image;
      figureImage.alt = work.imageAlt || `${work.title}配图`;
      figureCaption.textContent = `配图 · ${work.title}`;
    } else {
      figure.hidden = true;
      figureImage.removeAttribute("src");
      figureImage.alt = "";
      figureCaption.textContent = "";
    }

    readerBody.innerHTML = (work.body || [])
      .map((paragraph, i) => {
        const quote =
          i === quoteAt && work.quote && !quoteInBody
            ? `<blockquote class="reader-quote">「${escapeHTML(work.quote)}」</blockquote>`
            : "";
        return `<p>${escapeHTML(paragraph)}</p>${quote}`;
      })
      .join("");

    const commentBox = $("[data-reader-comment]", reader);
    const commentText = $("[data-reader-comment-text]", reader);
    if (work.comment) {
      commentBox.hidden = false;
      commentText.textContent = work.comment;
    } else {
      commentBox.hidden = true;
      commentText.textContent = "";
    }

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
    window.setTimeout(() => $(".reader-close", reader)?.focus({ preventScroll: true }), 120);
  }

  function openEssay(id, keepFocus = false) {
    const work = byId(id);
    if (!work) return;
    if (!reader) buildReader();
    if (!keepFocus) rememberFocus();
    renderReader(work);
    openReader();
    const hash = `#${work.id}`;
    if (window.location.hash !== hash) history.replaceState(null, "", hash);
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

  /* ---------- 全局事件 ---------- */

  function initGlobalEvents() {
    document.addEventListener("click", (event) => {
      const essayButton = event.target.closest("[data-open-essay]");
      if (!essayButton) return;
      event.preventDefault();
      openEssay(essayButton.dataset.openEssay);
    });

    window.addEventListener("keydown", (event) => {
      if (dialogState.active !== "reader") return;
      if (event.key === "Escape") closeReader();
      trapFocus(event, $(".reader-panel"));
    });
  }

  function openFromHash() {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const work = byId(hash);
    if (!work) return;
    window.setTimeout(() => openEssay(work.id), 120);
  }

  function init() {
    $$("[data-year]").forEach((node) => (node.textContent = new Date().getFullYear()));
    applySite();
    applyTotals();
    initHeader();
    renderHome();
    initEssayPage();
    initCategoryPage();
    initReveal();
    initGlobalEvents();
    openFromHash();

    const mutationObserver = new MutationObserver(() => initReveal());
    $$("[data-essay-grid], [data-home-essays], [data-category-index]").forEach((host) => {
      mutationObserver.observe(host, { childList: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
