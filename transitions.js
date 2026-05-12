/* ══════════════════════════════════════════════════════════════
   TRANSITIONS.JS — La 10 Agence
   Premium scroll transitions between sections
   Effets : fade-up, clip-reveal, split, scale-in, slide-in
══════════════════════════════════════════════════════════════ */

(() => {

  /* ─── 1. SMOOTH SCROLL PROGRESS BAR ─────────────────────── */
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; z-index: 9999;
    height: 2px; width: 0%;
    background: var(--green);
    box-shadow: 0 0 8px rgba(127,255,0,0.6);
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }, { passive: true });


  /* ─── 2. SECTION CLIP REVEAL ─────────────────────────────── */
  /* Each section slides up from below with a clip-path wipe    */
  const sections = document.querySelectorAll(
    '.about, .services, .portfolio, .process, .whyus, .temoignages, .partners-section, .team-section, .contact, .cta-banner, .footer'
  );

  sections.forEach(section => {
    section.style.willChange = 'transform, opacity';
  });

  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        sectionObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  sections.forEach(s => sectionObs.observe(s));


  /* ─── 3. STAGGERED CHILDREN ANIMATION ───────────────────── */
  /* Cards, service items, process steps get staggered entrance */
  const staggerGroups = [
    { parent: '.services-grid',   child: '.service-card',   delay: 80  },
    { parent: '.portfolio-grid',  child: '.portfolio-card', delay: 100 },
    { parent: '.process-steps',   child: '.process-step',   delay: 120 },
    { parent: '.whyus-right',     child: '.why-card',       delay: 100 },
    { parent: '.tem-masonry',     child: '.tem-card',       delay: 80  },
    { parent: '.partners-logo-grid', child: '.partner-logo-item', delay: 60 },
  ];

  staggerGroups.forEach(({ parent, child, delay }) => {
    const parentEl = document.querySelector(parent);
    if (!parentEl) return;

    const children = parentEl.querySelectorAll(child);
    children.forEach((el, i) => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(28px)';
      el.style.transition = `opacity 0.55s ease ${i * delay}ms, transform 0.55s ease ${i * delay}ms`;
    });

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        children.forEach(el => {
          el.style.opacity   = '1';
          el.style.transform = 'translateY(0)';
        });
        obs.disconnect();
      }
    }, { threshold: 0.1 });

    obs.observe(parentEl);
  });


  /* ─── 4. HERO TITLE WORD SPLIT ANIMATION ────────────────── */
  /* Each word in the hero title animates independently        */
  function wrapWords(el) {
    if (!el) return;
    el.querySelectorAll('.line').forEach(line => {
      const text  = line.textContent;
      const words = text.split(' ').filter(w => w);
      line.innerHTML = words.map((w, i) =>
        `<span class="word-wrap" style="display:inline-block;overflow:hidden;vertical-align:bottom;">
           <span class="word" style="display:inline-block;transform:translateY(110%);opacity:0;transition:transform 0.65s cubic-bezier(0.16,1,0.3,1) ${300 + i * 80}ms, opacity 0.65s ease ${300 + i * 80}ms;">${w}&nbsp;</span>
         </span>`
      ).join('');
    });
  }

  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    wrapWords(heroTitle);
    // Trigger after loader
    const loaderCheck = setInterval(() => {
      if (!document.getElementById('loader')?.classList.contains('hidden')) return;
      clearInterval(loaderCheck);
      heroTitle.querySelectorAll('.word').forEach(w => {
        w.style.transform = 'translateY(0)';
        w.style.opacity   = '1';
      });
    }, 100);
  }


  /* ─── 5. MAGNETIC BUTTONS ────────────────────────────────── */
  /* CTA buttons subtly follow the cursor for premium feel     */
  document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x    = (e.clientX - rect.left - rect.width  / 2) * 0.25;
      const y    = (e.clientY - rect.top  - rect.height / 2) * 0.25;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.15s ease';
    });
  });


  /* ─── 6. SECTION NUMBER COUNTER ANIMATION ───────────────── */
  /* Stats in hero animate up when they enter viewport         */
  document.querySelectorAll('.stat-num').forEach(el => {
    const raw     = el.textContent.trim();
    const numMatch = raw.match(/[\d.]+/);
    if (!numMatch) return;

    const target  = parseFloat(numMatch[0]);
    const prefix  = raw.slice(0, raw.indexOf(numMatch[0]));
    const suffix  = raw.slice(raw.indexOf(numMatch[0]) + numMatch[0].length);
    const isInt   = Number.isInteger(target);
    let   started = false;

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        let current  = 0;
        const steps  = 60;
        const inc    = target / steps;
        const timer  = setInterval(() => {
          current += inc;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = prefix + (isInt ? Math.floor(current) : current.toFixed(1)) + suffix;
        }, 25);
        obs.disconnect();
      }
    }, { threshold: 0.5 });

    obs.observe(el);
  });


  /* ─── 7. SMOOTH ANCHOR SCROLL (override) ────────────────── */
  /* Replaces default scroll with a smooth eased version       */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();

      const navHeight = document.getElementById('nav')?.offsetHeight || 80;
      const targetY   = target.getBoundingClientRect().top + window.scrollY - navHeight;

      smoothScrollTo(targetY, 900);
    });
  });

  function smoothScrollTo(target, duration) {
    const start    = window.scrollY;
    const distance = target - start;
    let   startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }


  /* ─── 8. SECTION ACTIVE HIGHLIGHT ───────────────────────── */
  /* Adds a subtle glow to the current section's nav link     */
  const allSections  = document.querySelectorAll('section[id]');
  const navLinks     = document.querySelectorAll('.nav-links a');

  const activeObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.style.color = active ? 'var(--green)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  allSections.forEach(s => activeObs.observe(s));

})();
