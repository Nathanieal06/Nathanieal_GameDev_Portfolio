/* ========================================
   CHATBOT LOGIC - NATALIE
   ======================================== */
;(function() {
  const chatToggle = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');
  const chatClose  = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput  = document.getElementById('chatInput');
  const chatSend   = document.getElementById('chatSend');

  // --- CONFIGURATION ---
  const AI_API_ENDPOINT = 'https://natalie-chatbot-proxy.nathasandipurti.workers.dev/';

  // Initial greeting
  const initialMessage = "Hi! I'm Natalie, Nathanieal's personal assistant. Ask me anything about him, his games, or his projects — or use the quick links below!";

  // ---------------------------------------------------------------
  // SITE NAVIGATION MAP
  // ---------------------------------------------------------------
  const SITE_PAGES = {
    home:      { label: '🏠 Home',       url: '/' },
    games:     { label: '🎮 Games',      url: 'pages/games.html' },
    projects:  { label: '💡 Projects',   url: 'pages/projects.html' },
    resume:    { label: '📄 Resume',     url: 'pages/resume.html' },
    academics: { label: '🎓 Academics',  url: 'pages/academics.html' },
    studying:  { label: '📚 Studying',   url: 'pages/studying.html' },
    contact:   { label: '✉️ Contact',    url: 'pages/contact.html' },
  };

  // ---------------------------------------------------------------
  // STRICT SYSTEM PROMPT — Natalie ONLY answers portfolio questions
  // ---------------------------------------------------------------
  const SYSTEM_PROMPT = `You are Natalie, the personal portfolio assistant for Nathanieal Sandipurti, a passionate Game Developer.

FACTS ABOUT NATHANIEAL (use ONLY these facts — do not invent anything):
- Name: Nathanieal Sandipurti
- Role: Game Developer (student / indie dev)
- Skills & tools he actually uses: Unity, C# (primary), game design, level design, narrative design
- He does NOT use Blender or Unreal Engine
- Games he has made: Legacy of Dharma, Echo The Paradox, LastStride
- Email: nathasandipurti@gmail.com
- He is actively seeking opportunities in game development
- Portfolio website: https://nathanieal-game-dev-portfolio.vercel.app
- Pages on the site: Home, Games, Projects, Resume, Academics, Studying, Contact

YOUR ONLY JOB is to answer questions about Nathanieal. You may also help visitors navigate the site.

STRICT RULES:
1. If a question is NOT related to Nathanieal, his work, or his portfolio, refuse politely: "I'm only here to help with questions about Nathanieal and his work! Is there something about him or his games I can help with?"
2. NEVER answer general knowledge questions (weather, math, coding tutorials, history, science, news, etc.).
3. NEVER mention Blender or Unreal Engine as Nathanieal's skills.
4. Keep answers SHORT — max 3 sentences.
5. When mentioning bold text use **word** markdown syntax.
6. Be friendly, enthusiastic, and professional.`;

  // ---------------------------------------------------------------
  // CLIENT-SIDE TOPIC FILTER — zero tokens for obvious off-topic
  // ---------------------------------------------------------------
  const OFF_TOPIC_PATTERNS = [
    /\bweather\b/i, /\btemperature\b/i, /\bforecast\b/i,
    /\bcalculate\b/i, /\d\s*[\+\-\*\/]\s*\d/,
    /\btutorial\b/i, /\brecipe\b/i, /\bcook\b/i,
    /\bnews\b/i, /\bpolitics\b/i, /\bsport(?:s)?\b/i,
    /\bmovie\b/i, /\bsong\b/i,
    /capital of/i, /history of/i,
    /tell me a joke/i, /write me an? essay/i,
    /\btranslate\b/i, /\bstock market\b/i, /\bcrypto\b/i,
  ];

  // Keywords that trigger navigation suggestions
  const NAV_TRIGGERS = {
    games:     /\bgame(?:s)?\b|\blegacy of dharma\b|\becho\b|\blaststride\b/i,
    projects:  /\bproject(?:s)?\b/i,
    resume:    /\bresume\b|\bcv\b|\bexperience\b/i,
    contact:   /\bcontact\b|\bemail\b|\bhire\b|\breach\b/i,
    academics: /\bacademic(?:s)?\b|\beducation\b|\bdegree\b|\buniversity\b|\bcollege\b/i,
    studying:  /\bstud(?:y|ying)\b|\blearning\b/i,
  };

  function isOffTopic(text) {
    return OFF_TOPIC_PATTERNS.some(p => p.test(text));
  }

  // Which page buttons to suggest based on user message
  function getSuggestedPages(text) {
    const suggested = new Set();
    for (const [key, pattern] of Object.entries(NAV_TRIGGERS)) {
      if (pattern.test(text)) suggested.add(key);
    }
    return [...suggested];
  }

  // ---------------------------------------------------------------
  // MARKDOWN → HTML (safe, minimal: bold, italic, line breaks)
  // ---------------------------------------------------------------
  function parseMarkdown(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  // ---------------------------------------------------------------
  // CONVERSATION HISTORY
  // ---------------------------------------------------------------
  let conversationHistory = [
    { role: "system",    content: SYSTEM_PROMPT },
    { role: "assistant", content: initialMessage },
  ];

  if (!chatToggle || !chatWindow) return;

  // ---------------------------------------------------------------
  // OPEN / CLOSE
  // ---------------------------------------------------------------
  chatToggle.addEventListener('click', () => {
    chatWindow.classList.add('open');
    if (chatMessages.children.length === 0) {
      addMessage(initialMessage, 'bot');
      addNavButtons(['games', 'projects', 'contact', 'resume']); // default quick links
    }
  });

  chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  // ---------------------------------------------------------------
  // SEND
  // ---------------------------------------------------------------
  chatSend.addEventListener('click', handleSend);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';

    // CLIENT-SIDE OFF-TOPIC GUARD (free — no API call)
    if (isOffTopic(text)) {
      addMessage("I'm only here to help with questions about Nathanieal and his work! Is there something about him, his games, or projects I can help you with? 😊", 'bot');
      chatSend.disabled = false;
      chatInput.focus();
      return;
    }

    conversationHistory.push({ role: "user", content: text });

    const typingIndicator = addTypingIndicator();
    chatSend.disabled = true;

    try {
      if (AI_API_ENDPOINT.includes('YOUR-SECURE-PROXY-URL')) {
        throw new Error("Proxy not configured yet.");
      }

      const response = await fetch(AI_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory })
      });

      if (!response.ok) {
        let errStr = 'API Error';
        try {
          const errData = await response.json();
          if (errData.error) errStr = errData.error;
        } catch(e) {}
        throw new Error(errStr);
      }

      const data = await response.json();
      const botReply = data.reply || "I'm having trouble connecting right now.";

      removeTypingIndicator(typingIndicator);
      addMessage(botReply, 'bot', true); // true = parse markdown
      conversationHistory.push({ role: "assistant", content: botReply });

      // Suggest relevant page navigation buttons
      const pages = getSuggestedPages(text);
      if (pages.length > 0) addNavButtons(pages);

    } catch (error) {
      removeTypingIndicator(typingIndicator);
      console.error(error);

      if (error.message === "Proxy not configured yet.") {
        addMessage("I'm still in setup mode! Please check back soon or email Nathanieal at nathasandipurti@gmail.com", 'bot');
      } else {
        addMessage(`Oops! Backend says: ${error.message}`, 'bot');
      }
    } finally {
      chatSend.disabled = false;
      chatInput.focus();
    }
  }

  // ---------------------------------------------------------------
  // UI HELPERS
  // ---------------------------------------------------------------
  function addMessage(text, sender, markdown = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', sender);
    if (markdown) {
      msgDiv.innerHTML = parseMarkdown(text);
    } else {
      msgDiv.textContent = text;
    }
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addNavButtons(pageKeys) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('chat-nav-buttons');

    pageKeys.forEach(key => {
      const page = SITE_PAGES[key];
      if (!page) return;
      const btn = document.createElement('a');
      btn.href = page.url;
      btn.textContent = page.label;
      btn.classList.add('chat-nav-btn');
      // Open in same tab so user stays in the portfolio
      btn.target = '_self';
      wrapper.appendChild(btn);
    });

    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('chat-message', 'bot', 'chat-typing-container');
    typingDiv.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
  }

  function removeTypingIndicator(element) {
    if (element && element.parentNode) element.parentNode.removeChild(element);
  }
})();
