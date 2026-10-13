/* The reference edition's theme shortcut, using native PreTeXt settings. */
(() => {
  "use strict";
  function startReading() {
    const toolbar = document.querySelector(".nav-other-controls");
    if (!toolbar || document.getElementById("reading-theme-toggle")) return;
    const button = document.createElement("button");
    button.id = "reading-theme-toggle";
    button.type = "button";
    button.className = "button reading-theme-toggle";
    const glyph = document.createElement("span");
    glyph.className = "theme-glyph";
    glyph.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "name";
    button.append(glyph, label);
    toolbar.append(button);
    function update() {
      const dark = document.documentElement.classList.contains("dark-mode");
      glyph.textContent = dark ? "☀" : "☾";
      label.textContent = dark ? "Light" : "Dark";
      button.title = "Switch to " + (dark ? "light" : "dark") + " mode";
      button.setAttribute("aria-label", button.title);
    }
    button.addEventListener("click", () => {
      const next = document.documentElement.classList.contains("dark-mode") ? "light" : "dark";
      const choice = document.getElementById("ptx-readability-theme-" + next);
      if (choice) { choice.checked = true; choice.dispatchEvent(new Event("change", { bubbles: true })); }
    });
    new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("storage", event => {
      if (event.key === "theme" && window.setDarkMode && window.isDarkMode) {
        const choice = document.getElementById("ptx-readability-theme-" + (event.newValue || "system"));
        if (choice) choice.checked = true;
        window.setDarkMode(window.isDarkMode());
      }
    });
    update();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startReading);
  else startReading();
})();
