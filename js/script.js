(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-actions');
  const theme = document.querySelector('.theme-toggle');
  const backToTop = document.querySelector('.back-to-top');
  const savedTheme = localStorage.getItem('ctn-theme');
  if (savedTheme) root.dataset.theme = savedTheme;

  if (theme) {
    const updateThemeLabel = () => theme.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'light' ? 'dark' : 'light'} mode`);
    updateThemeLabel();
    theme.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light'; localStorage.setItem('ctn-theme', root.dataset.theme); updateThemeLabel(); });
  }
  if (menu && links) {
    menu.addEventListener('click', () => { const open = links.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); });
    links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));
  }
  const handleScroll = () => { header?.classList.toggle('scrolled', scrollY > 8); backToTop?.classList.toggle('visible', scrollY > 500); };
  addEventListener('scroll', handleScroll, { passive: true }); handleScroll();
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('show'); reveal.unobserve(entry.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(element => reveal.observe(element));
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (navLinks.length) { const active = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)); }), { rootMargin: '-35% 0px -55%' }); document.querySelectorAll('main section[id]').forEach(section => active.observe(section)); }
  const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();
})();
