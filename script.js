const store = window.PortfolioStore;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
}

function safeHref(value = '') {
  const href = String(value).trim();
  if (!href) return '#';
  if (/^(https?:|mailto:|#|\/|data:image\/)/i.test(href) || /^[\w.-]+\.(png|jpe?g|webp|gif|svg)$/i.test(href)) return escapeHtml(href);
  return '#';
}

function linkAttributes(href) {
  return /^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
}

function artMarkup(item) {
  const copy = escapeHtml(item.artCopy || item.title).replace(/\n/g, '<br>');
  return `<div class="card-art card-art--${escapeHtml(item.art || 'warm')}" aria-hidden="true">
    <span class="small-note">${escapeHtml(item.type || 'selected work')}</span>
    <span class="art-title">${copy}</span>
    <span class="art-scribble handwritten">made by farouk</span>
  </div>`;
}

function renderWorkItem(item, index) {
  const href = safeHref(item.link);
  const image = item.image
    ? `<a class="image-link" href="${href}"${linkAttributes(item.link)} aria-label="${escapeHtml(item.cta || 'view work')}"><img src="${safeHref(item.image)}" width="1200" height="675" alt="${escapeHtml(item.imageAlt || item.title)}" loading="lazy"></a>`
    : artMarkup(item);
  const metrics = Array.isArray(item.metrics) && item.metrics.length
    ? `<div class="metric-pair">${item.metrics.map(metric => {
        const parts = String(metric).trim().split(/\s+(.+)/);
        return `<div><strong>${escapeHtml(parts[0] || '')}</strong><span>${escapeHtml(parts[1] || '')}</span></div>`;
      }).join('')}</div>`
    : '';
  return `<article class="work-card ${index % 3 === 0 ? 'clipped' : 'pin'}" data-category="${escapeHtml(item.category)}">
    ${image}
    <div class="card-content">
      <p class="handwritten category">${escapeHtml(item.type)}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      ${metrics}
      ${item.tags ? `<p class="work-tags">${escapeHtml(item.tags)}</p>` : ''}
      ${item.note ? `<p class="source-note">${escapeHtml(item.note)}</p>` : ''}
      ${item.link ? `<a class="text-link" href="${href}"${linkAttributes(item.link)}>${escapeHtml(item.cta || 'view work')}</a>` : ''}
    </div>
  </article>`;
}

function renderExperienceItem(item, index) {
  const detailLines = String(item.details || '').split('\n').filter(Boolean);
  const details = detailLines.length > 1
    ? `<ul>${detailLines.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`
    : `<p>${escapeHtml(detailLines[0] || '')}</p>`;
  const symbols = ['◎', '✎', '⌁', '◇'];
  return `<article class="timeline-item">
    <span class="timeline-icon" aria-hidden="true">${symbols[index % symbols.length]}</span>
    <div>
      <h3>${escapeHtml(item.role)}</h3>
      <p class="company">${escapeHtml(item.company)} <span>${escapeHtml(item.period)}</span></p>
      <p>${escapeHtml(item.summary)}</p>
      ${item.details ? `<details><summary>more about the work</summary>${details}</details>` : ''}
    </div>
  </article>`;
}

function renderProjectItem(item) {
  const href = safeHref(item.link);
  return `<article class="side-card paper pin">
    ${item.image ? `<img src="${safeHref(item.image)}" width="1200" height="675" loading="lazy" alt="${escapeHtml(item.imageAlt || item.title)}">` : `<div class="project-placeholder handwritten" aria-hidden="true">${escapeHtml(item.title)}</div>`}
    <div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      ${item.link ? `<a class="text-link" href="${href}"${linkAttributes(item.link)}>${escapeHtml(item.cta || 'view project')}</a>` : ''}
    </div>
  </article>`;
}

function renderPortfolio() {
  const data = store.getData();
  document.querySelector('#work-grid').innerHTML = data.work.map(renderWorkItem).join('');
  document.querySelector('#experience-list').innerHTML = data.experience.map(renderExperienceItem).join('');
  document.querySelector('#project-grid').innerHTML = data.projects.map(renderProjectItem).join('');
  applyFilter(document.querySelector('[data-filter][aria-pressed="true"]')?.dataset.filter || 'all', false);
}

function applyFilter(category, announce = true) {
  const cards = [...document.querySelectorAll('[data-category]')];
  let visible = 0;
  cards.forEach(card => {
    card.hidden = category !== 'all' && card.dataset.category !== category;
    if (!card.hidden) visible += 1;
  });
  if (announce) document.querySelector('#filter-status').textContent = visible + ' work samples shown.';
}

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    applyFilter(button.dataset.filter);
  });
});

const navigation = [...document.querySelectorAll('.nav-pill a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
  navigation.forEach(link => {
    const section = document.querySelector(link.hash);
    if (section) observer.observe(section);
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();
window.addEventListener('storage', renderPortfolio);
window.addEventListener('portfolio-data-changed', renderPortfolio);
renderPortfolio();
