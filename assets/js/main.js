(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const header = document.querySelector('#header');
  const menu = document.querySelector('#menu');
  const menuButton = document.querySelector('.menu-button');
  const todayLabel = document.querySelector('#today');
  const yearLabel = document.querySelector('#year');

  const formatToday = () => {
    const value = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  if (todayLabel) todayLabel.textContent = formatToday();
  if (yearLabel) yearLabel.textContent = String(new Date().getFullYear());

  const updateMenuOffset = () => {
    if (!header) return;
    document.documentElement.style.setProperty('--menu-top', `${Math.max(0, header.getBoundingClientRect().bottom)}px`);
  };

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
    updateMenuOffset();
  };

  const closeMenu = () => {
    menu?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    updateMenuOffset();
    const open = !menu?.classList.contains('is-open');
    menu?.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', () => {
    updateMenuOffset();
    if (window.innerWidth > 850) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  updateHeader();

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.06 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  /* Agenda filters and calendar */
  const eventCards = [...document.querySelectorAll('.event-card')];
  const monthDividers = [...document.querySelectorAll('.month-divider')];
  const monthButtons = [...document.querySelectorAll('.month-filter')];
  const categoryButtons = [...document.querySelectorAll('.category-filter')];
  const viewButtons = [...document.querySelectorAll('.view-button')];
  const searchInput = document.querySelector('#course-search');
  const countLabel = document.querySelector('#event-count');
  const emptyState = document.querySelector('#empty-state');
  const agendaList = document.querySelector('#agenda-list');
  const calendarPanel = document.querySelector('#calendar-panel');
  const calendarGrid = document.querySelector('#calendar-grid');
  const calendarTitle = document.querySelector('#calendar-title');
  const calendarPrev = document.querySelector('#calendar-prev');
  const calendarNext = document.querySelector('#calendar-next');

  const state = {
    month: 'todos',
    category: 'todos',
    query: '',
    view: 'list',
    calendarMonth: 9,
    calendarYear: 2026
  };

  const eventData = eventCards.map((card) => ({
    id: card.id,
    date: card.dataset.date,
    month: card.dataset.month,
    category: card.dataset.category,
    title: card.dataset.title,
    search: card.textContent.toLocaleLowerCase('pt-BR')
  }));

  const eventMatches = (event) => {
    const monthMatch = state.month === 'todos' || event.month === state.month;
    const categoryMatch = state.category === 'todos' || event.category === state.category;
    const queryMatch = !state.query || event.search.includes(state.query);
    return monthMatch && categoryMatch && queryMatch;
  };

  const setPressed = (buttons, active) => {
    buttons.forEach((button) => {
      const selected = button === active;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  };

  const applyFilters = () => {
    let visible = 0;
    eventCards.forEach((card, index) => {
      const show = eventMatches(eventData[index]);
      card.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });

    monthDividers.forEach((divider) => {
      const month = divider.dataset.monthLabel;
      const hasVisibleEvent = eventCards.some((card) => card.dataset.month === month && !card.classList.contains('is-hidden'));
      divider.classList.toggle('is-hidden', !hasVisibleEvent);
    });

    if (countLabel) countLabel.textContent = String(visible);
    if (emptyState) emptyState.hidden = visible !== 0;
    renderCalendar();
  };

  monthButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.month = button.dataset.month;
      if (state.month !== 'todos') state.calendarMonth = Number(state.month) - 1;
      setPressed(monthButtons, button);
      applyFilters();
    });
  });

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      setPressed(categoryButtons, button);
      applyFilters();
    });
  });

  searchInput?.addEventListener('input', () => {
    state.query = searchInput.value.trim().toLocaleLowerCase('pt-BR');
    applyFilters();
  });

  const setView = (view) => {
    state.view = view;
    const activeButton = viewButtons.find((button) => button.dataset.view === view);
    if (activeButton) setPressed(viewButtons, activeButton);
    if (agendaList) agendaList.hidden = view !== 'list';
    if (calendarPanel) calendarPanel.hidden = view !== 'calendar';
    if (view === 'calendar') renderCalendar();
  };

  viewButtons.forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));

  const monthNames = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

  function renderCalendar() {
    if (!calendarGrid || !calendarTitle) return;
    const year = state.calendarYear;
    const month = state.calendarMonth;
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevious = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    const today = new Date();

    calendarTitle.textContent = `${monthNames[month].charAt(0).toUpperCase()}${monthNames[month].slice(1)} de ${year}`;
    calendarGrid.innerHTML = '';

    for (let index = 0; index < totalCells; index += 1) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      let day = index - firstWeekday + 1;
      let cellMonth = month;
      let cellYear = year;

      if (day < 1) {
        day = daysInPrevious + day;
        cellMonth -= 1;
        if (cellMonth < 0) { cellMonth = 11; cellYear -= 1; }
        cell.classList.add('is-outside');
      } else if (day > daysInMonth) {
        day -= daysInMonth;
        cellMonth += 1;
        if (cellMonth > 11) { cellMonth = 0; cellYear += 1; }
        cell.classList.add('is-outside');
      }

      const iso = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (today.getFullYear() === cellYear && today.getMonth() === cellMonth && today.getDate() === day) cell.classList.add('is-today');
      cell.innerHTML = `<span>${day}</span>`;

      eventData.filter((event) => event.date === iso && eventMatches(event)).forEach((event) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-event';
        button.textContent = event.title;
        button.setAttribute('aria-label', `${event.title}, dia ${day}`);
        button.addEventListener('click', () => openEventFromCalendar(event));
        cell.appendChild(button);
      });

      calendarGrid.appendChild(cell);
    }

    if (calendarPrev) calendarPrev.disabled = month <= 9;
    if (calendarNext) calendarNext.disabled = month >= 10;
  }

  const openEventFromCalendar = (event) => {
    state.month = event.month;
    state.category = 'todos';
    state.query = '';
    if (searchInput) searchInput.value = '';
    const monthButton = monthButtons.find((button) => button.dataset.month === event.month);
    const categoryButton = categoryButtons.find((button) => button.dataset.category === 'todos');
    if (monthButton) setPressed(monthButtons, monthButton);
    if (categoryButton) setPressed(categoryButtons, categoryButton);
    applyFilters();
    setView('list');

    const target = document.querySelector(`#${event.id}`);
    if (!target) return;
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('is-highlighted');
      window.setTimeout(() => target.classList.remove('is-highlighted'), 1700);
    }, 60);
  };

  calendarPrev?.addEventListener('click', () => {
    if (state.calendarMonth > 9) state.calendarMonth -= 1;
    renderCalendar();
  });
  calendarNext?.addEventListener('click', () => {
    if (state.calendarMonth < 10) state.calendarMonth += 1;
    renderCalendar();
  });

  applyFilters();

  /* Caderno articles */
  const articles = {
    fermentacao: {
      category: 'Técnicas · Panificação',
      title: 'Fermentação longa: quando o tempo também vira ingrediente',
      intro: 'Uma boa massa não depende apenas de farinha, água e fermento. Ela também precisa de tempo — e entender esse tempo muda completamente o resultado.',
      image: 'assets/img/pratkar/curso-pizza.jpg',
      alt: 'Massa de pizza de longa fermentação',
      body: `<p>Na fermentação longa, a massa descansa por várias horas enquanto o fermento trabalha devagar. Esse processo desenvolve aromas mais profundos, melhora a textura e cria uma estrutura capaz de reter o ar produzido durante a fermentação.</p><p>O resultado aparece no forno: bordas mais leves, interior aerado e uma massa com personalidade. Mas tempo sozinho não resolve tudo. Temperatura, quantidade de fermento e hidratação precisam conversar entre si.</p><h3>Menos pressa, mais controle</h3><p>Fermentar por mais tempo não significa simplesmente esquecer a massa na bancada. Em geral, o frio é usado para desacelerar o processo e permitir que os sabores se desenvolvam sem que a massa passe do ponto.</p><p>Observar volume, elasticidade e aroma é mais importante do que seguir o relógio de maneira rígida. A receita oferece um caminho; a massa mostra quando está pronta.</p>`
    },
    croissant: {
      category: 'Culinária francesa',
      title: 'Camadas perfeitas: o que faz um bom croissant?',
      intro: 'Crocante por fora, leve por dentro e cheio de camadas bem definidas. O croissant é simples nos ingredientes e exigente na execução.',
      image: 'assets/img/pratkar/curso-croissant.jpg',
      alt: 'Croissants e massas folhadas',
      body: `<p>As camadas do croissant nascem da alternância entre massa e manteiga. A cada dobra, essa estrutura se multiplica. Quando vai ao forno, a água presente na manteiga vira vapor e separa delicadamente cada uma dessas folhas.</p><p>Para isso funcionar, a temperatura é decisiva. A manteiga precisa estar maleável o bastante para acompanhar a massa, mas fria o bastante para não se misturar a ela.</p><h3>Descansar também faz parte da técnica</h3><p>Entre uma dobra e outra, o glúten precisa relaxar. Tentar acelerar essa etapa deixa a massa resistente, aumenta o risco de rasgar as camadas e compromete o crescimento.</p><p>Um bom croissant é fruto de precisão, sensibilidade e paciência. É justamente essa combinação que transforma poucos ingredientes em algo extraordinário.</p>`
    },
    'mise-en-place': {
      category: 'Organização · Técnica',
      title: 'Mise en place: cozinhar melhor começa antes do fogo',
      intro: 'Separar, medir, cortar e organizar antes de começar não é preciosismo. É uma das ferramentas mais poderosas para cozinhar com calma e precisão.',
      image: 'assets/img/pratkar/curso-arabe.jpg',
      alt: 'Ingredientes organizados para o preparo',
      body: `<p>Mise en place significa colocar tudo em seu lugar. Na prática, é ler a receita inteira, separar utensílios, pesar ingredientes e antecipar os cortes antes que a panela esquente.</p><p>Essa preparação reduz interrupções, evita esquecimentos e permite prestar atenção no que realmente importa: temperatura, textura, aroma e ponto.</p><h3>Organização traz liberdade</h3><p>Quando a bancada está pronta, você deixa de correr atrás dos ingredientes e passa a conduzir o preparo. Isso é ainda mais importante em receitas rápidas, nas quais poucos segundos podem mudar o resultado.</p><p>Comece de forma simples: leia, agrupe por etapa e limpe enquanto trabalha. A cozinha ganha ritmo — e cozinhar fica muito mais prazeroso.</p>`
    }
  };

  const articleDialog = document.querySelector('#article-dialog');
  const dialogTitle = document.querySelector('#dialog-title');
  const dialogCategory = document.querySelector('#dialog-category');
  const dialogIntro = document.querySelector('#dialog-intro');
  const dialogBody = document.querySelector('#dialog-body');
  const dialogImage = document.querySelector('#dialog-image');
  let articleTrigger = null;

  const closeArticle = () => {
    if (!articleDialog?.open) return;
    articleDialog.close();
    document.body.classList.remove('dialog-open');
    articleTrigger?.focus();
  };

  document.querySelectorAll('[data-article]').forEach((button) => {
    button.addEventListener('click', () => {
      const article = articles[button.dataset.article];
      if (!article || !articleDialog) return;
      articleTrigger = button;
      dialogTitle.textContent = article.title;
      dialogCategory.textContent = article.category;
      dialogIntro.textContent = article.intro;
      dialogBody.innerHTML = article.body;
      dialogImage.src = article.image;
      dialogImage.alt = article.alt;
      articleDialog.showModal();
      articleDialog.scrollTop = 0;
      document.body.classList.add('dialog-open');
    });
  });

  document.querySelector('.dialog-close')?.addEventListener('click', closeArticle);
  document.querySelector('.dialog-finish')?.addEventListener('click', closeArticle);
  articleDialog?.addEventListener('click', (event) => {
    const rect = articleDialog.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) closeArticle();
  });
  articleDialog?.addEventListener('close', () => document.body.classList.remove('dialog-open'));
})();
