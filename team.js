/* ═══════════════════════════════════════════════════════════════
   ÉQUIPE — team.js
   Handles spotlight switching via grid cards & scrolling names
═══════════════════════════════════════════════════════════════ */

(() => {
  const cards       = document.querySelectorAll('.team-card');
  const spotImg     = document.getElementById('spotlight-img');
  const spotName    = document.getElementById('spotlight-name');
  const spotRole    = document.getElementById('spotlight-role');
  const spotBio     = document.getElementById('spotlight-bio');
  const nameSpans   = document.querySelectorAll('.team-names-row span[data-member]');

  if (!cards.length || !spotImg) return;

  // ── Member data from cards ────────────────────────────────
  const members = Array.from(cards).map(c => ({
    name:  c.dataset.name,
    role:  c.dataset.role,
    bio:   c.dataset.bio,
    img:   c.dataset.img,
    index: parseInt(c.dataset.index)
  }));

  let currentIndex = 0;

  // ── Switch spotlight ──────────────────────────────────────
  function activateMember(idx) {
    if (idx === currentIndex && spotImg.src) return;
    const m = members[idx];
    if (!m) return;
    currentIndex = idx;

    // Animate image swap
    spotImg.classList.add('changing');
    setTimeout(() => {
      spotImg.src = m.img;
      spotImg.alt = m.name;
      spotImg.classList.remove('changing');
    }, 300);

    // Update text
    spotName.textContent = m.name;
    spotRole.textContent = m.role;
    spotBio.textContent  = m.bio;

    // Update active card
    cards.forEach(c => c.classList.remove('active'));
    const activeCard = document.querySelector(`.team-card[data-index="${idx}"]`);
    if (activeCard) {
      activeCard.classList.add('active');
      // Scroll card into view gently on mobile
      if (window.innerWidth < 768) {
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // Update active name in scrolling rows
    nameSpans.forEach(span => {
      span.classList.toggle('active-name', parseInt(span.dataset.member) === idx);
    });
  }

  // ── Card click ────────────────────────────────────────────
  cards.forEach(card => {
    card.addEventListener('click', () => {
      activateMember(parseInt(card.dataset.index));
    });
  });

  // ── Scrolling name click ──────────────────────────────────
  nameSpans.forEach(span => {
    span.addEventListener('click', () => {
      activateMember(parseInt(span.dataset.member));
    });
  });

  // ── Auto-cycle members every 4 seconds ───────────────────
  let autoTimer = setInterval(() => {
    const next = (currentIndex + 1) % members.length;
    activateMember(next);
  }, 4000);

  // Pause auto-cycle on user interaction
  function pauseAuto() {
    clearInterval(autoTimer);
    // Resume after 12 seconds of inactivity
    autoTimer = setTimeout(() => {
      autoTimer = setInterval(() => {
        const next = (currentIndex + 1) % members.length;
        activateMember(next);
      }, 4000);
    }, 12000);
  }

  cards.forEach(c => c.addEventListener('click', pauseAuto));
  nameSpans.forEach(s => s.addEventListener('click', pauseAuto));

  // ── Init first member ─────────────────────────────────────
  activateMember(0);

})();
