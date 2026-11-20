const papinyUI = (() => {
  const switchCase = document.querySelector('#case-switch');
  switchCase.hidden = false;
  if (!isPapinyCase) {
    document.title = 'Последний рейс — кабинет детектива';
    switchCase.href = './';
    switchCase.textContent = 'Дело «Папины буквы»';
    return null;
  }

  const investigation = papinyInvestigation;
  const foundMessage = (ids) => ids.length
    ? 'В журнале: ' + ids.map(id => materialNumber(id) + ' · ' + papinyCase.materials[id - 1][0]).join(', ') + '.'
    : '';
  const evidenceLeads = {
    1: [['place', 'tannery'], ['place', 'market']],
    4: [['contact', 'port'], ['place', 'bell']],
    7: [['place', 'clock']],
    8: [['place', 'hearth']],
    9: [['place', 'warehouse'], ['place', 'willow'], ['place', 'carriage']],
    13: [['contact', 'inspector'], ['place', 'post'], ['place', 'west']],
    15: [['place', 'hearth']],
    16: [['place', 'warehouse']],
    18: [['contact', 'inspector']]
  };
  let line = null;
  let choosingMap = false;
  const emptyOrder = () => ({ step: 'suspect', suspect: null, route: null, stop: false, retry: false });
  let draft = emptyOrder();

  document.documentElement.classList.add('papiny-case');
  folder.querySelector('.book-case').textContent = papinyCase.date;
  folder.querySelector('.jacket-front span').textContent = papinyCase.title;
  folder.querySelector('#folder-title').textContent = papinyCase.title;
  const actions = document.createElement('div');
  actions.className = 'case-actions';
  actions.innerHTML = '<button type="button" data-case-intro>Как играть</button><button type="button" data-case-timeline>Хронология</button>';
  folderDetail.before(actions);

  document.querySelector('.call-masthead .eyebrow').textContent = 'Телефонная станция Блэкмира';
  document.querySelector('.directory-caption').textContent = 'Блэкмир';
  document.querySelector('#map-title').textContent = 'Блэкмир';
  document.querySelector('.map-date').textContent = 'Городской план · 1890';
  document.querySelector('.table-map-title').innerHTML = 'Городской план · 1890 <strong>Блэкмир</strong>';

  const mapDirectory = document.querySelector('#map-directory');
  const mapSpots = Object.entries(papinyCase.locations);
  const citySpots = mapSpots.filter(([, place]) => place.pos);
  const compactMap = document.querySelector('.table-map-print .map-field');
  const cityMap = mapDialog.querySelector('.map-field');
  const markers = [];
  [compactMap, cityMap].forEach((field) => {
    field.querySelectorAll('.map-pin').forEach(pin => pin.remove());
    citySpots.forEach(([key, place], index) => {
      const interactive = field === cityMap;
      const marker = document.createElement(interactive ? 'button' : 'span');
      marker.className = 'map-pin dossier-map-pin';
      marker.style.setProperty('--x', place.pos[0] + '%');
      marker.style.setProperty('--y', place.pos[1] + '%');
      marker.textContent = String(index + 1);
      if (interactive) {
        marker.type = 'button';
        marker.dataset.location = key;
        marker.setAttribute('aria-pressed', 'false');
        marker.setAttribute('aria-label', place.title);
        marker.title = place.title;
      } else {
        marker.setAttribute('aria-hidden', 'true');
      }
      markers.push([key, marker]);
      field.append(marker);
    });
  });
  mapDirectory.hidden = false;

  function syncMap() {
    const available = investigation.availablePlaces();
    markers.forEach(([key, el]) => { el.hidden = !available.includes(key); });
    const show = ([key]) => available.includes(key);
    const visitLink = ([key, place], label = '') => {
      const visited = investigation.visited(key);
      const fixed = !canChooseAddress(key);
      return '<button type="button" data-map-visit="' + key + '"' + (fixed ? ' disabled' : '') + '>' +
        label + place.title + (visited && !choosingMap ? ' <span aria-label="Посещено">✓</span>' : '') + '</button>';
    };
    const outside = mapSpots.filter(entry => !entry[1].pos && show(entry));
    mapDirectory.innerHTML = '<div class="map-index-list">' + citySpots.map((entry, index) =>
      show(entry) ? visitLink(entry, '<span>' + (index + 1) + '</span> ') : '').join('') + '</div>' +
      (outside.length ? '<div class="map-outskirts"><span>За городом</span>' + outside.map(entry => visitLink(entry)).join('') + '</div>' : '');
  }

  function canChooseAddress(key) {
    return !(choosingMap && draft.retry && key !== 'warehouse' && investigation.order()?.route.place === key);
  }
  syncMap();

  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="papiny-reading" class="case-paper-dialog" aria-labelledby="papiny-reading-title">
      <header>
        <div><p class="book-case" id="papiny-reading-meta"></p><h2 id="papiny-reading-title"></h2></div>
        <button type="button" class="case-paper-close" data-paper-close aria-label="Закрыть страницу" autofocus>×</button>
      </header>
      <article class="case-paper-body"></article>
    </dialog>
  `);
  const reading = document.querySelector('#papiny-reading');
  reading.querySelector('[data-paper-close]').addEventListener('click', () => reading.close());

  function openReading(title, label, html) {
    reading.querySelector('#papiny-reading-title').textContent = title;
    reading.querySelector('#papiny-reading-meta').textContent = label;
    reading.querySelector('.case-paper-body').innerHTML = html;
    if (!reading.open) reading.showModal();
    reading.scrollTop = 0;
  }

  function followButtons(material) {
    const links = evidenceLeads[material] ?? [];
    return links.map(([kind, key]) => '<button type="button" class="material-link" data-follow-' + kind + '="' + key + '">' +
      (kind === 'place' ? 'На карте · ' + papinyCase.locations[key].title : 'Позвонить · ' + investigation.contact(key).name) + '</button>').join('');
  }

  function openMaterial(number) {
    if (!investigation.owns(number)) return;
    const [title, text] = papinyCase.materials[number - 1];
    const links = followButtons(number);
    openReading(title, 'Материал ' + materialNumber(number), caseParagraphs(text) +
      (links ? '<div class="investigation-links">' + links + '</div>' : ''));
  }

  function optionButtons(options, attribute, blockedHint) {
    return options.map(option => '<div class="investigation-option">' +
      '<button type="button" data-' + attribute + '="' + option.id + '"' +
      (!option.ready || option.done || !investigation.canAct() ? ' disabled' : '') + '>' + option.text + '</button>' +
      (option.done ? '<small>Записано</small>' : !option.ready && blockedHint ? '<small>' + blockedHint(option) + '</small>' : '') +
      '</div>').join('');
  }

  function renderVisit(key) {
    const place = papinyCase.locations[key];
    const options = investigation.actionsFor('visit', key);
    const done = options.filter(option => option.done);
    const warehouse = key === 'warehouse' && investigation.owns(16) ? '<div class="warehouse-plan">' +
      papinyCase.warehouse.map(([name, detail]) => '<details><summary>' + name + '</summary><p>' + detail + '</p></details>').join('') + '</div>' : '';
    const files = materialButtons(place.materials);
    const hints = {
      tannery: 'Сначала осмотри комнату, где нашли тетрадь.',
      bell: 'Нужен рисунок из тетради.',
      hearth: 'Понадобится предыдущая запись или документ для сверки.',
      willow: 'Сначала опроси Флетчеров.',
      carriage: 'Сначала сверь книгу заказов.',
      warehouse: 'Проверь опись двора и собери документы для сверки.'
    };
    visitMaterials.innerHTML = '<div class="investigation-choices">' +
      optionButtons(options, 'visit-action', () => hints[key] ?? 'Нужны дополнительные сведения.') + '</div>' +
      '<div class="visit-result" role="status">' + done.map(option => '<p>' + option.reply + '</p>').join('') + '</div>' +
      warehouse + (files ? '<h3>Найденные материалы</h3>' + files : '');
  }

  function showButtons(html) {
    callQuestions.hidden = false;
    callQuestions.innerHTML = html;
  }

  function routeName(route) {
    if (!route) return '';
    const address = papinyCase.locations[route.place].title;
    return route.place === 'warehouse' && Number.isInteger(route.room)
      ? address + ' · ' + papinyCase.warehouse[route.room][0] : address;
  }

  function append(speaker, text, type) {
    appendDialogueLine(callMessages, speaker, text, type);
  }

  function renderOrder() {
    const order = investigation.order();
    if (order && draft.step !== 'retry-place' && draft.step !== 'retry-room' && draft.step !== 'review-retry') {
      renderOutcome(order);
      return;
    }
    const choices = [];
    const inspector = 'Инспектор';
    if (draft.step === 'suspect') {
      append(inspector, 'Кто организовал исчезновения?', 'witness');
      investigation.suspects().forEach(id => choices.push('<button type="button" data-order-suspect="' + id + '">' + investigation.name(id) + '</button>'));
    } else if (draft.step === 'place' || draft.step === 'retry-place') {
      if (draft.step === 'retry-place') append(inspector, 'Повозка не ушла. Какое место проверяем теперь?', 'witness');
      else {
        append('Детектив', 'Организатор — ' + investigation.name(draft.suspect) + '.', 'detective');
        append(inspector, 'Куда направить людей?', 'witness');
      }
      choices.push('<button type="button" data-order-map>Развернуть карту</button>');
      if (!draft.retry) choices.push('<button type="button" data-order-step="suspect">Изменить подозреваемого</button>');
    } else if (draft.step === 'room' || draft.step === 'retry-room') {
      append('Детектив', 'Проверьте Северный склад.', 'detective');
      append(inspector, 'Там три помещения. В какое идти первым?', 'witness');
      papinyCase.warehouse.forEach(([title], index) => {
        const alreadyChecked = order?.route.place === 'warehouse' && order.route.room === index;
        choices.push('<button type="button" data-order-room="' + index + '"' + (alreadyChecked ? ' disabled' : '') + '>' + title + '</button>');
      });
      choices.push('<button type="button" data-order-map>Выбрать другой адрес</button>');
    } else {
      const summary = draft.retry
        ? 'Повторный обыск: ' + routeName(draft.route) + '.'
        : 'Допросить: ' + investigation.name(draft.suspect) + '. Направить людей: ' + routeName(draft.route) + '.' +
          (investigation.owns(13) ? (draft.stop ? ' Повозку на 18:00 отменить.' : ' Заказ на 18:00 пока действует.') : '');
      append(inspector, summary + ' Подтверждаете?', 'witness');
      if (!draft.retry && investigation.owns(13)) {
        choices.push('<button type="button" data-order-stop aria-pressed="' + draft.stop + '">' +
          (draft.stop ? 'Повозка будет отменена' : 'Отменить повозку на 18:00') + '</button>');
      }
      choices.push('<button type="button" data-confirm-order>' + (draft.retry ? 'Подтвердить повторный обыск' : 'Отдать приказ') + '</button>');
      choices.push('<button type="button" data-order-map>Изменить место</button>');
      if (!draft.retry) choices.push('<button type="button" data-order-step="suspect">Изменить подозреваемого</button>');
      choices.push('<p class="question-label">До подтверждения можно положить трубку и сверить улики в журнале.</p>');
    }
    showButtons('<div class="investigation-choices">' + choices.join('') + '</div>');
  }

  function outcomeText(order) {
    const rescued = investigation.foundChildren(order.retry ?? order.route);
    const person = investigation.name(order.suspect);
    const paragraphs = [];
    let title;
    if (rescued) {
      title = order.suspect === 'vale' ? 'Дети вернулись домой' : 'Дети спасены';
      paragraphs.push('Полицейские поднялись над бутылочным складом и открыли комнату. Врач осмотрел Анну и Эдварда. К вечеру оба были с семьями.');
      if (order.stop) paragraphs.push('Контора отменила выезд, а пост у Южной почтовой станции проверил вечерние экипажи.');
    } else if (order.stop) {
      title = 'След потерян';
      paragraphs.push('Повозку задержали, но обыск по второму адресу тоже ничего не дал. Через месяц Анна и Эдвард всё ещё числятся пропавшими.');
    } else {
      title = 'Повозка ушла';
      paragraphs.push(order.route.place === 'warehouse'
        ? 'Команда проверила указанное помещение. Детей там не было.'
        : 'По указанному адресу детей не нашли.');
      paragraphs.push('В 18:00 повозка вышла со двора. У почтовой станции пассажиры пересели на междугородный экипаж. Конечного адреса в книге заказов не было.');
      paragraphs.push('На почтовой станции след обрывается. Через месяц на Рыночной улице всё ещё висят объявления о пропаже, но новых показаний нет.');
    }

    if (order.suspect === 'vale') {
      paragraphs.push('Вейла арестовали. Инспектор изъял подписанные им карточки и расписки из общества.');
    } else if (order.suspect === 'pike') {
      paragraphs.push('Пайка задержали по подозрению в удержании детей. Допрос не подтвердил, что он организовал исчезновения. Вейлу обвинение в тот вечер не предъявили.');
    } else {
      paragraphs.push('По вашему приказу привели на допрос: ' + person + '. Инспектор не нашёл оснований удерживать человека и отпустил его.');
      paragraphs.push('Кто-то видел, как полиция увела подозреваемого. По городу разошёлся слух, что виновного отпустили. У дома собрались разъярённые жители, среди них были родственники пропавших. Толпа забила освобождённого насмерть.');
      if (rescued) paragraphs.push('Известие о спасении детей пришло слишком поздно, чтобы остановить толпу.');
    }
    return { title, paragraphs };
  }

  function renderOutcome(order) {
    if (investigation.retryPending()) {
      append('Инспектор', 'Обыск по адресу «' + routeName(order.route) + '» ничего не дал. Контора отменила повозку на 18:00. У нас есть ещё одна проверка.', 'witness');
      showButtons('<button type="button" data-order-retry>Выбрать место повторного обыска</button>');
      return;
    }
    const result = outcomeText(order);
    append('Инспектор', 'Операция закончена. Откройте сводку.', 'witness');
    showButtons('<button type="button" data-open-ending>Читать развязку</button>');
    callResult.hidden = false;
    callResult.textContent = result.title;
  }

  function openLine(id = null) {
    line = investigation.contacts().includes(id) ? id : null;
    refreshPhone();
  }

  function refreshPhone() {
    callTitleAndDirectory();
    callMessages.replaceChildren();
    callQuestions.replaceChildren();
    callQuestions.hidden = true;
    callResult.hidden = true;
    append('Телефонистка', 'Телефонная станция слушает.', 'operator');
    if (!line) return;

    const contact = investigation.contact(line);
    const options = investigation.actionsFor('phone', line);
    append(contact.name, contact.greeting, 'witness');
    options.filter(option => option.done).forEach(option => {
      append('Детектив', option.text, 'detective');
      append(contact.name, option.reply, 'witness');
    });
    if (line === 'inspector' && (investigation.order() || draft.suspect || draft.step !== 'suspect' || draft.started)) renderOrder();
    else {
      const canReport = line === 'inspector' && investigation.owns(4);
      const report = line === 'inspector' ? '<button type="button" data-order-start' + (canReport ? '' : ' disabled') +
        '>Передать решение инспектору</button>' +
        (canReport ? '' : '<p class="question-label">Инспектор ждёт сведений с первого осмотра в доме № 8.</p>') : '';
      showButtons('<div class="investigation-choices">' + optionButtons(options, 'phone-action', () => 'Сначала нужна запись из конторы.') + report + '</div>');
    }
    scrollTranscript(callTranscript);
  }

  function callTitleAndDirectory() {
    phoneTitle.textContent = line ? investigation.contact(line).name : 'Телефон';
    callLine.textContent = line ? 'На линии' : 'Линия свободна';
    callContacts.innerHTML = investigation.contacts().map(id => {
      const contact = investigation.contact(id);
      return '<button type="button" data-investigation-contact="' + id + '" aria-pressed="' + (line === id) + '">' +
        '<span class="contact-name">' + contact.name + '<small>' + contact.line + '</small></span></button>';
    }).join('');
  }

  function openMapForOrder() {
    choosingMap = true;
    selectedLocation = draft.route?.place ?? null;
    openMap();
  }

  mapDialog.addEventListener('close', () => { choosingMap = false; });

  function chooseLocation(key) {
    const previous = investigation.order()?.route;
    if (draft.retry && previous?.place === key && key !== 'warehouse') return;
    draft.route = { place: key };
    draft.step = key === 'warehouse' ? (draft.retry ? 'retry-room' : 'room') : (draft.retry ? 'review-retry' : 'review');
    refreshPhone();
    callQuestions.querySelector('button:not(:disabled)')?.focus();
  }

  function syncJournal() {
    syncMap();
    if (folder.open) renderFolder();
  }

  function openEnding() {
    const result = outcomeText(investigation.order());
    openReading(result.title, 'Сводка инспектора', '<div class="case-ending">' +
      result.paragraphs.map(paragraph => '<p>' + paragraph + '</p>').join('') +
      '<button type="button" class="material-link" data-reset-investigation>Начать расследование заново</button></div>');
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    const data = target.dataset;
    if (target.closest('#phone') && phone.classList.contains('phone-closing')) return;
    if (target.hasAttribute('data-case-intro')) openReading('Как играть', papinyCase.title, caseParagraphs(papinyCase.rules));
    if (target.hasAttribute('data-case-timeline')) {
      const timeline = investigation.timeline().map(([date, text, source]) =>
        '<li><strong>' + date + '</strong><p>' + text + '</p><button type="button" class="material-link" data-read-material="' +
        source + '">Материал ' + materialNumber(source) + '</button></li>').join('');
      openReading('Хронология', 'Даты из найденных материалов', '<ol class="case-timeline">' + timeline + '</ol>');
    }
    if (data.readMaterial) openMaterial(Number(data.readMaterial));
    if (data.followPlace && investigation.availablePlaces().includes(data.followPlace)) {
      selectedLocation = data.followPlace;
      openMap();
    }
    if (data.followContact && investigation.contacts().includes(data.followContact)) openPhone(data.followContact);
    if (data.visitAction && currentVisit) {
      const result = investigation.perform('visit', currentVisit, data.visitAction);
      if (result) {
        renderVisit(currentVisit);
        if (result.found.length) visitMaterials.querySelector('.visit-result').append(' ' + foundMessage(result.found));
        visitMaterials.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
        syncJournal();
      }
    }
    if (data.investigationContact) {
      openLine(data.investigationContact);
      phoneTitle.focus({ preventScroll: true });
    }
    if (data.phoneAction && line) {
      const result = investigation.perform('phone', line, data.phoneAction);
      if (result) {
        refreshPhone();
        if (result.found.length) {
          callResult.hidden = false;
          callResult.textContent = foundMessage(result.found);
        }
        syncJournal();
      }
    }
    if (target.hasAttribute('data-order-start')) { draft = { ...emptyOrder(), started: true }; refreshPhone(); }
    if (data.orderSuspect) { draft.suspect = data.orderSuspect; draft.step = 'place'; refreshPhone(); }
    if (data.orderStep) { draft.step = data.orderStep; refreshPhone(); }
    if (target.hasAttribute('data-order-map')) openMapForOrder();
    if (data.orderRoom !== undefined) { draft.route.room = Number(data.orderRoom); draft.step = draft.retry ? 'review-retry' : 'review'; refreshPhone(); }
    if (target.hasAttribute('data-order-stop')) { draft.stop = !draft.stop; refreshPhone(); }
    if (target.hasAttribute('data-confirm-order')) {
      const saved = draft.retry ? investigation.retry(draft.route) : investigation.confirm(draft);
      if (saved) {
        draft = emptyOrder();
        refreshPhone();
        if (!investigation.retryPending()) openEnding();
      }
    }
    if (target.hasAttribute('data-order-retry')) { draft = { ...emptyOrder(), step: 'retry-place', retry: true }; openMapForOrder(); }
    if (target.hasAttribute('data-open-ending')) openEnding();
    if (target.hasAttribute('data-reset-investigation') &&
      window.confirm('Начать расследование заново? Улики, заметки на доске и результат этого прохождения будут сброшены.')) {
      investigation.reset();
      caseBoard.reset();
      location.reload();
    }
  });

  return { syncMap, renderVisit, openLine, chooseLocation, canChooseAddress, followButtons, choosingLocation: () => choosingMap };
})();
