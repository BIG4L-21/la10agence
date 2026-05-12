/* ═══════════════════════════════════════════════════════════════
   LA 10 AGENCE — CHATBOT.JS
   Powered by Claude (Anthropic API)
═══════════════════════════════════════════════════════════════ */

(() => {
  /* ─── State ─────────────────────────────────────────────── */
  let isOpen      = false;
  let isThinking  = false;
  let conversationHistory = [];   // full history for multi-turn context

  /* ─── DOM refs ───────────────────────────────────────────── */
  const trigger     = document.getElementById('chat-trigger');
  const panel       = document.getElementById('chat-panel');
  const messagesEl  = document.getElementById('chat-messages');
  const inputEl     = document.getElementById('chat-input');
  const sendBtn     = document.getElementById('chat-send');
  const closeBtn    = document.getElementById('chat-header-close');
  const suggestions = document.getElementById('chat-suggestions');
  const notifDot    = trigger.querySelector('.chat-notif-dot');
  const openIcon    = trigger.querySelector('.chat-open-icon');
  const closeIcon   = trigger.querySelector('.chat-close-icon');

  /* ─── System prompt — La 10 Agence knowledge ────────────── */
  const SYSTEM_PROMPT = `Tu es l'assistant virtuel de La 10 Agence, une agence de communication visuelle pluridisciplinaire basée à Guéret, France (13 Avenue Gambetta, 23000).

**À propos de l'agence :**
- Fondée par une équipe internationale (FR, ES, EN, AR)
- Spécialisée en : Branding, Design Graphique, Développement Web, Marketing Digital, SEO, Social Media, Email Marketing
- Plus de 120 projets livrés, 8+ ans d'expérience, présente dans 4 pays
- Clients notables : Patagonia, Brahma, Corona, Renault (Faurie Guéret), Honda

**Contact :**
- Email : contact@la10agence.com
- Tél : +33 6 42 80 61 15
- Instagram : @la10agence
- Facebook : La 10 Agence

**Processus de travail :** Découverte → Stratégie → Création → Lancement → Optimisation

**Ton rôle :**
- Répondre aux questions sur les services, tarifs, processus, délais
- Aider les visiteurs à comprendre comment démarrer un projet
- Orienter vers le formulaire de contact ou l'email pour les demandes de devis
- Parler en français, de façon chaleureuse, professionnelle et concise
- Ne jamais inventer des tarifs précis (dire que cela dépend du projet et inviter à demander un devis)
- Garder les réponses courtes (2-4 phrases max sauf si on te demande plus de détail)
- Utiliser des emojis avec modération pour rester chaleureux`;

  /* ─── Toggle open/close ──────────────────────────────────── */
  function openChat() {
    isOpen = true;
    panel.classList.add('open');
    trigger.classList.add('open');
    openIcon.style.display  = 'none';
    closeIcon.style.display = 'flex';
    notifDot.classList.add('hidden');
    if (messagesEl.children.length === 0) addWelcomeMessage();
    setTimeout(() => inputEl.focus(), 350);
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove('open');
    trigger.classList.remove('open');
    openIcon.style.display  = 'flex';
    closeIcon.style.display = 'none';
  }

  trigger.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  // Close on outside click
  document.addEventListener('click', e => {
    if (isOpen && !panel.contains(e.target) && !trigger.contains(e.target)) {
      closeChat();
    }
  });

  /* ─── Welcome message ────────────────────────────────────── */
  function addWelcomeMessage() {
    addTimestamp('Maintenant');
    addBotBubble('Bonjour ! 👋 Je suis l\'assistant de **La 10 Agence**. Comment puis-je vous aider aujourd\'hui ?');
  }

  /* ─── Add message bubbles ────────────────────────────────── */
  function addTimestamp(text) {
    const el = document.createElement('div');
    el.className = 'chat-timestamp';
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function addUserBubble(text) {
    const el = document.createElement('div');
    el.className = 'chat-bubble user';
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function addBotBubble(text) {
    const el = document.createElement('div');
    el.className = 'chat-bubble bot';
    // Simple markdown-like rendering: **bold**, *italic*, line breaks
    el.innerHTML = formatMessage(text);
    messagesEl.appendChild(el);
    scrollToBottom();
    return el;
  }

  function formatMessage(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  /* ─── Typing indicator ───────────────────────────────────── */
  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.id = 'chat-typing-indicator';
    el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* ─── Suggestion chips ───────────────────────────────────── */
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const msg = chip.getAttribute('data-msg');
      // Hide suggestions after first use
      suggestions.style.display = 'none';
      sendMessage(msg);
    });
  });

  /* ─── Send message ───────────────────────────────────────── */
  async function sendMessage(text) {
    text = text.trim();
    if (!text || isThinking) return;

    // Hide suggestions
    suggestions.style.display = 'none';

    // Show user bubble
    addUserBubble(text);
    inputEl.value = '';
    autoResizeTextarea();

    // Lock UI
    isThinking = true;
    sendBtn.disabled = true;
    showTyping();

    // Push to history
    conversationHistory.push({ role: 'user', content: text });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: conversationHistory,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'Désolé, je n\'ai pas pu répondre. Veuillez réessayer.';

      // Push assistant reply to history
      conversationHistory.push({ role: 'assistant', content: reply });

      hideTyping();
      addBotBubble(reply);

    } catch (err) {
      console.error('Chatbot error:', err);
      hideTyping();
      addBotBubble('Désolé, une erreur s\'est produite. Vous pouvez nous contacter directement à **contact@la10agence.com** 😊');
    } finally {
      isThinking = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  /* ─── Input events ───────────────────────────────────────── */
  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  inputEl.addEventListener('input', autoResizeTextarea);

  function autoResizeTextarea() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  }

  /* ─── Show notif dot on load (after 3s) ─────────────────── */
  setTimeout(() => {
    if (!isOpen) notifDot.classList.remove('hidden');
  }, 3000);

})();
