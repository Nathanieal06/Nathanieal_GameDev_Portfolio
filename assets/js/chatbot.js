/* ========================================
   CHATBOT LOGIC - NATALIE
   ======================================== */
;(function() {
  const chatToggle = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');
  const chatClose = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');

  // --- CONFIGURATION ---
  // Replace this with the URL of your secure backend proxy (e.g., Vercel Serverless Function or Cloudflare Worker)
  // See the AI Chatbot Setup Guide provided for instructions on creating this.
  const AI_API_ENDPOINT = 'https://natalie-chatbot-proxy.nathasandipurti.workers.dev/'; 

  // Initial greeting
  const initialMessage = "Hi! I'm Natalie, Nathanieal's personal assistant. Ask me anything about him, his games, projects, or how to get in touch!";

  // ---------------------------------------------------------------
  // STRICT SYSTEM PROMPT — Natalie ONLY answers portfolio questions
  // ---------------------------------------------------------------
  const SYSTEM_PROMPT = `You are Natalie, the personal portfolio assistant for Nathanieal Sandipurti, a passionate Game Developer.

YOUR ONLY JOB is to answer questions about Nathanieal. Specifically you can talk about:
- His background, skills, and passion for game development
- His games: Legacy of Dharma, Echo The Paradox, LastStride
- His tools & tech stack (Unity, C#, Unreal, Blender, etc.)
- His contact info: nathasandipurti@gmail.com
- His education, experience, and future goals
- His portfolio website

STRICT RULES:
1. If a question is NOT related to Nathanieal, his work, or his portfolio, you MUST refuse politely. Say something like: "I'm only here to help with questions about Nathanieal and his work! Is there something about him or his games I can help with?"
2. NEVER answer general knowledge questions (weather, math, coding tutorials, history, science, news, etc.).
3. NEVER pretend to be another AI or assistant.
4. Keep all answers SHORT and concise — maximum 3 sentences unless absolutely necessary.
5. Be friendly, enthusiastic, and professional.`;

  // ---------------------------------------------------------------
  // CLIENT-SIDE TOPIC FILTER — blocks obvious off-topic queries
  // BEFORE they reach the API, saving tokens entirely.
  // ---------------------------------------------------------------
  const OFF_TOPIC_PATTERNS = [
    /weather/i, /temperature/i, /forecast/i, /rain/i, /sunny/i,
    /what is \d/i, /calculate/i, /math/i, /\d\s*[\+\-\*\/]\s*\d/,
    /how to code/i, /tutorial/i, /recipe/i, /cook/i, /food/i,
    /news/i, /politics/i, /sport/i, /movie/i, /song/i, /music/i,
    /capital of/i, /history of/i, /who is [^n]/i, /tell me a joke/i,
    /write me a/i, /essay/i, /translate/i, /stock/i, /crypto/i,
  ];

  function isOffTopic(text) {
    return OFF_TOPIC_PATTERNS.some(pattern => pattern.test(text));
  }

  // Keep track of conversation history for better AI context
  let conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "assistant", content: initialMessage }
  ];

  if (!chatToggle || !chatWindow) return;

  // Toggle chat window
  chatToggle.addEventListener('click', () => {
    chatWindow.classList.add('open');
    if (chatMessages.children.length === 0) {
      addMessage(initialMessage, 'bot');
    }
  });

  chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  // Handle send message
  chatSend.addEventListener('click', handleSend);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message to UI
    addMessage(text, 'user');
    chatInput.value = '';
    
    // Add to history
    conversationHistory.push({ role: "user", content: text });

    // --- CLIENT-SIDE GUARD: Block obvious off-topic queries for free ---
    if (isOffTopic(text)) {
      addMessage("I'm only here to help with questions about Nathanieal and his work! Is there something about him, his games, or projects I can help you with? 😊", 'bot');
      conversationHistory.pop(); // remove the off-topic message from history
      chatSend.disabled = false;
      chatInput.focus();
      return;
    }

    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    chatSend.disabled = true;

    try {
      // If the user hasn't set up the proxy yet, show a fallback message
      if (AI_API_ENDPOINT.includes('YOUR-SECURE-PROXY-URL')) {
        throw new Error("Proxy not configured yet.");
      }

      // Send to backend proxy
      const response = await fetch(AI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      addMessage(botReply, 'bot');
      conversationHistory.push({ role: "assistant", content: botReply });

    } catch (error) {
      removeTypingIndicator(typingIndicator);
      console.error(error);
      
      if (error.message === "Proxy not configured yet.") {
        addMessage("I'm currently in setup mode! Nathanieal is still configuring my secure brain. Please check back later, or email him at nathasandipurti@gmail.com in the meantime.", 'bot');
      } else {
        // Display the actual error from the backend to help with debugging
        addMessage(`Oops! Backend says: ${error.message}`, 'bot');
      }
    } finally {
      chatSend.disabled = false;
      chatInput.focus();
    }
  }

  function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', sender);
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
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
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
})();
