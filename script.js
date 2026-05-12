/* ═══════════════════════════════════════════════════════════════
   LA 10 AGENCE — SCRIPT.JS
   Animations, interactions, scroll effects
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── LOADER ─────────────────────────────────────────────── */
  const loader       = document.getElementById('loader');
  const loaderBar    = document.getElementById('loader-progress');
  let   progress     = 0;

  const loaderInterval = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderInterval);
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        // Trigger hero reveals
        document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * 100);
        });
      }, 300);
    }
    loaderBar.style.width = progress + '%';
  }, 80);

  document.body.style.overflow = 'hidden';


  /* ─── CUSTOM CURSOR ──────────────────────────────────────── */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (cursor && follower) {
    let mx = 0, my = 0;
    let fx = 0, fy = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    // Smooth follower
    function animateCursor() {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }


  /* ─── NAVIGATION SCROLL ──────────────────────────────────── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });


  /* ─── MOBILE MENU ────────────────────────────────────────── */
  const burger     = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');

  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });


  /* ─── SCROLL REVEAL ──────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal-up:not(.hero .reveal-up)');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ─── ANIMATED NUMBER COUNTER ────────────────────────────── */
  const statNums = document.querySelectorAll('.stat-num');

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el  = entry.target;
        const raw = el.textContent.trim();
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        const prefix = raw.match(/^[^0-9]*/)?.[0] || '';
        const suffix = raw.match(/[^0-9]*$/)?.[0] || '';

        if (!isNaN(num)) {
          let start    = 0;
          const step   = num / 50;
          const isInt  = Number.isInteger(num);
          const ticker = setInterval(() => {
            start += step;
            if (start >= num) { start = num; clearInterval(ticker); }
            el.textContent = prefix + (isInt ? Math.floor(start) : start.toFixed(1)) + suffix;
          }, 30);
        }
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => countObserver.observe(el));


  /* ─── HERO TEXT STAGGER (after loader) ───────────────────── */
  // Already handled in loader finish callback above


  /* ─── SMOOTH ANCHOR SCROLL ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ─── SERVICE CARD STAGGER on hover ─────────────────────── */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.zIndex = '2';
    });
    card.addEventListener('mouseleave', () => {
      card.style.zIndex = '';
    });
  });


  /* ─── PORTFOLIO CARD TILT ────────────────────────────────── */
  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const x     = (e.clientX - rect.left) / rect.width  - 0.5;
      const y     = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease';
      setTimeout(() => card.style.transition = '', 400);
    });
  });


  /* ─── PARALLAX BLOBS (subtle) ────────────────────────────── */
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    const b1 = document.querySelector('.blob-1');
    const b2 = document.querySelector('.blob-2');
    const b3 = document.querySelector('.blob-3');
    if (b1) b1.style.transform = `translateY(${sy * 0.08}px)`;
    if (b2) b2.style.transform = `translateY(${-sy * 0.05}px)`;
    if (b3) b3.style.transform = `translateY(${sy * 0.04}px)`;
  }, { passive: true });


  /* ─── CONTACT FORM ───────────────────────────────────────── */
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Envoi en cours…';
      btn.disabled = true;

      // Simulate send
      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.innerHTML = '<span>Envoyer le message</span>';
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 5000);
      }, 1500);
    });
  }


  /* ─── STICKY NAV ACTIVE LINK ─────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.id;
      }
    });
    navLinks.forEach(link => {
      link.style.color = link.getAttribute('href') === `#${current}`
        ? 'var(--green)'
        : '';
    });
  }, { passive: true });


  /* ─── WHY CARDS HOVER STAGGER ────────────────────────────── */
  document.querySelectorAll('.why-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.05}s`;
  });


  /* ─── ROTATING BADGE ─────────────────────────────────────── */
  // CSS animation handles this via spin-slow keyframe


  /* ─── MARQUEE PAUSE ON HOVER ─────────────────────────────── */
  const marquee = document.querySelector('.marquee-track');
  if (marquee) {
    marquee.addEventListener('mouseenter', () => {
      marquee.style.animationPlayState = 'paused';
    });
    marquee.addEventListener('mouseleave', () => {
      marquee.style.animationPlayState = 'running';
    });
  }


  /* ─── PROCESS STEP ACTIVATE ON SCROLL ───────────────────── */
  const processSteps = document.querySelectorAll('.process-step');
  const processObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.querySelector('.step-icon')?.classList.add('active-step');
        }, i * 150);
      }
    });
  }, { threshold: 0.4 });
  processSteps.forEach(step => processObs.observe(step));

  /* ─── FOOTER SCROLL FADE ─────────────────────────────────── */
  const footerEls = document.querySelectorAll('.footer-col, .footer-brand');
  const footerObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        footerObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  footerEls.forEach(el => {
    el.style.opacity      = '0';
    el.style.transform    = 'translateY(20px)';
    el.style.transition   = 'opacity 0.6s ease, transform 0.6s ease';
    footerObs.observe(el);
  });

}); // End DOMContentLoaded


/* ══════════════════════════════════════════════════════════════
   HERO VIDEO BACKGROUND — handler
══════════════════════════════════════════════════════════════ */
(function initHeroVideo() {
  const video   = document.getElementById('hero-video');
  const wrapper = document.getElementById('hero-video-wrapper');
  if (!video || !wrapper) return;

  /* Fade in once video can play */
  function onCanPlay() {
    video.classList.add('loaded');
    wrapper.classList.add('active');
  }

  video.addEventListener('canplay', onCanPlay, { once: true });
  video.addEventListener('loadeddata', onCanPlay, { once: true });

  /* If video fails to load (file missing), hide wrapper gracefully */
  video.addEventListener('error', () => {
    wrapper.style.display = 'none';
  });

  /* Add pause/play toggle button */
  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'hero-video-pause';
  pauseBtn.id = 'hero-video-pause';
  pauseBtn.innerHTML = `
    <svg id="pause-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="3.5" height="10" rx="1" fill="currentColor"/>
      <rect x="7.5" y="1" width="3.5" height="10" rx="1" fill="currentColor"/>
    </svg>
    <svg id="play-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" style="display:none">
      <path d="M2 1l9 5-9 5V1z" fill="currentColor"/>
    </svg>
    <span id="pause-label">Pause</span>
  `;

  /* Only show button when video is actually playing */
  video.addEventListener('canplay', () => {
    const hero = document.getElementById('hero');
    if (hero) hero.appendChild(pauseBtn);
  }, { once: true });

  let playing = true;
  pauseBtn.addEventListener('click', () => {
    playing = !playing;
    playing ? video.play() : video.pause();
    document.getElementById('pause-icon').style.display = playing ? '' : 'none';
    document.getElementById('play-icon').style.display  = playing ? 'none' : '';
    document.getElementById('pause-label').textContent  = playing ? 'Pause' : 'Play';
  });

  /* Pause video when not in viewport (performance) */
  const heroObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { video.play().catch(() => {}); }
      else { video.pause(); }
    });
  }, { threshold: 0.1 });
  heroObs.observe(document.getElementById('hero') || document.body);

})();


/* ══════════════════════════════════════════════════════════════
   PARTNERS — Mouse parallax on bubbles
══════════════════════════════════════════════════════════════ */
(function initPartnersParallax() {
  const arena   = document.getElementById('partners-arena');
  const bubbles = document.querySelectorAll('.logo-bubble:not(:first-child)');
  if (!arena || !bubbles.length) return;

  let mouse = { x: 0, y: 0 };
  let raf;

  // Each bubble gets a unique depth factor
  const depths = [0.03, 0.06, 0.045, 0.07, 0.025, 0.055, 0.04, 0.065];

  arena.addEventListener('mousemove', e => {
    const rect = arena.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left - rect.width  / 2);
    mouse.y = (e.clientY - rect.top  - rect.height / 2);
  });

  arena.addEventListener('mouseleave', () => {
    mouse.x = 0;
    mouse.y = 0;
  });

  function tick() {
    bubbles.forEach((b, i) => {
      const d = depths[i % depths.length];
      const tx = mouse.x * d;
      const ty = mouse.y * d;
      // Blend with existing CSS animation via CSS custom property
      b.style.setProperty('--px', `${tx}px`);
      b.style.setProperty('--py', `${ty}px`);
      b.style.transform = `translate(var(--px, 0), var(--py, 0))`;
    });
    raf = requestAnimationFrame(tick);
  }

  // Only run parallax when section is visible
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { tick(); }
    else { cancelAnimationFrame(raf); }
  }, { threshold: 0.1 });
  obs.observe(arena);
})();
