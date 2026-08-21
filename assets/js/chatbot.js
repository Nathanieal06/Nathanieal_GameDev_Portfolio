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
  const initialMessage = "Hi! I'm Natalie, Nathanieal's personal assistant. What would you like to know about him, his games, or his projects?";

  // Keep track of conversation history for better AI context
  let conversationHistory = [
    { role: "system", content: "You are Natalie, a helpful and friendly assistant for Nathanieal Sandipurti, a Game Developer. You answer questions about his portfolio, games (Legacy of Dharma, Echo The Paradox, LastStride), and projects. Keep responses concise, engaging, and professional." },
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
        throw new Error('API Error');
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
        addMessage("Sorry, I'm experiencing some technical difficulties right now. Please email Nathanieal at nathasandipurti@gmail.com", 'bot');
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
