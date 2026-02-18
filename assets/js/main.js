// Unregister any service workers to prevent navigation preload errors
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  }).catch(function(err) {
    console.log('Service Worker unregistration failed: ', err);
  });
}

const toggle = document.querySelector('.mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('.nav__link');
const desktopNavList = document.querySelector('.nav__list:not(.nav__list--mobile)');
const desktopNavLinks = desktopNavList ? desktopNavList.querySelectorAll('.nav__link') : [];
const header = document.querySelector('.header');
const logoIcon = document.querySelector('.logo__icon');
const ctaButton = document.querySelector('.cta__button');

if (toggle && mobileMenu) {
  toggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

const getPageKey = () => {
  const path = window.location.pathname.toLowerCase();

  if (path.includes('/marketing/')) return 'marketing';
  if (path.includes('/diseno/')) return 'diseno';
  if (path.includes('/desarrollo/')) return 'desarrollo';
  if (path.includes('/portafolio/')) return 'portafolio';
  if (path.includes('/clientes/')) return 'portafolio';
  if (path.includes('/contactanos/')) return 'contactanos';
  if (path.includes('/inicio/')) return 'inicio';

  return 'inicio';
};

const applyActiveNav = () => {
  const pageKey = getPageKey();

  navLinks.forEach((link) => {
    link.classList.remove('is-active');
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href.includes(`/${pageKey}/`)) {
      link.classList.add('is-active');
    }
  });
};

const setUnderline = (left, width, opacity) => {
  if (!desktopNavList) return;
  desktopNavList.style.setProperty('--underline-left', `${left}px`);
  desktopNavList.style.setProperty('--underline-width', `${width}px`);
  desktopNavList.style.setProperty('--underline-opacity', `${opacity}`);
};

const animateUnderline = () => {
  if (!desktopNavList || desktopNavLinks.length === 0) return;

  const activeLink = Array.from(desktopNavLinks).find((link) => link.classList.contains('is-active'));
  if (!activeLink) {
    setUnderline(0, 0, 0);
    return;
  }

  const listRect = desktopNavList.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  const left = linkRect.left - listRect.left;
  const width = linkRect.width;

  try {
    const stored = window.sessionStorage.getItem('navUnderline');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed.left === 'number' && typeof parsed.width === 'number') {
        setUnderline(parsed.left, parsed.width, 1);
      }
    }
  } catch (error) {
    setUnderline(left, width, 1);
  }

  window.requestAnimationFrame(() => {
    setUnderline(left, width, 1);
    desktopNavList.classList.add('underline-animate');
    window.setTimeout(() => {
      desktopNavList.classList.remove('underline-animate');
    }, 1500);
  });

  try {
    window.sessionStorage.setItem('navUnderline', JSON.stringify({ left, width }));
  } catch (error) {
    // Ignore storage failures
  }
};

const triggerIntroEffects = () => {
  if (header) {
    header.classList.remove('is-transition');
    void header.offsetWidth;
    header.classList.add('is-transition');
  }

  if (logoIcon) {
    logoIcon.classList.remove('pulse');
    void logoIcon.offsetWidth;
    logoIcon.classList.add('pulse');
  }
};

const triggerIconPulse = (target) => {
  if (!target) return;
  target.classList.remove('icon-pulse');
  void target.offsetWidth;
  target.classList.add('icon-pulse');
};

const bindIconPulse = (el) => {
  if (!el) return;
  el.addEventListener('pointerdown', () => triggerIconPulse(el));
  el.addEventListener('click', () => triggerIconPulse(el));
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      triggerIconPulse(el);
    }
  });
};

applyActiveNav();
animateUnderline();
triggerIntroEffects();

navLinks.forEach((link) => bindIconPulse(link));
bindIconPulse(ctaButton);

const portfolioSection = document.querySelector('.portfolio');

if (portfolioSection) {
  const cards = Array.from(document.querySelectorAll('.portfolio-card'));
  const groups = Array.from(document.querySelectorAll('.filter__content'));

  const getActiveFilters = () => {
    const filters = {};
    groups.forEach((group) => {
      const groupKey = group.dataset.filterGroup;
      const values = Array.from(group.querySelectorAll('input:checked')).map((input) => input.value);
      filters[groupKey] = values;
    });
    return filters;
  };

  const matchesFilters = (card, filters) => {
    const industry = card.dataset.industry || '';
    const services = (card.dataset.service || '').split(',');
    const country = card.dataset.country || '';

    const industryMatch = filters.industry.length === 0 || filters.industry.includes(industry);
    const serviceMatch = filters.service.length === 0 || services.some((service) => filters.service.includes(service.trim()));
    const countryMatch = filters.country.length === 0 || filters.country.includes(country);

    return industryMatch && serviceMatch && countryMatch;
  };

  const applyFilters = () => {
    const filters = getActiveFilters();

    cards.forEach((card) => {
      const shouldShow = matchesFilters(card, filters);

      if (shouldShow) {
        card.hidden = false;
        requestAnimationFrame(() => {
          card.classList.remove('is-hidden');
        });
      } else {
        card.classList.add('is-hidden');
        setTimeout(() => {
          card.hidden = true;
        }, 300);
      }
    });
  };

  groups.forEach((group) => {
    group.addEventListener('change', applyFilters);
  });

  applyFilters();
}

const servicesSection = document.querySelector('.services');

if (servicesSection) {
  const cards = Array.from(servicesSection.querySelectorAll('.services__card'));
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  const getCardHeights = (card) => {
    const button = card.querySelector('.services__toggle');
    const content = card.querySelector('.services__content');
    if (!button || !content) return null;

    const cardStyles = window.getComputedStyle(card);
    const contentStyles = window.getComputedStyle(content);
    const paddingTop = parseFloat(cardStyles.paddingTop) || 0;
    const paddingBottom = parseFloat(cardStyles.paddingBottom) || 0;
    const contentMarginTop = parseFloat(contentStyles.marginTop) || 0;
    const closedHeight = button.offsetHeight + paddingTop + paddingBottom;
    const openHeight = button.offsetHeight + content.scrollHeight + contentMarginTop + paddingTop + paddingBottom;

    return { closedHeight, openHeight };
  };

  const applyCardHeight = (card, isActive) => {
    const heights = getCardHeights(card);
    if (!heights) return;
    const targetHeight = isActive ? heights.openHeight : heights.closedHeight;
    card.style.height = `${Math.ceil(targetHeight)}px`;
  };

  const refreshHeights = () => {
    cards.forEach((card) => {
      const isActive = card.classList.contains('is-active');
      applyCardHeight(card, isActive);
    });
  };

  const clearActiveCards = () => {
    cards.forEach((card) => {
      card.classList.remove('is-active');
      const button = card.querySelector('.services__toggle');
      const content = card.querySelector('.services__content');

      if (button) {
        button.setAttribute('aria-expanded', 'false');
      }
      if (content) {
        content.setAttribute('aria-hidden', 'true');
      }

      applyCardHeight(card, false);
    });
  };

  const setActiveCard = (target) => {
    cards.forEach((card) => {
      const isActive = card === target;
      card.classList.toggle('is-active', isActive);
      const button = card.querySelector('.services__toggle');
      const content = card.querySelector('.services__content');

      if (button) {
        button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      }
      if (content) {
        content.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      }

      applyCardHeight(card, isActive);
    });
  };

  cards.forEach((card) => {
    const button = card.querySelector('.services__toggle');
    if (button) {
      button.addEventListener('click', () => setActiveCard(card));
    }
    if (canHover.matches) {
      card.addEventListener('mouseenter', () => setActiveCard(card));
      card.addEventListener('mouseleave', () => clearActiveCards());
    }
  });

  window.addEventListener('resize', () => {
    refreshHeights();
  });

  refreshHeights();
}

const revealItems = document.querySelectorAll('.reveal-on-scroll');

if (revealItems.length > 0 && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });
} else if (revealItems.length > 0) {
  revealItems.forEach((item) => {
    item.classList.add('is-visible');
  });
}

const portfolioCards = document.querySelectorAll('.portfolio-card[data-href]');

if (portfolioCards.length > 0) {
  portfolioCards.forEach((card) => {
    const href = card.getAttribute('data-href');
    if (!href) return;

    card.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('a')) return;
      window.location.href = href;
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.location.href = href;
      }
    });
  });
}

const worksPanel = document.querySelector('[data-work-panel]');

if (worksPanel) {
  const worksClient = document.querySelector('[data-work-client]');
  const worksDescription = document.querySelector('[data-work-description]');
  const worksImage = document.querySelector('[data-work-image]');
  const worksLink = document.querySelector('[data-work-link]');
  const worksFeatures = document.querySelector('[data-work-features]');
  const prevButton = document.querySelector('[data-work-prev]');
  const nextButton = document.querySelector('[data-work-next]');

  const fallbackFeatures = ['Reservas online', 'Pick up y delivery', 'Galeria interactiva', 'Mobile friendly'];
  let projects = [];

  let activeIndex = 0;
  let isAnimating = false;

  const extractCssUrl = (value) => {
    if (!value) return '';
    const match = value.match(/url\(['"]?([^'"]+)['"]?\)/i);
    return match ? match[1] : '';
  };

  const extractHeroImage = (styleText) => {
    if (!styleText) return '';
    const match = styleText.match(/--case-hero-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
    return match ? match[1] : extractCssUrl(styleText);
  };

  const resolveUrl = (value, baseHref) => {
    if (!value) return '';
    try {
      return new URL(value, baseHref).href;
    } catch (error) {
      return value;
    }
  };

  const extractText = (node) => (node ? node.textContent.trim() : '');

  const normalizeText = (value) =>
    (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const normalizeFeatureText = (value) => normalizeText(value);

  const getFeatureIconSvg = (label) => {
    const text = normalizeFeatureText(label);

    if (text.includes('reserva')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2zm13 8H4v10h16V10zM6 12h4v4H6v-4z" /></svg>';
    }

    if (text.includes('animacion') || text.includes('animation') || text.includes('efecto')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.5 7.5L23 13l-7.5 3.5L12 24l-3.5-7.5L1 13l7.5-3.5L12 2zm0 5.2L10.3 11l-3.8 1.7 3.8 1.6L12 18.8l1.7-4.5 3.8-1.6-3.8-1.7L12 7.2z" /></svg>';
    }

    if (text.includes('marketplace') || text.includes('mercado libre')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18l-1.5 6H4.5L3 5zm2 8h14v6H5v-6zm2 2v2h2v-2H7zm4 0v2h2v-2h-2z" /></svg>';
    }

    if (text.includes('ecommerce') || text.includes('tienda')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h15l-1.5 8H7.5L6 6zm-2 0h2l2.5 10h9.5M9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" /></svg>';
    }

    if (text.includes('conversion')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3zm0 6a3 3 0 1 0 3 3h2a5 5 0 1 1-5-5v2z" /></svg>';
    }

    if (text.includes('seo') || text.includes('busqueda')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4a6 6 0 1 0 3.7 10.7l4.6 4.6 1.4-1.4-4.6-4.6A6 6 0 0 0 10 4zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" /></svg>';
    }

    if (text.includes('catalogo') || text.includes('catalog')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" /></svg>';
    }

    if (text.includes('analisis') || text.includes('reporte') || text.includes('metric')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16v-2H4v2zm2-4h2v-6H6v6zm5 0h2V8h-2v8zm5 0h2V5h-2v11z" /></svg>';
    }

    if (text.includes('pick') || text.includes('delivery') || text.includes('envio') || text.includes('retiro')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h12v10H3V6zm12 3h3l3 3v4h-6V9zm-9 9h2a2 2 0 0 1-4 0h2zm10 0h2a2 2 0 0 1-4 0h2z" /></svg>';
    }

    if (text.includes('pedido') || text.includes('orden')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h15l-1.5 8H7.5L6 6zm-2 0h2l2.5 10h9.5M9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" /></svg>';
    }

    if (text.includes('galeria') || text.includes('foto') || text.includes('image') || text.includes('imagen')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 12h16l-5-6-4 5-3-3-4 4z" /></svg>';
    }

    if (text.includes('mobile') || text.includes('responsive') || text.includes('celular')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm5 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" /></svg>';
    }

    if (text.includes('fisica') || text.includes('impresa') || text.includes('print')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 3v4H6V3h12zm1 5a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3v3H5v-3a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3h14zM6 15v4h12v-4H6zm12-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /></svg>';
    }

    if (text.includes('carta') || text.includes('menu')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V3zm2 2v14h12V5H6zm2 3h8v2H8V8zm0 4h8v2H8v-2z" /></svg>';
    }

    if (text.includes('multi') || text.includes('idioma') || text.includes('language')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm6 8h-3.3a14.8 14.8 0 0 0-1.2-4.1A8.1 8.1 0 0 1 18 10zM12 4a12.6 12.6 0 0 1 1.7 6H10.3A12.6 12.6 0 0 1 12 4zM6.5 5.9A14.8 14.8 0 0 0 5.3 10H2.9a8.1 8.1 0 0 1 3.6-4.1zM4 12h3.3a14.8 14.8 0 0 0 1.2 4.1A8.1 8.1 0 0 1 4 12zm8 8a12.6 12.6 0 0 1-1.7-6h3.4A12.6 12.6 0 0 1 12 20zm5.5-1.9a14.8 14.8 0 0 0 1.2-4.1h2.4a8.1 8.1 0 0 1-3.6 4.1z" /></svg>';
    }

    if (text.includes('contacto') || text.includes('whatsapp') || text.includes('mensaje')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.7L3 21l4.5-1.2A9 9 0 1 0 12 3zm0 2a7 7 0 0 1 5.9 10.7l-.3.5.8 2.9-2.9-.8-.5.3A7 7 0 1 1 12 5z" /></svg>';
    }

    if (text.includes('postulacion') || text.includes('empleo') || text.includes('trabajo')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0-0.001-8.001A4 4 0 0 0 12 12zm0 2c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" /></svg>';
    }

    if (text.includes('patio') || text.includes('terraza') || text.includes('backyard')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 7h-2l2 5h-2l2 6H9l2-6H9l2-5H9l3-7zm-1 18h2v2h-2v-2z" /></svg>';
    }

    if (text.includes('cobertura') || text.includes('zona') || text.includes('caba') || text.includes('gba')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 4.4 5.2 9.5 6.5 10.8a1 1 0 0 0 1 0C13.8 18.5 19 13.4 19 9a7 7 0 0 0-7-7zm0 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" /></svg>';
    }

    if (text.includes('identidad') || text.includes('marca') || text.includes('branding')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l7 3v6c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5l7-3zm0 4.2L8 7v3.8c0 3.4 2.3 6.3 4 7.6 1.7-1.3 4-4.2 4-7.6V7l-4-0.8z" /></svg>';
    }

    if (text.includes('experiencia') || text.includes('cliente') || text.includes('ux')) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z" /></svg>';
    }

    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.4 5 5.6.8-4 3.9.9 5.6L12 15.8 7.1 17.3l.9-5.6-4-3.9 5.6-.8L12 2z" /></svg>';
  };

  const fetchPortfolioProjects = async () => {
    try {
      const response = await fetch('../portafolio/');
      if (!response.ok) throw new Error('Portfolio fetch failed');
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const cards = Array.from(doc.querySelectorAll('.portfolio-card[data-href]'));

      return cards.map((card) => {
        const media = card.querySelector('.portfolio-card__media');
        const title = card.querySelector('.portfolio-card__title-link');
        const description = card.querySelector('.portfolio-card__body p:not(.portfolio-card__service)');
        const link = card.getAttribute('data-href') || '';

        return {
          client: extractText(title),
          description: extractText(description),
          features: [],
          image: extractCssUrl(media ? media.getAttribute('style') : ''),
          link
        };
      });
    } catch (error) {
      return [];
    }
  };

  const enrichFromClientPage = async (project) => {
    if (!project.link) return project;

    try {
      const baseUrl = new URL(project.link, window.location.href);
      const response = await fetch(baseUrl.href);
      if (!response.ok) throw new Error('Client fetch failed');
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const descriptionNode =
        doc.querySelector('.case-section.case-challenges .case-section__header p') ||
        doc.querySelector('.case-results__text') ||
        doc.querySelector('.case-hero__meta');

      const challengeTitles = Array.from(doc.querySelectorAll('.case-challenge h3'))
        .map((item) => item.textContent.trim())
        .filter(Boolean);

      const strategyTitles = Array.from(doc.querySelectorAll('.case-strategy__block h3'))
        .map((item) => item.textContent.trim())
        .filter(Boolean);

      const resultItems = Array.from(doc.querySelectorAll('.case-results__list li'))
        .map((item) => item.textContent.trim())
        .filter(Boolean);

      const heroMeta = doc.querySelector('.case-hero__meta');
      const resultSummary = doc.querySelector('.case-results__text');
      const hero = doc.querySelector('.case-hero');
      const heroStyle = hero ? hero.getAttribute('style') : '';
      const heroImage = extractHeroImage(heroStyle);
      const logo = doc.querySelector('.case-hero__logo');
      const logoSrc = logo ? logo.getAttribute('src') : '';

      const normalizedClient = normalizeText(project.client);
      const isBoutique = normalizedClient.includes('boutique de la limpieza');

      const baseDescription = extractText(descriptionNode) || project.description;
      const boutiqueDescription = [extractText(heroMeta), extractText(resultSummary)]
        .filter(Boolean)
        .join(' - ');

      const imageCandidate = heroImage || project.image || logoSrc;
      const resolvedImage = resolveUrl(imageCandidate, baseUrl.href);

      return {
        ...project,
        description: isBoutique ? boutiqueDescription || baseDescription : baseDescription,
        features: isBoutique && strategyTitles.length > 0
          ? strategyTitles
          : challengeTitles.length > 0
            ? challengeTitles
            : resultItems,
        image: resolvedImage || project.image
      };
    } catch (error) {
      return project;
    }
  };

  const applyProject = (index) => {
    if (projects.length === 0) return;
    const project = projects[index];
    if (!project) return;

    if (worksClient) worksClient.textContent = project.client;
    if (worksDescription) worksDescription.textContent = project.description;
    if (worksLink) worksLink.setAttribute('href', project.link || '#');

    if (worksFeatures) {
      const normalizedClient = normalizeText(project.client);
      const isTlp = normalizedClient.includes('the little pig');
      const isLelita = normalizedClient.includes('lelita');
      const isPri = normalizedClient.includes('puertas rapidas') || normalizedClient.includes('pri');
      const tlpFeatures = [
        'Reservas online',
        'Pedidos desde la web',
        'Galeria visual',
        'Postulaciones laborales',
        'Patio trasero destacado'
      ];
      const lelitaFeatures = [
        'Carta digital visual',
        'Multilenguaje',
        'Contacto directo',
        'Carta fisica impresa',
        'Animaciones',
        'Reservas online'
      ];
      const priFeatures = [
        'Identidad corporativa',
        'Catalogo digital de productos',
        'SEO B2B especializado',
        'Experiencia de usuario industrial',
        'Integracion con WhatsApp'
      ];
      const items = isTlp
        ? tlpFeatures
        : isLelita
          ? lelitaFeatures
          : isPri
            ? priFeatures
            : project.features && project.features.length > 0
              ? project.features
              : fallbackFeatures;
      worksFeatures.innerHTML = items
        .map((item) => {
          const icon = getFeatureIconSvg(item);
          return `<li><span class="works__feature-icon" aria-hidden="true">${icon}</span><span>${item}</span></li>`;
        })
        .join('');
    }

    if (worksImage) {
      const normalizedClient = normalizeText(project.client);
      const isLelita = normalizedClient.includes('lelita');
      const isBoutique = normalizedClient.includes('boutique de la limpieza');
      const isTlp = normalizedClient.includes('the little pig');
      const isPri = normalizedClient.includes('puertas rapidas') || normalizedClient.includes('pri');

      if (isLelita) {
        const thumbs = [
          { src: '../fotos/LELITA captura 1.png', alt: 'LELITA captura 1' },
          { src: '../fotos/LELITA captura 2.png', alt: 'LELITA captura 2' },
          { src: '../fotos/LELITA captura 3.png', alt: 'LELITA captura 3' }
        ];

        worksImage.classList.add('is-thumbs');
        worksImage.classList.remove('is-tlp');
        worksImage.classList.remove('is-single');
        worksImage.classList.remove('is-pri');
        worksImage.style.backgroundImage = '';
        worksImage.style.backgroundSize = '';
        worksImage.style.backgroundPosition = '';
        worksImage.innerHTML = thumbs
          .map((thumb) => `<img class="works__thumb" src="${thumb.src}" alt="${thumb.alt}" loading="lazy" />`)
          .join('');
      } else if (isBoutique) {
        const thumbs = [
          { src: '../fotos/LBDLLEjemplo1.png', alt: 'La Boutique de la Limpieza 1' }
        ];

        worksImage.classList.add('is-thumbs');
        worksImage.classList.remove('is-tlp');
        worksImage.classList.add('is-single');
        worksImage.classList.remove('is-pri');
        worksImage.style.backgroundImage = '';
        worksImage.style.backgroundSize = '';
        worksImage.style.backgroundPosition = '';
        worksImage.innerHTML = thumbs
          .map((thumb) => `<img class="works__thumb" src="${thumb.src}" alt="${thumb.alt}" loading="lazy" />`)
          .join('');
      } else if (isTlp) {
        const thumbs = [
          { src: '../fotos/TLP1.png', alt: 'The Little Pig 1' },
          { src: '../fotos/TLP2.png', alt: 'The Little Pig 2' }
        ];

        worksImage.classList.add('is-thumbs');
        worksImage.classList.add('is-tlp');
        worksImage.classList.remove('is-single');
        worksImage.style.backgroundImage = '';
        worksImage.style.backgroundSize = '';
        worksImage.style.backgroundPosition = '';
        worksImage.innerHTML = thumbs
          .map((thumb) => {
            const wideClass = thumb.wide ? ' works__thumb--wide' : '';
            return `<img class="works__thumb${wideClass}" src="${thumb.src}" alt="${thumb.alt}" loading="lazy" />`;
          })
          .join('');
      } else if (isPri) {
        const thumbs = [
          { src: '../fotos/celuPRI1.png', alt: 'Puertas Rápidas Industriales Mobile 1' },
          { src: '../fotos/CeluPRI2.png', alt: 'Puertas Rápidas Industriales Mobile 2' }
        ];

        worksImage.classList.add('is-thumbs');
        worksImage.classList.add('is-pri');
        worksImage.classList.remove('is-single');
        worksImage.classList.remove('is-tlp');
        worksImage.style.backgroundImage = '';
        worksImage.style.backgroundSize = '';
        worksImage.style.backgroundPosition = '';
        worksImage.innerHTML = thumbs
          .map((thumb) => `<img class="works__thumb" src="${thumb.src}" alt="${thumb.alt}" loading="lazy" />`)
          .join('');
      } else {
        worksImage.classList.remove('is-thumbs');
        worksImage.classList.remove('is-single');
        worksImage.classList.remove('is-tlp');
        worksImage.innerHTML = '';

        if (project.image) {
          worksImage.style.backgroundImage = `url(${project.image})`;
          worksImage.style.backgroundSize = 'cover';
          worksImage.style.backgroundPosition = 'center';
        } else {
          worksImage.style.backgroundImage = '';
          worksImage.style.backgroundSize = '';
          worksImage.style.backgroundPosition = '';
        }
      }
    }
  };

  const changeProject = (direction) => {
    if (isAnimating || projects.length === 0) return;
    isAnimating = true;
    worksPanel.classList.add('is-animating');

    window.setTimeout(() => {
      activeIndex = (activeIndex + direction + projects.length) % projects.length;
      applyProject(activeIndex);
      worksPanel.classList.remove('is-animating');
      window.setTimeout(() => {
        isAnimating = false;
      }, 240);
    }, 220);
  };

  const loadProjects = async () => {
    const portfolioProjects = await fetchPortfolioProjects();
    if (portfolioProjects.length === 0) {
      projects = [];
      applyProject(activeIndex);
      return;
    }

    const enriched = await Promise.all(portfolioProjects.map(enrichFromClientPage));
    projects = enriched;
    const boutiqueIndex = projects.findIndex((item) =>
      normalizeText(item.client).includes('boutique de la limpieza')
    );
    if (boutiqueIndex > 0) {
      const boutiqueProject = projects.splice(boutiqueIndex, 1)[0];
      projects.unshift(boutiqueProject);
    }
    activeIndex = 0;
    applyProject(activeIndex);
  };

  loadProjects();

  if (prevButton) {
    prevButton.addEventListener('click', () => changeProject(-1));
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => changeProject(1));
  }
}

const testimonialsSection = document.querySelector('.testimonials');

if (testimonialsSection) {
  const profileCard = testimonialsSection.querySelector('[data-testimonial-profile]');
  const profilePortrait = testimonialsSection.querySelector('[data-profile-portrait]');
  const profileText = testimonialsSection.querySelector('[data-profile-text]');
  const track = testimonialsSection.querySelector('[data-testimonial-track]');
  const prev = testimonialsSection.querySelector('[data-testimonial-prev]');
  const next = testimonialsSection.querySelector('[data-testimonial-next]');

  const slides = [
    {
      profileVariant: 'is-variant-1',
      profileText: 'Aqui iria una foto de un cliente satisfecho que represente confianza y profesionalismo.',
      reviews: [
        {
          text: 'La web nos dio orden, claridad y un salto real en conversiones. Todo se sintio profesional.',
          name: 'Gonzalez Retail'
        },
        {
          text: 'El equipo entendio nuestro negocio y lo llevo a una identidad digital moderna y confiable.',
          name: 'Studio Norte'
        },
        {
          text: 'En pocas semanas vimos mejoras en SEO y en la forma de presentar nuestros servicios.',
          name: 'Clinica Horizonte'
        }
      ]
    },
    {
      profileVariant: 'is-variant-2',
      profileText: 'Cliente real con presencia nacional, enfocado en procesos claros y resultados medibles.',
      reviews: [
        {
          text: 'Nos ayudaron a ordenar el mensaje y a proyectar una imagen mucho mas solida.',
          name: 'Andes Logistics'
        },
        {
          text: 'El proceso fue transparente y la entrega supero nuestras expectativas.',
          name: 'Grupo Novum'
        },
        {
          text: 'El nuevo sitio transmite confianza y mejoro la conversion de leads.',
          name: 'Marea Seguros'
        }
      ]
    },
    {
      profileVariant: 'is-variant-3',
      profileText: 'Una PyME que buscaba escalar con un socio digital moderno y confiable.',
      reviews: [
        {
          text: 'Logramos una presencia digital clara y con foco en resultados.',
          name: 'Vista Consulting'
        },
        {
          text: 'El diseno y la estructura hacen que nuestros clientes confien mas.',
          name: 'Delta Foods'
        },
        {
          text: 'Se nota la experiencia y el cuidado en cada detalle.',
          name: 'Sigma Health'
        }
      ]
    }
  ];

  let activeSlide = 0;
  let isAnimating = false;

  const buildStars = () => {
    return new Array(5)
      .fill(null)
      .map(
        () =>
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.6 5.8 6.4.6-4.8 4.1 1.4 6.3L12 15.9 6.4 18.8l1.4-6.3L3 8.4l6.4-.6L12 2z" /></svg>'
      )
      .join('');
  };

  const renderCards = (reviews) => {
    if (!track) return;
    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    const visible = isMobile ? reviews.slice(0, 1) : reviews.slice(0, 3);

    track.innerHTML = visible
      .map(
        (review) => `
          <article class="testimonial-card">
            <div class="testimonial-card__rating">
              <span>5.0</span>
              <span class="testimonial-card__stars">${buildStars()}</span>
            </div>
            <div class="testimonial-card__divider"></div>
            <p class="testimonial-card__text">${review.text}</p>
            <div class="testimonial-card__footer">
              <span class="testimonial-card__avatar" aria-hidden="true"></span>
              <span>${review.name}</span>
            </div>
          </article>
        `
      )
      .join('');
  };

  const applySlide = (index) => {
    const slide = slides[index];
    if (!slide) return;

    if (profileText) profileText.textContent = slide.profileText;
    if (profilePortrait) {
      profilePortrait.classList.remove('is-variant-1', 'is-variant-2', 'is-variant-3');
      profilePortrait.classList.add(slide.profileVariant);
    }
    renderCards(slide.reviews);
  };

  const changeSlide = (direction) => {
    if (isAnimating) return;
    isAnimating = true;

    if (profileCard) profileCard.classList.add('is-animating');
    if (track) track.classList.add('is-animating');

    window.setTimeout(() => {
      activeSlide = (activeSlide + direction + slides.length) % slides.length;
      applySlide(activeSlide);

      if (profileCard) profileCard.classList.remove('is-animating');
      if (track) track.classList.remove('is-animating');

      window.setTimeout(() => {
        isAnimating = false;
      }, 240);
    }, 220);
  };

  applySlide(activeSlide);

  if (prev) {
    prev.addEventListener('click', () => changeSlide(-1));
  }

  if (next) {
    next.addEventListener('click', () => changeSlide(1));
  }

  window.addEventListener('resize', () => {
    applySlide(activeSlide);
  });
}

const faqSection = document.querySelector('.faq');

if (faqSection) {
  const items = Array.from(faqSection.querySelectorAll('.faq__item'));

  const setOpenItem = (target) => {
    items.forEach((item) => {
      const button = item.querySelector('.faq__question');
      const answer = item.querySelector('.faq__answer');
      const shouldOpen = item === target;

      item.classList.toggle('is-open', shouldOpen);
      if (button) button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      if (answer) answer.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    });
  };

  items.forEach((item) => {
    const button = item.querySelector('.faq__question');
    if (!button) return;

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      if (isOpen) {
        setOpenItem(null);
      } else {
        setOpenItem(item);
      }
    });
  });
}

window.addEventListener('resize', () => {
  animateUnderline();
});

// Show/hide header on scroll
(function() {
  if (!header) return;
  
  let lastScroll = 0;
  let scrollTimeout;

  const handleScroll = () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    if (currentScroll <= 50) {
      header.classList.remove('is-hidden');
    } else if (currentScroll > lastScroll && currentScroll > 100) {
      // Scrolling down & past threshold
      header.classList.add('is-hidden');
    } else if (currentScroll < lastScroll) {
      // Scrolling up
      header.classList.remove('is-hidden');
    }
    
    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
  };

  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(handleScroll);
  }, { passive: true });
})();

// Language toggle functionality
const translations = {
  es: {
    nav: {
      inicio: 'Inicio',
      marketing: 'Marketing',
      diseno: 'Diseño',
      desarrollo: 'Desarrollo',
      portafolio: 'Portafolio',
      contactanos: 'Contactanos'
    },
    hero: {
      eyebrow: 'Estrategia digital de alto impacto',
      title: 'Un sitio web es solo el comienzo.',
      copy: 'Combinamos diseño, SEO y her ramientas de marketing para ayudar a que tu negocio crezca en línea.',
      signal: 'Resultados que cruzan fronteras',
      button: 'Contactanos'
    },
    services: {
      title: 'Servicios',
      marketing: {
        name: 'Marketing',
        items: ['Estrategia digital', 'Publicidad online', 'Growth marketing', 'Analisis de metricas', 'Funnels de conversion', 'Automatizacion comercial']
      },
      sistemas: {
        name: 'Sistemas',
        items: ['Automatizaciones', 'Integraciones', 'Soluciones internas', 'Dashboards operativos', 'Optimización de procesos']
      },
      desarrollo: {
        name: 'Desarrollo',
        items: ['Desarrollo web', 'Desarrollo de software', 'Desarrollo de MVP', 'SEO', 'APIs y servicios', 'QA y optimizacion']
      },
      diseno: {
        name: 'Diseno',
        items: ['Diseno UI/UX', 'Diseno web', 'Diseno de aplicaciones moviles', 'Branding', 'Sistemas de diseno', 'Direccion visual']
      }
    },
    global: {
      title: 'Presencia Global',
      meta: 'CLIENTES ACTIVOS EN ESTA REGION',
      newYork: 'Nueva York',
      buenosAires: 'Buenos Aires',
      miami: 'Miami'
    },
    works: {
      title: 'Nuestros trabajos',
      button: 'Ver proyecto'
    },
    testimonials: {
      title: 'Impulsamos el exito de PyMEs, transformando sus objetivos en realidades.',
      profileText: 'Aqui iria una foto de un cliente satisfecho que represente confianza y profesionalismo.'
    },
    faq: {
      title: 'Preguntas Frecuentes',
      questions: [
        '¿Siempre trabajan bajo contrato?',
        '¿Cuanto demoran en terminar un proyecto?',
        '¿Que incluyen los planes de servicio?',
        '¿Ofrecen mantenimiento y soporte?',
        '¿Trabajan con PyMEs y negocios pequenos?'
      ],
      answers: [
        'Si. Trabajamos con contrato y un alcance claro para proteger tiempos, entregables y objetivos.',
        'Depende del alcance, pero en general un sitio profesional se entrega entre 3 y 6 semanas.',
        'Diseno, desarrollo, SEO base, analitica y ajustes iniciales segun las metas del negocio.',
        'Si. Podemos encargarnos de mejoras continuas, seguridad, backups y evolucion del sitio.',
        'Si. Nos especializamos en PyMEs y adaptamos el proyecto a su presupuesto y objetivos.'
      ]
    },
    ctaPanel: {
      title: '¿Crees en lo que hacemos?',
      subtitle: 'Hablemos',
      button: 'Contactanos'
    },
    pages: {
      marketing: {
        title: 'Marketing',
        subtitle: 'Estrategia, performance y crecimiento con un enfoque sci-fi.'
      },
      diseno: {
        title: 'Diseño',
        subtitle: 'Identidad, UI/UX y dirección visual con estética premium.',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vel mauris sed justo tempus posuere. Nulla facilisi. Integer ut lacus ut sapien consequat interdum.'
      },
      desarrollo: {
        title: 'Desarrollo',
        subtitle: 'Webs, apps y experiencias interactivas de alto impacto.'
      }
    },
    portfolio: {
      eyebrow: 'TODOS NUESTROS TRABAJOS',
      meta: '+20 Proyectos Terminados',
      pitch: '20 marcas ya renovaron su identidad con nosotros. ¿Listo para que tu proyecto destaque?',
      filterTitle: 'Filtrar proyectos',
      industries: 'Industrias',
      services: 'Servicios',
      cities: 'Ciudades',
      tags: {
        gastronomia: 'Gastronomia',
        tatto: 'Tatto',
        industria: 'Industria',
        higieneYLimpieza: 'Higiene y Limpieza'
      }
    },
    contact: {
      title: 'Hablemos!',
      subtitle: 'Estamos aqui para ayudarte',
      checklist: [
        'Le responderemos en 24 horas.',
        'Firmaremos un acuerdo de confidencialidad si lo solicita.',
        'Acceso a especialistas de producto dedicados.'
      ],
      form: {
        nombre: 'Nombre',
        nombrePlaceholder: 'Tu nombre',
        apellido: 'Apellido',
        apellidoPlaceholder: 'Tu apellido',
        industria: 'Industria',
        industriaPlaceholder: 'Ej. Tecnologia',
        email: 'Mail compania',
        emailPlaceholder: 'contacto@empresa.com',
        mensaje: 'Cuentanos tu idea sobre tu proyecto',
        mensajePlaceholder: 'Resumen breve del proyecto',
        button: 'Enviar consulta'
      }
    },
    footer: {
      help: '¿Necesitas ayuda?',
      call: 'Llamanos',
      legal: 'Todos los derechos reservados.'
    }
  },
  en: {
    nav: {
      inicio: 'Home',
      marketing: 'Marketing',
      diseno: 'Design',
      desarrollo: 'Development',
      portafolio: 'Portfolio',
      contactanos: 'Contact Us'
    },
    hero: {
      eyebrow: 'High-impact digital strategy',
      title: 'A website is just the beginning.',
      copy: 'We combine design, SEO, and marketing tools to help your business grow online.',
      signal: 'Results that cross borders',
      button: 'Contact Us'
    },
    services: {
      title: 'Services',
      marketing: {
        name: 'Marketing',
        items: ['Digital strategy', 'Online advertising', 'Growth marketing', 'Metrics analysis', 'Conversion funnels', 'Sales automation']
      },
      sistemas: {
        name: 'Systems',
        items: ['Automations', 'Integrations', 'Internal solutions', 'Operational dashboards', 'Process optimization']
      },
      desarrollo: {
        name: 'Development',
        items: ['Web development', 'Software development', 'MVP development', 'SEO', 'APIs and services', 'QA and optimization']
      },
      diseno: {
        name: 'Design',
        items: ['UI/UX design', 'Web design', 'Mobile app design', 'Branding', 'Design systems', 'Visual direction']
      }
    },
    global: {
      title: 'Global Presence',
      meta: 'ACTIVE CLIENTS IN THIS REGION',
      newYork: 'New York',
      buenosAires: 'Buenos Aires',
      miami: 'Miami'
    },
    works: {
      title: 'Our Work',
      button: 'View project'
    },
    testimonials: {
      title: 'We drive SME success, turning their goals into realities.',
      profileText: 'Here would be a photo of a satisfied client representing trust and professionalism.'
    },
    faq: {
      title: 'Frequently Asked Questions',
      questions: [
        'Do you always work under contract?',
        'How long does it take to complete a project?',
        'What do service plans include?',
        'Do you offer maintenance and support?',
        'Do you work with SMEs and small businesses?'
      ],
      answers: [
        'Yes. We work with a contract and clear scope to protect timelines, deliverables, and objectives.',
        'It depends on the scope, but generally a professional site is delivered within 3 to 6 weeks.',
        'Design, development, base SEO, analytics, and initial adjustments according to business goals.',
        'Yes. We can handle continuous improvements, security, backups, and site evolution.',
        'Yes. We specialize in SMEs and adapt the project to your budget and objectives.'
      ]
    },
    ctaPanel: {
      title: 'Believe in what we do?',
      subtitle: 'Let\'s talk',
      button: 'Contact Us'
    },
    pages: {
      marketing: {
        title: 'Marketing',
        subtitle: 'Strategy, performance, and growth with a sci-fi approach.'
      },
      diseno: {
        title: 'Design',
        subtitle: 'Identity, UI/UX, and visual direction with premium aesthetics.',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vel mauris sed justo tempus posuere. Nulla facilisi. Integer ut lacus ut sapien consequat interdum.'
      },
      desarrollo: {
        title: 'Development',
        subtitle: 'Websites, apps, and high-impact interactive experiences.'
      }
    },
    portfolio: {
      eyebrow: 'ALL OUR WORK',
      meta: '+20 Completed Projects',
      pitch: '20 brands have already renewed their identity with us. Ready for your project to stand out?',
      filterTitle: 'Filter projects',
      industries: 'Industries',
      services: 'Services',
      cities: 'Cities',
      tags: {
        gastronomia: 'Gastronomy',
        tatto: 'Tattoo',
        industria: 'Industry',
        higieneYLimpieza: 'Hygiene and Cleaning'
      }
    },
    contact: {
      title: 'Let\'s talk!',
      subtitle: 'We\'re here to help you',
      checklist: [
        'We will respond within 24 hours.',
        'We will sign a confidentiality agreement if requested.',
        'Access to dedicated product specialists.'
      ],
      form: {
        nombre: 'First Name',
        nombrePlaceholder: 'Your first name',
        apellido: 'Last Name',
        apellidoPlaceholder: 'Your last name',
        industria: 'Industry',
        industriaPlaceholder: 'E.g. Technology',
        email: 'Company Email',
        emailPlaceholder: 'contact@company.com',
        mensaje: 'Tell us about your project idea',
        mensajePlaceholder: 'Brief project summary',
        button: 'Submit inquiry'
      }
    },
    footer: {
      help: 'Need help?',
      call: 'Call us',
      legal: 'All rights reserved.'
    }
  }
};

const langToggle = document.querySelector('.lang-toggle');

if (langToggle) {
  const updateLanguage = (lang) => {
    // Update button state
    langToggle.dataset.lang = lang;
    const flag = langToggle.querySelector('.lang-toggle__flag');
    const label = langToggle.querySelector('.lang-toggle__label');
    
    if (lang === 'es') {
      if (flag) {
        flag.innerHTML = '<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="4.67" fill="#74ACDF"/><rect y="4.67" width="20" height="4.67" fill="#FFFFFF"/><rect y="9.33" width="20" height="4.67" fill="#74ACDF"/></svg>';
      }
      if (label) label.textContent = 'ESP';
      langToggle.setAttribute('aria-label', 'Cambiar a inglés');
    } else {
      if (flag) {
        flag.innerHTML = '<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#B22234"/><rect width="20" height="1.08" fill="#FFFFFF"/><rect y="2.15" width="20" height="1.08" fill="#FFFFFF"/><rect y="4.31" width="20" height="1.08" fill="#FFFFFF"/><rect y="6.46" width="20" height="1.08" fill="#FFFFFF"/><rect y="8.62" width="20" height="1.08" fill="#FFFFFF"/><rect y="10.77" width="20" height="1.08" fill="#FFFFFF"/><rect y="12.92" width="20" height="1.08" fill="#FFFFFF"/><rect width="8" height="7.5" fill="#3C3B6E"/></svg>';
      }
      if (label) label.textContent = 'ENG';
      langToggle.setAttribute('aria-label', 'Switch to Spanish');
    }
    
    // Update page content
    const t = translations[lang];
    if (!t) return;
    
    // Update navigation links (both desktop and mobile)
    document.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const icon = link.querySelector('.nav__icon');
      
      let newText = '';
      if (href.includes('/inicio/')) {
        newText = t.nav.inicio;
      } else if (href.includes('/marketing/')) {
        newText = t.nav.marketing;
      } else if (href.includes('/diseno/')) {
        newText = t.nav.diseno;
      } else if (href.includes('/desarrollo/')) {
        newText = t.nav.desarrollo;
      } else if (href.includes('/portafolio/')) {
        newText = t.nav.portafolio;
      } else if (href.includes('/contactanos/')) {
        newText = t.nav.contactanos;
      }
      
      if (newText && icon) {
        Array.from(link.childNodes).forEach(node => {
          if (node.nodeType === 3) node.remove();
        });
        link.appendChild(document.createTextNode(newText));
      }
    });
    
    // Update CTA button
    if (ctaButton) {
      const ctaIcon = ctaButton.querySelector('.cta__icon');
      if (ctaIcon) {
        Array.from(ctaButton.childNodes).forEach(node => {
          if (node.nodeType === 3) node.remove();
        });
        ctaButton.appendChild(document.createTextNode(t.nav.contactanos));
      }
    }
    
    // HERO SECTION (inicio page)
    const heroEyebrow = document.querySelector('.hero__eyebrow');
    const heroTitle = document.querySelector('.hero__title');
    const heroCopy = document.querySelector('.hero__copy');
    const heroSignal = document.querySelector('.hero__signal span:last-child');
    const heroButton = document.querySelector('.hero__button');
    
    if (heroEyebrow) heroEyebrow.textContent = t.hero.eyebrow;
    if (heroTitle) heroTitle.textContent = t.hero.title;
    if (heroCopy) heroCopy.textContent = t.hero.copy;
    if (heroSignal) heroSignal.textContent = t.hero.signal;
    if (heroButton) {
      const heroButtonIcon = heroButton.querySelector('.cta__icon');
      if (heroButtonIcon) {
        Array.from(heroButton.childNodes).forEach(node => {
          if (node.nodeType === 3) node.remove();
        });
        heroButton.appendChild(document.createTextNode(t.hero.button));
      }
    }
    
    // SERVICES SECTION
    const servicesTitle = document.querySelector('.services__title');
    if (servicesTitle) servicesTitle.textContent = t.services.title;
    
    // Marketing service
    const marketingName = document.querySelector('[data-service="marketing"] .services__name');
    const marketingItems = document.querySelectorAll('[data-service="marketing"] .services__content li');
    if (marketingName) marketingName.textContent = t.services.marketing.name;
    marketingItems.forEach((item, i) => {
      if (t.services.marketing.items[i]) item.textContent = t.services.marketing.items[i];
    });
    
    // Sistemas service
    const sistemasName = document.querySelector('[data-service="sistemas"] .services__name');
    const sistemasItems = document.querySelectorAll('[data-service="sistemas"] .services__content li');
    if (sistemasName) sistemasName.textContent = t.services.sistemas.name;
    sistemasItems.forEach((item, i) => {
      if (t.services.sistemas.items[i]) item.textContent = t.services.sistemas.items[i];
    });
    
    // Desarrollo service
    const desarrolloName = document.querySelector('[data-service="desarrollo"] .services__name');
    const desarrolloItems = document.querySelectorAll('[data-service="desarrollo"] .services__content li');
    if (desarrolloName) desarrolloName.textContent = t.services.desarrollo.name;
    desarrolloItems.forEach((item, i) => {
      if (t.services.desarrollo.items[i]) item.textContent = t.services.desarrollo.items[i];
    });
    
    // Diseno service
    const disenoName = document.querySelector('[data-service="diseno"] .services__name');
    const disenoItems = document.querySelectorAll('[data-service="diseno"] .services__content li');
    if (disenoName) disenoName.textContent = t.services.diseno.name;
    disenoItems.forEach((item, i) => {
      if (t.services.diseno.items[i]) item.textContent = t.services.diseno.items[i];
    });
    
    // GLOBAL SECTION
    const globalTitle = document.querySelector('.global__title');
    if (globalTitle) globalTitle.textContent = t.global.title;
    document.querySelectorAll('.global__meta').forEach(meta => {
      meta.textContent = t.global.meta;
    });
    
    // WORKS SECTION
    const worksTitle = document.querySelector('.works__title');
    const worksButton = document.querySelector('.works__button');
    if (worksTitle) worksTitle.textContent = t.works.title;
    if (worksButton) worksButton.textContent = t.works.button;
    
    // TESTIMONIALS SECTION
    const testimonialsTitle = document.querySelector('.testimonials__title');
    const testimonialsProfile = document.querySelector('[data-profile-text]');
    if (testimonialsTitle) testimonialsTitle.textContent = t.testimonials.title;
    if (testimonialsProfile) testimonialsProfile.textContent = t.testimonials.profileText;
    
    // FAQ SECTION
    const faqTitle = document.querySelector('.faq__title');
    if (faqTitle) faqTitle.textContent = t.faq.title;
    document.querySelectorAll('.faq__question span:first-child').forEach((q, i) => {
      if (t.faq.questions[i]) q.textContent = t.faq.questions[i];
    });
    document.querySelectorAll('.faq__answer p').forEach((a, i) => {
      if (t.faq.answers[i]) a.textContent = t.faq.answers[i];
    });
    
    // CTA PANEL SECTION
    const ctaPanelTitle = document.querySelector('.cta-panel__title');
    const ctaPanelSubtitle = document.querySelector('.cta-panel__subtitle');
    const ctaPanelButton = document.querySelector('.cta-panel__button');
    if (ctaPanelTitle) ctaPanelTitle.textContent = t.ctaPanel.title;
    if (ctaPanelSubtitle) ctaPanelSubtitle.textContent = t.ctaPanel.subtitle;
    if (ctaPanelButton) ctaPanelButton.textContent = t.ctaPanel.button;
    
    // SECONDARY PAGES (marketing, diseno, desarrollo)
    const pageTitle = document.querySelector('.page__title');
    const pageSubtitle = document.querySelector('.page__subtitle');
    const pageText = document.querySelector('.page__text');
    
    if (pageTitle && pageSubtitle) {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/marketing/')) {
        pageTitle.textContent = t.pages.marketing.title;
        pageSubtitle.textContent = t.pages.marketing.subtitle;
      } else if (path.includes('/diseno/')) {
        pageTitle.textContent = t.pages.diseno.title;
        pageSubtitle.textContent = t.pages.diseno.subtitle;
        if (pageText) pageText.textContent = t.pages.diseno.text;
      } else if (path.includes('/desarrollo/')) {
        pageTitle.textContent = t.pages.desarrollo.title;
        pageSubtitle.textContent = t.pages.desarrollo.subtitle;
      }
    }
    
    // PORTFOLIO PAGE
    const portfolioEyebrow = document.querySelector('.portfolio__eyebrow');
    const portfolioMeta = document.querySelector('.portfolio__meta');
    const portfolioPitch = document.querySelector('.portfolio__pitch');
    const filterPanelTitle = document.querySelector('.filter-panel__title');
    
    if (portfolioEyebrow) portfolioEyebrow.textContent = t.portfolio.eyebrow;
    if (portfolioMeta) portfolioMeta.textContent = t.portfolio.meta;
    if (portfolioPitch) portfolioPitch.textContent = t.portfolio.pitch;
    if (filterPanelTitle) filterPanelTitle.textContent = t.portfolio.filterTitle;
    
    document.querySelectorAll('.filter summary').forEach(summary => {
      const text = summary.textContent.trim().toLowerCase();
      if (text.includes('industria')) {
        summary.childNodes[0].textContent = t.portfolio.industries + '\n              ';
      } else if (text.includes('servicio')) {
        summary.childNodes[0].textContent = t.portfolio.services + '\n              ';
      } else if (text.includes('ciudad')) {
        summary.childNodes[0].textContent = t.portfolio.cities + '\n              ';
      }
    });
    
    // CONTACT PAGE
    const contactTitle = document.querySelector('.contact__title');
    const contactSubtitle = document.querySelector('.contact__subtitle');
    const contactChecklist = document.querySelectorAll('.contact__list li');
    
    if (contactTitle) contactTitle.textContent = t.contact.title;
    if (contactSubtitle) contactSubtitle.textContent = t.contact.subtitle;
    contactChecklist.forEach((item, i) => {
      if (t.contact.checklist[i]) {
        const svg = item.querySelector('.contact__check');
        if (svg) {
          item.innerHTML = '';
          item.appendChild(svg);
          item.appendChild(document.createTextNode(t.contact.checklist[i]));
        }
      }
    });
    
    // Contact form
    const formLabels = document.querySelectorAll('.field__label');
    const formInputs = document.querySelectorAll('.field input, .field textarea');
    const formButton = document.querySelector('.form__button');
    
    formLabels.forEach(label => {
      const parent = label.closest('.field');
      const input = parent ? parent.querySelector('input, textarea') : null;
      
      if (input) {
        const name = input.getAttribute('name');
        if (name === 'nombre') {
          label.textContent = t.contact.form.nombre;
          input.setAttribute('placeholder', t.contact.form.nombrePlaceholder);
        } else if (name === 'apellido') {
          label.textContent = t.contact.form.apellido;
          input.setAttribute('placeholder', t.contact.form.apellidoPlaceholder);
        } else if (name === 'industria') {
          label.textContent = t.contact.form.industria;
          input.setAttribute('placeholder', t.contact.form.industriaPlaceholder);
        } else if (name === 'email') {
          label.textContent = t.contact.form.email;
          input.setAttribute('placeholder', t.contact.form.emailPlaceholder);
        } else if (name === 'mensaje') {
          label.textContent = t.contact.form.mensaje;
          input.setAttribute('placeholder', t.contact.form.mensajePlaceholder);
        }
      }
    });
    
    if (formButton) formButton.textContent = t.contact.form.button;
    
    // FOOTER
    const footerHelp = document.querySelector('.site-footer__eyebrow');
    const footerCall = document.querySelector('.site-footer__title');
    const footerLegal = document.querySelector('.site-footer__legal');
    
    if (footerHelp) footerHelp.textContent = t.footer.help;
    if (footerCall) footerCall.textContent = t.footer.call;
    if (footerLegal) footerLegal.textContent = t.footer.legal;
    
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
    
    // Store preference
    try {
      localStorage.setItem('preferredLanguage', lang);
    } catch (e) {
      // Ignore storage failures
    }
  };
  
  // Load saved language preference
  const loadLanguage = () => {
    try {
      const savedLang = localStorage.getItem('preferredLanguage');
      if (savedLang && translations[savedLang]) {
        updateLanguage(savedLang);
        return;
      }
    } catch (e) {
      // Ignore storage failures
    }
    
    // Set initial state without updating content (content is already in Spanish in HTML)
    langToggle.dataset.lang = 'es';
    const flag = langToggle.querySelector('.lang-toggle__flag');
    const label = langToggle.querySelector('.lang-toggle__label');
    if (flag) {
      flag.innerHTML = '<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="4.67" fill="#74ACDF"/><rect y="4.67" width="20" height="4.67" fill="#FFFFFF"/><rect y="9.33" width="20" height="4.67" fill="#74ACDF"/></svg>';
    }
    if (label) label.textContent = 'ESP';
  };
  
  // Toggle language on click
  langToggle.addEventListener('click', () => {
    const currentLang = langToggle.dataset.lang || 'es';
    const newLang = currentLang === 'es' ? 'en' : 'es';
    updateLanguage(newLang);
  });
  
  // Initialize
  loadLanguage();
}
