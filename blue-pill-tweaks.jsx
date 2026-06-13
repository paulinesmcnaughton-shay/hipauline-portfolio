/* Tweaks island for the Blue Pill portfolio.
   Applies values to <html> via CSS custom properties + data-attributes,
   so the static page stays directly editable. */

const BP_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2a6fdb",
  "fonts": "Grotesk",
  "theme": "Light",
  "cards": "Flat"
}/*EDITMODE-END*/;

function BluePillTweaks() {
  const [t, setTweak] = useTweaks(BP_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", t.accent);
    root.setAttribute("data-font", t.fonts === "Serif" ? "serif" : "grotesk");
    root.setAttribute("data-theme", t.theme === "Dark" ? "dark" : "light");
    root.setAttribute("data-cards", t.cards === "Bordered" ? "bordered" : "flat");
  }, [t.accent, t.fonts, t.theme, t.cards]);

  return (
    <TweaksPanel>
      <TweakSection label="Theme" />
      <TweakRadio label="Mode" value={t.theme} options={["Light", "Dark"]}
                  onChange={(v) => setTweak("theme", v)} />
      <TweakColor label="Accent" value={t.accent}
                  options={["#2a6fdb", "#111114", "#4f46e5", "#0f8a5b"]}
                  onChange={(v) => setTweak("accent", v)} />
      <TweakSection label="Typography" />
      <TweakRadio label="Headings" value={t.fonts} options={["Grotesk", "Serif"]}
                  onChange={(v) => setTweak("fonts", v)} />
      <TweakSection label="Project cards" />
      <TweakRadio label="Style" value={t.cards} options={["Flat", "Bordered"]}
                  onChange={(v) => setTweak("cards", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("bp-tweaks-root")).render(<BluePillTweaks />);
