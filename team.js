/* ═══════════════════════════════════════════════════════════════
   ÉQUIPE — team.js  v3
   Working click + ultra-smooth transitions
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const cards    = document.querySelectorAll('.team-card');
  const spotWrap = document.querySelector('.spotlight-img-wrapper');
  const spotName = document.getElementById('spotlight-name');
  const spotRole = document.getElementById('spotlight-role');
  const spotBio  = document.getElementById('spotlight-bio');
  const nameSpans = document.querySelectorAll('.team-names-row span[data-member]');

  if (!cards.length || !spotWrap) return;

  /* ── Build members array from cards ──────────────────────── */
  const members = Array.from(cards).map(c => ({
    name:  c.dataset.name  || '',
    role:  c.dataset.role  || '',
    bio:   c.dataset.bio   || '',
    img:   c.dataset.img   || '',
    index: parseInt(c.dataset.index) || 0,
  }));

  let current   = 0;
  let autoTimer = null;

  /* ── Create two image layers for crossfade ───────────────── */
  // Layer A (bottom) — visible
  const imgA = document.createElement('img');
  imgA.className = 'spot-layer spot-layer-a';

  // Layer B (top) — incoming
  const imgB = document.createElement('img');
  imgB.className = 'spot-layer spot-layer-b';

  // Remove existing spotlight img if any
  const oldImg = document.getElementById('spotlight-img');
  if (oldImg) oldImg.remove();

  spotWrap.appendChild(imgA);
  spotWrap.appendChild(imgB);

  /* ── Text fade helper ────────────────────────────────────── */
  function animText(el, newVal, delay = 0) {
    if (!el) return;
    el.style.transition = `opacity 0.2s ease ${delay}ms, transform 0.35s cubic-bezier(0.23,1,0.32,1) ${delay}ms`;
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(12px)';
    setTimeout(() => {
      el.textContent   = newVal;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200 + delay);
  }

  /* ── Core: switch to member idx ──────────────────────────── */
  function goTo(idx) {
    if (idx === current) return;
    const m = members[idx];
    if (!m) return;
    current = idx;

    /* ── Image crossfade ─────────────── */
    // Copy current A into B position (as background)
    imgB.src     = imgA.src;
    imgB.style.cssText = `opacity:1; transform:scale(1);`;

    // Load new image into A but invisible
    imgA.style.cssText = `opacity:0; transform:scale(1.06);`;
    imgA.src     = m.img;
    imgA.alt     = m.name;

    // Once loaded → fade A in, fade B out
    const doFade = () => {
      imgA.style.transition = 'opacity 0.55s cubic-bezier(0.23,1,0.32,1), transform 0.65s cubic-bezier(0.23,1,0.32,1)';
      imgA.style.opacity    = '1';
      imgA.style.transform  = 'scale(1)';

      imgB.style.transition = 'opacity 0.4s ease';
      imgB.style.opacity    = '0';
    };

    if (imgA.complete && imgA.naturalWidth > 0) {
      requestAnimationFrame(doFade);
    } else {
      imgA.onload  = doFade;
      imgA.onerror = doFade; // still fade even if img fails
    }

    /* ── Text update ─────────────────── */
    animText(spotName, m.name, 0);
    animText(spotRole, m.role, 80);
    animText(spotBio,  m.bio,  140);

    /* ── Cards highlight ─────────────── */
    cards.forEach(c => c.classList.remove('active'));
    const active = document.querySelector(`.team-card[data-index="${idx}"]`);
    if (active) {
      active.classList.add('active');
      if (window.innerWidth < 768) {
        active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    /* ── Name rows highlight ─────────── */
    nameSpans.forEach(s => {
      s.classList.toggle('active-name', parseInt(s.dataset.member) === idx);
    });
  }

  /* ── Init first member ───────────────────────────────────── */
  function init() {
    const m = members[0];
    if (!m) return;
    imgA.src = m.img;
    imgA.alt = m.name;
    imgA.style.cssText = 'opacity:1; transform:scale(1);';
    imgB.style.cssText = 'opacity:0;';

    if (spotName) spotName.textContent = m.name;
    if (spotRole) spotRole.textContent = m.role;
    if (spotBio)  spotBio.textContent  = m.bio;

    cards[0]?.classList.add('active');
    nameSpans.forEach(s => {
      if (parseInt(s.dataset.member) === 0) s.classList.add('active-name');
    });
  }

  /* ── Card click ──────────────────────────────────────────── */
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.index);
      goTo(idx);
      resetAuto();
    });

    /* ── Card 3D tilt ────────────────── */
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transition = 'transform 0.1s ease';
      card.style.transform  = `perspective(400px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), border-color 0.3s ease, box-shadow 0.3s ease';
      card.style.transform  = '';
    });
  });

  /* ── Name row click ──────────────────────────────────────── */
  nameSpans.forEach(s => {
    s.addEventListener('click', () => {
      goTo(parseInt(s.dataset.member));
      resetAuto();
    });
  });

  /* ── Spotlight wrapper parallax ──────────────────────────── */
  const section = document.querySelector('.team-section');
  section?.addEventListener('mousemove', e => {
    const r = section.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    spotWrap.style.transition = 'transform 0.5s ease';
    spotWrap.style.transform  = `perspective(800px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
  });
  section?.addEventListener('mouseleave', () => {
    spotWrap.style.transition = 'transform 0.7s cubic-bezier(0.23,1,0.32,1)';
    spotWrap.style.transform  = '';
  });

  /* ── Auto-cycle ──────────────────────────────────────────── */
  function startAuto() {
    autoTimer = setInterval(() => {
      goTo((current + 1) % members.length);
    }, 4000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    setTimeout(startAuto, 10000);
  }

  /* ── Start ───────────────────────────────────────────────── */
  init();
  startAuto();

});
