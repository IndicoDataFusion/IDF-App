(function () {
  "use strict";
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const applyTheme = (theme, remember) => {
    const isDark = theme === "dark";
    root.dataset.theme = isDark ? "dark" : "light";
    if (themeToggle) {
      const label = isDark ? "Switch to light mode" : "Switch to dark mode";
      themeToggle.setAttribute("aria-label", label);
      themeToggle.setAttribute("title", label);
    }
    if (themeColor) themeColor.content = isDark ? "#161513" : "#cc3514";
    if (remember) {
      try { localStorage.setItem("idf-theme", isDark ? "dark" : "light"); } catch (_) {}
    }
  };

  applyTheme(root.dataset.theme || "light", false);
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
  }

  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (toggle && menu) {
    const closeMenu = () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    };
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { closeMenu(); toggle.focus(); }
    });
  }
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}());
