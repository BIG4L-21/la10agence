/* ══════════════════════════════════════════════════════════════
   ADMIN.JS — La 10 Agence
   Full admin dashboard powered by Supabase
══════════════════════════════════════════════════════════════ */

/* ─── Supabase Config ────────────────────────────────────── */
const SUPABASE_URL = 'https://wkjzzrgzoyfiytabeidn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indranp6cmd6b3lmaXl0YWJlaWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzQwOTgsImV4cCI6MjA5NDM1MDA5OH0.Lk50X1OQ7qWpqDRUoj1zP4cPkxzHszTUWtx4giMeo_g';

/* ─── Supabase API helpers ───────────────────────────────── */
const api = {
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  },

  async get(table, params = '') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}&order=created_at.desc`, { headers: this.headers });
    return r.json();
  },
  async insert(table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...this.headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(data)
    });
    return r.json();
  },
  async update(table, id, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...this.headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(data)
    });
    return r.json();
  },
  async upsert(table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...this.headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(data)
    });
    return r.json();
  },
  async delete(table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE', headers: this.headers
    });
  },

  // Auth
  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ email, password })
    });
    return r.json();
  },
  async signOut(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${token}` }
    });
  }
};

/* ─── State ──────────────────────────────────────────────── */
let authToken = localStorage.getItem('la10_admin_token');
let currentPage = 'overview';

/* ─── DOM refs ───────────────────────────────────────────── */
const loginScreen = document.getElementById('login-screen');
const dashboard   = document.getElementById('dashboard');
const loginForm   = document.getElementById('login-form');
const loginError  = document.getElementById('login-error');
const loginBtn    = document.getElementById('login-btn');
const logoutBtn   = document.getElementById('logout-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modal       = document.getElementById('modal');
const modalTitle  = document.getElementById('modal-title');
const modalBody   = document.getElementById('modal-body');
const modalClose  = document.getElementById('modal-close');
const toast       = document.getElementById('admin-toast');

/* ══════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════ */
async function checkAuth() {
  if (authToken) {
    showDashboard();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginScreen.style.display = 'flex';
  dashboard.style.display   = 'none';
}

function showDashboard() {
  loginScreen.style.display = 'none';
  dashboard.style.display   = 'grid';
  loadPage('overview');
  updateDate();
  loadStats();
  loadUnreadCount();
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email    = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  loginBtn.disabled = true;
  loginBtn.querySelector('span').textContent = 'Connexion...';
  loginError.textContent = '';

  const data = await api.signIn(email, password);
  if (data.access_token) {
    authToken = data.access_token;
    localStorage.setItem('la10_admin_token', authToken);
    // Update auth header
    api.headers['Authorization'] = `Bearer ${authToken}`;

    // Show user info
    const emailDisplay = document.getElementById('user-email-display');
    const userAvatar   = document.getElementById('user-avatar');
    if (emailDisplay) emailDisplay.textContent = email.split('@')[0];
    if (userAvatar)   userAvatar.textContent   = email[0].toUpperCase();

    showDashboard();
  } else {
    loginError.textContent = 'Email ou mot de passe incorrect.';
  }

  loginBtn.disabled = false;
  loginBtn.querySelector('span').textContent = 'Se connecter';
});

logoutBtn.addEventListener('click', async () => {
  await api.signOut(authToken);
  authToken = null;
  localStorage.removeItem('la10_admin_token');
  showLogin();
});

/* ══════════════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════════════ */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadPage(btn.dataset.page);
  });
});

function loadPage(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');

  switch(page) {
    case 'overview':    loadStats(); loadRecentData(); break;
    case 'projets':     loadProjets(); break;
    case 'temoignages': loadTemoignages(); break;
    case 'equipe':      loadEquipe(); break;
    case 'textes':      loadTextes(); break;
    case 'messages':    loadMessages(); break;
  }
}

function updateDate() {
  const el = document.getElementById('current-date');
  if (el) el.textContent = new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

/* ══════════════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════════════ */
async function loadStats() {
  try {
    const [projets, temoignages, equipe, messages] = await Promise.all([
      api.get('projets', 'select=id'),
      api.get('temoignages', 'select=id'),
      api.get('equipe', 'select=id'),
      api.get('messages', 'select=id&lu=eq.false'),
    ]);

    document.getElementById('stat-projets').textContent     = projets.length || 0;
    document.getElementById('stat-temoignages').textContent = temoignages.length || 0;
    document.getElementById('stat-equipe').textContent      = equipe.length || 0;
    document.getElementById('stat-messages').textContent    = messages.length || 0;

    updateMsgBadge(messages.length || 0);
  } catch(e) { console.error(e); }
}

function updateMsgBadge(count) {
  const badge = document.getElementById('msg-badge');
  if (!badge) return;
  badge.textContent   = count;
  badge.style.display = count > 0 ? 'inline' : 'none';
}

async function loadUnreadCount() {
  const msgs = await api.get('messages', 'select=id&lu=eq.false');
  updateMsgBadge(Array.isArray(msgs) ? msgs.length : 0);
}

async function loadRecentData() {
  // Recent projets
  const projets = await api.get('projets', 'select=titre,created_at&limit=5');
  const rp = document.getElementById('recent-projets');
  if (rp) {
    if (!projets.length) { rp.innerHTML = '<div class="loading-state">Aucun projet</div>'; return; }
    rp.innerHTML = projets.map(p => `
      <div class="recent-item">
        <div class="recent-dot"></div>
        <span class="recent-item-title">${p.titre || 'Sans titre'}</span>
        <span class="recent-item-date">${formatDate(p.created_at)}</span>
      </div>`).join('');
  }

  // Recent messages
  const msgs = await api.get('messages', 'select=nom,email,created_at&limit=5');
  const rm = document.getElementById('recent-messages');
  if (rm) {
    if (!msgs.length) { rm.innerHTML = '<div class="loading-state">Aucun message</div>'; return; }
    rm.innerHTML = msgs.map(m => `
      <div class="recent-item">
        <div class="recent-dot" style="background:var(--blue)"></div>
        <span class="recent-item-title">${m.nom || 'Anonyme'}</span>
        <span class="recent-item-date">${formatDate(m.created_at)}</span>
      </div>`).join('');
  }
}

/* ══════════════════════════════════════════════════════════
   PROJETS
══════════════════════════════════════════════════════════ */
async function loadProjets() {
  const list = document.getElementById('projets-list');
  list.innerHTML = '<div class="loading-state">Chargement...</div>';

  const projets = await api.get('projets');
  document.getElementById('projets-count').textContent = projets.length || 0;

  if (!projets.length) {
    list.innerHTML = `<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M17 13v8M13 17h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg><p>Aucun projet. Créez votre premier projet !</p></div>`;
    return;
  }

  list.innerHTML = projets.map(p => `
    <div class="item-card">
      <div class="item-card-img">
        ${p.image_url
          ? `<img src="${p.image_url}" alt="${p.titre}" onerror="this.parentElement.innerHTML='<div class=item-card-img-placeholder>${(p.titre||'P')[0]}</div>'">`
          : `<div class="item-card-img-placeholder">${(p.titre||'P')[0]}</div>`}
      </div>
      <div class="item-card-body">
        <div class="item-card-title">${p.titre || 'Sans titre'}</div>
        <div class="item-card-sub">${p.description ? p.description.slice(0,80)+'...' : 'Pas de description'}</div>
        <div class="item-card-tags">
          ${p.categorie ? `<span class="item-tag">${p.categorie}</span>` : ''}
          ${(p.tags||[]).slice(0,2).map(t => `<span class="item-tag">${t}</span>`).join('')}
        </div>
        <div class="item-card-actions">
          <button class="btn-edit" onclick="editProjet('${p.id}')">✏️ Modifier</button>
          <button class="btn-delete" onclick="deleteItem('projets','${p.id}',loadProjets)">🗑</button>
        </div>
      </div>
    </div>`).join('');
}

document.getElementById('btn-add-projet')?.addEventListener('click', () => openProjetModal());

function openProjetModal(projet = null) {
  modalTitle.textContent = projet ? 'Modifier le projet' : 'Nouveau projet';
  modalBody.innerHTML = `
    <div class="field-group"><label>Titre *</label><input type="text" id="f-titre" value="${projet?.titre||''}" placeholder="Nom du projet" required/></div>
    <div class="modal-row">
      <div class="field-group"><label>Catégorie</label>
        <select id="f-categorie">
          <option value="">Choisir...</option>
          ${['branding','design','web','marketing','social','video','print'].map(c => `<option value="${c}" ${projet?.categorie===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="field-group"><label>Lien du projet</label><input type="url" id="f-lien" value="${projet?.lien||''}" placeholder="https://..."/></div>
    </div>
    <div class="field-group"><label>Description</label><textarea id="f-description" placeholder="Décrivez le projet...">${projet?.description||''}</textarea></div>
    <div class="field-group"><label>URL Image</label><input type="url" id="f-image" value="${projet?.image_url||''}" placeholder="https://... ou projets/nom.jpg"/></div>
    <div class="field-group"><label>URL Vidéo (optionnel)</label><input type="url" id="f-video" value="${projet?.video_url||''}" placeholder="https://..."/></div>
    <div class="field-group"><label>Tags (séparés par virgule)</label><input type="text" id="f-tags" value="${(projet?.tags||[]).join(', ')}" placeholder="branding, logo, print"/></div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Annuler</button>
      <button class="btn-save" onclick="saveProjet('${projet?.id||''}')">💾 Sauvegarder</button>
    </div>`;
  openModal();
}

async function saveProjet(id) {
  const data = {
    titre:       document.getElementById('f-titre').value.trim(),
    categorie:   document.getElementById('f-categorie').value,
    description: document.getElementById('f-description').value.trim(),
    lien:        document.getElementById('f-lien').value.trim(),
    image_url:   document.getElementById('f-image').value.trim(),
    video_url:   document.getElementById('f-video').value.trim(),
    tags:        document.getElementById('f-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
  };
  if (!data.titre) { showToast('Le titre est requis', 'error'); return; }

  if (id) { await api.update('projets', id, data); }
  else     { await api.insert('projets', data); }

  closeModal();
  showToast('✓ Projet sauvegardé !', 'success');
  loadProjets();
  loadStats();
}

async function editProjet(id) {
  const data = await api.get('projets', `id=eq.${id}`);
  openProjetModal(data[0]);
}

/* ══════════════════════════════════════════════════════════
   TÉMOIGNAGES
══════════════════════════════════════════════════════════ */
async function loadTemoignages() {
  const list = document.getElementById('temoignages-list');
  list.innerHTML = '<div class="loading-state">Chargement...</div>';

  const items = await api.get('temoignages');
  document.getElementById('temoignages-count').textContent = items.length || 0;

  if (!items.length) {
    list.innerHTML = '<div class="empty-state"><p>Aucun témoignage. Créez le premier !</p></div>';
    return;
  }

  list.innerHTML = items.map(t => `
    <div class="list-item">
      <div class="list-item-avatar" style="background:${t.avatar_couleur||'linear-gradient(135deg,#7fff00,#3a7a00)'}">
        ${t.avatar_initiales||'?'}
      </div>
      <div class="list-item-body">
        <div class="list-item-name">${t.nom||'Anonyme'} <span style="color:var(--gray);font-weight:400;font-size:0.78rem">— ${t.entreprise||''}</span></div>
        <div class="list-item-stars">${'★'.repeat(t.stars||5)}</div>
        <div class="list-item-text">${t.texte||''}</div>
      </div>
      <div class="list-item-actions">
        <span class="list-item-visible ${t.visible?'on':'off'}">${t.visible?'Visible':'Masqué'}</span>
        <button class="btn-edit" onclick="editTemoignage('${t.id}')">✏️</button>
        <button class="btn-delete" onclick="deleteItem('temoignages','${t.id}',loadTemoignages)">🗑</button>
      </div>
    </div>`).join('');
}

document.getElementById('btn-add-temoignage')?.addEventListener('click', () => openTemoignageModal());

function openTemoignageModal(t = null) {
  modalTitle.textContent = t ? 'Modifier le témoignage' : 'Nouveau témoignage';
  modalBody.innerHTML = `
    <div class="modal-row">
      <div class="field-group"><label>Nom *</label><input type="text" id="f-nom" value="${t?.nom||''}" placeholder="Prénom Nom" required/></div>
      <div class="field-group"><label>Entreprise</label><input type="text" id="f-entreprise" value="${t?.entreprise||''}" placeholder="Nom de l'entreprise"/></div>
    </div>
    <div class="modal-row">
      <div class="field-group"><label>Rôle / Titre</label><input type="text" id="f-role" value="${t?.role||''}" placeholder="Directeur Marketing"/></div>
      <div class="field-group"><label>Note (étoiles)</label>
        <select id="f-stars">${[5,4,3,2,1].map(s=>`<option value="${s}" ${(t?.stars||5)===s?'selected':''}>${s} étoiles</option>`).join('')}</select>
      </div>
    </div>
    <div class="field-group"><label>Témoignage *</label><textarea id="f-texte" placeholder="Texte du témoignage...">${t?.texte||''}</textarea></div>
    <div class="modal-row">
      <div class="field-group"><label>Initiales avatar</label><input type="text" id="f-initiales" value="${t?.avatar_initiales||''}" placeholder="RA" maxlength="3"/></div>
      <div class="field-group"><label>Couleur avatar</label><input type="text" id="f-couleur" value="${t?.avatar_couleur||'linear-gradient(135deg,#7fff00,#3a7a00)'}" placeholder="linear-gradient(...)"/></div>
    </div>
    <div class="field-group">
      <label>Visibilité</label>
      <select id="f-visible">
        <option value="true" ${t?.visible!==false?'selected':''}>Visible sur le site</option>
        <option value="false" ${t?.visible===false?'selected':''}>Masqué</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Annuler</button>
      <button class="btn-save" onclick="saveTemoignage('${t?.id||''}')">💾 Sauvegarder</button>
    </div>`;
  openModal();
}

async function saveTemoignage(id) {
  const data = {
    nom:               document.getElementById('f-nom').value.trim(),
    entreprise:        document.getElementById('f-entreprise').value.trim(),
    role:              document.getElementById('f-role').value.trim(),
    texte:             document.getElementById('f-texte').value.trim(),
    stars:             parseInt(document.getElementById('f-stars').value),
    avatar_initiales:  document.getElementById('f-initiales').value.trim(),
    avatar_couleur:    document.getElementById('f-couleur').value.trim(),
    visible:           document.getElementById('f-visible').value === 'true',
  };
  if (!data.nom || !data.texte) { showToast('Nom et texte requis', 'error'); return; }

  if (id) { await api.update('temoignages', id, data); }
  else     { await api.insert('temoignages', data); }

  closeModal();
  showToast('✓ Témoignage sauvegardé !', 'success');
  loadTemoignages();
  loadStats();
}

async function editTemoignage(id) {
  const data = await api.get('temoignages', `id=eq.${id}`);
  openTemoignageModal(data[0]);
}

/* ══════════════════════════════════════════════════════════
   ÉQUIPE
══════════════════════════════════════════════════════════ */
async function loadEquipe() {
  const list = document.getElementById('equipe-list');
  list.innerHTML = '<div class="loading-state">Chargement...</div>';

  const items = await api.get('equipe', 'order=ordre.asc');
  document.getElementById('equipe-count').textContent = items.length || 0;

  if (!items.length) {
    list.innerHTML = '<div class="empty-state"><p>Aucun membre. Ajoutez le premier !</p></div>';
    return;
  }

  list.innerHTML = items.map(m => `
    <div class="item-card">
      <div class="item-card-img">
        ${m.image_url
          ? `<img src="${m.image_url}" alt="${m.nom}" onerror="this.parentElement.innerHTML='<div class=item-card-img-placeholder>${(m.nom||'M')[0]}</div>'">`
          : `<div class="item-card-img-placeholder">${(m.nom||'M')[0]}</div>`}
      </div>
      <div class="item-card-body">
        <div class="item-card-title">${m.nom||'Membre'}</div>
        <div class="item-card-sub">${m.role||'Rôle'}</div>
        <div class="item-card-sub" style="font-size:0.75rem;color:var(--gray)">${m.bio?m.bio.slice(0,60)+'...':''}</div>
        <div class="item-card-actions" style="margin-top:0.75rem">
          <button class="btn-edit" onclick="editMembre('${m.id}')">✏️ Modifier</button>
          <button class="btn-delete" onclick="deleteItem('equipe','${m.id}',loadEquipe)">🗑</button>
        </div>
      </div>
    </div>`).join('');
}

document.getElementById('btn-add-membre')?.addEventListener('click', () => openMembreModal());

function openMembreModal(m = null) {
  modalTitle.textContent = m ? 'Modifier le membre' : 'Nouveau membre';
  modalBody.innerHTML = `
    <div class="modal-row">
      <div class="field-group"><label>Nom *</label><input type="text" id="f-nom" value="${m?.nom||''}" placeholder="Prénom Nom" required/></div>
      <div class="field-group"><label>Rôle *</label><input type="text" id="f-role" value="${m?.role||''}" placeholder="Directeur Créatif"/></div>
    </div>
    <div class="field-group"><label>Bio</label><textarea id="f-bio" placeholder="Courte présentation...">${m?.bio||''}</textarea></div>
    <div class="field-group"><label>URL Photo</label><input type="url" id="f-image" value="${m?.image_url||''}" placeholder="https://... ou team/photo.jpg"/></div>
    <div class="field-group"><label>Ordre d'affichage</label><input type="number" id="f-ordre" value="${m?.ordre||0}" min="0"/></div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Annuler</button>
      <button class="btn-save" onclick="saveMembre('${m?.id||''}')">💾 Sauvegarder</button>
    </div>`;
  openModal();
}

async function saveMembre(id) {
  const data = {
    nom:       document.getElementById('f-nom').value.trim(),
    role:      document.getElementById('f-role').value.trim(),
    bio:       document.getElementById('f-bio').value.trim(),
    image_url: document.getElementById('f-image').value.trim(),
    ordre:     parseInt(document.getElementById('f-ordre').value) || 0,
  };
  if (!data.nom) { showToast('Le nom est requis', 'error'); return; }

  if (id) { await api.update('equipe', id, data); }
  else     { await api.insert('equipe', data); }

  closeModal();
  showToast('✓ Membre sauvegardé !', 'success');
  loadEquipe();
  loadStats();
}

async function editMembre(id) {
  const data = await api.get('equipe', `id=eq.${id}`);
  openMembreModal(data[0]);
}

/* ══════════════════════════════════════════════════════════
   TEXTES DU SITE
══════════════════════════════════════════════════════════ */
const TEXTES_CONFIG = [
  { id: 'hero_titre',       label: 'Titre principal (Hero)',       placeholder: 'Nous créons des marques qui se démarquent.' },
  { id: 'hero_sous_titre',  label: 'Sous-titre (Hero)',            placeholder: 'Branding, design, web & marketing digital...' },
  { id: 'about_texte1',     label: 'À propos — Paragraphe 1',      placeholder: 'Nous accompagnons les entreprises...' },
  { id: 'about_texte2',     label: 'À propos — Paragraphe 2',      placeholder: 'Notre approche mêle créativité...' },
  { id: 'cta_titre',        label: 'CTA — Titre',                  placeholder: 'Prêt à transformer votre image digitale ?' },
  { id: 'cta_sous_titre',   label: 'CTA — Sous-titre',             placeholder: 'Discutons de votre projet...' },
  { id: 'footer_tagline',   label: 'Footer — Tagline',             placeholder: 'Agence de communication visuelle...' },
  { id: 'contact_email',    label: 'Email de contact',             placeholder: 'contact@la10agence.com' },
  { id: 'contact_tel',      label: 'Téléphone',                    placeholder: '+33 6 42 80 61 15' },
  { id: 'contact_adresse',  label: 'Adresse',                      placeholder: '13 Avenue Gambetta, 23000 Guéret' },
];

async function loadTextes() {
  const list = document.getElementById('textes-list');
  list.innerHTML = '<div class="loading-state">Chargement...</div>';

  const data = await api.get('textes');
  const map  = {};
  (data||[]).forEach(t => { map[t.id] = t.valeur; });

  list.innerHTML = TEXTES_CONFIG.map(t => `
    <div class="texte-item">
      <label>${t.label}</label>
      <textarea id="texte-${t.id}" placeholder="${t.placeholder}">${map[t.id]||''}</textarea>
    </div>`).join('');
}

document.getElementById('btn-save-textes')?.addEventListener('click', async () => {
  const rows = TEXTES_CONFIG.map(t => ({
    id:         t.id,
    valeur:     document.getElementById(`texte-${t.id}`)?.value || '',
    updated_at: new Date().toISOString(),
  }));

  await api.upsert('textes', rows);
  showToast('✓ Textes sauvegardés !', 'success');
});

/* ══════════════════════════════════════════════════════════
   MESSAGES
══════════════════════════════════════════════════════════ */
async function loadMessages() {
  const list = document.getElementById('messages-list');
  list.innerHTML = '<div class="loading-state">Chargement...</div>';

  const items = await api.get('messages');
  const unread = items.filter(m => !m.lu).length;
  document.getElementById('messages-count').textContent = items.length || 0;
  updateMsgBadge(unread);

  if (!items.length) {
    list.innerHTML = '<div class="empty-state"><p>Aucun message reçu.</p></div>';
    return;
  }

  list.innerHTML = items.map(m => `
    <div class="message-item ${m.lu?'':'unread'}">
      <div class="message-header">
        <span class="message-name">${m.nom||'Anonyme'}</span>
        <span class="message-email">${m.email||''}</span>
        ${m.service ? `<span class="message-service">${m.service}</span>` : ''}
        <span class="message-date">${formatDate(m.created_at)}</span>
      </div>
      <div class="message-text">${m.message||''}</div>
      <div class="message-actions">
        ${!m.lu ? `<button class="btn-read" onclick="markRead('${m.id}')">✓ Marquer comme lu</button>` : '<span style="font-size:0.75rem;color:var(--gray)">✓ Lu</span>'}
        <button class="btn-delete" onclick="deleteItem('messages','${m.id}',loadMessages)" style="margin-left:auto">🗑 Supprimer</button>
      </div>
    </div>`).join('');
}

async function markRead(id) {
  await api.update('messages', id, { lu: true });
  loadMessages();
  loadStats();
}

document.getElementById('btn-mark-all-read')?.addEventListener('click', async () => {
  const items = await api.get('messages', 'select=id&lu=eq.false');
  await Promise.all(items.map(m => api.update('messages', m.id, { lu: true })));
  loadMessages();
  loadStats();
  showToast('✓ Tous les messages marqués comme lus', 'success');
});

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
async function deleteItem(table, id, reloadFn) {
  if (!confirm('Confirmer la suppression ?')) return;
  await api.delete(table, id);
  showToast('✓ Supprimé', 'success');
  reloadFn();
  loadStats();
}

function openModal() {
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

let toastTimer = null;
function showToast(msg, type = '') {
  toast.textContent = msg;
  toast.className   = `admin-toast ${type} show`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'admin-toast'; }, 3500);
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
}

// Expose for inline onclick
window.editProjet      = editProjet;
window.editTemoignage  = editTemoignage;
window.editMembre      = editMembre;
window.deleteItem      = deleteItem;
window.saveProjet      = saveProjet;
window.saveTemoignage  = saveTemoignage;
window.saveMembre      = saveMembre;
window.closeModal      = closeModal;
window.markRead        = markRead;

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
checkAuth();
