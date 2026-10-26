(function (root) {
  'use strict';
  function normalizeSearch(value) { return String(value || '').trim().toLocaleLowerCase().replace(/\s+/g, ' '); }
  function matchesSearchRecord(record, query) { const normalizedQuery = normalizeSearch(query); return !normalizedQuery || normalizeSearch(record).includes(normalizedQuery); }
  function isSafeExternalUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } }
  function initPortal(doc) {
    const search = doc.querySelector('#resource-search');
    const items = [...doc.querySelectorAll('.resource-item')];
    const sections = [...doc.querySelectorAll('.resource-section')];
    const status = doc.querySelector('.search-status');
    const empty = doc.querySelector('.search-empty');
    const anchors = [...doc.querySelectorAll('.anchor-nav a')];
    const total = items.length;
    doc.querySelectorAll('a[target="_blank"]').forEach((link) => { if (!isSafeExternalUrl(link.href)) { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); } link.rel = 'noopener noreferrer'; });
    doc.querySelectorAll('[aria-disabled="true"]').forEach((element) => { element.addEventListener('click', (event) => event.preventDefault()); element.setAttribute('tabindex', '-1'); });
    function updateSearch() {
      const query = normalizeSearch(search ? search.value : ''); let visible = 0;
      items.forEach((item) => { const match = matchesSearchRecord(item.dataset.search || item.textContent, query); item.hidden = !match; if (match) visible += 1; });
      sections.forEach((section) => { const visibleItems = section.querySelectorAll('.resource-item:not([hidden])').length; section.hidden = Boolean(query) && visibleItems === 0; const sectionCount = section.querySelector('.section-visible-count'); if (sectionCount) sectionCount.textContent = String(visibleItems); });
      if (status) { status.hidden = !query; status.textContent = query ? `“${search.value.trim()}” 找到 ${visible} / ${total} 项资源` : ''; }
      if (empty) empty.hidden = !query || visible > 0;
      doc.documentElement.classList.toggle('is-searching', Boolean(query));
    }
    if (search) search.addEventListener('input', updateSearch);
    doc.addEventListener('keydown', (event) => { const tagName = doc.activeElement ? doc.activeElement.tagName : ''; const editing = tagName === 'INPUT' || tagName === 'TEXTAREA'; if (event.key === '/' && !editing && search) { event.preventDefault(); search.focus(); } if (event.key === 'Escape' && search) { search.value = ''; updateSearch(); search.blur(); } });
    if ('IntersectionObserver' in root) {
      const observer = new IntersectionObserver((entries) => { if (normalizeSearch(search ? search.value : '')) return; const visibleEntry = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (!visibleEntry) return; anchors.forEach((anchor) => { const active = anchor.hash === `#${visibleEntry.target.id}`; anchor.classList.toggle('active', active); if (active) anchor.setAttribute('aria-current', 'location'); else anchor.removeAttribute('aria-current'); }); }, { rootMargin: '-26% 0px -58% 0px', threshold: [0.08, 0.2, 0.45] });
      sections.forEach((section) => observer.observe(section));
    }
    root.addEventListener('scroll', () => { const scrollable = doc.documentElement.scrollHeight - root.innerHeight; const progress = scrollable > 0 ? root.scrollY / scrollable : 0; doc.documentElement.style.setProperty('--scroll-progress', String(progress)); }, { passive: true });
    updateSearch();
  }
  const api = { normalizeSearch, matchesSearchRecord, isSafeExternalUrl, initPortal };
  root.UEDPortal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initPortal(document)); else initPortal(document); }
})(typeof globalThis !== 'undefined' ? globalThis : this);
