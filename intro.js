/* ============================================================
   intro.js — the front-door engine.
   Power-on → camera push → terminal types → the choice.
   Red pill: glitch + portal warp into the Matrix homepage.
   Blue pill: a clean fade out to the traditional portfolio.

   The React Tweaks panel boots & feeds this engine; if React
   never loads, a safety timer boots it with the defaults below.
   ============================================================ */
(function () {
  "use strict";

  /* ---- The one thing to set once Pauline hands over her URL ---- */
  var ORIGINAL_SITE = "portfolio.html"; /* Blue pill → traditional portfolio */
  var MATRIX_HOME = "portfolio2.html";     /* Red pill → Matrix portfolio */

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function isMobileEarly() { return window.matchMedia("(max-width: 560px)").matches; }
  var LINE_WELCOME = isMobileEarly()
    ? "Welcome to Pauline\u2019s Portfolio"
    : "Welcome to Pauline\u2019s Portfolio.";
  var LINE_PROMPT = "What do you decide to do?";

  /* ---- DOM ---- */
  var crt     = document.getElementById("crt");
  var screenEl= document.getElementById("screen");
  var linesEl = document.getElementById("lines");
  var choices = document.getElementById("choices");
  var redPill = document.getElementById("redPill");
  var bluePill= document.getElementById("bluePill");
  var skipBtn = document.getElementById("skip");
  var portal  = document.getElementById("portal");
  var placard = document.getElementById("placard");

  /* ---- Tunables (defaults; the panel overrides these) ---- */
  var PACE = 2;                       /* 1 brisk … 5 slow */
  var GLITCH = "Medium";
  var GLITCH_MAP = {
    Low:    { amt: 0.5,  dur: 480 },
    Medium: { amt: 0.85, dur: 720 },
    High:   { amt: 1.3,  dur: 1020 }
  };

  function factor() { return 0.5 + PACE * 0.28; }     /* PACE 2 ≈ 1.06 */

  var runId = 0;            /* bumps on every (re)start to cancel stale typing */
  var booted = false;
  var transitioning = false;

  /* ---- helpers ---- */
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function makeCaret() {
    var c = document.createElement("span");
    c.className = "caret";
    return c;
  }
  function dropCaret() {
    var c = linesEl.querySelector(".caret");
    if (c) c.remove();
  }

  /* type one line; resolves when done (or aborts if a newer run started) */
  function typeLine(text, cls) {
    return new Promise(function (resolve) {
      var id = runId;
      var line = document.createElement("div");
      line.className = "ln" + (cls ? " " + cls : "");
      var textNode = document.createTextNode("");
      line.appendChild(textNode);
      dropCaret();
      linesEl.appendChild(line);
      var caret = makeCaret();
      line.appendChild(caret);

      var i = 0;
      var base = 30;
      function step() {
        if (id !== runId) { resolve(); return; }      /* cancelled */
        if (i >= text.length) { resolve(); return; }
        var ch = text.charAt(i++);
        textNode.textContent += ch;
        var jitter = (ch === " ") ? 0 : (Math.random() * 26 - 8);
        var d = (base + jitter) * factor();
        if (ch === "." || ch === "?") d += 140 * factor();   /* breathe on punctuation */
        setTimeout(step, Math.max(8, d));
      }
      step();
    });
  }

  function blankLine() {
    var d = document.createElement("div");
    d.className = "ln";
    d.innerHTML = "&nbsp;";
    dropCaret();
    linesEl.appendChild(d);
  }

  function showChoices() {
    if (isMobileEarly()) {
      /* mobile only: caret on its own row + spacer before CTAs */
      dropCaret();
      var caretRow = document.createElement("div");
      caretRow.className = "ln caret-row";
      caretRow.appendChild(makeCaret());
      linesEl.appendChild(caretRow);
      var gap = document.createElement("div");
      gap.className = "ln gap";
      gap.innerHTML = "&nbsp;";
      linesEl.appendChild(gap);
    }
    /* desktop: leave caret on the question line (original behavior) */

    choices.hidden = false;
    /* next frame so the transition runs */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { choices.classList.add("in"); });
    });
  }

  function resetVisuals() {
    choices.hidden = true;
    choices.classList.remove("in");
    linesEl.innerHTML = "";
    screenEl.classList.remove("glitch");
    crt.classList.remove("warp");
    portal.classList.remove("fire");
  }

  /* ---- the cinematic run ---- */
  function run() {
    var id = ++runId;
    transitioning = false;
    resetVisuals();
    crt.classList.remove("pushed");
    /* push duration tracks pace */
    crt.style.setProperty("--push-dur", (2.2 * factor()).toFixed(2) + "s");

    if (reduce) {
      /* reduced motion: skip the dolly + power flash, just present it */
      crt.style.transition = "none";
      crt.classList.add("pushed");
      screenEl.classList.add("on");
      skipBtn.hidden = true;
      linesEl.innerHTML =
        '<div class="ln">' + LINE_WELCOME + '</div>' +
        '<div class="ln q">' + LINE_PROMPT + (isMobileEarly() ? '' : '<span class="caret"></span>') + '</div>';
      showChoices();
      return;
    }

    /* power on */
    screenEl.classList.add("boot", "on");
    skipBtn.hidden = false;

    (async function () {
      await wait(150);
      if (id !== runId) return;
      crt.classList.add("pushed");                 /* camera pushes toward the glass */
      await wait(620 * factor());
      if (id !== runId) return;
      screenEl.classList.remove("boot");

      await typeLine(LINE_WELCOME);
      if (id !== runId) return;
      await wait(620 * factor());
      if (id !== runId) return;

      await typeLine(LINE_PROMPT, "q");
      if (id !== runId) return;
      await wait(420 * factor());
      if (id !== runId) return;
      showChoices();
    })();
  }

  /* skip straight to the choice */
  function skip() {
    if (transitioning) return;
    runId++;                                        /* cancel any typing */
    skipBtn.hidden = true;
    screenEl.classList.remove("boot");
    screenEl.classList.add("on");
    crt.style.transition = "none";
    crt.classList.add("pushed");
    /* re-enable transitions next frame so later warp animates */
    requestAnimationFrame(function () { crt.style.transition = ""; });
    linesEl.innerHTML =
      '<div class="ln">' + LINE_WELCOME + '</div>' +
      '<div class="ln q">' + LINE_PROMPT + (isMobileEarly() ? '' : '<span class="caret"></span>') + '</div>';
    showChoices();
  }

  /* ---- RED PILL: glitch → fly into the screen → Matrix ---- */
  function takeRed() {
    if (transitioning) return;
    transitioning = true;
    runId++;
    skipBtn.hidden = true;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();

    var g = GLITCH_MAP[GLITCH] || GLITCH_MAP.Medium;

    if (reduce) {
      portal.classList.add("fire");
      setTimeout(function () { window.location.href = MATRIX_HOME; }, 650);
      return;
    }

    screenEl.style.setProperty("--glitch", g.amt);
    screenEl.classList.add("glitch");

    setTimeout(function () {
      crt.classList.remove("pushed");
      crt.classList.add("warp");                    /* accelerate into the glass */
      portal.classList.add("fire");                 /* green bloom swallows the view */
      setTimeout(function () { window.location.href = MATRIX_HOME; }, 900);
    }, g.dur);
  }

  /* ---- BLUE PILL: no drama, fade to the traditional portfolio ---- */
  function takeBlue() {
    if (transitioning) return;
    transitioning = true;
    runId++;
    skipBtn.hidden = true;
    if (placard) placard.style.opacity = "0";
    document.body.classList.add("fade-out");
    setTimeout(function () { window.location.href = ORIGINAL_SITE; }, 720);
  }

  /* ---- wiring ---- */
  redPill.addEventListener("click", takeRed);
  bluePill.addEventListener("click", takeBlue);
  skipBtn.addEventListener("click", skip);

  document.addEventListener("keydown", function (e) {
    if (transitioning) return;
    var k = e.key.toLowerCase();
    if (k === "r") { e.preventDefault(); takeRed(); }
    else if (k === "b") { e.preventDefault(); takeBlue(); }
    else if (e.key === "Escape" && !choices.classList.contains("in")) { e.preventDefault(); skip(); }
  });

  /* ---- public API for the Tweaks bridge ---- */
  window.__intro = {
    boot: function () {
      if (booted) return;
      booted = true;
      run();
    },
    replay: function () {
      booted = true;
      transitioning = false;
      run();
    },
    setPace: function (p) { PACE = +p || 2; },
    setGlitch: function (level) { if (GLITCH_MAP[level]) GLITCH = level; },
    isBooted: function () { return booted; }
  };

  /* ---- safety net: if React never boots us, boot ourselves ---- */
  setTimeout(function () { window.__intro.boot(); }, 1700);

  /* preview helper: ?skip=1 jumps straight to the choice */
  if (/[?&]skip=1(?:&|$)/.test(location.search)) {
    setTimeout(function () {
      window.__intro.boot();
      setTimeout(skip, 40);
    }, 120);
  }
})();
