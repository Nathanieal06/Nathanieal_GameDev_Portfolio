/* ============================================================
   Nathanieal Sandipurti — Portfolio Script
   Minimal: navbar scroll, mobile menu, scroll reveal
   ============================================================ */

// ── Navbar scroll ──────────────────────────────────────────
;(function () {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
})();

// ── Mobile menu ────────────────────────────────────────────
;(function () {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('active');
    document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
  });

  links.querySelectorAll('.nav-link').forEach(l => {
    l.addEventListener('click', (e) => {
      if (l.parentElement.classList.contains('nav-dropdown')) {
        l.parentElement.classList.toggle('active');
        return;
      }
      toggle.classList.remove('active');
      links.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
})();

// ── Scroll reveal ──────────────────────────────────────────
;(function () {
  const items = document.querySelectorAll('.card, .section-label, .section-title');

  items.forEach((el, i) => {
    el.classList.add('reveal');
    const mod = i % 3;
    if (mod === 1) el.classList.add('reveal-d1');
    if (mod === 2) el.classList.add('reveal-d2');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// ── Smooth anchor scroll ───────────────────────────────────
;(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// ── Active link on scroll ──────────────────────────────────
;(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const y = window.pageYOffset + 100;
    sections.forEach(s => {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        const id = s.id;
        links.forEach(l => {
          l.classList.toggle('active',
            l.getAttribute('href') === `#${id}` ||
            (id === 'hero' && l.getAttribute('href') === '#')
          );
        });
      }
    });
  });
})();

// ── Contact Form Submission ────────────────────────────────
;(function () {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    const successMsg = document.getElementById('formSuccessMessage');
    const errorMsg = document.getElementById('formErrorMessage');

    // Reset messages and button state
    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg) errorMsg.style.display = 'none';
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Get form data
    const formData = {
      fullName: document.getElementById('name').value,
      email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value
    };

    try {
      // NOTE: Update this URL for production if needed
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        contactForm.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
        contactForm.reset();
      } else {
        throw new Error(
          data.errors 
            ? data.errors.map(err => err.msg).join('<br>') 
            : data.message || 'Something went wrong.'
        );
      }
    } catch (error) {
      if (errorMsg) {
        errorMsg.innerHTML = `<strong>Error:</strong><br>${error.message}`;
        errorMsg.style.display = 'block';
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
})();

// ── YouTube Preloader ──────────────────────────────────────────
(function() {
  const iframe = document.querySelector('.hero-video iframe');
  const loader = document.getElementById('page-loader');
  
  if (!loader) return;
  if (!iframe) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
    return;
  }

  let isLoaded = false;
  function hideLoader() {
    if (isLoaded) return;
    isLoaded = true;
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    setTimeout(() => loader.remove(), 500);
  }

  // Fallback timeout in case YouTube API fails or autoplay is blocked
  setTimeout(hideLoader, 4000);

  // Load YouTube API
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  if(firstScriptTag) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  } else {
      document.body.appendChild(tag);
  }

  window.onYouTubeIframeAPIReady = function() {
    new YT.Player(iframe, {
      events: {
        'onReady': function(event) {
          // If video is already playing
          if (event.target.getPlayerState() === YT.PlayerState.PLAYING) {
             hideLoader();
          }
        },
        'onStateChange': function(event) {
          if (event.data === YT.PlayerState.PLAYING) {
            hideLoader();
          }
        }
      }
    });
  };
})();
