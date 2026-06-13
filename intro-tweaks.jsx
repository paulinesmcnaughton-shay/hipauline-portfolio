
/* ============================================================
   intro-tweaks.jsx — the Tweaks panel for the front door.
   Owns the four live controls and bridges them into the
   vanilla engine (window.__intro) + CSS variables.
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "pace": 5,
  "termColor": "#5dff96",
  "glitch": "High",
  "crtZoom": 80
}/*EDITMODE-END*/;

const TERM_COLORS = [
  "#5dff96", /* phosphor green (default) */
  "#ffb000", /* amber */
  "#eaf2ec", /* paper white */
  "#7fdfff"  /* ice blue */
];

function applyVisual(t) {
  const root = document.documentElement.style;
  root.setProperty("--term-color", t.termColor);
  root.setProperty("--crt-zoom", (t.crtZoom / 100).toFixed(3));
}

function IntroTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const firstRun = React.useRef(true);

  // Push color + zoom to CSS, pace + glitch to the engine, every change.
  React.useEffect(() => {
    applyVisual(t);
    if (window.__intro) {
      window.__intro.setPace(t.pace);
      window.__intro.setGlitch(t.glitch);
    }
  }, [t.termColor, t.crtZoom, t.pace, t.glitch]);

  // Boot the engine once React is alive; replay when pacing changes so the
  // user actually sees the new speed.
  React.useEffect(() => {
    if (!window.__intro) return;
    if (firstRun.current) {
      firstRun.current = false;
      window.__intro.boot();
    } else {
      window.__intro.replay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.pace]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Timing" />
      <TweakSlider label="Intro speed" value={t.pace} min={1} max={5} step={1}
                   onChange={(v) => setTweak("pace", v)} />
      <TweakButton label="Replay intro" secondary
                   onClick={() => window.__intro && window.__intro.replay()} />

      <TweakSection label="Terminal" />
      <TweakColor label="Phosphor" value={t.termColor} options={TERM_COLORS}
                  onChange={(v) => setTweak("termColor", v)} />

      <TweakSection label="Red pill" />
      <TweakRadio label="Glitch" value={t.glitch}
                  options={["Low", "Medium", "High"]}
                  onChange={(v) => setTweak("glitch", v)} />

      <TweakSection label="Layout" />
      <TweakSlider label="Machine size" value={t.crtZoom} min={80} max={125} step={1} unit="%"
                   onChange={(v) => setTweak("crtZoom", v)} />
    </TweaksPanel>
  );
}

// Apply persisted defaults immediately (before the panel is ever opened) so the
// static page already reflects them, then mount the panel.
applyVisual(TWEAK_DEFAULTS);
if (window.__intro) {
  window.__intro.setPace(TWEAK_DEFAULTS.pace);
  window.__intro.setGlitch(TWEAK_DEFAULTS.glitch);
}
ReactDOM.createRoot(document.getElementById("tweak-root")).render(<IntroTweaks />);
