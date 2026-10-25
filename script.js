/**
 * Luna Beauty Studio - Core Interactive Application
 * Plain JavaScript (ES6+), Production-Minded, Framework-Free
 */

'use strict';

// ============================================================================
// 1. Studio Configuration
// ============================================================================
const SALON_CONFIG = {
  salonName: 'Luna Beauty Studio',
  whatsappNumber: 'REPLACE_WITH_FULL_WHATSAPP_NUMBER', // Format: 447XXXXXXXXX (e.g., 447123456789)
  instagramUrl: 'REPLACE_WITH_INSTAGRAM_URL',
  address: 'REPLACE_WITH_REAL_ADDRESS',
  displayAddress: 'Mayfair, Central London, W1K, United Kingdom',
  hoursDescription: 'Monday–Saturday: 9:00 AM – 7:00 PM | Sunday: Closed',
  openHour: 9,
  closeHour: 19
};

// Check for user-tested temporary number in sessionStorage
const storedTestNumber = sessionStorage.getItem('luna_test_whatsapp');
if (storedTestNumber) {
  SALON_CONFIG.whatsappNumber = storedTestNumber;
}

// ============================================================================
// 2. WhatsApp URL Generator & Sanitization
// ============================================================================
/**
 * Normalizes a phone number for the official WhatsApp click-to-chat API.
 * Removes spaces, plus signs, brackets, and dashes.
 * Ensures international format without leading plus sign.
 */
function sanitizeWhatsAppNumber(rawNumber) {
  if (!rawNumber || typeof rawNumber !== 'string') return null;
  // If it still contains placeholder text
  if (rawNumber.includes('REPLACE_WITH') || rawNumber.trim() === '') {
    return null;
  }
  // Strip all non-digit characters
  const cleaned = rawNumber.replace(/\D/g, '');
  // Valid international numbers generally have between 10 and 15 digits
  if (cleaned.length < 9 || cleaned.length > 15) {
    return null;
  }
  return cleaned;
}

/**
 * Builds the official WhatsApp click-to-chat URL.
 * https://wa.me/WHATSAPP_NUMBER?text=ENCODED_MESSAGE
 */
function buildWhatsAppUrl(message) {
  const cleanNumber = sanitizeWhatsAppNumber(SALON_CONFIG.whatsappNumber);
  if (!cleanNumber) {
    return null;
  }
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Handles WhatsApp link triggers safely.
 * If number is still a placeholder, shows a polite modal/toast so the user
 * or developer can immediately test with their real number.
 */
function handleWhatsAppAction(message, fallbackService = 'Appointment') {
  const url = buildWhatsAppUrl(message);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    showWhatsAppSetupPrompt(message, fallbackService);
  }
}

// ============================================================================
// 3. UI Notification & Setup Modal
// ============================================================================
function showToast(title, message, isError = false) {
  let toast = document.getElementById('luna-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'luna-toast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <strong style="color:var(--color-blush);">${title}</strong>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    </div>
    <div>${message}</div>
  `;

  toast.classList.add('show');

  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.classList.remove('show');
    });
  }

  setTimeout(() => {
    toast.classList.remove('show');
  }, 7000);
}

function showWhatsAppSetupPrompt(prefilledMessage, serviceName) {
  // Check if modal exists
  let modal = document.getElementById('whatsapp-setup-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'whatsapp-setup-modal';
    modal.className = 'lightbox-modal';
    modal.style.zIndex = '300';
    modal.innerHTML = `
      <div style="background:var(--color-ivory); color:var(--color-text); padding:2rem; border-radius:18px; max-width:480px; width:90%; box-shadow:var(--shadow-lg); border:1px solid var(--color-border-rose); position:relative;">
        <button id="close-setup-modal" style="position:absolute; top:1rem; right:1.25rem; font-size:1.5rem; color:var(--color-plum);" aria-label="Close setup modal">&times;</button>
        <div style="width:48px; height:48px; border-radius:50%; background:var(--color-blush); color:var(--color-plum); display:flex; align-items:center; justify-content:center; margin-bottom:1rem;">
          <svg style="width:24px; height:24px; fill:currentColor;" viewBox="0 0 24 24">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/>
          </svg>
        </div>
        <h3 style="font-family:var(--font-serif); font-size:1.4rem; color:var(--color-plum); margin-bottom:0.5rem;">Configure WhatsApp Number</h3>
        <p style="font-size:0.9rem; color:var(--color-text-muted); margin-bottom:1.25rem; line-height:1.5;">
          The salon's WhatsApp number is currently set to the placeholder <code>REPLACE_WITH_FULL_WHATSAPP_NUMBER</code>.
          To test live booking now, enter a UK WhatsApp number (e.g., <strong>447123456789</strong>):
        </p>
        <div style="margin-bottom:1.25rem;">
          <input type="tel" id="test-wa-input" placeholder="e.g. 447123456789" style="width:100%; padding:0.75rem 1rem; border:1px solid var(--color-border-rose); border-radius:10px; font-size:1rem; font-family:inherit; background:#fff; color:var(--color-text);" />
          <span style="font-size:0.76rem; color:var(--color-text-muted); display:block; margin-top:0.35rem;">Enter country code without the leading + sign.</span>
        </div>
        <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
          <button id="cancel-setup-btn" class="btn btn-secondary btn-sm">Dismiss</button>
          <button id="save-test-wa-btn" class="btn btn-primary btn-sm">Save &amp; Open Chat</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-setup-modal');
    const cancelBtn = modal.querySelector('#cancel-setup-btn');
    const saveBtn = modal.querySelector('#save-test-wa-btn');
    const input = modal.querySelector('#test-wa-input');

    const closeModal = () => modal.classList.remove('open');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    saveBtn.addEventListener('click', () => {
      const val = input.value.trim();
      const sanitized = sanitizeWhatsAppNumber(val);
      if (!sanitized) {
        showToast('Invalid Number', 'Please enter a valid phone number with country code (e.g. 447123456789).', true);
        return;
      }
      SALON_CONFIG.whatsappNumber = sanitized;
      sessionStorage.setItem('luna_test_whatsapp', sanitized);
      closeModal();
      showToast('Number Configured', `Updated to +${sanitized}. Opening WhatsApp...`);
      setTimeout(() => {
        handleWhatsAppAction(prefilledMessage, serviceName);
      }, 500);
    });
  }

  modal.classList.add('open');
  const input = modal.querySelector('#test-wa-input');
  if (input) {
    input.focus();
  }
}

// ============================================================================
// 4. Mobile Navigation Drawer
// ============================================================================
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-nav-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Sticky header shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  if (!toggleBtn || !drawer || !backdrop) return;

  function openMenu() {
    toggleBtn.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggleBtn.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  backdrop.addEventListener('click', closeMenu);

  // Highlight current page nav link
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (!href) return;
    const cleanHref = href.split('#')[0];
    const isHomePage = currentPath.endsWith('/') || currentPath.endsWith('/index.html') || currentPath === '';
    
    if (isHomePage && (cleanHref === 'index.html' || cleanHref === '/' || cleanHref === '')) {
      link.classList.add('active');
    } else if (!isHomePage && cleanHref && currentPath.includes(cleanHref)) {
      link.classList.add('active');
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenu();
    }
  });
}

// ============================================================================
// 5. Services WhatsApp Links & Filtering
// ============================================================================
function initServices() {
  // Setup WhatsApp trigger on service cards
  const serviceButtons = document.querySelectorAll('.service-book-btn');
  serviceButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-service') || 'Treatment';
      const message = `Hello Luna Beauty Studio, I would like to enquire about booking a ${serviceName.toLowerCase()} appointment. Could you please let me know your available dates and times?`;
      handleWhatsAppAction(message, serviceName);
    });
  });

  // Services category filtering
  const filterButtons = document.querySelectorAll('.services-filter-bar .filter-btn');
  const serviceCards = document.querySelectorAll('.service-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      serviceCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // General Booking buttons (Hero CTA, Nav CTA, Booking Section CTA, Contact CTA)
  const generalBookingBtns = document.querySelectorAll('.general-booking-btn');
  generalBookingBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const message = `Hello Luna Beauty Studio, I would like to book an appointment. Could you please share your available dates and times?`;
      handleWhatsAppAction(message, 'General Booking');
    });
  });
}

// ============================================================================
// 6. Gallery Filter & Interactive Lightbox
// ============================================================================
function initGalleryAndLightbox() {
  const filterBtns = document.querySelectorAll('.gallery-filter-bar .filter-btn');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  let currentVisibleItems = [...galleryItems];
  let currentIndex = 0;

  // Gallery filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (category === 'all' || itemCat === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      // Update currently active items for lightbox cycling
      currentVisibleItems = galleryItems.filter(item => item.style.display !== 'none');
    });
  });

  // Lightbox open function
  function openLightbox(index) {
    if (!currentVisibleItems.length) return;
    currentIndex = index;
    const item = currentVisibleItems[currentIndex];
    const img = item.querySelector('img');
    const title = item.getAttribute('data-title') || img.getAttribute('alt') || 'Salon Work';

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxTitle.textContent = title;
    lightboxCounter.textContent = `${currentIndex + 1} of ${currentVisibleItems.length}`;

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showNext() {
    if (!currentVisibleItems.length) return;
    currentIndex = (currentIndex + 1) % currentVisibleItems.length;
    openLightbox(currentIndex);
  }

  function showPrev() {
    if (!currentVisibleItems.length) return;
    currentIndex = (currentIndex - 1 + currentVisibleItems.length) % currentVisibleItems.length;
    openLightbox(currentIndex);
  }

  // Attach click to each gallery item
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = currentVisibleItems.indexOf(item);
      if (idx !== -1) {
        openLightbox(idx);
      }
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const idx = currentVisibleItems.indexOf(item);
        if (idx !== -1) {
          openLightbox(idx);
        }
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

  // Close when clicking outside image wrap
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNext();
    } else if (e.key === 'ArrowLeft') {
      showPrev();
    }
  });
}

// ============================================================================
// 7. Accessible FAQ Accordion
// ============================================================================
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');

    if (!header || !content) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other items (accordion single-open style for clean readability)
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherHeader = other.querySelector('.faq-header');
          const otherContent = other.querySelector('.faq-content');
          if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

// ============================================================================
// 8. Live Studio Open/Closed Status (London Time)
// ============================================================================
function updateSalonLiveStatus() {
  const statusPill = document.getElementById('live-status-indicator');
  if (!statusPill) return;

  try {
    // Determine current hour & day in Europe/London timezone
    const now = new Date();
    const londonTimeStr = now.toLocaleString('en-GB', { timeZone: 'Europe/London' });
    const londonDate = new Date(londonTimeStr);

    const day = londonDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = londonDate.getHours();

    const isSunday = day === 0;
    const isOpen = !isSunday && hours >= SALON_CONFIG.openHour && hours < SALON_CONFIG.closeHour;

    const dot = statusPill.querySelector('.status-dot');
    const text = statusPill.querySelector('.status-text');

    if (isOpen) {
      if (dot) dot.classList.remove('closed');
      if (text) text.textContent = 'Open Today · 9:00 AM – 7:00 PM';
    } else if (isSunday) {
      if (dot) dot.classList.add('closed');
      if (text) text.textContent = 'Closed Today (Sunday) · Reopens Mon 9:00 AM';
    } else if (hours < SALON_CONFIG.openHour) {
      if (dot) dot.classList.add('closed');
      if (text) text.textContent = 'Opens Today at 9:00 AM';
    } else {
      if (dot) dot.classList.add('closed');
      if (text) text.textContent = 'Closed for the evening · Reopens tomorrow at 9:00 AM';
    }
  } catch (err) {
    // Fallback if Intl timeZone fails
    const text = statusPill.querySelector('.status-text');
    if (text) text.textContent = 'Mon–Sat: 9:00 AM – 7:00 PM';
  }
}

// ============================================================================
// 9. Interactive Settings Bar & Developer Utilities
// ============================================================================
function initDeveloperTools() {
  const saveBtn = document.getElementById('save-config-btn');
  const input = document.getElementById('dev-wa-input');
  const addressCopyBtn = document.getElementById('copy-address-btn');

  if (saveBtn && input) {
    if (SALON_CONFIG.whatsappNumber && !SALON_CONFIG.whatsappNumber.includes('REPLACE_')) {
      input.value = SALON_CONFIG.whatsappNumber;
    }

    saveBtn.addEventListener('click', () => {
      const val = input.value.trim();
      const sanitized = sanitizeWhatsAppNumber(val);
      if (!sanitized) {
        showToast('Invalid Phone Format', 'Please enter a valid UK/international number with country code (e.g. 447123456789).', true);
        return;
      }
      SALON_CONFIG.whatsappNumber = sanitized;
      sessionStorage.setItem('luna_test_whatsapp', sanitized);
      showToast('Configuration Updated', `Live WhatsApp link target updated to +${sanitized}.`);
    });
  }

  if (addressCopyBtn) {
    addressCopyBtn.addEventListener('click', () => {
      const text = SALON_CONFIG.displayAddress;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Address Copied', 'Studio address copied to your clipboard.');
      }).catch(() => {
        showToast('Address', text);
      });
    });
  }
}

// ============================================================================
// 10. General Polish & Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Dynamic copyright year
  const yearEl = document.getElementById('copyright-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Back to top button
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Graceful image fallback handler
  const allImages = document.querySelectorAll('img');
  allImages.forEach(img => {
    img.addEventListener('error', function() {
      // Fallback SVG placeholder with brand colours if any Unsplash image drops
      const width = this.getAttribute('width') || 600;
      const height = this.getAttribute('height') || 400;
      this.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="%23F2D9D5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="20" fill="%23512D3A">Luna Beauty Studio</text></svg>`;
    });
  });

  // Initialize modules
  initNavigation();
  initServices();
  initGalleryAndLightbox();
  initFaqAccordion();
  updateSalonLiveStatus();
  initDeveloperTools();

  // Refresh live status every minute
  setInterval(updateSalonLiveStatus, 60000);
});
