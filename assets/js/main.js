// モバイル用メニュー。言語切り替えとページ移動はHTMLだけでも動作します。
(function () {
  'use strict';
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.primary-nav');
  if (!toggle || !nav) return;
  var english = document.documentElement.lang === 'en';
  var openLabel = english ? 'Open menu' : 'メニューを開く';
  var closeLabel = english ? 'Close menu' : 'メニューを閉じる';

  function setOpen(open, restoreFocus) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? closeLabel : openLabel);
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (restoreFocus) toggle.focus();
  }

  toggle.hidden = false;
  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('keydown', function (event) {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      setOpen(false, true);
      return;
    }
    if (event.key !== 'Tab') return;
    var links = Array.from(nav.querySelectorAll('a'));
    var first = links[0];
    var last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === toggle) {
      event.preventDefault();
      last.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      toggle.focus();
    } else if (!event.shiftKey && document.activeElement === toggle) {
      event.preventDefault();
      first.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      toggle.focus();
    }
  });
  document.addEventListener('click', function (event) {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setOpen(false);
  });
  window.matchMedia('(min-width: 1061px)').addEventListener('change', function (event) {
    if (event.matches) setOpen(false);
  });
})();

// 発表は共著も含め、選択した年だけを表示します。
// JavaScriptが無効な場合は、HTML内の全年度の一覧を閲覧できます。
(function () {
  'use strict';
  var english = document.documentElement.lang === 'en';
  document.querySelectorAll('[data-year-filter]').forEach(function (section) {
    var tablist = section.querySelector('[role="tablist"]');
    var tabs = Array.from(tablist.querySelectorAll('[data-year]'));
    var panels = Array.from(section.querySelectorAll('[data-year-panel]'));
    var count = section.querySelector('[data-year-count]');
    if (!tabs.length || tabs.length !== panels.length) return;

    function selectYear(year, updateAddress) {
      var activePanel = panels.find(function (panel) {
        return panel.dataset.yearPanel === year;
      });
      if (!activePanel) return;
      tabs.forEach(function (tab) {
        var selected = tab.dataset.year === year;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(function (panel) {
        panel.hidden = panel !== activePanel;
      });
      var total = activePanel.querySelectorAll('.output-entry').length;
      count.textContent = String(total);
      count.setAttribute('aria-label', english ? total + ' presentations in ' + year : year + '年の発表' + total + '件');
      if (updateAddress) {
        window.history.replaceState(null, '', '#' + activePanel.id);
      }
      if (updateAddress || window.location.hash === '#' + activePanel.id) {
        document.querySelectorAll('.language-switch a').forEach(function (link) {
          link.setAttribute('href', link.getAttribute('href').split('#')[0] + '#' + activePanel.id);
        });
      }
    }

    function yearFromAddress() {
      var panel = panels.find(function (item) {
        return '#' + item.id === window.location.hash;
      });
      return panel ? panel.dataset.yearPanel : null;
    }

    panels.forEach(function (panel) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', section.id + '-tab-' + panel.dataset.yearPanel);
      panel.tabIndex = 0;
    });
    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        selectYear(tab.dataset.year, true);
      });
      tab.addEventListener('keydown', function (event) {
        var next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        selectYear(tabs[next].dataset.year, true);
        tabs[next].focus();
      });
    });
    selectYear(yearFromAddress() || tabs[0].dataset.year, false);
    tablist.hidden = false;
    window.addEventListener('hashchange', function () {
      var year = yearFromAddress();
      if (year) selectYear(year, false);
    });
  });
})();
