/* ================================================================
   DEEPANSH WATER SOLUTION — SHARED JAVASCRIPT
================================================================ */

/* ── NAVBAR: scroll shadow + hamburger ── */
(function() {
  const header    = document.getElementById('mainHeader');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('open');
    });

    /* Close on link click (mobile) */
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });

    /* Close on outside click */
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  }
})();


/* ── SCROLL REVEAL ── */
(function() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();


/* -- HERO MAP -- */
(function() {
  const hero = document.querySelector('.hero');
  const background = document.getElementById('heroBackground');
  if (!hero || !background) return;

  const layers = Array.from(background.querySelectorAll('.hero-bg-layer'));
  const dots = Array.from(document.querySelectorAll('.hero-bg-dot'));
  if (!layers.length) return;

  let currentIndex = Math.max(0, layers.findIndex((layer) => layer.classList.contains('is-active')));
  if (currentIndex === -1) currentIndex = 0;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let rotationTimer = null;

  const setActiveSlide = (nextIndex) => {
    layers.forEach((layer, index) => {
      layer.classList.toggle('is-active', index === nextIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === nextIndex);
      dot.setAttribute('aria-pressed', index === nextIndex ? 'true' : 'false');
    });

    currentIndex = nextIndex;
  };

  const startRotation = () => {
    if (prefersReducedMotion.matches || layers.length < 2) return;
    clearInterval(rotationTimer);
    rotationTimer = window.setInterval(() => {
      setActiveSlide((currentIndex + 1) % layers.length);
    }, 5000);
  };

  setActiveSlide(currentIndex);
  startRotation();

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      setActiveSlide(index);
      startRotation();
    });
  });

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    background.style.setProperty('--hero-pointer-x', `${x.toFixed(2)}%`);
    background.style.setProperty('--hero-pointer-y', `${y.toFixed(2)}%`);
  });

  hero.addEventListener('pointerleave', () => {
    background.style.setProperty('--hero-pointer-x', '70%');
    background.style.setProperty('--hero-pointer-y', '32%');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(rotationTimer);
      rotationTimer = null;
      return;
    }
    startRotation();
  });
})();

(function() {
  const mapRoot = document.getElementById('heroMap');
  if (!mapRoot || typeof L === 'undefined') return;

  const map = L.map(mapRoot, {
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true,
    doubleClickZoom: true,
    boxZoom: false,
    attributionControl: false
  }).setView([23.8, 79.2], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(map);

  const delhiNcrZone = L.polygon([
    [28.78, 76.86],
    [28.92, 77.22],
    [28.82, 77.66],
    [28.54, 77.82],
    [28.26, 77.66],
    [28.14, 77.28],
    [28.24, 76.94]
  ], {
    color: '#6fc6ff',
    weight: 2,
    opacity: 0.9,
    fillColor: '#2f80ed',
    fillOpacity: 0.18
  }).addTo(map);

  delhiNcrZone.bindTooltip('Delhi NCR Coverage', {
    permanent: false,
    direction: 'center',
    className: 'hero-map-zone-label'
  });
  delhiNcrZone.bringToBack();

  const locations = [
    { name: 'Sector 37, Faridabad HQ', type: 'Headquarters', coords: [28.4248, 77.3145], office: true },
    { name: 'NCERT, Delhi', type: 'Project Point', coords: [28.6244, 77.2188] },
    { name: 'South Delhi', type: 'Project Point', coords: [28.5355, 77.2420] },
    { name: 'West Delhi', type: 'Project Point', coords: [28.6692, 77.0990] },
    { name: 'Dwarka, Delhi', type: 'Project Point', coords: [28.5921, 77.0460] },
    { name: 'IIT Roorkee', type: 'Project Point', coords: [29.8649, 77.8969] },
    { name: 'IIT Jodhpur', type: 'Project Point', coords: [26.4714, 73.1137] },
    { name: 'Jodhpur City', type: 'Project Point', coords: [26.2389, 73.0243] },
    { name: 'Hyderabad', type: 'Project Point', coords: [17.3850, 78.4867] },
    { name: 'Ahmedabad', type: 'Project Point', coords: [23.0225, 72.5714] },
    { name: 'Surat', type: 'Project Point', coords: [21.1702, 72.8311] },
    { name: 'Indore', type: 'Project Point', coords: [22.7196, 75.8577] },
    { name: 'Lucknow', type: 'Project Point', coords: [26.8467, 80.9462] },
    { name: 'Dabur India, Ghaziabad', type: 'Project Point', coords: [28.6692, 77.4538] },
    { name: 'Ghaziabad City', type: 'Project Point', coords: [28.6692, 77.4538] },
    { name: 'Indirapuram, Ghaziabad', type: 'Project Point', coords: [28.6460, 77.3695] },
    { name: 'Ved Van, Noida', type: 'Project Point', coords: [28.5677, 77.3261] },
    { name: 'Ved Van, Greater Noida', type: 'Project Point', coords: [28.4744, 77.5030] },
    { name: 'Gurugram Sector 43', type: 'Project Point', coords: [28.4583, 77.0931] },
    { name: 'Gurugram Golf Course Road', type: 'Project Point', coords: [28.4376, 77.1011] },
    { name: 'Cyber City, Gurugram', type: 'Project Point', coords: [28.4949, 77.0895] },
    { name: 'Sohna Road, Gurugram', type: 'Project Point', coords: [28.3956, 77.0417] },
    { name: 'Noida Sector 62', type: 'Project Point', coords: [28.6289, 77.3649] },
    { name: 'Noida Expressway', type: 'Project Point', coords: [28.5355, 77.3910] },
    { name: 'Greater Noida West', type: 'Project Point', coords: [28.6127, 77.4376] },
    { name: 'Dehradun', type: 'Project Point', coords: [30.3165, 78.0322] },
    { name: 'Ranikhet, Uttarakhand', type: 'Project Point', coords: [29.6437, 79.4322] },
    { name: 'Chandigarh', type: 'Project Point', coords: [30.7333, 76.7794] },
    { name: 'Faridabad', type: 'Project Point', coords: [28.4089, 77.3178] },
    { name: 'Bangalore', type: 'Project Point', coords: [12.9716, 77.5946] }
  ];

  const makeIcon = (office) => L.divIcon({
    className: '',
    html: `<span class="hero-map-pin${office ? ' office' : ''}"></span>`,
    iconSize: office ? [16, 16] : [14, 14],
    iconAnchor: office ? [8, 8] : [7, 7]
  });

  const latLngs = [];
  locations.forEach((location) => {
    const marker = L.marker(location.coords, { icon: makeIcon(location.office) }).addTo(map);
    marker.bindPopup(
      `<strong>${location.name}</strong><span>${location.type}</span>`,
      { className: 'hero-map-popup', closeButton: false, offset: [0, -6] }
    );
    if (location.office) marker.openPopup();
    latLngs.push(location.coords);
  });

  map.fitBounds(latLngs, { padding: [28, 28] });

  window.addEventListener('resize', () => {
    map.invalidateSize();
  });
})();


/* -- INNER PAGE HERO BUBBLES -- */
(function() {
  /* Inner-page atmosphere is now rendered in CSS so it appears immediately on first paint. */
})();


/* ── SMOOTH SCROLL for hash links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const offset = 100; /* header height */
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
/* -- PAGE LOADER -- */
(function() {
  const body = document.body;
  if (!body) return;

  const logoFromHeader = document.querySelector('.logo img')?.getAttribute('src');
  const logoSrc = logoFromHeader || '/images_dws/deepansh-water-solution-logo.png';

  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.id = 'pageLoader';
  loader.setAttribute('aria-hidden', 'true');
  loader.innerHTML = `
    <div class="page-loader__inner">
      <div class="page-loader__logo-wrap">
        <img class="page-loader__logo" src="${logoSrc}" alt="Deepansh Water Solution logo">
      </div>
      <div class="page-loader__ring"></div>
      <div class="page-loader__brand">Deepansh Water Solution</div>
      <div class="page-loader__text">Preparing smarter water systems...</div>
      <div class="page-loader__bar">
        <span class="page-loader__bar-fill"></span>
      </div>
    </div>
  `;

  body.classList.add('is-loading');
  body.prepend(loader);

  let hidden = false;

  const hideLoader = () => {
    if (hidden) return;
    hidden = true;
    loader.classList.add('is-hidden');
    body.classList.remove('is-loading');
    window.setTimeout(() => {
      loader.remove();
    }, 650);
  };

  if (document.readyState === 'complete') {
    hideLoader();
    return;
  }

  window.addEventListener('load', hideLoader, { once: true });
  window.setTimeout(hideLoader, 3200);
})();
