// The saved theme and the .js class are applied by the inline snippet in each page's <head>,
// so the page renders in the right theme without a flash.
(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-actions');
  const theme = document.querySelector('.theme-toggle');
  const backToTop = document.querySelector('.back-to-top');

  // Links use clean URLs (puzzleme/, privacy, ../#games) to match the canonical URLs served by the host.
  // When the site is opened straight from disk there is no server to resolve them, so add the file name.
  if (location.protocol === 'file:') {
    document.querySelectorAll('a[href]').forEach(link => {
      const [path, hash] = link.getAttribute('href').split('#');
      if (!path || /^[a-z]+:/i.test(path)) return;
      const lastSegment = path.split('/').pop();
      const file = path.endsWith('/') ? `${path}index.html` : lastSegment.includes('.') ? path : `${path}.html`;
      if (file !== path) link.setAttribute('href', `${file}${hash !== undefined ? `#${hash}` : ''}`);
    });
  }

  if (theme) {
    const updateThemeLabel = () => theme.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'light' ? 'dark' : 'light'} mode`);
    updateThemeLabel();
    theme.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('ctn-theme', root.dataset.theme); } catch (e) { }
      updateThemeLabel();
    });
  }

  if (menu && links) {
    const setOpen = open => {
      links.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menu.addEventListener('click', () => setOpen(!links.classList.contains('open')));
    links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
  }

  const handleScroll = () => {
    header?.classList.toggle('scrolled', scrollY > 8);
    backToTop?.classList.toggle('visible', scrollY > 500);
  };
  addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      reveal.unobserve(entry.target);
    }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(element => reveal.observe(element));

  // Highlight the nav link of the section in view (only for in-page links).
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (navLinks.length) {
    const active = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }), { rootMargin: '-35% 0px -55%' });
    document.querySelectorAll('main section[id]').forEach(section => active.observe(section));
  }

  // Screenshot carousels: arrows and swipe move one image and loop around; dots show the first visible image.
  // A copy of the images is added before and after the originals, so going past either end shows the
  // other end; once scrolling stops, the track jumps silently back to the same image in the originals.
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const originals = [...track.children];
    const count = originals.length;
    if (count < 2) return;
    const copies = () => originals.map(slide => {
      const copy = slide.cloneNode(true);
      copy.alt = '';
      copy.setAttribute('aria-hidden', 'true');
      return copy;
    });
    track.prepend(...copies());
    track.append(...copies());

    const slides = [...track.children];
    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    const dots = carousel.querySelector('.carousel-dots');
    const step = () => slides[1].offsetLeft - slides[0].offsetLeft;
    const position = () => Math.round(track.scrollLeft / step());
    const goTo = index => track.scrollTo({ left: index * step() });
    const jumpTo = index => {
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = index * step();
      track.style.scrollBehavior = '';
    };

    let last = count;
    let touching = false;
    let settle;
    const recenter = () => {
      if (touching) return;
      const index = position();
      if (index < count) jumpTo(index + count);
      else if (index >= 2 * count) jumpTo(index - count);
    };

    const update = () => {
      last = position();
      const active = last % count;
      [...dots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === active)));
      clearTimeout(settle);
      settle = setTimeout(recenter, 150);
    };

    dots.replaceChildren(...originals.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show screenshot ${i + 1}`);
      dot.addEventListener('click', () => goTo(position() - (position() % count) + i));
      return dot;
    }));

    prev.addEventListener('click', () => goTo(position() - 1));
    next.addEventListener('click', () => goTo(position() + 1));
    track.addEventListener('scroll', update, { passive: true });
    track.addEventListener('touchstart', () => { touching = true; }, { passive: true });
    track.addEventListener('touchend', () => { touching = false; update(); }, { passive: true });
    addEventListener('resize', () => jumpTo(last));
    jumpTo(count);
    update();
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
