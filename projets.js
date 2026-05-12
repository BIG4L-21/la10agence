/* ═══════════════════════════════════════════════════════════════
   PROJETS.JS — Filtres, animations, interactions
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Custom cursor ──────────────────────────────────────── */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (cursor && follower) {
    let mx = 0, my = 0, fx = 0, fy = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });
    (function loop() {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ─── Nav scroll ─────────────────────────────────────────── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ─── Mobile menu ────────────────────────────────────────── */
  const burger     = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (burger) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
    document.querySelectorAll('.mobile-link').forEach(l =>
      l.addEventListener('click', () => {
        burger.classList.remove('active');
        mobileMenu.classList.remove('open');
      })
    );
  }

  /* ─── Scroll reveal ──────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal-up');
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
  }, { threshold: 0.1 }).observe
    ? (() => {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.1 });
        revealEls.forEach(el => obs.observe(el));
      })()
    : revealEls.forEach(el => el.classList.add('visible'));

  /* ─── Filtres ────────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.projet-card');
  const noResults  = document.getElementById('no-results');
  const grid       = document.getElementById('projets-grid');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      let visible  = 0;

      cards.forEach((card, i) => {
        const cats = card.getAttribute('data-category') || '';
        const show = filter === 'all' || cats.includes(filter);

        if (show) {
          card.classList.remove('hidden');
          card.classList.remove('fade-in');
          // Staggered animation
          setTimeout(() => card.classList.add('fade-in'), i * 50);
          visible++;
        } else {
          card.classList.add('hidden');
          card.classList.remove('fade-in');
        }
      });

      // No results
      if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';

      // Rebuild grid layout for large cards after filter
      rebuildGrid(filter);
    });
  });

  function rebuildGrid(filter) {
    // Reset large cards when filtered (so they don't span 2 cols alone)
    cards.forEach(card => {
      if (card.classList.contains('projet-large') && card.classList.contains('hidden')) {
        // already hidden, no issue
      }
    });
  }

  /* ─── Vidéo : play au hover ──────────────────────────────── */
  document.querySelectorAll('.projet-video-card').forEach(card => {
    const video = card.querySelector('.projet-video');
    if (!video) return;
    card.addEventListener('mouseenter', () => video.play().catch(() => {}));
    card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
  });

  /* ─── Carte : scroll reveal ──────────────────────────────── */
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('fade-in'), i * 60);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  cards.forEach(card => cardObserver.observe(card));

});
