/* ══════════════════════════════════════════════════════════════
   FEATURES.JS
   1. Dark / Light mode toggle
   2. EmailJS real email sending
   3. Toast notifications
══════════════════════════════════════════════════════════════

   ⚠️  EMAILJS SETUP (gratuit — 200 emails/mois) :
   1. Va sur https://www.emailjs.com et crée un compte
   2. "Add New Service" → Gmail → connecte ton Gmail
   3. "Email Templates" → crée un template avec ces variables :
        {{from_name}}, {{from_email}}, {{service}}, {{message}}
   4. Remplace les 3 valeurs ci-dessous par les tiennes
══════════════════════════════════════════════════════════════ */

/* ─── EmailJS Config — REMPLACE CES VALEURS ─────────────── */
const EMAILJS_PUBLIC_KEY  = 'HWSDmZhV9XZmD-qbX';
const EMAILJS_SERVICE_ID  = 'service_qdpy9a6';
const EMAILJS_TEMPLATE_ID = 'template_8mc2hap';
/* ─────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ════════════════════════════════════════════════════════
     1. DARK / LIGHT MODE
  ════════════════════════════════════════════════════════ */
  const themeToggle = document.getElementById('theme-toggle');
  const iconMoon    = themeToggle?.querySelector('.icon-moon');
  const iconSun     = themeToggle?.querySelector('.icon-sun');

  // Load saved preference
  const savedTheme = localStorage.getItem('la10-theme') || 'dark';
  if (savedTheme === 'light') applyLight();

  function applyLight() {
    document.body.classList.add('light-mode');
    if (iconMoon) iconMoon.style.display = 'none';
    if (iconSun)  iconSun.style.display  = 'block';
  }
  function applyDark() {
    document.body.classList.remove('light-mode');
    if (iconMoon) iconMoon.style.display = 'block';
    if (iconSun)  iconSun.style.display  = 'none';
  }

  themeToggle?.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-mode');
    if (isLight) {
      applyDark();
      localStorage.setItem('la10-theme', 'dark');
      showToast('🌙 Mode sombre activé');
    } else {
      applyLight();
      localStorage.setItem('la10-theme', 'light');
      showToast('☀️ Mode clair activé');
    }
  });


  /* ════════════════════════════════════════════════════════
     2. EMAILJS — FORMULAIRE DE CONTACT
  ════════════════════════════════════════════════════════ */
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const btnText   = document.getElementById('form-btn-text');
  const btnIcon   = document.getElementById('form-btn-icon');
  const btnSpinner= document.getElementById('form-btn-spinner');
  const successEl = document.getElementById('form-success');
  const errorEl   = document.getElementById('form-error');

  // Init EmailJS
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'VOTRE_PUBLIC_KEY') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // UI — loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Envoi en cours…';
    if (btnIcon)    btnIcon.style.display    = 'none';
    if (btnSpinner) btnSpinner.style.display = 'block';
    successEl?.classList.remove('show');
    errorEl?.classList.remove('show');

    const fname   = document.getElementById('fname')?.value   || '';
    const lname   = document.getElementById('lname')?.value   || '';
    const email   = document.getElementById('email')?.value   || '';
    const service = document.getElementById('service')?.value || '';
    const message = document.getElementById('message')?.value || '';

    const templateParams = {
      from_name:  `${fname} ${lname}`.trim(),
      from_email: email,
      service:    service || 'Non spécifié',
      message:    message,
      to_email:   'contact@la10agence.com',
    };

    try {
      // If EmailJS is configured, send real email
      if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'VOTRE_PUBLIC_KEY') {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      } else {
        // Fallback simulation (remove when EmailJS is configured)
        await new Promise(r => setTimeout(r, 1500));
      }

      // Success
      form.reset();
      successEl?.classList.add('show');
      showToast('✓ Message envoyé avec succès !', 'success');

      // GA event tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          event_category: 'Contact',
          event_label: service || 'General',
        });
      }

      setTimeout(() => successEl?.classList.remove('show'), 6000);

    } catch (err) {
      console.error('EmailJS error:', err);
      errorEl?.classList.add('show');
      showToast('✗ Erreur d\'envoi. Réessayez.', 'error');
      setTimeout(() => errorEl?.classList.remove('show'), 6000);
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Envoyer le message';
      if (btnIcon)    btnIcon.style.display    = 'block';
      if (btnSpinner) btnSpinner.style.display = 'none';
    }
  });


  /* ════════════════════════════════════════════════════════
     3. TOAST NOTIFICATIONS
  ════════════════════════════════════════════════════════ */
  let toastTimer = null;

  function showToast(message, type = '') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    if (toastTimer) clearTimeout(toastTimer);

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  /* ════════════════════════════════════════════════════════
     4. 3D TILT EFFECT ON TESTIMONIAL CARDS
  ════════════════════════════════════════════════════════ */
  document.querySelectorAll('.tem-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5;
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltX  = y * -12;   // vertical tilt
      const tiltY  = x *  12;   // horizontal tilt
      const shine  = `radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(127,255,0,0.08) 0%, transparent 65%)`;

      card.style.transform   = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
      card.style.background  = `linear-gradient(145deg, #161616 0%, #0d0d0d 100%), ${shine}`;
      card.style.backgroundBlendMode = 'normal';

      // Dynamic shine overlay
      let shineEl = card.querySelector('.tem-card-shine');
      if (!shineEl) {
        shineEl = document.createElement('div');
        shineEl.className = 'tem-card-shine';
        shineEl.style.cssText = `
          position:absolute; inset:0; border-radius:inherit;
          pointer-events:none; z-index:1; transition: opacity 0.1s;
        `;
        card.appendChild(shineEl);
      }
      shineEl.style.background = `radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(127,255,0,0.07) 0%, transparent 65%)`;
      shineEl.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s ease, border-color 0.3s ease';
      card.style.background = '';
      const shineEl = card.querySelector('.tem-card-shine');
      if (shineEl) shineEl.style.opacity = '0';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.15s ease, box-shadow 0.3s ease, border-color 0.3s ease';
    });
  });

  /* ════════════════════════════════════════════════════════
     5. TESTIMONIALS HORIZONTAL SCROLL + DRAG
  ════════════════════════════════════════════════════════ */
  const track    = document.getElementById('tem-track');
  const prevBtn  = document.getElementById('tem-prev');
  const nextBtn  = document.getElementById('tem-next');
  const progBar  = document.getElementById('tem-progress-bar');

  if (track) {
    const CARD_W = 316; // card width + gap

    // Update progress bar
    function updateProgress() {
      const max = track.scrollWidth - track.clientWidth;
      const pct = max > 0 ? (track.scrollLeft / max) * 100 : 0;
      if (progBar) progBar.style.width = pct + '%';
    }

    // Scroll by card width
    prevBtn?.addEventListener('click', () => {
      track.scrollBy({ left: -CARD_W, behavior: 'smooth' });
    });
    nextBtn?.addEventListener('click', () => {
      track.scrollBy({ left: CARD_W, behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateProgress, { passive: true });

    // Drag to scroll
    let isDragging = false, startX = 0, scrollLeft = 0;
    track.addEventListener('mousedown', e => {
      isDragging = true; startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft; track.style.cursor = 'grabbing';
    });
    document.addEventListener('mouseup', () => {
      isDragging = false; track.style.cursor = 'grab';
    });
    track.addEventListener('mousemove', e => {
      if (!isDragging) return;
      e.preventDefault();
      const x    = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) track.scrollBy({ left: diff > 0 ? CARD_W : -CARD_W, behavior: 'smooth' });
    });

    // Init progress
    updateProgress();
  }

  /* ════════════════════════════════════════════════════════
     6. EXPOSE GLOBALS
  ════════════════════════════════════════════════════════ */
  window.showToast = showToast;

});
