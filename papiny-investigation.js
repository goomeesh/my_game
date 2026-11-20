const papinyInvestigation = (() => {
  const key = 'papiny-bukvy:investigation-v2';
  const startingPlaces = ['tannery', 'market', 'bell'];
  const leads = {
    4: ['bridge'], 7: ['clock'], 8: ['hearth'], 9: ['warehouse', 'carriage', 'willow'],
    13: ['post', 'west'], 15: ['hearth']
  };
  const people = {
    anna: [1], edward: [1], bell: [1], marsh: [1], samuel: [5, 7, 11], grinder: [2],
    ward: [7, 8], vale: [5, 6, 8, 9, 10, 14, 15], pike: [12, 13, 14, 17, 18],
    cole: [12, 13, 14], keeper: [17, 19], kitchen: [18], fletcher: [9, 11], secretary: [9]
  };
  const suspectNames = {
    bell: 'Отец Анны Белл', marsh: 'Мать Эдварда Марша', fletcher: 'Мистер Флетчер'
  };
  const siteActions = {
    tannery: [
      { text: 'Осмотреть комнату и задний двор', gets: [3], reply: 'У комнаты одно широкое окно и открытый камин. Из кухни можно выйти в Гончарный переулок.' },
      { text: 'Спросить точильщика, кто входил в дом', gets: [2], reply: 'Точильщик помнит повязку на руке мальчика и кожаную папку у мужчины. Лица мужчины он не разглядел.' },
      { text: 'Забрать у полицейского найденную тетрадь', needs: [3], gets: [4, 5], reply: 'В тетради два узких окна и зелёная печь. Описанная комната выглядит иначе.' }
    ],
    market: [{ text: 'Расспросить соседку у поворота', gets: [15], reply: 'Соседка узнала мужчину, которого мальчик назвал мистером Вейлом.' }],
    bell: [{ text: 'Показать родителям рисунок крестика', needs: [4], gets: [6], reply: 'Отец узнаёт свою резьбу. Мать даёт школьные работы, чтобы сравнить почерк.' }],
    bridge: [{ text: 'Осмотреть подъезд к мосту', gets: [], reply: 'По набережной через мост идут грузовые повозки. Сведения о происшествиях здесь ведёт портовая стража. Её можно вызвать из кабинета.' }],
    clock: [{ text: 'Расспросить Уорда о сыне', gets: [8], reply: 'Часовщик показывает карточку человека, который предлагал устроить его сына учеником.' }],
    hearth: [
      { text: 'Предъявить показания Уорда и сверить архив', needs: [8], gets: [9], reply: 'Председатель открывает служебный шкаф. Инспектор может сопоставить журнал с тремя закрытыми делами.' },
      { text: 'Предъявить Вейлу заявления и карточки', needs: [9], gets: [10], reply: 'Вейл объясняет, откуда, по его словам, взялись бумаги, и остаётся под наблюдением полицейского.' }
    ],
    willow: [
      { text: 'Опросить Флетчеров и сверить документы', gets: [11], reply: 'Флетчеры показывают расписку и ребёнка, которого им представили под именем Томаса.' },
      { text: 'Поговорить с Сэмюэлом отдельно', needs: [11], gets: [12], reply: 'Его расспрашивают до того, как он увидит тетрадь. Он помнит комнату, голоса и поездку.' }
    ],
    carriage: [
      { text: 'Проверить книгу заказов и маршрутные листы', gets: [13], reply: 'В книге четыре поездки. Последний заказ назначен на 18:00 и ещё действует.' },
      { text: 'Расспросить Роберта Коула о поездках', needs: [13], gets: [14], reply: 'Коул описывает остановку у дома № 8 и показывает, где заканчивались поездки.' }
    ],
    warehouse: [
      { text: 'Осмотреть грузовой двор и сверить опись', gets: [16], reply: 'Двор общий, а помещения разные. На схеме можно осмотреть каждое снаружи.' },
      { text: 'Поговорить с хозяйкой «Красного оленя»', needs: [16], gets: [17], reply: 'Хозяйка рассказывает, кто платит за верхнюю комнату и кто за ней присматривает.' },
      { text: 'Выслушать работницу кухни отдельно', needs: [16], gets: [18], reply: 'Работница видела двоих утром. После половины третьего к двери она не возвращалась.' },
      { text: 'Сверить счета хозяйки с архивной копией', needs: [9, 17], gets: [19], reply: 'Оплата комнаты, присмотра и обратной поездки отражена в разных книгах.' }
    ],
    post: [{ text: 'Проверить, откуда уходят вечерние экипажи', gets: [], reply: 'Здесь запланирована пересадка на междугородный экипаж. Конечный адрес в городском заказе не указан.' }],
    west: [{ text: 'Поговорить с домоправительницей', gets: [14], reply: 'Она подтверждает короткий визит Вейла 13 июня. Хозяина пока нет дома.' }]
  };
  const phone = {
    inspector: { name: 'Инспектор', line: 'Полиция Блэкмира', greeting: 'Инспектор слушает. Если у вас есть версия, назовите, кого допрашивать и куда направить людей.',
      actions: [{ text: 'Сверить план операции с заказом на 18:00', needs: [13], gets: [20], reply: 'Повозка ещё не вышла. Конторе можно запретить отправку; у почтовой станции поставим пост.' }] },
    port: { name: 'Дежурный портовой стражи', line: 'Портовая стража', needs: [4], greeting: 'Дежурный слушает. О каком происшествии хотите узнать?',
      actions: [{ text: 'Сверить запись о лошади в канале', gets: [7], reply: 'Это было 9 июня у Восточного моста. Сверьте вечерний выпуск «Вестника». В нём есть ещё одно объявление о пропаже.' }] },
    ward: { name: 'Часовщик Уорд', line: 'Часовая улица, 4', needs: [7], greeting: 'Да, это мастерская Уорда.',
      actions: [{ text: 'Уточнить, когда можно поговорить о Сэмюэле', gets: [], reply: 'Я в мастерской. Приходите, покажу карточку того человека и бумаги Сэма.' }] },
    carriage: { name: 'Хозяин конторы', line: 'Контора наёмных повозок', needs: [13], greeting: 'Контора слушает. Что сверить в заказах?',
      actions: [{ text: 'Уточнить, действует ли заказ на 18:00', gets: [], reply: 'Да. Повозка заказана отдельно. Без распоряжения инспектора заказ не снимаем.' }] }
  };
  const datedFacts = [
    ['1 июня', 'Исчезла Анна Белл.', 1],
    ['3 июня', 'Напечатано объявление о поисках Анны.', 1],
    ['9 июня', 'Происшествие с лошадью у Восточного моста.', 7],
    ['10 июня', 'Пропал Сэмюэл Уорд.', 7],
    ['12 июня, вечер', 'Повозка из складского двора отправилась в Уиллоу.', 13],
    ['13 июня, утро', 'Поездка через дом № 8 на Западную дорогу закончилась возвратом.', 13],
    ['21 июня', 'Исчез Эдвард Марш.', 1],
    ['21 июня, 15:30', 'Мальчика забрали у задней калитки дома № 8.', 13],
    ['22 июня, 08:00 и около 14:30', 'У двери наверху работница видела двоих детей утром и слышала два голоса после обеда.', 18],
    ['22 июня, 18:00 · запланировано', 'Последний заказ в книге повозок.', 13],
    ['Точная дата неизвестна', 'В тетради есть запись про лошадь. Сопоставьте её с независимым источником.', 4]
  ];
  const fresh = () => ({ clues: [1], visits: [], actions: [], order: null });
  let state = fresh();
  if (isPapinyCase) {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved && Array.isArray(saved.clues) && Array.isArray(saved.visits) && Array.isArray(saved.actions)) state = saved;
    } catch {
      // Storage is optional for play in the current tab.
    }
  }
  const owns = (id) => state.clues.includes(id);
  const meets = (required) => (required ?? []).every(owns);
  const availablePlaces = () => [...new Set(startingPlaces.concat(state.clues.flatMap(id => leads[id] ?? [])))];
  const knownPeople = () => Object.keys(papinyCase.people).filter(id => people[id].some(owns));
  const suspects = () => knownPeople().filter(id => !['anna', 'edward', 'samuel'].includes(id));
  const name = (id) => suspectNames[id] || papinyCase.people[id][0];
  const canAct = () => state.order === null;

  function persist() {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {
      // Keep the case playable when storage is unavailable.
    }
  }

  function visit(id) {
    if (!availablePlaces().includes(id)) return false;
    if (!state.visits.includes(id)) {
      state.visits.push(id);
      persist();
    }
    return true;
  }

  function action(channel, id, index, definition) {
    const actionId = channel + ':' + id + ':' + index;
    return { ...definition, id: actionId, done: state.actions.includes(actionId), ready: meets(definition.needs) };
  }

  function actionsFor(channel, id) {
    const definitions = channel === 'visit' ? siteActions[id] : phone[id]?.actions;
    return (definitions ?? []).map((definition, index) => action(channel, id, index, definition));
  }

  function perform(channel, id, actionId) {
    const entry = actionsFor(channel, id).find(option => option.id === actionId);
    if (!entry || !entry.ready || entry.done || !canAct()) return null;
    const found = entry.gets.filter(number => !owns(number));
    state.actions.push(actionId);
    state.clues.push(...found);
    persist();
    return { ...entry, found };
  }

  const foundChildren = (route) => route?.place === 'warehouse' && route.room === 1;
  const validRoute = (route) => Boolean(route && availablePlaces().includes(route.place)
    && (route.place !== 'warehouse' || [0, 1, 2].includes(route.room)));
  const retryPending = () => Boolean(state.order && !foundChildren(state.order.route) && state.order.stop && !state.order.retry);

  function confirm(draft) {
    if (!canAct() || !suspects().includes(draft.suspect) || !validRoute(draft.route)) return false;
    state.order = { suspect: draft.suspect, route: { ...draft.route }, stop: Boolean(draft.stop && owns(13)), retry: null };
    persist();
    return true;
  }

  function retry(route) {
    if (!retryPending() || !validRoute(route)) return false;
    const first = state.order.route;
    if (first.place === route.place && first.room === route.room) return false;
    state.order.retry = { ...route };
    persist();
    return true;
  }

  function reset() {
    state = fresh();
    persist();
  }

  return {
    owns, knownPeople, suspects, name, availablePlaces, visit, actionsFor, perform, canAct, confirm, retry, retryPending, foundChildren, reset,
    contacts: () => Object.keys(phone).filter(id => meets(phone[id].needs)),
    contact: (id) => phone[id],
    timeline: () => datedFacts.filter(([, , source]) => owns(source)),
    visited: (id) => state.visits.includes(id),
    order: () => state.order
  };
})();
