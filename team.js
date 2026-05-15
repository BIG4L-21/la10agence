/* ═══════════════════════════════════════════════════════════════
   ÉQUIPE — team.js
   Ultra-smooth spotlight transitions with GSAP-like easing
═══════════════════════════════════════════════════════════════ */

(() => {
  const cards     = document.querySelectorAll('.team-card');
  const spotImg   = document.getElementById('spotlight-img');
  const spotName  = document.getElementById('spotlight-name');
  const spotRole  = document.getElementById('spotlight-role');
  const spotBio   = document.getElementById('spotlight-bio');
  const nameSpans = document.querySelectorAll('.team-names-row span[data-member]');
  const spotWrap  = document.querySelector('.spotlight-img-wrapper');

  if (!cards.length || !spotImg) return;

  const members = Array.from(cards).map(c => ({
    name:  c.dataset.name  || '',
    role:  c.dataset.role  || '',
    bio:   c.dataset.bio   || '',
    img:   c.dataset.img   || '',
    index: parseInt(c.dataset.index)
  }));

  let currentIndex = 0;
  let isAnimating  = false;

  /* ── Smooth text swap ──────────────────────────────────── */
  function fadeText(el, newText, delay = 0) {
    el.style.transition = `opacity 0.25s ease ${delay}ms, transform 0.25s ease ${delay}ms`;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => {
      el.textContent = newText;
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }, 260 + delay);
  }

  /* ── Smooth image swap with crossfade ──────────────────── */
  function swapImage(newSrc, newAlt) {
    if (!newSrc || !spotImg) return;

    // Simple smooth crossfade on the existing img tag
    spotImg.style.transition = 'opacity 0.3s ease, transform 0.5s cubic-bezier(0.23,1,0.32,1)';
    spotImg.style.opacity    = '0';
    spotImg.style.transform  = 'scale(1.04)';

    setTimeout(() => {
      spotImg.src     = newSrc;
      spotImg.alt     = newAlt;
      spotImg.onload  = () => {
        spotImg.style.opacity   = '1';
        spotImg.style.transform = 'scale(1)';
        isAnimating = false;
      };
      // Fallback if image already cached
      if (spotImg.complete) {
        spotImg.style.opacity   = '1';
        spotImg.style.transform = 'scale(1)';
        isAnimating = false;
      }
    }, 300);
  }

  /* ── Main activate function ────────────────────────────── */
  function activateMember(idx, force = false) {
    if (idx === currentIndex && !force) return;
    const m = members[idx];
    if (!m) return;

    isAnimating  = true;
    currentIndex = idx;

    // Image crossfade
    swapImage(m.img, m.name);

    // Text with staggered fade
    fadeText(spotName, m.name, 0);
    fadeText(spotRole, m.role, 60);
    fadeText(spotBio,  m.bio,  120);

    // Active card highlight
    cards.forEach(c => {
      c.classList.remove('active');
      c.style.transition = 'all 0.3s ease';
    });
    const activeCard = document.querySelector(`.team-card[data-index="${idx}"]`);
    if (activeCard) {
      activeCard.classList.add('active');
      activeCard.style.transform = 'translateY(-3px) scale(1.02)';
      setTimeout(() => { activeCard.style.transform = ''; }, 300);
      if (window.innerWidth < 768) {
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // Active name glow
    nameSpans.forEach(span => {
      span.classList.toggle('active-name', parseInt(span.dataset.member) === idx);
    });
  }

  /* ── Card hover preview (subtle) ──────────────────────── */
  cards.forEach(card => {
    card.addEventListener('click', () => {
      activateMember(parseInt(card.dataset.index));
      pauseAuto();
    });

    // Subtle tilt on hover
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(400px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'all 0.4s cubic-bezier(0.23,1,0.32,1)';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.15s ease';
    });
  });

  /* ── Name click ────────────────────────────────────────── */
  nameSpans.forEach(span => {
    span.addEventListener('click', () => {
      activateMember(parseInt(span.dataset.member));
      pauseAuto();
    });
  });

  /* ── Auto-cycle with smooth acceleration ───────────────── */
  let autoTimer = null;

  function startAuto() {
    autoTimer = setInterval(() => {
      const next = (currentIndex + 1) % members.length;
      activateMember(next);
    }, 4000);
  }

  function pauseAuto() {
    clearInterval(autoTimer);
    setTimeout(startAuto, 10000);
  }

  /* ── Spotlight parallax on mouse move ──────────────────── */
  if (spotWrap) {
    const section = document.querySelector('.team-section');
    section?.addEventListener('mousemove', e => {
      const rect = section.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      spotWrap.style.transition = 'transform 0.4s ease';
      spotWrap.style.transform  = `perspective(600px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
    });
    section?.addEventListener('mouseleave', () => {
      spotWrap.style.transform  = '';
      spotWrap.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
    });
  }

  /* ── Init ──────────────────────────────────────────────── */
  activateMember(0, true);
  startAuto();

})();
