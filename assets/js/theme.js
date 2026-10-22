// Apply the saved or system theme before the stylesheet paints the page.
(function () {
  'use strict';
  var root = document.documentElement;
  var storageKey = 'kurihara-color-theme';
  var system = window.matchMedia('(prefers-color-scheme: dark)');
  var preference = null;
  var button;

  function valid(value) {
    return value === 'light' || value === 'dark' ? value : null;
  }

  try {
    preference = valid(window.localStorage.getItem(storageKey));
  } catch (error) {
    // The toggle also works when browser storage is unavailable.
  }

  function apply() {
    var theme = preference || (system.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#151b28' : '#fbfcff';
    if (button) {
      var dark = theme === 'dark';
      var english = root.lang === 'en';
      button.setAttribute('aria-pressed', String(dark));
      button.title = english
        ? (dark ? 'Switch to light mode' : 'Switch to dark mode')
        : (dark ? 'ライトモードに切り替え' : 'ダークモードに切り替え');
    }
  }

  apply();
  system.addEventListener('change', function () {
    if (!preference) apply();
  });
  window.addEventListener('storage', function (event) {
    if (event.key === storageKey || event.key === null) {
      preference = valid(event.newValue);
      apply();
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    button = document.querySelector('.theme-toggle');
    if (!button) return;
    button.addEventListener('click', function () {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(storageKey, preference);
      } catch (error) {
        // Keep the selected theme for the current page even without storage.
      }
      apply();
    });
    apply();
    button.hidden = false;
  });
})();
