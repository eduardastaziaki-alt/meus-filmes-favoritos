/* =============================================
   CineBox — app.js
   ============================================= */

/* ---------- Elementos ---------- */
const btnMenu      = document.getElementById('btnMenu');
const sidebar      = document.getElementById('sidebar');
const main         = document.getElementById('main');
const searchInput  = document.getElementById('searchInput');
const chips        = document.querySelectorAll('.chip');
const sidebarItems = document.querySelectorAll('.sidebar__item[data-filter]');
const movieGrid    = document.getElementById('movieGrid');
const cards        = document.querySelectorAll('.card');
const noResults    = document.getElementById('noResults');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const modalPlayer  = document.getElementById('modalPlayer');
const modalTitle   = document.getElementById('modalTitle');
const modalMeta    = document.getElementById('modalMeta');

/* ---------- Estado ---------- */
let activeFilter = 'todos';
let searchQuery  = '';

/* =============================================
   SIDEBAR TOGGLE
   ============================================= */
btnMenu.addEventListener('click', () => {
  const isMobile = window.innerWidth <= 900;
  if (isMobile) {
    sidebar.classList.toggle('open');
  } else {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('full-width');
  }
});

/* Fechar sidebar ao clicar fora (mobile) */
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900 &&
      !sidebar.contains(e.target) &&
      !btnMenu.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

/* =============================================
   FILTROS POR CHIPS
   ============================================= */
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    applyFilters();
  });
});

/* Filtros da sidebar */
sidebarItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const filter = item.dataset.filter;
    activeFilter = filter;

    /* Sincroniza chip correspondente */
    chips.forEach(c => {
      c.classList.toggle('active', c.dataset.filter === filter);
    });

    applyFilters();

    /* Fecha sidebar no mobile */
    if (window.innerWidth <= 900) sidebar.classList.remove('open');
  });
});

/* =============================================
   BUSCA
   ============================================= */
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  applyFilters();
});

/* =============================================
   APLICAR FILTROS + BUSCA
   ============================================= */
function applyFilters() {
  let visible = 0;

  cards.forEach(card => {
    const genre = card.dataset.genre || '';
    const title = (card.dataset.title || '').toLowerCase();

    const matchFilter = activeFilter === 'todos' || genre === activeFilter;
    const matchSearch = !searchQuery || title.includes(searchQuery);

    if (matchFilter && matchSearch) {
      card.classList.remove('hidden');
      visible++;
    } else {
      card.classList.add('hidden');
    }
  });

  noResults.classList.toggle('hidden', visible > 0);
}

/* =============================================
   MODAL PLAYER — abrir ao clicar em thumbnails
   ============================================= */
const thumbCards = document.querySelectorAll('.card__thumb');

thumbCards.forEach(thumb => {
  thumb.addEventListener('click', () => {
    const card  = thumb.closest('.card');
    const title = card.dataset.title || 'Filme';
    const meta  = card.querySelector('.card__meta')?.textContent || '';
    const img   = thumb.querySelector('.card__img');

    /* Monta iframe com base na thumbnail do YouTube */
    const ytSrc = img?.src || '';
    const videoId = extractYouTubeId(ytSrc);

    if (videoId) {
      modalPlayer.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/${videoId}?autoplay=1"
          title="${title}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>`;
    } else {
      modalPlayer.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#aaa;font-size:1rem;">
          <p>Player não disponível para este filme.</p>
        </div>`;
    }

    modalTitle.textContent = title;
    modalMeta.textContent  = meta;
    openModal();
  });
});

/* Extrai ID do YouTube a partir da URL da thumbnail */
function extractYouTubeId(url) {
  const match = url.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
  return match ? match[1] : null;
}

/* =============================================
   MODAL — abrir / fechar
   ============================================= */
function openModal() {
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
  modalPlayer.innerHTML = ''; /* Para o vídeo */
}

modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* =============================================
   ANIMAÇÃO DE ENTRADA DOS CARDS
   ============================================= */
function animateCards() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity    = '1';
          entry.target.style.transform  = 'translateY(0)';
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity .4s ease, transform .4s ease, box-shadow .22s ease';
    observer.observe(card);
  });
}

animateCards();

/* =============================================
   TOOLTIP SIMPLES NOS BOTÕES "MAIS OPÇÕES"
   ============================================= */
document.querySelectorAll('.card__more').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    /* Poderia abrir um dropdown — aqui apenas feedback visual */
    btn.style.background = 'var(--border)';
    setTimeout(() => btn.style.background = '', 300);
  });
});
