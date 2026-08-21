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
  // SITE NAVIGATION MAP — use absolute paths so they work from ANY page depth
  // ---------------------------------------------------------------
  const SITE_PAGES = {
    // Main pages
    home:      { label: '🏠 Home',            url: '/' },
    games:     { label: '🎮 All Games',        url: '/pages/games.html' },
    projects:  { label: '💡 All Projects',     url: '/pages/projects.html' },
    resume:    { label: '📄 Resume',           url: '/pages/resume.html' },
    academics: { label: '🎓 Academics',        url: '/pages/academics.html' },
    studying:  { label: '📚 Studying',         url: '/pages/studying.html' },
    contact:   { label: '✉️ Contact',          url: '/pages/contact.html' },

    // Individual game pages
    lastride:   { label: '🎮 LastStride',          url: '/pages/games/last-stride.html' },
    legacy:     { label: '🎮 Legacy of Dharma',    url: '/pages/games/legacy-of-dharma.html' },
    echo:       { label: '🎮 Echo The Paradox',    url: '/pages/games/echo-the-paradox.html' },
    cityscape:  { label: '🎮 Cityscape',           url: '/pages/games/cityscape.html' },
    galaxystrike: { label: '🎮 Galaxy Strike',     url: '/pages/games/galaxy-strike.html' },
    obstacledodge: { label: '🎮 Obstacle Dodge',   url: '/pages/games/obstacle-dodge.html' },
    rocketboost: { label: '🎮 Rocket Boost',       url: '/pages/games/rocket-boost.html' },
    royalrun:   { label: '🎮 Royal Run',           url: '/pages/games/royal-run.html' },
    zatun:      { label: '🎮 Zatun Zombie',        url: '/pages/games/zatun-zombie.html' },
    sharpshooter: { label: '🎮 Sharp Shooter',     url: '/pages/games/sharp-shooter.html' },
    unityrpg:   { label: '🎮 Unity RPG',           url: '/pages/games/unity-rpg.html' },

    // Individual project pages
    healthchatbot: { label: '💡 Healthcare Chatbot',    url: '/pages/projects/healthcare-chatbot.html' },
    imgclassify:   { label: '💡 Image Classification', url: '/pages/projects/image-classification.html' },
    irrigation:    { label: '💡 Smart Irrigation',     url: '/pages/projects/smart-irrigation.html' },
    gamesales:     { label: '💡 Video Game Sales',     url: '/pages/projects/video-game-sales.html' },
  };

  // ---------------------------------------------------------------
  // STRICT SYSTEM PROMPT — Natalie ONLY answers portfolio questions
  // Full knowledge base built from the actual portfolio pages.
  // ---------------------------------------------------------------
  const SYSTEM_PROMPT = `You are Natalie, the personal portfolio assistant for Nathanieal Sandipurti, a passionate Game Developer. You have full, detailed knowledge of his portfolio.

=== ABOUT NATHANIEAL ===
- Full Name: Nathanieal Sandipurti
- Role: Game Developer (indie dev & student)
- Primary Skills: Unity Engine, C#, Game Design, Level Design, Narrative Design, Procedural Generation, AI/NavMesh systems
- He does NOT use Blender or Unreal Engine
- Email: nathasandipurti@gmail.com
- GitHub: https://github.com/Nathanieal06
- Itch.io: https://nathanieal.itch.io
- Portfolio: https://nathanieal-game-dev-portfolio.vercel.app
- He is actively seeking opportunities in game development

=== ACADEMICS ===
- Studying at college, currently in Semester 6
- CGPA: 8.89 (Cumulative)
- CPI: 8.25 (Performance Index)
- SPI (Sem 6): 8.91 (Current Semester)
- Active Backlogs: 0 (All Clear)
- Full academic breakdown is on the Academics page

=== GAMES ===

--- LASTSTRIDE ---
- Genre: Endless Runner
- Engine: Unity 6 (6000.3.11f1), C#
- Platform: PC (Windows)
- Role: Sole Developer (Team of 1)
- Status: Completed
- Game Jam: Indie Connect Game Jam #1 (GDAI Game Connect)
- Play: https://nathanieal.itch.io/infinite-runner
- GitHub: https://github.com/Nathanieal06/LastStride
- Overview: An endless runner with procedural chunk-based level generation, multiple obstacle types, distinct biomes with per-biome background music, boss encounters, and increasing speed difficulty scaling over time.
- Key Features: Procedural Level Generator (chunk lifecycle system), Lane-Safe obstacle spawning (mathematically prevents impossible configurations), Boss Fight System (laser attack clears obstacles in real-time), Audio Manager (preloads all BGM into RAM at startup to eliminate lag spikes), 3-lane smooth lerp-based player controller.
- Postmortem: Lane-safety system and BGM preloading worked great. Would use object pooling and ScriptableObjects in future versions.

--- LEGACY OF DHARMA ---
- Genre: Third-Person Action/Adventure RPG
- Engine: Unity 6000 (URP), C#
- Platform: PC
- Role: Lead Programmer
- Team: 4 Students, 2 Mentors
- Duration: ~2.5 Months (May - Jul 2026)
- Status: In Development / Prototype
- GitHub: https://github.com/Nathanieal06/PlayerController
- YouTube: https://youtu.be/XOAHr7uRtYg
- Overview: A third-person action/adventure game with a two-state stance system bridging exploration and combat. Features multi-hit combo sword & shield mechanics and horse riding for a AAA "snappy" feel.
- Key Features: Custom state-machine player controller with Coyote Time, i-frames and dodge rolls; Horse Riding & Mount System with IK rein snapping; Combo attack system with event-driven weapon colliders; Enemy AI system (NavMesh) with EnemyBase class, BossEnemy, PatrolEnemy variants.
- Technical Highlight: Hybrid Root Motion Combat — script drives movement during exploration, but OnAnimatorMove injects animation displacement during attacks for a weighty "AAA feel".

--- ECHO: THE PARADOX ---
- Genre: First-Person Narrative Adventure / Walking Simulator
- Engine: Unity 6 (6000.3.11f1), C#
- Platform: PC (Windows)
- Role: Sole Developer / Narrative Designer (Team of 1)
- Status: Released
- Game Jam: S.T.E.M Jam (GameDev Club IIT Guwahati)
- Play/Download: https://nathanieal.itch.io/echo-the-paradox
- Overview: A first-person narrative adventure set across 4 acts. The player responds to a radio distress call, interacts with objects and NPCs, makes story choices, and experiences a mystery narrative.
- Key Features: 4-Act narrative structure (4 separate Unity scenes with fully baked GI); IInteractable interface system (fully decoupled, supports doors, chests, radios, beds, maps); Branching dialogue system (DialogueEditor with story choice tracking across acts); Layered audio (radio SFX, ambient static, dialogue simultaneously); Smooth fade-to-black scene transitions with async loading.
- Technical Highlight: Coroutine-based sequence managers for scripted story events. Interface-based interactable system scaled to all 4 acts without touching PlayerInteraction once.

--- OTHER GAMES (also have dedicated pages) ---
- Cityscape: pages/games/cityscape.html
- Galaxy Strike: pages/games/galaxy-strike.html
- Obstacle Dodge: pages/games/obstacle-dodge.html
- Rocket Boost: pages/games/rocket-boost.html
- Royal Run: pages/games/royal-run.html
- Zatun Zombie: pages/games/zatun-zombie.html
- Sharp Shooter: pages/games/sharp-shooter.html
- Unity RPG: pages/games/unity-rpg.html
- Unity Programming Test: pages/games/unity-programming-test.html

=== PROJECTS ===
- Healthcare Chatbot: pages/projects/healthcare-chatbot.html
- Image Classification: pages/projects/image-classification.html
- Smart Irrigation System: pages/projects/smart-irrigation.html
- Video Game Sales Analysis: pages/projects/video-game-sales.html

=== SITE PAGES ===
Home, Games (pages/games.html), Projects (pages/projects.html), Resume (pages/resume.html), Academics (pages/academics.html), Studying (pages/studying.html), Contact (pages/contact.html)

=== YOUR RULES ===
1. Answer ONLY questions about Nathanieal, his work, games, projects, academics, or how to contact him.
2. NEVER answer off-topic questions (weather, math, news, general coding help, etc.). Say: "I'm only here to help with questions about Nathanieal and his work!"
3. Keep answers SHORT — max 3 sentences unless listing items.
4. Use **bold** for game names and key terms.
5. Be friendly, enthusiastic, and professional.
6. If asked something you don't have data on, say "I don't have that info — check the full page!" and suggest the relevant nav button.`;


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
  // Specific games/projects take priority over the general pages
  const NAV_TRIGGERS = {
    // Specific games (checked first)
    lastride:      /\blast.?stride\b/i,
    legacy:        /\blegacy of dharma\b/i,
    echo:          /\becho the paradox\b|\becho\b/i,
    cityscape:     /\bcityscape\b/i,
    galaxystrike:  /\bgalaxy.?strike\b/i,
    obstacledodge: /\bobstacle.?dodge\b/i,
    rocketboost:   /\brocket.?boost\b/i,
    royalrun:      /\broyal.?run\b/i,
    zatun:         /\bzatun\b|\bzombie\b/i,
    sharpshooter:  /\bsharp.?shooter\b/i,
    unityrpg:      /\bunity.?rpg\b/i,

    // Specific projects
    healthchatbot: /\bhealthcare.?chatbot\b/i,
    imgclassify:   /\bimage.?classif/i,
    irrigation:    /\birrigation\b/i,
    gamesales:     /\bgame.?sales\b|\bvideo game sales\b/i,

    // General pages (fallback if no specific match)
    games:     /\bgame(?:s)?\b/i,
    projects:  /\bproject(?:s)?\b/i,
    resume:    /\bresume\b|\bcv\b|\bexperience\b/i,
    contact:   /\bcontact\b|\bemail\b|\bhire\b|\breach\b/i,
    academics: /\bacademic(?:s)?\b|\beducation\b|\bdegree\b|\buniversity\b|\bcollege\b/i,
    studying:  /\bstud(?:y|ying)\b|\blearning\b/i,
  };

  function isOffTopic(text) {
    return OFF_TOPIC_PATTERNS.some(p => p.test(text));
  }

  // Which page buttons to suggest based on user message AND bot reply
  function getSuggestedPages(userText, botText) {
    const combined = (userText + ' ' + (botText || '')).toLowerCase();
    const suggested = new Set();
    const specificGameKeys = ['lastride','legacy','echo','cityscape','galaxystrike','obstacledodge','rocketboost','royalrun','zatun','sharpshooter','unityrpg'];
    const specificProjectKeys = ['healthchatbot','imgclassify','irrigation','gamesales'];

    for (const [key, pattern] of Object.entries(NAV_TRIGGERS)) {
      if (pattern.test(combined)) suggested.add(key);
    }

    // If any specific game was matched, also add "All Games" as secondary
    const hasSpecificGame = specificGameKeys.some(k => suggested.has(k));
    if (hasSpecificGame) suggested.add('games');

    // If any specific project was matched, also add "All Projects" as secondary
    const hasSpecificProject = specificProjectKeys.some(k => suggested.has(k));
    if (hasSpecificProject) suggested.add('projects');

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

      // Suggest relevant page navigation buttons based on user question + bot answer
      const pages = getSuggestedPages(text, botReply);
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
