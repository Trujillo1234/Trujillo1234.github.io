/* Apply the saved reading theme before the page is painted. */
(() => {
  "use strict";
  try {
    if (!["light", "dark"].includes(localStorage.getItem("theme"))) localStorage.setItem("theme", "dark");
    document.documentElement.classList.toggle("dark-mode", localStorage.getItem("theme") === "dark");
  } catch (_) { document.documentElement.classList.add("dark-mode"); }
})();
