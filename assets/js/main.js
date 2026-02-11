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
        const description = card.querySelector('.portfolio-card__body p');
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

      const resultItems = Array.from(doc.querySelectorAll('.case-results__list li'))
        .map((item) => item.textContent.trim())
        .filter(Boolean);

      const hero = doc.querySelector('.case-hero');
      const heroStyle = hero ? hero.getAttribute('style') : '';
      const heroImage = extractHeroImage(heroStyle);
      const logo = doc.querySelector('.case-hero__logo');
      const logoSrc = logo ? logo.getAttribute('src') : '';

      const imageCandidate = heroImage || project.image || logoSrc;
      const resolvedImage = resolveUrl(imageCandidate, baseUrl.href);

      return {
        ...project,
        description: extractText(descriptionNode) || project.description,
        features: challengeTitles.length > 0 ? challengeTitles : resultItems,
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
      const items = project.features && project.features.length > 0 ? project.features : fallbackFeatures;
      worksFeatures.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
    }

    if (worksImage) {
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
