const folder = document.querySelector('#folder');
const folderTrigger = document.querySelector('#open-folder');
const bookMotion = folder.querySelector('.book-motion');
const bookJacket = folder.querySelector('.book-jacket');
const bookSpread = folder.querySelector('.book-open');
const folderShade = folder.querySelector('.folder-shade');
const folderDetail = document.querySelector('#folder-detail');
const phone = document.querySelector('#phone');
const phoneTrigger = document.querySelector('#open-phone');
const receiver = phone.querySelector('.receiver');
const folderPage = document.querySelector('#folder-page');
const phoneTitle = document.querySelector('#phone-title');
const callLine = document.querySelector('#call-line');
const callContacts = document.querySelector('#call-contacts');
const callMessages = document.querySelector('#call-messages');
const callQuestions = document.querySelector('#call-questions');
const callResult = document.querySelector('#call-result');
const callTranscript = phone.querySelector('.call-transcript');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const tableau = document.querySelector('.desk-tableau');
const office = document.querySelector('.office');
const breathSmoke = createBreathSmoke(document.querySelector('#breath-smoke'));
const rain = document.querySelector('.window-rain');
const mapDialog = document.querySelector('#town-map');
const mapTrigger = document.querySelector('#open-map');
const mapSheet = mapDialog.querySelector('.map-sheet');
const mapSlip = document.querySelector('#map-slip');
const visitDialog = document.querySelector('#visit');
const visitScene = visitDialog.querySelector('.visit-scene');
const visitView = visitScene.querySelector('.visit-view');
const visitInspect = visitScene.querySelector('[data-inspect]');
const visitObservation = visitScene.querySelector('#visit-observation');
const visitWitness = visitScene.querySelector('.visit-witness');
const visitTranscript = visitScene.querySelector('.visit-transcript');
const visitMessages = visitTranscript.querySelector('ol');
const visitQuestions = visitScene.querySelector('.visit-questions');
const visitMaterials = visitScene.querySelector('.visit-materials');
const deskMapStairs = document.querySelector('#desk-map-stairs');
const cigar = document.querySelector('#cigar');
const cigarettePack = document.querySelector('#cigarette-pack');
const drinkWhisky = document.querySelector('#drink-whisky');
const sipView = document.querySelector('.sip-view');
const liftedBottle = document.querySelector('.bottle-lift');
const deskStatus = document.querySelector('#desk-status');
const restart = document.querySelector('#restart');

const contacts = {
  station: {
    place: 'Станция Блэкфорд',
    name: 'Артур Белл',
    role: 'Начальник станции',
    description: 'Дежурил в вечер прибытия последнего поезда. Прислал телеграмму об исчезновении кондуктора.',
    number: '14',
    greeting: 'Белл у аппарата. Это по поводу кондуктора?',
    questions: [
      {
        label: 'Где вы стояли?',
        reply: 'У дверей конторы, в дальнем конце платформы. Я ждал, пока состав остановится.'
      },
      {
        label: 'Кто ещё был на платформе?',
        reply: 'На другом конце стояла женщина с дорожным чемоданом. Она ушла в сторону гостиницы.'
      },
      {
        label: 'Почему запись в журнале сделана до прибытия поезда?',
        reply: 'Это запись о выдаче ключа, не о прибытии. Подпись там неразборчивая. На платформе я видел человека в форменной фуражке. Решил, что это Рид, потому что в журнал уже вписали его фамилию.',
        needsJournal: true,
        revealsLead: true
      }
    ]
  },
  inn: {
    place: 'Гостиница «Фонарь»',
    name: 'Элис Уорд',
    role: 'Хозяйка гостиницы',
    description: 'Держит гостиницу «Фонарь» у вокзала. Кондуктор Рид иногда заходил к ней после смены.',
    number: '27',
    greeting: 'Гостиница «Фонарь», Уорд слушает.',
    questions: [
      {
        label: 'Вы видели кондуктора этим вечером?',
        reply: 'Мистер Рид иногда заходил после смены. Сегодня его я не видела.'
      },
      {
        label: 'Что видно из окон гостиницы?',
        reply: 'Главный вход станции хорошо виден. На другой конец платформы выходит служебная лестница, её от нас закрывает навес.'
      }
    ]
  }
};

const locations = {
  station: {
    title: 'Станция Блэкфорд',
    description: 'Вечерний поезд пришёл сюда в 22:10. Начальник станции утверждает, что видел кондуктора на платформе.',
    address: 'Блэкфорд · Платформа',
    arrival: 'Под навесом капает с крыши. Артур Белл ждёт у двери станционной конторы.',
    inspect: 'Осмотреть платформу',
    observation: 'Под навесом горят редкие фонари. Из дверей конторы видна платформа, но в дальнем конце трудно различить лицо.',
    greeting: 'Добрый вечер. Вы получили мою телеграмму?',
    contact: 'station'
  },
  inn: {
    title: 'Гостиница «Фонарь»',
    description: 'Из окон гостиницы виден главный вход вокзала. Хозяйка знает кондуктора Рида.',
    address: 'Блэкфорд · Приёмная',
    arrival: 'За стойкой в приёмной Элис Уорд складывает ключи. В окне напротив отражается фонарь у станции.',
    inspect: 'Выглянуть в окно',
    observation: 'Главный вход вокзала хорошо освещён. Навес закрывает дальний конец платформы и выход к лестнице.',
    greeting: 'Добрый вечер. Вы по поводу мистера Рида?',
    contact: 'inn'
  },
  stairs: {
    title: 'Служебная лестница',
    description: 'Лестница у дальнего края платформы ведёт в переулок. Кто-то получил ключ от неё под фамилией Рида ещё до прибытия поезда.',
    address: 'Блэкфорд · За платформой',
    arrival: 'За навесом шумит дождь. Мокрые ступени спускаются к переулку, в стороне от главного входа.',
    inspect: 'Осмотреть проход',
    observation: 'По этой лестнице можно уйти с платформы, минуя главный вход. Из гостиницы прохода не видно.'
  }
};

const documents = {
  telegram: {
    title: 'Телеграмма',
    body: `<p class="document-meta">Станция Блэкфорд · 17 ноября 1897 г.</p>
      <p class="telegram-text">Поезд прибыл в <strong>22:10</strong>. Я видел кондуктора на платформе. На перекличку он не явился. Прошу приехать.</p>
      <p class="signature">Артур Белл</p>`
  },
  journal: {
    title: 'Станционный журнал',
    body: `<p class="document-meta">Заверенная выписка · 17 ноября 1897 г.</p>
      <dl class="journal-lines">
        <div><dt>22:05</dt><dd>Выдан ключ от служебной лестницы. Фамилия в журнале — Рид. Подпись неразборчива.</dd></div>
        <div><dt>22:10</dt><dd>Вечерний поезд прибыл.</dd></div>
      </dl>`
  },
  note: {
    title: 'Заметка детектива',
    body: `<p class="document-meta">После разговора с начальником станции</p>
      <p>Белл видел форму, но не разглядел лица. До прибытия поезда кто-то получил ключ от служебной лестницы под фамилией Рида.</p>
      <p class="next-task"><strong>Следующий вопрос</strong> Кто был на платформе в форме кондуктора?</p>`
  }
};

const papinyDossier = isPapinyCase ? Object.fromEntries(['documents', 'people', 'places']
  .flatMap(papinyEntries).map(entry => [entry.id, { title: entry.title, photo: entry.photo }])) : null;

caseBoard.init(papinyDossier ?? {
  'person-station': { title: contacts.station.name, photo: 0 },
  'person-inn': { title: contacts.inn.name, photo: 1 },
  'place-station': { title: locations.station.title, photo: 2 },
  'place-inn': { title: locations.inn.title, photo: 3 },
  'place-stairs': { title: locations.stairs.title, photo: 4 },
  'clue-telegram': { title: documents.telegram.title, photo: 5 },
  'clue-journal': { title: documents.journal.title, photo: 6 },
  'clue-note': { title: documents.note.title, photo: 7 }
});

const storageKey = isPapinyCase ? 'papiny-bukvy:desk' : 'posledniy-reys:episode-one';
const bottleCapacity = 4;
const sipsPerGlass = 3;
const cigarDuration = 60000;
const cigaretteDuration = 40000;
const packCapacity = 5;
const breathInterval = 4000;
const exhaleDuration = 1200;
const freshProgress = () => ({ readJournal: false, foundLead: false, bottle: bottleCapacity, sips: 0,
  cigarUsed: 0, cigaretteUsed: 0, cigarettesLeft: packCapacity });

function restoredNumber(value, maximum, fallback) {
  return Number.isInteger(value) && value >= 0 && value <= maximum ? value : fallback;
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return {
      readJournal: saved?.readJournal === true,
      foundLead: saved?.foundLead === true,
      bottle: restoredNumber(saved?.bottle, bottleCapacity, bottleCapacity),
      sips: restoredNumber(saved?.sips, sipsPerGlass, 0),
      cigarUsed: restoredNumber(saved?.cigarUsed, cigarDuration, 0),
      cigaretteUsed: restoredNumber(saved?.cigaretteUsed, cigaretteDuration, 0),
      cigarettesLeft: restoredNumber(saved?.cigarettesLeft, packCapacity, packCapacity)
    };
  } catch {
    return freshProgress();
  }
}

let progress = loadProgress();
let selectedPage = 'documents';
let selectedRecord = null;
let activeContact = null;
let selectedLocation = null;
let whiskyState = progress.sips ? 'full' : 'empty';
let whiskyOperation = 0;
let cigarTick;
let cigarStarted = null;
let nextBreathAt;
let lastBreathAt;
const conversations = new Map();
const operatorGreeting = isPapinyCase ? 'Телефонная станция слушает.' : 'Станция слушает. С кем вас соединить?';

for (let index = 0; index < 58; index += 1) {
  const streak = document.createElement('i');
  const duration = .62 + (index * 19 % 71) / 100;
  streak.style.setProperty('--rain-x', `${index * 29 % 99}%`);
  streak.style.setProperty('--rain-length', `${8 + index * 7 % 19}%`);
  streak.style.setProperty('--rain-opacity', String(.23 + (index * 13 % 49) / 100));
  streak.style.setProperty('--rain-time', `${duration}s`);
  streak.style.setProperty('--rain-delay', `-${duration * (index * 31 % 101) / 101}s`);
  rain.append(streak);
}

if (!isPapinyCase) callContacts.innerHTML = Object.entries(contacts).map(([key, contact]) => `
  <button type="button" data-contact="${key}" aria-pressed="false">
    <span class="contact-name">${contact.place}<small>${contact.name}</small></span>
    <span class="contact-number">№ ${contact.number}</span>
  </button>`).join('');

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  } catch {
    // Keep the current session playable when browser storage is unavailable.
  }
  updateDesk();
}

function updateDesk() {
  if (isPapinyCase) {
    deskStatus.textContent = 'Папины буквы. Открой журнал, чтобы прочитать заявления о пропаже детей.';
    return;
  }
  deskStatus.textContent = progress.foundLead
    ? 'Первая зацепка найдена. Запись уже в папке дела.'
    : 'Осмотрите стол, чтобы начать расследование.';
  restart.hidden = !progress.foundLead;
  deskMapStairs.hidden = !progress.foundLead;
}

const folderSections = {
  documents: { title: 'Улики', summary: 'Документы и находки по делу об исчезновении кондуктора. Выбери материал справа, чтобы прочитать его.' },
  people: { title: 'Люди', summary: 'Свидетели и другие люди, связанные с делом. Выбери карточку справа, чтобы посмотреть, что о них известно.' },
  places: { title: 'Места', summary: 'Места в Блэкфорде, которые могут помочь расследованию. Выбери адрес справа, чтобы посмотреть заметки.' }
};

function folderEntries() {
  if (isPapinyCase) {
    const unlocked = selectedPage === 'people' ? papinyInvestigation.knownPeople() : papinyInvestigation.availablePlaces();
    return papinyEntries(selectedPage).filter(entry => selectedPage === 'documents'
      ? papinyInvestigation.owns(Number(entry.key)) : unlocked.includes(entry.key));
  }
  if (selectedPage === 'documents') {
    const available = progress.foundLead ? ['telegram', 'journal', 'note'] : ['telegram', 'journal'];
    return available.map(key => ({ key, id: 'clue-' + key, ...documents[key] }));
  }
  if (selectedPage === 'people') {
    return Object.entries(contacts).map(([key, contact]) => ({
      key, id: 'person-' + key, title: contact.name, caption: contact.role,
      body: `<p>${contact.description}</p><p class="person-number">Телефон № ${contact.number}</p>`
    }));
  }
  return Object.entries(locations).filter(([key]) => key !== 'stairs' || progress.foundLead)
    .map(([key, place]) => ({
      key, id: 'place-' + key, title: place.title, body: `<p>${place.description}</p>`
    }));
}

function renderFolder() {
  folder.querySelectorAll('[data-page]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.page === selectedPage));
  });
  const { title, summary } = folderSections[selectedPage];
  const entries = folderEntries();
  const record = entries.find(entry => entry.key === selectedRecord);
  const listScroll = folderPage.scrollTop;
  const overview = isPapinyCase
    ? selectedPage === 'documents'
      ? '<section class="section-note"><h3>Начало дела</h3>' + caseParagraphs(papinyCase.introduction) +
        '<button type="button" class="material-link" data-follow-place="tannery">Показать дом № 8 на карте</button></section>'
      : `<section class="section-note"><h3>${title}</h3><p>Выбери карточку справа, чтобы открыть связанные материалы.</p></section>`
    : `<section class="section-note"><h3>${title}</h3><p>${summary}</p></section>`;

  folderDetail.innerHTML = record
    ? `<article class="record-sheet ${record.key}">
        <header>${caseBoard.preview(record.id)}<div><h3>${record.title}</h3>
          ${record.caption ? `<p class="document-meta">${record.caption}</p>` : ''}</div></header>
        <div class="record-text">${record.body}</div>
        ${isPapinyCase && selectedPage === 'documents' ? `<div class="investigation-links">${papinyUI.followButtons(record.key)}</div>` : ''}
      </article>`
    : overview;
  folderDetail.scrollTop = 0;

  folderPage.innerHTML = `<h3 class="record-list-title">${title}</h3>
    <ul class="record-list">${entries.map(entry => `<li>
      <button type="button" class="record-choice" data-record="${entry.key}" aria-pressed="${entry.key === selectedRecord}">
        ${entry.number ? `<span class="material-number">${entry.number}</span>` : caseBoard.preview(entry.id)}<span>${entry.title}</span>
      </button>${caseBoard.pinButton(entry.id)}
    </li>`).join('')}</ul>${isPapinyCase ? '' : '<div class="file-blank-slots" aria-hidden="true"></div>'}`;
  folderPage.scrollTop = listScroll;
}

function appendDialogueLine(messages, speaker, text, kind, animate = false) {
  const entry = document.createElement('li');
  const speakerLabel = document.createElement('span');
  const line = document.createElement('p');
  entry.className = `call-message ${kind}`;
  if (animate) entry.classList.add('new-message');
  speakerLabel.className = 'speaker';
  speakerLabel.textContent = speaker;
  line.textContent = text;
  entry.append(speakerLabel, line);
  messages.append(entry);
}

function addExchange(messages, contact, question, animate = false) {
  appendDialogueLine(messages, 'Детектив', question.label, 'detective', animate);
  appendDialogueLine(messages, contact.name, question.reply, 'witness', animate);
}

function scrollTranscript(transcript, animate = false) {
  transcript.scrollTo({
    top: transcript.scrollHeight,
    behavior: animate && !reducedMotion.matches ? 'smooth' : 'auto'
  });
}

function questionButtons(contactKey) {
  return contacts[contactKey].questions.map((question, index) => {
    if (conversations.get(contactKey).has(index) || (question.needsJournal && !progress.readJournal)) return '';
    return `<button type="button" data-question="${index}">${question.label}</button>`;
  }).join('');
}

function recordAnswer(contactKey, index, messages) {
  const contact = contacts[contactKey];
  const question = contact.questions[index];
  conversations.get(contactKey).add(index);
  addExchange(messages, contact, question, true);
  if (question.revealsLead) {
    progress.foundLead = true;
    saveProgress();
  }
}

function renderQuestions() {
  callQuestions.hidden = !activeContact;
  if (!activeContact) {
    callQuestions.replaceChildren();
    callResult.hidden = true;
    return;
  }
  const contact = contacts[activeContact];
  const asked = conversations.get(activeContact);
  const options = questionButtons(activeContact);
  callQuestions.innerHTML = options
    ? `<p class="question-label">Что спросить?</p>${options}`
    : '<p class="question-label">На этой линии больше нет вопросов.</p>';
  callResult.hidden = !Array.from(asked).some((index) => contact.questions[index].revealsLead);
  if (!callResult.hidden) callResult.textContent = 'Заметка добавлена в книгу дела.';
}

function renderPhone() {
  callContacts.querySelectorAll('[data-contact]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.contact === activeContact));
  });
  callMessages.replaceChildren();
  const contact = contacts[activeContact];
  appendDialogueLine(callMessages, 'Телефонистка', operatorGreeting, 'operator');
  phoneTitle.textContent = contact?.name ?? 'Телефон';
  callLine.textContent = contact ? `На линии · № ${contact.number}` : 'Линия свободна';
  if (contact) {
    const asked = conversations.get(activeContact);
    appendDialogueLine(callMessages, contact.name, contact.greeting, 'witness', asked.size === 0);
    asked.forEach((index) => addExchange(callMessages, contact, contact.questions[index]));
  }
  renderQuestions();
  scrollTranscript(callTranscript);
}

const folderFlight = 820;
let folderAnimations = [];
let folderClosing = false;

function animateFolder(closing) {
  const source = folderTrigger.getBoundingClientRect();
  const cover = bookJacket.getBoundingClientRect();
  const offsetX = source.left + source.width / 2 - cover.left - cover.width / 2;
  const offsetY = source.top + source.height / 2 - cover.top - cover.height / 2;
  const scaleX = source.width / cover.width;
  const scaleY = source.height / cover.height;
  const timing = { duration: folderFlight, fill: 'both' };
  const ease = 'cubic-bezier(.36, 0, .25, 1)';
  const animations = [
    bookMotion.animate([
      { transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scaleX}, ${scaleY}) rotateZ(-3deg)`, easing: ease },
      { transform: 'translate3d(0, 0, 0) scale(1, 1) rotateZ(0deg)' }
    ], timing),
    bookJacket.animate([
      { visibility: 'visible', opacity: 1, transform: 'perspective(1800px) rotateY(0deg)', offset: 0 },
      { visibility: 'visible', opacity: 1, transform: 'perspective(1800px) rotateY(0deg)', offset: .18, easing: ease },
      { visibility: 'visible', opacity: 1, transform: 'perspective(1800px) rotateY(-176deg)', offset: .78 },
      { visibility: 'visible', opacity: 0, transform: 'perspective(1800px) rotateY(-180deg)', offset: 1 }
    ], timing),
    bookSpread.animate([
      { clipPath: 'inset(-64px -120px -64px 50%)', opacity: 0, offset: 0 },
      { clipPath: 'inset(-64px -120px -64px 50%)', opacity: 0, offset: .18, easing: ease },
      { clipPath: 'inset(-64px -120px -64px -64px)', opacity: 1, offset: .8 },
      { clipPath: 'inset(-64px -120px -64px -64px)', opacity: 1, offset: 1 }
    ], timing),
    folderShade.animate([{ opacity: 0, easing: ease }, { opacity: 1 }], timing)
  ];
  const start = document.timeline.currentTime;
  for (const animation of animations) {
    if (closing) animation.playbackRate = -1;
    animation.startTime = start + (closing ? folderFlight : 0);
  }
  return animations;
}

folderTrigger.addEventListener('click', async () => {
  if (folder.open) return;
  renderFolder();
  folder.showModal();
  folder.scrollTop = 0;
  if (reducedMotion.matches) return;
  const animations = folderAnimations = animateFolder(false);
  await Promise.allSettled(animations.map(animation => animation.finished));
  if (folderAnimations !== animations || folderClosing) return;
  animations.forEach(animation => animation.cancel());
  folderAnimations = [];
});

async function closeFolder() {
  if (!folder.open || folderClosing) return;
  folderClosing = true;
  folder.classList.add('folder-leaving');
  if (!reducedMotion.matches) {
    if (folderAnimations.length) folderAnimations.forEach(animation => animation.reverse());
    else folderAnimations = animateFolder(true);
    await Promise.allSettled(folderAnimations.map(animation => animation.finished));
  }
  folder.close();
  folderAnimations.forEach(animation => animation.cancel());
  folderAnimations = [];
  folderClosing = false;
  folder.classList.remove('folder-leaving');
  folderTrigger.focus({ preventScroll: true });
}

folder.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeFolder();
});

function selectContact(key) {
  activeContact = key;
  if (key && !conversations.has(key)) conversations.set(key, new Set());
  renderPhone();
}

function openPhone(contact = null) {
  if (isPapinyCase) papinyUI.openLine(contact);
  else selectContact(contact);
  phone.showModal();
  const source = phoneTrigger.getBoundingClientRect();
  const handset = receiver.getBoundingClientRect();
  const x = source.left + source.width / 2 - handset.left - handset.width / 2;
  const y = source.top + source.height / 2 - handset.top - handset.height / 2;
  phone.style.setProperty('--receiver-x', `${x}px`);
  phone.style.setProperty('--receiver-y', `${y}px`);
  phone.classList.add('phone-opening');
}

phoneTrigger.addEventListener('click', () => openPhone());

async function hangUp() {
  if (phone.classList.contains('phone-closing')) return;
  phone.classList.replace('phone-opening', 'phone-closing');
  const animations = receiver.getAnimations();
  await Promise.allSettled(animations.map((animation) => animation.finished));
  phone.close();
}

phone.addEventListener('close', () => phone.classList.remove('phone-opening', 'phone-closing'));
phone.addEventListener('cancel', (event) => {
  event.preventDefault();
  hangUp();
});

function renderMap() {
  if (isPapinyCase) papinyUI.syncMap();
  mapDialog.querySelectorAll('[data-location]').forEach((pin) => {
    const key = pin.dataset.location;
    if (!isPapinyCase) pin.hidden = key === 'stairs' && !progress.foundLead;
    pin.setAttribute('aria-pressed', String(key === selectedLocation));
  });
  const place = (isPapinyCase ? papinyCase.locations : locations)[selectedLocation];
  mapSlip.innerHTML = place
    ? `<div><h3>${place.title}</h3><p>${isPapinyCase ? (place.address || 'Блэкмир') : place.description}</p></div>
       <button type="button" data-map-visit="${selectedLocation}"${isPapinyCase && !papinyUI.canChooseAddress(selectedLocation) ? ' disabled' : ''}>${isPapinyCase && papinyUI.choosingLocation() ? 'Указать этот адрес' : 'Отправиться сюда'}</button>`
    : '<p>Выбери место на карте.</p>';
}

function setMapDestination() {
  const source = mapTrigger.getBoundingClientRect();
  const dialogBounds = mapDialog.getBoundingClientRect();
  const width = mapSheet.offsetWidth;
  const height = mapSheet.offsetHeight;
  const x = source.left + source.width / 2 - (dialogBounds.left + mapSheet.offsetLeft + width / 2);
  const y = source.top + source.height / 2 - (dialogBounds.top + mapSheet.offsetTop + height / 2);
  mapDialog.style.setProperty('--map-x', `${x}px`);
  mapDialog.style.setProperty('--map-y', `${y}px`);
  mapDialog.style.setProperty('--map-scale', Math.min(.72, source.width / width));
}

function openMap() {
  if (mapDialog.open) return;
  renderMap();
  mapDialog.showModal();
  setMapDestination();
  mapDialog.classList.add('map-opening');
}
mapTrigger.addEventListener('click', openMap);

async function closeMap() {
  if (!mapDialog.open || mapDialog.classList.contains('map-closing')) return false;
  const style = getComputedStyle(mapSheet);
  mapDialog.style.setProperty('--map-close-start', style.transform);
  mapDialog.style.setProperty('--map-close-opacity', style.opacity);
  setMapDestination();
  mapDialog.classList.remove('map-opening');
  mapDialog.classList.add('map-closing');
  const exit = mapSheet.getAnimations().find(animation => animation.animationName === 'settle-map');
  if (exit) await Promise.allSettled([exit.finished]);
  mapDialog.close();
  return true;
}

mapDialog.addEventListener('close', () => mapDialog.classList.remove('map-opening', 'map-closing'));
mapDialog.querySelector('[data-close]').addEventListener('click', closeMap);
mapDialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeMap();
});
mapDialog.addEventListener('click', async (event) => {
  if (mapDialog.classList.contains('map-closing')) return;
  const pin = event.target.closest('[data-location]');
  if (pin) {
    selectedLocation = pin.dataset.location;
    renderMap();
  }
  const visit = event.target.closest('[data-map-visit]');
  if (visit) {
    selectedLocation = visit.dataset.mapVisit;
    if (isPapinyCase && papinyUI.choosingLocation()) {
      const key = selectedLocation;
      if (await closeMap()) papinyUI.chooseLocation(key);
      return;
    }
    openVisit(selectedLocation);
  }
});

let currentVisit = null;

function renderVisitQuestions(contactKey) {
  visitQuestions.innerHTML = questionButtons(contactKey) || '<p>На этом пока всё.</p>';
}

function openVisit(key) {
  if (isPapinyCase) {
    const place = papinyCase.locations[key];
    if (!place || visitDialog.open || !papinyInvestigation.visit(key)) return;
    currentVisit = key;
    visitScene.querySelector('#visit-title').textContent = place.title;
    visitScene.querySelector('#visit-address').textContent = place.address || 'Блэкмир';
    visitView.dataset.scene = place.scene ?? '';
    visitView.innerHTML = place.photo === undefined || place.scene ? '' : caseBoard.preview(`papiny-place-${key}`);
    visitView.classList.toggle('visit-unillustrated', place.photo === undefined && !place.scene);
    visitScene.querySelector('.visit-arrival').textContent = place.description;
    visitInspect.hidden = true;
    visitObservation.hidden = true;
    visitWitness.hidden = true;
    visitMaterials.hidden = false;
    papinyUI.renderVisit(key);
    visitDialog.showModal();
    visitDialog.scrollTop = 0;
    return;
  }
  const place = locations[key];
  if (!place || visitDialog.open || (key === 'stairs' && !progress.foundLead)) return;
  currentVisit = key;
  visitScene.querySelector('#visit-title').textContent = place.title;
  visitScene.querySelector('#visit-address').textContent = place.address;
  visitView.innerHTML = caseBoard.preview(`place-${key}`);
  visitScene.querySelector('.visit-arrival').textContent = place.arrival;
  visitInspect.textContent = place.inspect;
  visitInspect.setAttribute('aria-expanded', 'false');
  visitObservation.textContent = place.observation;
  visitObservation.hidden = true;
  visitWitness.hidden = !place.contact;
  if (place.contact) {
    const contact = contacts[place.contact];
    if (!conversations.has(place.contact)) conversations.set(place.contact, new Set());
    visitScene.querySelector('#visit-witness-title').textContent = contact.name;
    visitMessages.replaceChildren();
    appendDialogueLine(visitMessages, contact.name, place.greeting, 'witness');
    conversations.get(place.contact).forEach(index => addExchange(visitMessages, contact, contact.questions[index]));
    renderVisitQuestions(place.contact);
  }
  visitDialog.showModal();
  scrollTranscript(visitTranscript);
}

async function returnToMap() {
  if (!visitDialog.open || visitDialog.classList.contains('visit-leaving')) return;
  visitDialog.classList.add('visit-leaving');
  const exit = visitScene.getAnimations().find(animation => animation.animationName === 'depart-location');
  if (exit) await Promise.allSettled([exit.finished]);
  visitDialog.close();
  visitDialog.classList.remove('visit-leaving');
  currentVisit = null;
  renderMap();
  mapSlip.querySelector('[data-map-visit]')?.focus({ preventScroll: true });
}

visitScene.querySelector('[data-return-to-map]').addEventListener('click', returnToMap);
visitDialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  returnToMap();
});
visitInspect.addEventListener('click', () => {
  visitObservation.hidden = !visitObservation.hidden;
  visitInspect.setAttribute('aria-expanded', String(!visitObservation.hidden));
});
visitQuestions.addEventListener('click', (event) => {
  const question = event.target.closest('[data-question]');
  if (!question || !currentVisit || visitDialog.classList.contains('visit-leaving')) return;
  const contactKey = locations[currentVisit].contact;
  recordAnswer(contactKey, Number(question.dataset.question), visitMessages);
  renderVisitQuestions(contactKey);
  scrollTranscript(visitTranscript, true);
  (visitQuestions.querySelector('button') ?? visitTranscript).focus({ preventScroll: true });
});

function currentSmoke() {
  return progress.cigarUsed === cigarDuration && progress.cigarettesLeft < packCapacity
    ? { key: 'cigaretteUsed', duration: cigaretteDuration, isCigarette: true }
    : { key: 'cigarUsed', duration: cigarDuration, isCigarette: false };
}

function renderSmokingControls() {
  const { key, duration, isCigarette } = currentSmoke();
  const active = cigarStarted !== null;
  const spent = progress[key] >= duration;
  const resume = isCigarette && !spent;
  const noCigar = progress.cigarUsed === cigarDuration;
  cigar.setAttribute('aria-pressed', String(active));
  cigar.setAttribute('aria-disabled', String(spent));
  cigar.setAttribute('aria-label', spent ? 'Пепельница с окурком'
    : active ? (isCigarette ? 'Затушить сигарету' : 'Затушить сигару')
    : (isCigarette ? 'Снова зажечь сигарету' : 'Зажечь сигару'));
  cigarettePack.hidden = !noCigar;
  cigarettePack.setAttribute('aria-disabled', String(active));
  cigarettePack.setAttribute('aria-label', resume ? 'Продолжить курить сигарету'
    : progress.cigarettesLeft ? `Взять сигарету. В пачке: ${progress.cigarettesLeft}` : 'Достать новую пачку и взять сигарету');
  cigarettePack.dataset.empty = String(progress.cigarettesLeft === 0);
  office.classList.toggle('cigar-lit', active);
  office.classList.toggle('cigar-drawn', active);
  office.classList.toggle('cigar-spent', spent);
  office.classList.toggle('cigarette-mode', isCigarette);
}

function renderCigarLength(used, duration) {
  const cycle = used % breathInterval;
  const slowerBurn = .55;
  const drawBurn = (breathInterval - exhaleDuration * slowerBurn) / (breathInterval - exhaleDuration);
  const burnWithinCycle = Math.min(cycle, exhaleDuration) * slowerBurn
    + Math.max(0, cycle - exhaleDuration) * drawBurn;
  const burned = (used < breathInterval ? used : used - cycle + burnWithinCycle) / duration;
  const cigarette = duration === cigaretteDuration;
  office.style.setProperty('--burn-x', `${(cigarette ? 13 : 22) + burned * (cigarette ? 63 : 44)}%`);
  office.style.setProperty('--burn-y', `${(cigarette ? 9 : 7) + burned * 69}%`);
  office.style.setProperty('--stub-left', `${burned * 82}%`);
  office.classList.toggle('cigar-short', used > 0 || progress.cigarUsed === cigarDuration);
}

function stopSmoking() {
  const { key, duration, isCigarette } = currentSmoke();
  const used = Math.min(duration, progress[key] + performance.now() - cigarStarted);
  clearInterval(cigarTick);
  cigarStarted = null;
  progress[key] = Math.round(used);
  renderCigarLength(used, duration);
  renderSmokingControls();
  saveProgress();
  if (!isCigarette && progress[key] === duration) {
    deskStatus.textContent = 'Сигара догорела. На столе появилась пачка сигарет.';
  } else if (progress[key] === duration) {
    deskStatus.textContent = 'В пепельнице остался окурок.';
  } else {
    deskStatus.textContent = isCigarette ? 'Сигарета снова в пепельнице.' : 'Сигара снова в пепельнице.';
  }
}

function updateCigar() {
  const { key, duration } = currentSmoke();
  const now = performance.now();
  const used = Math.min(duration, progress[key] + now - cigarStarted);
  renderCigarLength(used, duration);
  if (now >= nextBreathAt) {
    if (!reducedMotion.matches) breathSmoke.breathe();
    lastBreathAt = now;
    nextBreathAt += breathInterval * (Math.floor((now - nextBreathAt) / breathInterval) + 1);
  }
  office.classList.toggle('cigar-drawn', now - lastBreathAt >= exhaleDuration);
  if (used >= duration) stopSmoking();
}

function startSmoking() {
  const { key, duration } = currentSmoke();
  breathSmoke.clear();
  cigarStarted = performance.now();
  lastBreathAt = -Infinity;
  nextBreathAt = cigarStarted + breathInterval - progress[key] % breathInterval;
  cigarTick = setInterval(updateCigar, 100);
  renderCigarLength(progress[key], duration);
  renderSmokingControls();
  deskStatus.textContent = 'Уголёк разгорается.';
}

cigar.addEventListener('click', () => {
  if (cigarStarted !== null) {
    stopSmoking();
    return;
  }
  const { key, duration } = currentSmoke();
  if (progress[key] < duration) startSmoking();
});

cigarettePack.addEventListener('click', () => {
  if (progress.cigarUsed < cigarDuration || cigarStarted !== null) return;
  const { key, duration, isCigarette } = currentSmoke();
  if (!isCigarette || progress[key] >= duration) {
    if (!progress.cigarettesLeft) progress.cigarettesLeft = packCapacity;
    progress.cigarettesLeft -= 1;
    progress.cigaretteUsed = 0;
    saveProgress();
  }
  startSmoking();
});

window.addEventListener('pagehide', () => {
  if (cigarStarted !== null) stopSmoking();
});

function setWhisky(state) {
  whiskyState = state;
  tableau.dataset.whisky = state;
  office.classList.toggle('sipping-whisky', state === 'drinking');
  drinkWhisky.setAttribute('aria-disabled', String(state === 'pouring' || state === 'drinking'));
  office.style.setProperty('--bottle-level', progress.bottle / bottleCapacity);
  office.style.setProperty('--glass-level', progress.sips / sipsPerGlass);
  const label = state === 'pouring' ? 'Стакан наполняется' : state === 'drinking' ? 'Глоток виски'
    : progress.sips ? `Пригубить. Осталось глотков: ${progress.sips}` : 'Наполнить стакан виски';
  drinkWhisky.setAttribute('aria-label', label);
}

async function fillGlass() {
  if (whiskyState !== 'empty') return;
  const operation = ++whiskyOperation;
  if (!progress.bottle) progress.bottle = bottleCapacity;
  office.style.setProperty('--bottle-before', progress.bottle / bottleCapacity);
  progress.bottle -= 1;
  progress.sips = sipsPerGlass;
  setWhisky('pouring');
  saveProgress();
  await Promise.allSettled(liftedBottle.getAnimations().map((animation) => animation.finished));
  if (operation !== whiskyOperation) return;
  setWhisky('full');
  deskStatus.textContent = progress.bottle ? 'В стакане виски на три глотка.' : 'Последняя порция виски в стакане.';
}

drinkWhisky.addEventListener('click', async () => {
  if (whiskyState === 'empty') {
    await fillGlass();
    return;
  }
  if (whiskyState !== 'full') return;
  const operation = ++whiskyOperation;
  office.style.setProperty('--sip-before', progress.sips / sipsPerGlass);
  progress.sips -= 1;
  setWhisky('drinking');
  saveProgress();
  await Promise.allSettled(sipView.getAnimations().map((animation) => animation.finished));
  if (operation !== whiskyOperation) return;
  setWhisky(progress.sips ? 'full' : 'empty');
  deskStatus.textContent = ['Стакан пуст.', 'В стакане остался один глоток.', 'В стакане осталось два глотка.'][progress.sips];
});

folder.addEventListener('click', (event) => {
  if (folderClosing) return;
  if (event.target === folder) {
    closeFolder();
    return;
  }
  const boardButton = event.target.closest('[data-board-item]');
  if (boardButton) {
    const id = boardButton.dataset.boardItem;
    caseBoard.toggle(id);
    boardButton.outerHTML = caseBoard.pinButton(id);
    folderPage.querySelector(`[data-board-item="${id}"]`).focus();
    return;
  }
  const page = event.target.closest('[data-page]');
  const recordButton = event.target.closest('[data-record]');
  if (page && selectedPage !== page.dataset.page) {
    selectedPage = page.dataset.page;
    selectedRecord = null;
    folderPage.scrollTop = 0;
    renderFolder();
  }
  if (recordButton) {
    selectedRecord = recordButton.dataset.record;
    if (selectedPage === 'documents' && selectedRecord === 'journal') {
      progress.readJournal = true;
      saveProgress();
    }
    renderFolder();
    folderPage.querySelector(`[data-record="${selectedRecord}"]`).focus({ preventScroll: true });
  }
});

phone.addEventListener('click', (event) => {
  if (phone.classList.contains('phone-closing')) return;
  if (isPapinyCase) return;
  const contactButton = event.target.closest('[data-contact]');
  const questionButton = event.target.closest('[data-question]');
  if (contactButton && activeContact !== contactButton.dataset.contact) {
    selectContact(contactButton.dataset.contact);
    phoneTitle.focus();
  }
  if (!questionButton) return;

  recordAnswer(activeContact, Number(questionButton.dataset.question), callMessages);
  renderQuestions();
  scrollTranscript(callTranscript, true);
  const nextQuestion = callQuestions.querySelector('button') ?? callTranscript;
  nextQuestion.focus({ preventScroll: true });
});

folder.querySelector('[data-close]').addEventListener('click', closeFolder);
phone.querySelector('[data-close]').addEventListener('click', hangUp);

restart.addEventListener('click', () => {
  clearInterval(cigarTick);
  cigarStarted = null;
  breathSmoke.clear();
  whiskyOperation += 1;
  progress = freshProgress();
  selectedPage = 'documents';
  selectedRecord = null;
  activeContact = null;
  selectedLocation = null;
  conversations.clear();
  caseBoard.reset();
  renderCigarLength(0, cigarDuration);
  renderSmokingControls();
  setWhisky('empty');
  saveProgress();
  closeFolder();
});

const startingSmoke = currentSmoke();
renderCigarLength(progress[startingSmoke.key], startingSmoke.duration);
renderSmokingControls();
setWhisky(whiskyState);
updateDesk();
