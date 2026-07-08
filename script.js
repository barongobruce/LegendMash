/* ============================================================
   LEGEND MASH STUDIOS — LUXURY PHOTOGRAPHY & VIDEOGRAPHY
   Vanilla JavaScript
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setCurrentYear();
    initStickyHeader();
    initMobileMenu();
    initActiveNavOnScroll();
    initScrollReveal();
    initHeroParallax();
    initPortfolioFilter();
    initTestimonialCarousel();
    initStatCounters();
    initBookingForm();
    initBackToTop();
  }

  /* ---------- Footer year ---------- */
  function setCurrentYear() {
    var el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Sticky header: solidify on scroll ---------- */
  function initStickyHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;

    var toggleState = function () {
      if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };

    toggleState();
    window.addEventListener('scroll', throttle(toggleState, 50), { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var toggleBtn = document.getElementById('menuToggle');
    var nav = document.getElementById('mainNav');
    if (!toggleBtn || !nav) return;

    var closeMenu = function () {
      toggleBtn.classList.remove('is-active');
      nav.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    var openMenu = function () {
      toggleBtn.classList.add('is-active');
      nav.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    toggleBtn.addEventListener('click', function () {
      var isOpen = nav.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when a nav link is tapped
    nav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Highlight active nav link based on section in view ---------- */
  function initActiveNavOnScroll() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    var linkFor = function (id) {
      return document.querySelector('.nav-link[href="#' + id + '"]');
    };

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove('is-active'); });
            var activeLink = linkFor(entry.target.id);
            if (activeLink) activeLink.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- Scroll reveal (fade + slide up) ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

     /* ---------- Hero parallax & Mobile Image Swap ---------- */
  function initHeroParallax() {
    var heroImage = document.getElementById('heroImage');
    var hero = document.querySelector('.hero');
    if (!heroImage || !hero) return;

    var isMobile = window.innerWidth <= 640;

    // SWAP THE IMAGE SOURCE ON MOBILE
    if (isMobile) {
      // 👇 CHANGE 'your-image-name.png' TO YOUR ACTUAL FILENAME 👇
      heroImage.src = 'images/hero3.png'; 
      heroImage.style.objectPosition = 'center center';
    }

    var update = function () {
      var scrollY = window.scrollY;
      var heroHeight = hero.offsetHeight;
      if (scrollY > heroHeight) return;

      if (isMobile) {
        heroImage.style.transform = 'none'; // Kill parallax on mobile
      } else {
        var offset = scrollY * 0.35;
        heroImage.style.transform = 'translateY(' + offset + 'px)';
      }
    };

    update();
    window.addEventListener('scroll', throttle(update, 16), { passive: true });
    window.addEventListener('resize', throttle(update, 100));
  }
  

  /* ---------- Portfolio filter ---------- */
  function initPortfolioFilter() {
    var buttons = document.querySelectorAll('.filter-btn');
    var items = document.querySelectorAll('.portfolio-item');
    if (!buttons.length || !items.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        buttons.forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');

        items.forEach(function (item) {
          var category = item.getAttribute('data-category');
          var shouldShow = filter === 'all' || category === filter;
          item.classList.toggle('is-hidden', !shouldShow);
        });
      });
    });
  }

  /* ---------- Testimonial carousel ---------- */
  function initTestimonialCarousel() {
    var track = document.getElementById('testimonialTrack');
    var prevBtn = document.getElementById('testimonialPrev');
    var nextBtn = document.getElementById('testimonialNext');
    var dotsWrap = document.getElementById('testimonialDots');
    if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

    var cards = Array.prototype.slice.call(track.children);
    if (!cards.length) return;

    var currentIndex = 0;
    var visibleCount = getVisibleCount();
    var autoplayTimer = null;
    var autoplayDelay = 6000;

    function getVisibleCount() {
      var w = window.innerWidth;
      if (w <= 640) return 1;
      if (w <= 940) return 2;
      if (w <= 1180) return 3;
      return 4;
    }

    function maxIndex() {
      return Math.max(0, cards.length - visibleCount);
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      var totalDots = maxIndex() + 1;
      for (var i = 0; i < totalDots; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Go to testimonial slide ' + (i + 1));
        if (i === currentIndex) dot.classList.add('is-active');
        (function (index) {
          dot.addEventListener('click', function () {
            goTo(index);
            restartAutoplay();
          });
        })(i);
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      var dots = dotsWrap.querySelectorAll('button');
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === currentIndex);
      });
    }

    function goTo(index) {
      currentIndex = Math.max(0, Math.min(index, maxIndex()));
      var cardWidth = cards[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      var offset = currentIndex * (cardWidth + gap);
      track.style.transform = 'translateX(-' + offset + 'px)';
      updateDots();
    }

    function next() {
      goTo(currentIndex >= maxIndex() ? 0 : currentIndex + 1);
    }

    function prev() {
      goTo(currentIndex <= 0 ? maxIndex() : currentIndex - 1);
    }

    function startAutoplay() {
      autoplayTimer = setInterval(next, autoplayDelay);
    }

    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    nextBtn.addEventListener('click', function () { next(); restartAutoplay(); });
    prevBtn.addEventListener('click', function () { prev(); restartAutoplay(); });

    track.parentElement.addEventListener('mouseenter', stopAutoplay);
    track.parentElement.addEventListener('mouseleave', startAutoplay);

    window.addEventListener('resize', throttle(function () {
      visibleCount = getVisibleCount();
      buildDots();
      goTo(Math.min(currentIndex, maxIndex()));
    }, 150));

    buildDots();
    goTo(0);
    startAutoplay();
  }

  /* ---------- Animated stat counters ---------- */
  function initStatCounters() {
    var counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    var animate = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1800;
      var startTime = null;

      var step = function (timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        var value = Math.floor(eased * target);
        el.textContent = value + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      };

      requestAnimationFrame(step);
    };

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (el) { observer.observe(el); });
  }

    /* ---------- Booking Form (WhatsApp Integration) ---------- */
  function initBookingForm() {
    var form = document.getElementById('bookingForm');
    var feedback = document.getElementById('formFeedback');
    if (!form || !feedback) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // Stop page from reloading

      // Check if form is valid
      if (!form.checkValidity()) {
        feedback.textContent = 'Please fill in all required fields.';
        feedback.style.color = '#e3c778';
        form.reportValidity();
        return;
      }

      // 1. Gather the data from the form
      var name = form.fullName.value.trim();
      var email = form.email.value.trim();
      var phone = form.phone.value.trim();
      var service = form.service.options[form.service.selectedIndex].text;
      var date = form.eventDate.value;
      var time = form.eventTime.value;
      var message = form.message.value.trim();

      // 2. Build the WhatsApp Message
      // Note: %0A creates a new line in WhatsApp
      var waText = "Hello Legend Mash! I would like to make a booking.%0A%0A" +
                   "*Name:* " + name + "%0A" +
                   "*Email:* " + email + "%0A" +
                   "*Phone:* " + phone + "%0A" +
                   "*Service:* " + service + "%0A" +
                   "*Date:* " + date + "%0A" +
                   "*Time:* " + time + "%0A" +
                   "*Message:* " + (message || "No additional message");

      // 3. Your WhatsApp Number (Format: Country Code + Number, no + sign)
      var waNumber = "254790817100"; 

      // 4. Create the link and open it
      var waUrl = "https://wa.me/" + waNumber + "?text=" + waText;
      window.open(waUrl, '_blank');

      // 5. Show success message and reset form
      feedback.textContent = 'Opening WhatsApp... Please send the message there!';
      feedback.style.color = '#c8a04a';
      form.reset();
    });
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    var toggleVisibility = function () {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    };

    toggleVisibility();
    window.addEventListener('scroll', throttle(toggleVisibility, 100), { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Utility: throttle ---------- */
  function throttle(fn, wait) {
    var lastCall = 0;
    var timeoutId = null;
    return function () {
      var now = Date.now();
      var args = arguments;
      var context = this;
      if (now - lastCall >= wait) {
        lastCall = now;
        fn.apply(context, args);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
          lastCall = Date.now();
          fn.apply(context, args);
        }, wait - (now - lastCall));
      }
    };
  }

/* Video Modal for Service Cards */
function initVideoModal() {
  var videoCards = document.querySelectorAll('.service-card[data-video]');
  
  videoCards.forEach(function(card) {
    card.addEventListener('click', function() {
      var videoSrc = this.getAttribute('data-video');
      createVideoModal(videoSrc);
    });
  });
  
  function createVideoModal(videoSrc) {
    // Create modal overlay
    var modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
      <div class="video-modal-content">
        <button class="video-modal-close" aria-label="Close video">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <video controls autoplay>
          <source src="${videoSrc}" type="video/mp4">
        </video>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on X button or clicking outside
    setTimeout(function() {
      modal.classList.add('is-open');
      var closeBtn = modal.querySelector('.video-modal-close');
      closeBtn.addEventListener('click', function() {
        closeModal();
      });
      modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
      });
    }, 10);
    
    function closeModal() {
      modal.classList.remove('is-open');
      setTimeout(function() {
        modal.remove();
      }, 300);
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', closeOnEscape);
      }
    });
  }
}

// Initialize video modal
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoModal);
} else {
  initVideoModal();
}

  /* ---------- Portfolio Video Modal ---------- */
  function initPortfolioVideos() {
    var videoItems = document.querySelectorAll('.portfolio-item[data-video]');
    
    videoItems.forEach(function(item) {
      item.addEventListener('click', function() {
        var videoSrc = this.getAttribute('data-video');
        openVideoModal(videoSrc);
      });
    });
    
    function openVideoModal(videoSrc) {
      var modal = document.createElement('div');
      modal.className = 'video-modal';
      modal.innerHTML = `
        <div class="video-modal-content">
          <button class="video-modal-close" aria-label="Close video">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <video controls autoplay>
            <source src="${videoSrc}" type="video/mp4">
            <source src="${videoSrc}" type="video/quicktime">
          </video>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      setTimeout(function() { modal.classList.add('is-open'); }, 10);
      
      var closeBtn = modal.querySelector('.video-modal-close');
      closeBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
      
      function closeModal() {
        modal.classList.remove('is-open');
        setTimeout(function() { modal.remove(); }, 300);
      }
      
      document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', closeOnEscape); }
      });
    }
  }
  
  // Initialize video modal
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioVideos);
  } else {
    initPortfolioVideos();
  }

/* ============================================================
   ABOUT SECTION - REVEAL ANIMATIONS
   ============================================================ */

function initAboutReveal() {
  var revealElements = document.querySelectorAll('.about-section .reveal-text');
  
  if (!revealElements.length) return;
  
  var observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  };
  
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  revealElements.forEach(function(el) {
    observer.observe(el);
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutReveal);
} else {
  initAboutReveal();
}

/* WhatsApp Booking Form */
function initWhatsAppBooking() {
  var form = document.getElementById('bookingForm');
  var feedback = document.getElementById('formFeedback');
  
  if (!form || !feedback) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!form.checkValidity()) {
      feedback.textContent = 'Please fill in all required fields.';
      feedback.style.color = '#e3c778';
      form.reportValidity();
      return;
    }
    
    // Get form values
    var name = form.fullName.value.trim();
    var email = form.email.value.trim();
    var phone = form.phone.value.trim();
    var service = form.service.options[form.service.selectedIndex].text;
    var eventDate = form.eventDate.value;
    var eventTime = form.eventTime.value;
    var message = form.message.value.trim();
    
    // Build WhatsApp message
    var whatsappMessage = 
      '*NEW BOOKING REQUEST*%0A%0A' +
      '*Name:* ' + encodeURIComponent(name) + '%0A' +
      '*Email:* ' + encodeURIComponent(email) + '%0A' +
      '*Phone:* ' + encodeURIComponent(phone) + '%0A' +
      '*Service:* ' + encodeURIComponent(service) + '%0A' +
      '*Event Date:* ' + encodeURIComponent(eventDate) + '%0A' +
      '*Event Time:* ' + encodeURIComponent(eventTime) + '%0A' +
      '*Message:* ' + encodeURIComponent(message || 'No additional message') + '%0A%0A' +
      'Sent from Legend Mash Studios website';
    
    // Your WhatsApp number (replace with actual number)
    var whatsappNumber = '254790817100'; // Format: country code + number (no + or spaces)
    
    // Open WhatsApp
    var whatsappURL = 'https://wa.me/' + whatsappNumber + '?text=' + whatsappMessage;
    window.open(whatsappURL, '_blank');
    
    // Show success message
    feedback.textContent = 'Opening WhatsApp...';
    feedback.style.color = '#c8a04a';
    
    // Reset form
    form.reset();
  });
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWhatsAppBooking);
} else {
  initWhatsAppBooking();
}

})();
