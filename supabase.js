/* ══════════════════════════════════════════════════════════════
   SUPABASE.JS — La 10 Agence
   Shared Supabase client for the public website
   Loads projets, temoignages, equipe from the database
══════════════════════════════════════════════════════════════ */

const SUPA_URL = 'https://wkjzzrgzoyfiytabeidn.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indranp6cmd6b3lmaXl0YWJlaWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzQwOTgsImV4cCI6MjA5NDM1MDA5OH0.Lk50X1OQ7qWpqDRUoj1zP4cPkxzHszTUWtx4giMeo_g';

const db = {
  headers: {
    'apikey': SUPA_KEY,
    'Authorization': `Bearer ${SUPA_KEY}`,
  },
  async get(table, params = '') {
    try {
      const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${params}`, { headers: this.headers });
      if (!r.ok) return [];
      return await r.json();
    } catch(e) { console.error('DB error:', e); return []; }
  }
};

/* ══════════════════════════════════════════════════════════
   LOAD PROJETS → projets.html
══════════════════════════════════════════════════════════ */
async function loadProjetsSite() {
  const grid = document.getElementById('projets-grid');
  if (!grid) return;

  const projets = await db.get('projets', 'order=ordre.asc,created_at.desc');
  if (!projets.length) return; // keep static fallback

  // Clear existing static cards
  grid.innerHTML = '';

  projets.forEach((p, i) => {
    const isLarge = i === 0; // first project is large
    const card    = document.createElement('div');
    card.className  = `projet-card${isLarge ? ' projet-large' : ''}`;
    card.setAttribute('data-category', p.categorie || '');

    const tags    = (p.tags || []).map(t => `<span>${t}</span>`).join('');
    const isVideo = p.video_url && p.video_url.match(/\.(mp4|webm)/i);
    const isImg   = p.image_url && !isVideo;

    let mediaHtml = '';
    if (isVideo) {
      mediaHtml = `
        <video class="projet-video" muted loop playsinline poster="${p.image_url||''}">
          <source src="${p.video_url}" type="video/mp4"/>
        </video>`;
    } else if (isImg) {
      mediaHtml = `
        <img src="${p.image_url}" alt="${p.titre||''}" class="projet-img"
             onerror="this.parentElement.classList.add('no-img')"/>`;
    }

    card.innerHTML = `
      <div class="projet-media">
        ${mediaHtml}
        <div class="projet-placeholder">
          <span class="placeholder-num">${String(i+1).padStart(2,'0')}</span>
          <span class="placeholder-label">Image à venir</span>
        </div>
        <div class="projet-overlay">
          <div class="projet-overlay-content">
            <span class="projet-voir">Voir le projet ↗</span>
          </div>
        </div>
      </div>
      <div class="projet-info">
        <div class="projet-tags">${tags}</div>
        <h3 class="projet-titre">${p.titre||'Projet'}</h3>
        <p class="projet-desc">${p.description||''}</p>
        ${p.lien && p.lien !== '#' ? `
        <a href="${p.lien}" target="_blank" class="projet-lien">
          Voir le projet
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M9 3l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>` : ''}
      </div>`;

    // Video hover play
    if (isVideo) {
      const vid = card.querySelector('.projet-video');
      card.addEventListener('mouseenter', () => vid?.play().catch(()=>{}));
      card.addEventListener('mouseleave', () => { if(vid){vid.pause();vid.currentTime=0;} });
    }

    // Click → open link
    if (p.lien && p.lien !== '#') {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => window.open(p.lien, '_blank'));
    }

    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════════════════════════
   LOAD TÉMOIGNAGES → index.html
══════════════════════════════════════════════════════════ */
async function loadTemoignagesSite() {
  const masonry = document.querySelector('.tem-masonry');
  if (!masonry) return;

  const items = await db.get('temoignages', 'visible=eq.true&order=created_at.asc');
  if (!items.length) return;

  // Split into 3 columns
  const cols = [[], [], []];
  items.forEach((t, i) => cols[i % 3].push(t));

  // Build Google icon SVG
  const gIcon = `<svg class="tem-google-icon" width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;

  masonry.innerHTML = cols.map((col, ci) => `
    <div class="tem-col">
      ${col.map((t, ti) => {
        const isFeatured = ci === 0 && ti === 0;
        return isFeatured ? `
          <div class="tem-card tem-card-featured">
            <div class="tem-card-bar"></div>
            <div class="tem-card-quote">❝</div>
            <p>${t.texte||''}</p>
            <div class="tem-card-footer">
              <div class="tem-card-stars">${'★'.repeat(t.stars||5)}</div>
              <div class="tem-card-author">
                <div class="tem-avatar" style="background:${t.avatar_couleur||'linear-gradient(135deg,#7fff00,#3a7a00)'}">
                  ${t.avatar_initiales||'?'}
                </div>
                <div>
                  <strong>${t.nom||''}</strong>
                  <span>${t.role||''} ${t.entreprise?'— '+t.entreprise:''}</span>
                </div>
              </div>
            </div>
          </div>` : `
          <div class="tem-card">
            <div class="tem-card-stars">${'★'.repeat(t.stars||5)}</div>
            <p>${t.texte||''}</p>
            <div class="tem-card-author">
              <div class="tem-avatar" style="background:${t.avatar_couleur||'linear-gradient(135deg,#666,#333)'}">
                ${t.avatar_initiales||'?'}
              </div>
              <div>
                <strong>${t.nom||''}</strong>
                <span>${t.entreprise||t.role||''}</span>
              </div>
              ${gIcon}
            </div>
          </div>`;
      }).join('')}
    </div>`).join('');

  // Re-apply 3D tilt if features.js is loaded
  if (typeof window.apply3DTilt === 'function') window.apply3DTilt();
}

/* ══════════════════════════════════════════════════════════
   LOAD ÉQUIPE → index.html
══════════════════════════════════════════════════════════ */
async function loadEquipeSite() {
  const grid     = document.querySelector('.team-grid');
  const namesBg  = document.querySelector('.team-names-bg');
  if (!grid) return;

  const membres = await db.get('equipe', 'order=ordre.asc');
  if (!membres.length) return;

  // Rebuild team cards
  grid.innerHTML = membres.map((m, i) => `
    <div class="team-card"
         data-index="${i}"
         data-name="${m.nom||''}"
         data-role="${m.role||''}"
         data-bio="${(m.bio||'').replace(/"/g,'&quot;')}"
         data-img="${m.image_url||''}">
      <div class="tcard-img-wrap">
        ${m.image_url
          ? `<img src="${m.image_url}" alt="${m.nom||''}" loading="lazy"
                  onerror="this.style.display='none'">`
          : `<div style="width:100%;height:100%;background:var(--black-3);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:rgba(127,255,0,0.2)">${(m.nom||'M')[0]}</div>`
        }
        <div class="tcard-overlay"></div>
      </div>
      <div class="tcard-info">
        <span class="tcard-name">${m.nom||''}</span>
        <span class="tcard-role">${m.role||''}</span>
      </div>
    </div>`).join('');

  // Rebuild scrolling names
  if (namesBg) {
    const noms = membres.map(m => m.nom||'').filter(Boolean);
    const makeSep = () => '<span class="tsep">✦</span>';
    const makeRow = (arr) => arr.map((n,i) =>
      `<span data-member="${i}">${n}</span>${makeSep()}`).join('');
    const doubled = [...noms, ...noms];

    namesBg.innerHTML = `
      <div class="team-names-row">${makeRow(doubled)}</div>
      <div class="team-names-row">${makeRow([...doubled].reverse())}</div>
      <div class="team-names-row">${makeRow(doubled)}</div>`;
  }

  // Re-init team.js spotlight
  if (typeof window.initTeamSpotlight === 'function') {
    window.initTeamSpotlight();
  }
}

/* ══════════════════════════════════════════════════════════
   LOAD TEXTES → apply to page elements
══════════════════════════════════════════════════════════ */
async function loadTextesSite() {
  const textes = await db.get('textes');
  if (!textes.length) return;

  const map = {};
  textes.forEach(t => { map[t.id] = t.valeur; });

  const apply = (selector, value, attr = 'textContent') => {
    if (!value) return;
    const el = document.querySelector(selector);
    if (el) el[attr] = value;
  };

  // Apply texts to the page
  if (map.contact_email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      a.href        = `mailto:${map.contact_email}`;
      a.textContent = map.contact_email;
    });
  }
  if (map.contact_tel) {
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      a.href        = `tel:${map.contact_tel.replace(/\s/g,'')}`;
      a.textContent = map.contact_tel;
    });
  }
}

/* ══════════════════════════════════════════════════════════
   AUTO INIT on DOMContentLoaded
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Detect which page we're on
  const isProjetPage = !!document.getElementById('projets-grid');
  const isIndexPage  = !!document.querySelector('.tem-masonry');

  if (isProjetPage) {
    loadProjetsSite();
  }
  if (isIndexPage) {
    loadTemoignagesSite();
    loadEquipeSite();
    loadTextesSite();
  }
});
