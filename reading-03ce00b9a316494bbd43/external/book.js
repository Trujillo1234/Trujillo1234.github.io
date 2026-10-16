/* The reference edition's theme shortcut, using native PreTeXt settings. */
(() => {
  "use strict";
  function startReading() {
    setupScreenWakeLock();
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
  function setupScreenWakeLock() {
    const player = document.getElementById("ptx-read-aloud-player");
    const group = document.querySelector("#ptx-read-aloud-settings-popup .ptx-readability-options-group");
    if (!player || !group || document.getElementById("reading-keep-awake")) return;
    const key = "long-division-keep-awake";
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "reading-keep-awake";
    checkbox.checked = true;
    try { checkbox.checked = localStorage.getItem(key) !== "false"; } catch (_) {}
    const caption = document.createElement("span");
    caption.textContent = "Keep screen awake while reading";
    label.append(checkbox, caption);
    const status = document.createElement("small");
    status.id = "reading-keep-awake-status";
    status.setAttribute("role", "status");
    checkbox.setAttribute("aria-describedby", status.id);
    group.append(label, status);
    if (!navigator.wakeLock || !window.isSecureContext) {
      checkbox.disabled = true;
      checkbox.checked = false;
      status.textContent = "Keeping the screen awake is unavailable in this browser.";
      return;
    }
    let lock = null;
    let pending = false;
    let leaving = false;
    const wanted = () => checkbox.checked && !leaving && !player.hidden &&
      player.dataset.state === "speaking" && document.visibilityState === "visible";
    const idleMessage = () => checkbox.checked ?
      "Keeps this page awake during playback. Manual screen locking still stops listening." :
      "Your normal screen timeout applies.";
    async function release() {
      const previous = lock;
      lock = null;
      if (previous && !previous.released) {
        try { await previous.release(); } catch (_) {}
      }
    }
    async function sync() {
      if (!wanted()) {
        await release();
        status.textContent = idleMessage();
        return;
      }
      if (lock || pending) return;
      pending = true;
      try {
        const acquired = await navigator.wakeLock.request("screen");
        // Playback may have stopped while the browser considered the request.
        if (!wanted()) {
          await acquired.release();
          return;
        }
        lock = acquired;
        status.textContent = "Screen staying awake while reading.";
        acquired.addEventListener("release", () => {
          if (lock !== acquired) return;
          lock = null;
          status.textContent = wanted() ?
            "Screen lock was released by your device. Pause and play to try again." : idleMessage();
        });
      } catch (_) {
        status.textContent = wanted() ?
          "Could not keep the screen awake. Check battery saver, or pause and play to retry." : idleMessage();
      } finally {
        pending = false;
      }
    }
    checkbox.addEventListener("change", () => {
      try { localStorage.setItem(key, String(checkbox.checked)); } catch (_) {}
      void sync();
    });
    new MutationObserver(() => { void sync(); }).observe(player, {
      attributes: true, attributeFilter: ["data-state", "hidden"]
    });
    document.addEventListener("visibilitychange", () => { void sync(); });
    window.addEventListener("pagehide", () => { leaving = true; void release(); });
    window.addEventListener("pageshow", () => { leaving = false; void sync(); });
    void sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startReading);
  else startReading();
})();
