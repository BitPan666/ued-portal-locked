(function (root) {
  'use strict';
  function normalizeSearch(value) { return String(value || '').trim().toLocaleLowerCase().replace(/\s+/g, ' '); }
  function matchesSearchRecord(record, query) { const normalizedQuery = normalizeSearch(query); return !normalizedQuery || normalizeSearch(record).includes(normalizedQuery); }
  function isSafeExternalUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } }
  function shouldRecenterSearch(previousQuery, nextQuery) { return !normalizeSearch(previousQuery) && Boolean(normalizeSearch(nextQuery)); }
  function initPortal(doc) {
    const search = doc.querySelector('#resource-search');
    const items = [...doc.querySelectorAll('.resource-item')];
    const sections = [...doc.querySelectorAll('.resource-section')];
    const resourcePanels = [...doc.querySelectorAll('.resource-panel')];
    const projectGroups = [...doc.querySelectorAll('.project-group')];
    const status = doc.querySelector('.search-status');
    const empty = doc.querySelector('.search-empty');
    const anchors = [...doc.querySelectorAll('.anchor-nav a')];
    const hero = doc.querySelector('.hero');
    const preview = doc.querySelector('.resource-preview');
    // Interaction demo only. Connect to the authorized worksheet service later.
    const projectRefresh = doc.querySelector('[data-project-refresh-demo]');
    if (projectRefresh) projectRefresh.addEventListener('click', () => {
      if (projectRefresh.disabled) return;
      const label = projectRefresh.querySelector('span');
      projectRefresh.disabled = true;
      projectRefresh.setAttribute('aria-busy', 'true');
      label.textContent = '刷新中';
      root.setTimeout(() => {
        label.textContent = '刷新';
        projectRefresh.disabled = false;
        projectRefresh.removeAttribute('aria-busy');
      }, 900);
    });
    const total = items.length;
    let previousQuery = '';
    doc.querySelectorAll('a[target="_blank"]').forEach((link) => { if (!isSafeExternalUrl(link.href)) { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); } link.rel = 'noopener noreferrer'; });
    doc.querySelectorAll('[aria-disabled="true"]').forEach((element) => { element.addEventListener('click', (event) => event.preventDefault()); element.setAttribute('tabindex', '-1'); });
    function updateSearch() {
      const query = normalizeSearch(search ? search.value : ''); let visible = 0;
      const recenter = shouldRecenterSearch(previousQuery, query);
      items.forEach((item) => { const match = matchesSearchRecord(item.dataset.search || item.textContent, query); item.hidden = !match; if (match) visible += 1; });
      projectGroups.forEach((group) => { const visibleItems = group.querySelectorAll('.resource-item:not([hidden])').length; group.hidden = Boolean(query) && visibleItems === 0; });
      resourcePanels.forEach((panel) => {
        const visibleItems = panel.querySelectorAll('.resource-item:not([hidden])').length;
        panel.hidden = Boolean(query) && visibleItems === 0;
        const panelCount = panel.querySelector('.panel-visible-count');
        if (panelCount) panelCount.textContent = String(visibleItems);
      });
      sections.forEach((section) => { const visibleItems = section.querySelectorAll('.resource-item:not([hidden])').length; section.hidden = Boolean(query) && visibleItems === 0; const sectionCount = section.querySelector('.section-visible-count'); if (sectionCount) sectionCount.textContent = String(visibleItems); });
      if (status) { status.hidden = !query; status.textContent = query ? `“${search.value.trim()}” 找到 ${visible} / ${total} 项资源` : ''; }
      if (empty) empty.hidden = !query || visible > 0;
      doc.documentElement.classList.toggle('is-searching', Boolean(query));
      if (recenter && status && root.requestAnimationFrame) root.requestAnimationFrame(() => status.scrollIntoView({ block: 'start' }));
      previousQuery = query;
    }
    if (search) search.addEventListener('input', updateSearch);
    function createPreviewVisual(button) {
      const sources = button.dataset.previewGallery ? button.dataset.previewGallery.trim().split(/\s+/) : [button.dataset.previewSrc];
      const images = sources.map((source, index) => {
        const image = doc.createElement('img');
        image.src = source;
        image.alt = button.dataset.previewTitle + (sources.length > 1 ? ` 示例 ${index + 1}` : ' 示例原图');
        image.decoding = 'async';
        return image;
      });
      if (images.length === 1) return images[0];
      const gallery = doc.createElement('span');
      gallery.className = 'preview-gallery';
      gallery.replaceChildren(...images);
      return gallery;
    }
    doc.querySelectorAll('.skill-thumbnail[data-preview-gallery]').forEach((button) => {
      button.querySelector('img').replaceWith(createPreviewVisual(button));
    });
    if (preview && typeof preview.showModal === 'function') {
      const previewCanvas = preview.querySelector('.preview-canvas');
      const previewTitle = preview.querySelector('#resource-preview-title');
      doc.querySelectorAll('[data-preview-src]').forEach((button) => button.addEventListener('click', () => {
        previewTitle.textContent = button.dataset.previewTitle;
        previewCanvas.replaceChildren(createPreviewVisual(button));
        preview.showModal();
      }));
      preview.querySelector('.preview-close').addEventListener('click', () => preview.close());
      preview.addEventListener('click', (event) => {
        const bounds = preview.getBoundingClientRect();
        if (event.target === preview && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) preview.close();
      });
    }
    if (hero && root.matchMedia && !root.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
        hero.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
      }, { passive: true });
      hero.addEventListener('pointerleave', () => {
        hero.style.setProperty('--pointer-x', '68%');
        hero.style.setProperty('--pointer-y', '28%');
      }, { passive: true });
    }
    doc.addEventListener('keydown', (event) => { if (preview && preview.open) return; const tagName = doc.activeElement ? doc.activeElement.tagName : ''; const editing = tagName === 'INPUT' || tagName === 'TEXTAREA'; if (event.key === '/' && !editing && search) { event.preventDefault(); search.focus(); } if (event.key === 'Escape' && search) { search.value = ''; updateSearch(); search.blur(); } });
    const navSections = anchors.map((anchor) => doc.querySelector(anchor.hash)).filter(Boolean);
    function updateActiveAnchor() {
      if (normalizeSearch(search ? search.value : '')) return;
      const anchorBar = doc.querySelector('.anchor-wrap');
      const header = doc.querySelector('.site-header');
      const readingLine = (header ? header.offsetHeight : 0) + (anchorBar ? anchorBar.offsetHeight : 0) + 48;
      let activeSection = navSections[0];
      navSections.forEach((section) => { if (!section.hidden && section.getBoundingClientRect().top <= readingLine) activeSection = section; });
      anchors.forEach((anchor) => {
        const active = activeSection && anchor.hash === '#' + activeSection.id;
        anchor.classList.toggle('active', Boolean(active));
        if (active) anchor.setAttribute('aria-current', 'location');
        else anchor.removeAttribute('aria-current');
      });
    }
    root.addEventListener('scroll', () => {
      const scrollable = doc.documentElement.scrollHeight - root.innerHeight;
      const progress = scrollable > 0 ? root.scrollY / scrollable : 0;
      doc.documentElement.style.setProperty('--scroll-progress', String(progress));
      updateActiveAnchor();
    }, { passive: true });
    root.addEventListener('resize', updateActiveAnchor, { passive: true });
    root.addEventListener('load', updateActiveAnchor, { once: true });
    updateActiveAnchor();
    updateSearch();
  }
  const api = { normalizeSearch, matchesSearchRecord, isSafeExternalUrl, shouldRecenterSearch, initPortal };
  root.UEDPortal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initPortal(document)); else initPortal(document); }
})(typeof globalThis !== 'undefined' ? globalThis : this);
