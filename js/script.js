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

  // Email addresses are assembled on click to keep them away from scrapers.
  // Markup: <button data-email-user="contact" data-email-domain="ctndevs.com">Show email</button>
  document.querySelectorAll('[data-email-user]').forEach(button => button.addEventListener('click', () => {
    const email = `${button.dataset.emailUser}@${button.dataset.emailDomain}`;
    const link = document.createElement('a');
    link.href = `mailto:${email}`;
    link.textContent = email;
    button.replaceWith(link);
  }));

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
