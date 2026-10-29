(function (root) {
  'use strict';
  function initSkillDetail(doc) {
    const groups = [...doc.querySelectorAll('[data-tabs]')];
    function activate(group, tab, focus) {
      group.querySelectorAll('[role="tab"]').forEach((item) => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        const panel = doc.getElementById(item.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
    }
    groups.forEach((group) => {
      const tabs = [...group.querySelectorAll('[role="tab"]')];
      function select(tab, focus) {
        activate(group, tab, focus);
        if (group.dataset.tabs === 'content') root.history.replaceState(null, '', '#' + tab.dataset.tab);
      }
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(tab, false));
        tab.addEventListener('keydown', (event) => {
          const keys = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
          if (!(event.key in keys)) return;
          event.preventDefault();
          select(tabs[keys[event.key]], true);
        });
      });
    });
    const contentGroup = groups.find((group) => group.dataset.tabs === 'content');
    function openContent(name, focus) {
      const tab = [...contentGroup.querySelectorAll('[role="tab"]')].find((item) => item.dataset.tab === name);
      if (tab) activate(contentGroup, tab, focus);
    }
    openContent(root.location.hash.slice(1), false);
    root.addEventListener('hashchange', () => openContent(root.location.hash.slice(1), false));
    doc.querySelectorAll('[data-open-tab]').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      root.history.replaceState(null, '', '#' + link.dataset.openTab);
      openContent(link.dataset.openTab, true);
      contentGroup.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }));
    doc.querySelectorAll('[data-copy-target]').forEach((button) => button.addEventListener('click', async () => {
      const target = doc.getElementById(button.dataset.copyTarget);
      const feedback = button.closest('.copy-block').querySelector('.copy-feedback');
      button.disabled = true;
      try {
        await root.navigator.clipboard.writeText(target.textContent.trim());
        feedback.textContent = '已复制，可以粘贴到 Codex。';
      } catch {
        const selection = root.getSelection();
        const range = doc.createRange();
        range.selectNodeContents(target);
        selection.removeAllRanges();
        selection.addRange(range);
        feedback.textContent = '自动复制不可用，已选中文本，请手动复制。';
      } finally { button.disabled = false; }
    }));
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initSkillDetail(document));
    else initSkillDetail(document);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
