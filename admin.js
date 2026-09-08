const store = window.PortfolioStore;
let data = store.getData();
let undoState = null;
let toastTimer;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
}

function itemName(section, item) {
  return section === 'experience' ? item.role : item.title;
}

function itemMeta(section, item) {
  if (section === 'work') return item.category + ' · ' + item.type;
  if (section === 'experience') return item.company + ' · ' + item.period;
  return item.description;
}

function renderLists() {
  ['work', 'experience', 'projects'].forEach(section => {
    const list = document.querySelector(`[data-list="${section}"]`);
    list.innerHTML = data[section].length
      ? data[section].map(item => `
        <article class="entry">
          <div><h3>${escapeHtml(itemName(section, item))}</h3><p>${escapeHtml(itemMeta(section, item))}</p></div>
          <div class="entry-actions">
            <button type="button" data-edit="${escapeHtml(item.id)}" data-section="${section}">edit</button>
            <button type="button" class="remove" data-remove="${escapeHtml(item.id)}" data-section="${section}">remove</button>
          </div>
        </article>`).join('')
      : '<p>nothing here yet. add the first item with the form.</p>';
  });
}

function activateTab(section) {
  document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tab === section)));
  document.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== section; });
}

function clearForm(form) {
  form.reset();
  form.elements.id.value = '';
  form.querySelector('.save-button').textContent = form.dataset.form === 'work'
    ? 'save work item'
    : form.dataset.form === 'experience' ? 'save experience' : 'save project';
}

function editItem(section, id) {
  activateTab(section);
  const item = data[section].find(entry => entry.id === id);
  const form = document.querySelector(`[data-form="${section}"]`);
  if (!item || !form) return;
  Object.entries(item).forEach(([name, value]) => {
    const field = form.elements[name];
    if (!field || name === 'imageFile') return;
    field.value = Array.isArray(value) ? value.join(', ') : value;
  });
  form.querySelector('.save-button').textContent = 'update ' + (section === 'experience' ? 'experience' : section === 'projects' ? 'project' : 'work item');
  form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  form.elements[section === 'experience' ? 'role' : 'title'].focus({ preventScroll: true });
}

function showToast(message, canUndo = false) {
  const toast = document.querySelector('.toast');
  toast.querySelector('span').textContent = message;
  toast.querySelector('button').hidden = !canUndo;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
    undoState = null;
  }, 6000);
}

function removeItem(section, id) {
  const index = data[section].findIndex(item => item.id === id);
  if (index < 0) return;
  const [item] = data[section].splice(index, 1);
  undoState = { section, item, index };
  store.saveData(data);
  renderLists();
  showToast(itemName(section, item) + ' removed.', true);
}

function undoRemove() {
  if (!undoState) return;
  if (undoState.reset) {
    data = undoState.previous;
    store.saveData(data);
    renderLists();
    document.querySelector('.toast').hidden = true;
    undoState = null;
    return;
  }
  const { section, item, index } = undoState;
  data[section].splice(index, 0, item);
  store.saveData(data);
  renderLists();
  document.querySelector('.toast').hidden = true;
  undoState = null;
}

async function imageToDataUrl(file) {
  if (!file) return '';
  if (!file.type.startsWith('image/')) throw new Error('choose an image file.');
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('the image could not be read.'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('the image could not be decoded.'));
    element.src = source;
  });
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', .82);
}

function formItem(section, form) {
  const values = Object.fromEntries(new FormData(form).entries());
  delete values.imageFile;
  Object.keys(values).forEach(key => {
    if (typeof values[key] === 'string') values[key] = values[key].trim();
  });
  if (section === 'work') {
    values.metrics = values.metrics ? values.metrics.split(',').map(value => value.trim()).filter(Boolean) : [];
  }
  return values;
}

document.querySelectorAll('[data-tab]').forEach(button => {
  button.addEventListener('click', () => activateTab(button.dataset.tab));
});

document.querySelectorAll('[data-new]').forEach(button => {
  button.addEventListener('click', () => {
    const section = button.dataset.new;
    const form = document.querySelector(`[data-form="${section}"]`);
    clearForm(form);
    form.elements[section === 'experience' ? 'role' : 'title'].focus();
  });
});

document.querySelectorAll('[data-cancel]').forEach(button => {
  button.addEventListener('click', () => clearForm(button.form));
});

document.addEventListener('click', event => {
  const edit = event.target.closest('[data-edit]');
  const remove = event.target.closest('[data-remove]');
  if (edit) editItem(edit.dataset.section, edit.dataset.edit);
  if (remove) removeItem(remove.dataset.section, remove.dataset.remove);
});

document.querySelectorAll('[data-form]').forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const section = form.dataset.form;
    const button = form.querySelector('.save-button');
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = 'saving…';
    button.dataset.state = 'loading';
    try {
      const item = formItem(section, form);
      const current = data[section].find(entry => entry.id === item.id);
      const file = form.elements.imageFile?.files[0];
      if (file) item.image = await imageToDataUrl(file);
      else if (!item.image && current?.image) item.image = current.image;
      if (!item.id) item.id = store.makeId(section);
      const index = data[section].findIndex(entry => entry.id === item.id);
      if (index >= 0) data[section][index] = item;
      else data[section].push(item);
      store.saveData(data);
      renderLists();
      clearForm(form);
      button.dataset.state = 'success';
      button.textContent = 'saved';
      showToast(itemName(section, item) + ' saved.');
      setTimeout(() => {
        button.dataset.state = '';
        button.textContent = originalLabel.includes('update') ? originalLabel.replace('update', 'save') : originalLabel;
      }, 1400);
    } catch (error) {
      button.dataset.state = 'error';
      button.textContent = 'could not save';
      showToast(error.name === 'QuotaExceededError' ? 'browser storage is full. export your data, then use smaller images.' : error.message);
    } finally {
      button.disabled = false;
    }
  });
});

document.querySelector('.toast button').addEventListener('click', undoRemove);

document.querySelector('#export-data').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'farouk-portfolio-content.json';
  link.click();
  URL.revokeObjectURL(url);
  showToast('portfolio json exported.');
});

document.querySelector('#import-data').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    data = store.importData(await file.text());
    renderLists();
    document.querySelectorAll('[data-form]').forEach(clearForm);
    showToast('portfolio data imported.');
  } catch (error) {
    showToast(error.message);
  } finally {
    event.target.value = '';
  }
});

document.querySelector('#reset-data').addEventListener('click', () => {
  const previous = JSON.parse(JSON.stringify(data));
  data = store.resetData();
  renderLists();
  undoState = { reset: true, previous };
  const toast = document.querySelector('.toast');
  toast.querySelector('span').textContent = 'defaults restored.';
  toast.querySelector('button').hidden = false;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; undoState = null; }, 6000);
});

renderLists();
