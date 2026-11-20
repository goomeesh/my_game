const caseBoard = (() => {
  const area = document.querySelector('.board-area');
  const cards = document.querySelector('.board-cards');
  const threads = document.querySelector('.board-threads');
  const status = document.querySelector('#board-status');
  const panel = document.querySelector('#case-board');
  const rig = document.querySelector('.board-rig');
  const pull = document.querySelector('.board-pull');
  const editor = document.querySelector('#board-note');
  const editorTitle = editor.querySelector('#board-note-title');
  const editorText = editor.querySelector('textarea');
  const storageKey = isPapinyCase ? 'papiny-bukvy:investigation-board' : 'posledniy-reys:case-board';
  const pinIcon = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 3h6l-.65 2.2v4.05l2.85 3.25v1H6.8v-1l2.85-3.25V5.2L9 3Zm3 10.5V21" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const elements = new Map();
  const flipped = new Set();
  const cardStops = [.14, .38, .62, .86];
  let catalog = {};
  let positions = {};
  let links = [];
  let notes = {};
  let editing = null;
  let selected = null;
  let draft = null;
  let drag = null;
  let draggedCard = null;
  let pullStart = null;

  function setPanel(open) {
    panel.inert = !open;
    panel.setAttribute('aria-hidden', String(!open));
    rig.classList.toggle('board-open', open);
    pull.setAttribute('aria-expanded', String(open));
    pull.setAttribute('aria-label', open ? 'Убрать доску расследования' : 'Открыть доску расследования');
    if (open) drawThreads();
  }

  function togglePanel() {
    setPanel(panel.inert);
  }

  pull.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || pullStart) return;
    pullStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    pull.setPointerCapture(event.pointerId);
    rig.classList.add('cord-pulling');
  });

  pull.addEventListener('pointermove', (event) => {
    if (pullStart?.id !== event.pointerId) return;
    const amount = Math.min(71, Math.max(0, event.clientY - pullStart.y));
    rig.style.setProperty('--cord-pull', `${amount}px`);
  });

  function releaseCord(event) {
    if (pullStart?.id !== event.pointerId) return;
    const dy = event.clientY - pullStart.y;
    const dx = event.clientX - pullStart.x;
    pullStart = null;
    rig.classList.remove('cord-pulling');
    rig.style.removeProperty('--cord-pull');
    if (event.type === 'pointerup' && (dy >= 23 || Math.hypot(dx, dy) < 10)) togglePanel();
  }

  pull.addEventListener('pointerup', releaseCord);
  pull.addEventListener('pointercancel', releaseCord);
  pull.addEventListener('lostpointercapture', releaseCord);
  pull.addEventListener('click', (event) => { if (event.detail === 0) togglePanel(); });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || panel.inert || document.querySelector('dialog[open]')) return;
    setPanel(false);
    pull.focus();
  });

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ positions, links, notes }));
    } catch {
      // The board still works for the current session.
    }
  }

  function validPosition(value) {
    return value && Number.isFinite(value.x) && Number.isFinite(value.y)
      && value.x >= 0 && value.x <= 1 && value.y >= 0 && value.y <= 1;
  }

  function isPinned(id) {
    return Object.hasOwn(positions, id);
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      positions = Object.fromEntries(Object.entries(saved?.positions ?? {})
        .filter(([id, value]) => Object.hasOwn(catalog, id) && validPosition(value)));
      links = (Array.isArray(saved?.links) ? saved.links : []).filter((pair) =>
        Array.isArray(pair) && pair.length === 2 && pair[0] !== pair[1] && pair.every(isPinned));
      notes = Object.fromEntries(Object.entries(saved?.notes ?? {})
        .filter(([id, value]) => Object.hasOwn(catalog, id) && typeof value === 'string')
        .map(([id, value]) => [id, value.slice(0, editorText.maxLength)]));
    } catch {
      positions = {};
      links = [];
      notes = {};
    }
  }

  function preview(id) {
    const entry = catalog[id];
    return `<span class="case-photo" data-photo="${entry.photo}" aria-hidden="true"></span>`;
  }

  function pinButton(id) {
    const pinned = isPinned(id);
    const label = (pinned ? 'Снять с доски' : 'На доску') + ' — ' + catalog[id].title;
    return `<button class="journal-pin" type="button" data-board-item="${id}" aria-pressed="${pinned}" aria-label="${label}" title="${label}">${pinIcon}</button>`;
  }

  function point(id, bounds) {
    const box = elements.get(id).querySelector('.thread-pin').getBoundingClientRect();
    return { x: box.left + box.width / 2 - bounds.left, y: box.top + box.height / 2 - bounds.top };
  }

  function drawThreads() {
    const bounds = area.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    threads.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    threads.replaceChildren();
    const addThread = (from, to, unfinished) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const sag = Math.min(16, Math.hypot(to.x - from.x, to.y - from.y) * .065);
      line.setAttribute('d', `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 + sag} ${to.x} ${to.y}`);
      line.setAttribute('class', unfinished ? 'thread-draft' : 'thread-set');
      threads.append(line);
    };
    links.forEach(([one, two]) => addThread(point(one, bounds), point(two, bounds), false));
    if (selected && draft) addThread(point(selected, bounds), draft, true);
  }

  function hint() {
    return elements.size ? 'Нажми на карточку, чтобы перевернуть её. Две булавки соединяют карточки нитью.'
      : 'Закрепи материалы из журнала.';
  }

  function positionCard(id) {
    const card = elements.get(id);
    const { x, y } = positions[id];
    card.style.setProperty('--card-x', `${x * 100}%`);
    card.style.setProperty('--card-y', `${y * 100}%`);
  }

  function updateNote(id) {
    const card = elements.get(id);
    const reversed = flipped.has(id);
    const note = notes[id];
    card.classList.toggle('flipped', reversed);
    card.querySelector('.board-photo').setAttribute('aria-pressed', String(reversed));
    const text = card.querySelector('.board-note-preview');
    text.textContent = note || 'Здесь будет твоя заметка';
    text.setAttribute('aria-hidden', String(!reversed));
    const edit = card.querySelector('.board-note-edit');
    edit.hidden = !reversed;
    edit.textContent = note ? 'Править' : 'Написать';
  }

  function render() {
    elements.clear();
    cards.replaceChildren();
    Object.keys(positions).forEach((id) => {
      const entry = catalog[id];
      const card = document.createElement('article');
      card.className = 'board-card';
      card.dataset.card = id;
      card.style.setProperty('--photo-angle', `${((Number(entry.photo) || 0) % 5 - 2) * 2}deg`);
      card.innerHTML = `<button type="button" class="board-photo" aria-label="Оборот карточки — ${entry.title}">
          <span class="card-flip">
            <span class="card-front" aria-hidden="true">${preview(id)}<span class="card-caption">${entry.title}</span></span>
            <span class="card-back"><span class="board-note-preview" id="note-${id}"></span></span>
          </span>
        </button>
        <button type="button" class="board-note-edit" aria-describedby="note-${id}" hidden></button>
        <button type="button" class="thread-pin" aria-pressed="false" aria-label="Нить — ${entry.title}"></button>
        <button type="button" class="board-remove" aria-label="Снять с доски — ${entry.title}">×</button>`;
      cards.append(card);
      elements.set(id, card);
      positionCard(id);
      updateNote(id);
    });
    status.textContent = hint();
    drawThreads();
  }

  function toggle(id) {
    if (!Object.hasOwn(catalog, id)) return false;
    const added = !isPinned(id);
    if (added) {
      const slots = cardStops.flatMap(x => [{ x, y: .11 }, { x, y: .54 }]);
      const order = [0, 2, 4, 6, 1, 3, 5, 7];
      positions[id] = order.map(index => slots[index]).find(slot => !Object.values(positions)
        .some(value => Math.abs(value.x - slot.x) < .11 && Math.abs(value.y - slot.y) < .16))
        ?? slots[Object.keys(positions).length % slots.length];
    } else {
      delete positions[id];
      flipped.delete(id);
      links = links.filter(pair => !pair.includes(id));
    }
    selected = null;
    draft = null;
    save();
    render();
    return added;
  }

  function reset() {
    positions = {};
    links = [];
    notes = {};
    flipped.clear();
    selected = null;
    draft = null;
    save();
    render();
  }

  cards.addEventListener('click', (event) => {
    const id = event.target.closest('[data-card]')?.dataset.card;
    if (!id) return;
    if (event.target.closest('.board-photo')) {
      if (event.detail !== 0 && draggedCard === id) return;
      if (flipped.has(id)) flipped.delete(id);
      else flipped.add(id);
      updateNote(id);
      return;
    }
    if (event.target.closest('.board-note-edit')) {
      editing = id;
      editorTitle.textContent = catalog[id].title;
      editorText.value = notes[id] ?? '';
      editor.showModal();
      return;
    }
    if (event.target.closest('.board-remove')) {
      toggle(id);
      return;
    }
    const pin = event.target.closest('.thread-pin');
    if (!pin) return;
    if (selected === id) {
      selected = null;
      status.textContent = hint();
    } else if (!selected) {
      selected = id;
      status.textContent = 'Нажми вторую булавку.';
    } else {
      const index = links.findIndex(pair => pair.includes(id) && pair.includes(selected));
      if (index < 0) links.push([selected, id]);
      else links.splice(index, 1);
      selected = null;
      save();
      status.textContent = index < 0 ? 'Нить натянута. Нажми на те же булавки, чтобы снять её.' : 'Нить снята.';
    }
    draft = null;
    elements.forEach((card, key) => card.querySelector('.thread-pin')
      .setAttribute('aria-pressed', String(key === selected)));
    drawThreads();
  });

  editor.querySelector('form').addEventListener('submit', (event) => {
    if (!editing || event.submitter?.value !== 'save') return;
    const note = editorText.value.trim();
    if (note) notes[editing] = note;
    else delete notes[editing];
    save();
    updateNote(editing);
  });
  editor.addEventListener('close', () => { editing = null; });

  cards.addEventListener('pointerdown', (event) => {
    const handle = event.target.closest('.board-photo');
    if (!handle || event.button !== 0 || drag) return;
    const card = handle.closest('[data-card]');
    const box = card.getBoundingClientRect();
    draggedCard = null;
    drag = { id: card.dataset.card, handle, pointerId: event.pointerId,
      startX: event.clientX, startY: event.clientY,
      x: event.clientX - box.left - box.width / 2, y: event.clientY - box.top };
    handle.setPointerCapture(event.pointerId);
  });

  area.addEventListener('pointermove', (event) => {
    if (!selected && !drag) return;
    const bounds = area.getBoundingClientRect();
    if (drag?.pointerId === event.pointerId && (draggedCard === drag.id
      || Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 5)) {
      draggedCard = drag.id;
      elements.get(drag.id).classList.add('dragging');
      positions[drag.id] = { x: clamp((event.clientX - bounds.left - drag.x) / bounds.width),
        y: clamp((event.clientY - bounds.top - drag.y) / bounds.height) };
      positionCard(drag.id);
    }
    if (selected) draft = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    drawThreads();
  });

  function clamp(value) {
    return Math.max(0, Math.min(1, value));
  }

  function release(event) {
    if (drag?.pointerId !== event.pointerId) return;
    elements.get(drag.id)?.classList.remove('dragging');
    drag = null;
    if (draggedCard) save();
  }

  cards.addEventListener('pointerup', release);
  cards.addEventListener('pointercancel', release);
  cards.addEventListener('lostpointercapture', release);
  cards.addEventListener('keydown', (event) => {
    const handle = event.target.closest('.board-photo');
    const delta = { ArrowLeft: [-.025, 0], ArrowRight: [.025, 0], ArrowUp: [0, -.035], ArrowDown: [0, .035] }[event.key];
    if (!handle || !delta) return;
    event.preventDefault();
    const id = handle.closest('[data-card]').dataset.card;
    const { x, y } = positions[id];
    positions[id] = { x: clamp(x + delta[0]), y: clamp(y + delta[1]) };
    positionCard(id);
    drawThreads();
    save();
  });

  area.addEventListener('pointerleave', () => {
    draft = null;
    drawThreads();
  });
  new ResizeObserver(drawThreads).observe(area);

  return {
    init(entries) { catalog = entries; load(); render(); },
    toggle, reset, preview, pinButton
  };
})();
