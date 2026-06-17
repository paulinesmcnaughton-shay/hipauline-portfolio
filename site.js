/* ============================================================
   Shared site logic — runs on every page.
   Defines PROJECTS + per-section copy, injects cursor / menu /
   spinner / warp overlay, wires the cinematic page transitions.
   ============================================================ */
(function () {
  "use strict";

  /* ---- Project list (single source of truth) — newest to oldest ---- */
  const PROJECTS = [
    { name: "Cengage",    route: "/projects/matrix/cengage.html" },
    { name: "Cisco",      route: "/projects/matrix/cisco.html",      label: "Cisco Meraki" },
    { name: "WildKind",   route: "/projects/matrix/wildkind.html" },
    { name: "VCA",        route: "/projects/matrix/vca.html",        label: "Mars - VCA" },
    { name: "ANKrD",      route: "/projects/matrix/ankrd.html",       soon: true },
    { name: "Enora",      route: "/projects/matrix/enora.html",       soon: true },
    { name: "Games",      route: "/projects/matrix/games.html",      label: "Little Sort" },
    { name: "Pipli",      route: "/projects/matrix/pipli.html",       soon: true },
    { name: "PeteHealth", route: "/projects/matrix/pete-health.html" },
    { name: "Wag",        route: "/projects/matrix/wag.html" },
    { name: "Selected",   route: "/projects/matrix/selected-product-work.html", label: "Selected Work" }
  ];
  window.PROJECTS = PROJECTS;

  /* ABOUT ME is a real, built page; the rest are routes for the live site. */
  const ABOUT_HREF = "/about.html";
  const HOME_HREF = "/portfolio2.html";
  const ORIGINAL_SITE = "/portfolio.html";

  /* ---- Per-section loading copy. ACCESS GRANTED is constant. ---- */
  const WARP_COPY = {
    "HOME":      ["Returning to the grid...", "Reloading the matrix...", "Connection restored..."],
    "ABOUT ME":  ["Loading profile...", "Reading memory archive...", "Identity confirmed..."],
    "PROJECTS":  ["Opening project archive...", "Loading case files...", "Retrieving build history..."],
    "ANKrD":     ["Loading ANKrD...", "Analyzing behavior patterns...", "Preparing financial simulation..."],
    "WildKind":  ["Loading WildKind...", "Scanning species database...", "Connecting to the field guide..."],
    "Cengage":   ["Loading Cengage...", "Generating experiment logs...", "Preparing test environment..."],
    "Enora":     ["Loading Enora...", "Connecting wellness systems...", "Preparing experience archive..."],
    "RESUME":    ["Loading credentials...", "Verifying experience...", "Compiling career history..."],
    "CONTACT":   ["Establishing connection...", "Signal detected...", "Communication channel open..."],
    "WORK WITH ME": ["Opening project workspace...", "Loading inquiry form...", "Let's build something..."],
    "Pipli":     ["Loading Pipli...", "Accessing family data...", "Preparing care experience..."],
    "Wag":       ["Loading Wag...", "Connecting pet network...", "Retrieving pet care flows..."],
    "Selected":  ["Loading selected work...", "Scanning project archive...", "Compiling shipped work..."]
  };
  function copyFor(key) {
    if (WARP_COPY[key]) return WARP_COPY[key];
    return ["Loading " + key + "...", "Loading case files...", "Retrieving build history..."];
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     1. INJECT SHARED DOM (cursor, menu, spinner, warp overlay)
     ========================================================= */
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  const cursorDot = el('<div id="cursor-dot" aria-hidden="true"></div>');
  const cursorPill = el('<div id="cursor-pill" aria-hidden="true"></div>');

  const menuBtn = el(
    '<button id="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="menu-panel"><span></span><span></span><span></span></button>'
  );
  const menuOverlay = el('<div id="menu-overlay" hidden></div>');
  const menuPanel = el(
    '<aside id="menu-panel" aria-label="Site menu" aria-hidden="true">' +
      '<div class="menu-head"><span class="menu-title">// index</span></div>' +
      '<nav id="menu-list"></nav></aside>'
  );

  const spinner = el(
    '<a id="spinner" href="#" role="img" aria-label="System still running" tabindex="0">' +
      '<svg viewBox="0 0 44 54" aria-hidden="true">' +
        '<rect x="20" y="4" width="4" height="9" rx="1.5" fill="currentColor" opacity="0.8"></rect>' +
        '<path d="M22 11 L5 24 L22 50 Z" fill="currentColor" opacity="0.5"></path>' +
        '<path d="M22 11 L39 24 L22 50 Z" fill="currentColor" opacity="0.92"></path>' +
        '<path d="M5 24 L39 24" stroke="currentColor" stroke-width="1" opacity="0.35"></path>' +
      '</svg>' +
      '<span class="spin-tip">SYSTEM ONLINE</span>' +
    '</a>'
  );

  const warp = el(
    '<div id="warp" aria-hidden="true"><div class="warp-stage">' +
      '<div class="warp-title">ACCESS GRANTED</div>' +
      '<ul class="warp-lines"></ul>' +
    '</div></div>'
  );

  function mount() {
    document.body.appendChild(cursorDot);
    document.body.appendChild(menuBtn);
    document.body.appendChild(menuOverlay);
    document.body.appendChild(menuPanel);
    if (!document.body.hasAttribute("data-no-spinner")) document.body.appendChild(spinner);
    document.body.appendChild(warp);
    initCursor();
    initMenu();
    if (spinner.isConnected) spinner.addEventListener("click", (e) => e.preventDefault());

    // Move data-page from <body> to <main> so the warp-in animation's transform
    // never creates a stacking context on body — which would break position:fixed
    // on the spinner and other chrome elements during and after the animation.
    if (document.body.hasAttribute("data-page")) {
      const main = document.querySelector("main");
      if (main && !main.hasAttribute("data-page")) {
        main.setAttribute("data-page", document.body.getAttribute("data-page") || "");
        document.body.removeAttribute("data-page");
      }
    }
  }

  /* =========================================================
     2. CUSTOM CURSOR (green dot + trailing snake-text)
     ========================================================= */
  const DEFAULT_PILL = "Welcome";
  const SNAKE_GAP = 13;   // distance between letters in the snake (px)
  function initCursor() {
    let mx = innerWidth / 2, my = innerHeight / 2;
    let px = mx, py = my;
    let ready = false;

    // The trailing snake only appears on pages flagged data-pill (the home page).
    const hasPill = document.body.hasAttribute("data-pill");
    if (hasPill) document.body.appendChild(cursorPill);

    // Each letter is its own positioned glyph that chases the one ahead of it.
    let letters = [];
    function buildSnake(text) {
      cursorPill.textContent = "";
      letters = [];
      [...(text || DEFAULT_PILL)].forEach((ch) => {
        const s = document.createElement("span");
        s.className = "snake-letter";
        s.textContent = ch === " " ? "\u00a0" : ch;
        cursorPill.appendChild(s);
        letters.push({ el: s, x: px, y: py });
      });
    }
    if (hasPill) buildSnake(DEFAULT_PILL);

    window.setPill = function (text, hot) {
      if (!hasPill) return;
      cursorPill.classList.toggle("hot", !!hot);
      buildSnake(text);
    };

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!ready) { ready = true; document.body.classList.add("cursor-on"); }
    });
    window.addEventListener("mouseleave", () => document.body.classList.remove("cursor-on"));
    window.addEventListener("mouseenter", () => { if (ready) document.body.classList.add("cursor-on"); });
    document.addEventListener("mousedown", () => { cursorDot.style.scale = "0.6"; });
    document.addEventListener("mouseup", () => { cursorDot.style.scale = "1"; });

    (function loop() {
      px += (mx - px) * 0.22;
      py += (my - py) * 0.22;
      cursorDot.style.transform = "translate(" + mx + "px," + my + "px)";
      if (hasPill && letters.length) {
        // Head letter trails just behind the cursor; the rest chain off it.
        const head = letters[0];
        head.x = px + 18; head.y = py + 20;
        head.el.style.transform = "translate(" + head.x + "px," + head.y + "px)";
        for (let i = 1; i < letters.length; i++) {
          const prev = letters[i - 1], cur = letters[i];
          let dx = cur.x - prev.x, dy = cur.y - prev.y;
          const d = Math.hypot(dx, dy) || 0.0001;
          cur.x = prev.x + (dx / d) * SNAKE_GAP;
          cur.y = prev.y + (dy / d) * SNAKE_GAP;
          cur.el.style.transform = "translate(" + cur.x + "px," + cur.y + "px)";
        }
      }
      requestAnimationFrame(loop);
    })();
  }

  /* =========================================================
     3. MENU DRAWER (built from PROJECTS + About Me)
     ========================================================= */
  let closeMenu = function () {};
  function initMenu() {
    const listEl = menuPanel.querySelector("#menu-list");

    const entries = [{ name: "Home", href: HOME_HREF, warp: "HOME", home: true }]
      .concat(PROJECTS.map((p) => ({ name: p.name, href: p.route, warp: p.name, label: p.label, soon: p.soon })))
      .concat([
        { name: "About Me", href: ABOUT_HREF, warp: "ABOUT ME", about: true },
        { name: "Work With Me", href: "/work-together.html", warp: "WORK WITH ME", workwith: true },
        { name: "Classic Portfolio", href: ORIGINAL_SITE, blue: true }
      ]);

    let projNo = 0;
    entries.forEach((p) => {
      const soon = !!p.soon;
      const a = document.createElement(soon ? "span" : "a");
      a.className = "m-item" + (p.about ? " m-about" : "") + (p.home ? " m-home" : "") + (soon ? " m-soon" : "") + (p.blue ? " m-bluepill" : "") + (p.workwith ? " m-workwith" : "");
      if (!soon) { a.href = p.href; }
      if (!soon && !p.blue) { a.dataset.warp = p.warp; }   // classic portfolio link navigates directly, no warp
      // classic portfolio opens in the same tab
      const label = p.label || p.name;
      if (p.home) {
        a.setAttribute("aria-label", "Return to home");
        a.innerHTML = '<span class="idx">//</span><span class="lbl">Home</span><span class="arr">\u2192</span>';
      } else if (p.about) {
        a.setAttribute("aria-label", "About Pauline Shay");
        a.innerHTML = '<span class="idx">//</span><span class="lbl">' + label + '</span><span class="arr">\u2192</span>';
      } else if (p.workwith) {
        a.setAttribute("aria-label", "Work with Pauline \u2014 start a project");
        a.innerHTML = '<span class="idx">//</span><span class="lbl">' + label + '</span><span class="arr">\u2192</span>';
      } else if (p.blue) {
        a.setAttribute("aria-label", "Classic portfolio — open the classic portfolio (opens in a new tab)");
        a.innerHTML = '<span class="idx">//</span><span class="lbl">' + label + '</span><span class="arr">\u2197</span>';
      } else {
        projNo++;
        const idx = '<span class="idx">' + String(projNo).padStart(2, "0") + '</span>';
        if (soon) {
          a.setAttribute("aria-label", p.name + " — coming soon.");
          a.setAttribute("aria-disabled", "true");
          a.innerHTML = idx + '<span class="lbl">' + label + '</span><span class="soon-tag">soon</span>';
        } else {
          a.setAttribute("aria-label", "Open " + p.name + " case study.");
          a.innerHTML = idx + '<span class="lbl">' + label + '</span><span class="arr">\u2192</span>';
        }
      }
      listEl.appendChild(a);

      // Attach warp handler directly — don't rely on event bubbling through the panel
      if (a.dataset.warp) {
        a.addEventListener("click", function (ev) {
          if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
          ev.preventDefault();
          ev.stopPropagation();
          runWarp(a.dataset.warp, a.getAttribute("href"));
        });
      }
    });

    const links = listEl.querySelectorAll("a");
    let open = false, overlayTimer;

    function setOpen(v) {
      open = v;
      menuBtn.setAttribute("aria-expanded", String(v));
      menuPanel.classList.toggle("open", v);
      menuPanel.setAttribute("aria-hidden", String(!v));
      menuBtn.setAttribute("aria-label", v ? "Close menu" : "Open menu");
      clearTimeout(overlayTimer);
      if (v) {
        // Compensate for scrollbar disappearing so the page doesn't shift
        const sb = window.innerWidth - document.documentElement.clientWidth;
        if (sb > 0) document.body.style.paddingRight = sb + "px";
        document.body.style.overflow = "hidden";
        menuOverlay.hidden = false;
        requestAnimationFrame(() => menuOverlay.classList.add("open"));
        if (links[0]) links[0].focus({ preventScroll: true });
      } else {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        menuOverlay.classList.remove("open");
        overlayTimer = setTimeout(() => { menuOverlay.hidden = true; }, 380);
      }
    }
    closeMenu = () => setOpen(false);

    menuBtn.addEventListener("click", () => setOpen(!open));
    menuOverlay.addEventListener("click", () => { setOpen(false); menuBtn.focus(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) { setOpen(false); menuBtn.focus(); }
    });
  }

  /* =========================================================
     4. WARP TRANSITIONS
     ========================================================= */
  let warping = false;
  const linesEl = warp.querySelector(".warp-lines");

  function runWarp(key, href) {
    if (warping || !href) return;
    warping = true;
    closeMenu();

    // pause the matrix rain on pages that have it (matrix.html handles this event)
    document.dispatchEvent(new CustomEvent("warp:start"));

    // build copy
    linesEl.innerHTML = "";
    copyFor(key).forEach((txt) => {
      const li = document.createElement("li");
      li.textContent = txt;
      linesEl.appendChild(li);
    });

    warp.classList.add("show");
    const lis = linesEl.querySelectorAll("li");
    lis.forEach((li, i) => setTimeout(() => li.classList.add("in"), 140 + i * 150));

    const HOLD = 680; // 500–800ms before the warp fires

    if (reduceMotion) {
      setTimeout(() => navigate(href), HOLD + 120);
    } else {
      setTimeout(() => {
        warp.classList.add("warp");
        setTimeout(() => navigate(href), 860);
      }, HOLD);
    }
  }

  function navigate(href) {
    window.location.href = href;
  }

  // Delegate clicks from any [data-warp] link (project words + menu items)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-warp]");
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    runWarp(a.dataset.warp, a.getAttribute("href"));
  });
  // keyboard: Enter on a focused project word / menu item
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const a = document.activeElement;
    if (a && a.matches && a.matches("a[data-warp]")) {
      e.preventDefault();
      runWarp(a.dataset.warp, a.getAttribute("href"));
    }
  });

  /* ---- bfcache restore: reset warp overlay so back-navigation never shows a blank screen ---- */
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      warp.classList.remove("show", "warp");
      warping = false;
    }
  });

  /* ---- boot ---- */
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
