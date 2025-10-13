document.addEventListener('DOMContentLoaded', function () {
  // Helpers
  const body = document.body;

  // Create single zoom overlay (if not exists)
  let zoomOverlay = document.querySelector('.zoom-overlay');
  if (!zoomOverlay) {
    zoomOverlay = document.createElement('div');
    zoomOverlay.className = 'zoom-overlay';
    zoomOverlay.innerHTML = '<img src="" alt="확대된 이미지" />';
    document.body.appendChild(zoomOverlay);
  }
  const zoomImg = zoomOverlay.querySelector('img');

  // Open/close modal functions
  function openModal(modal, triggerEl) {
    if (!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    modal.dataset._trigger = triggerEl ? (triggerEl.id || '') : '';
    // focus first focusable element inside modal (image or close button)
    const firstFocusable = modal.querySelector('.modal-content .close-btn') ||
                           modal.querySelector('.modal-images img');
    if (firstFocusable) firstFocusable.focus();
    body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
    // restore focus to triggering element if possible
    const triggerId = modal.dataset._trigger;
    if (triggerId) {
      const el = document.getElementById(triggerId);
      if (el) el.focus();
    }
  }

  // Attach click for .modal-link to open corresponding modal
  document.addEventListener('click', function (e) {
    const link = e.target.closest('.modal-link');
    if (!link) return;
    e.preventDefault();
    const targetId = link.dataset.target;
    if (!targetId) return;
    const modal = document.getElementById(targetId);
    if (!modal) return;

    // Mark the link with an id so we can restore focus later
    if (!link.id) link.id = 'modal-trigger-' + Math.random().toString(36).slice(2,9);

    // Ensure images inside modal have click handlers for zoom
    const imgs = modal.querySelectorAll('.modal-images img');
    imgs.forEach(img => {
      // make focusable for keyboard users
      img.tabIndex = 0;
      // avoid adding duplicate handlers
      if (!img.dataset.zoomHandler) {
        img.addEventListener('click', () => openZoom(img));
        img.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            openZoom(img);
          }
        });
        img.dataset.zoomHandler = '1';
      }
    });

    openModal(modal, link);
  });

  // Close buttons inside modals
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.close-btn');
    if (!btn) return;
    const modal = btn.closest('.modal');
    if (modal) closeModal(modal);
  });

  // Click outside modal-content (on modal backdrop) closes modal
  window.addEventListener('click', function (e) {
    if (e.target.classList && e.target.classList.contains('modal')) {
      closeModal(e.target);
    }
  });

  // Keyboard: Esc closes zoom overlay or modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (zoomOverlay.classList.contains('active')) {
        closeZoom();
      } else {
        // close any open modal
        const openModalEl = document.querySelector('.modal[style*="display: flex"]');
        if (openModalEl) closeModal(openModalEl);
      }
    }
  });

  // Zoom functions
  function openZoom(imgEl) {
    if (!imgEl) return;
    const src = imgEl.src || imgEl.getAttribute('data-src') || '';
    const alt = imgEl.alt || '확대된 이미지';
    zoomImg.src = src;
    zoomImg.alt = alt;
    zoomOverlay.classList.add('active');
    zoomOverlay.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
    // focus image for accessibility
    zoomImg.tabIndex = 0;
    zoomImg.focus();
  }

  function closeZoom() {
    zoomOverlay.classList.remove('active');
    zoomOverlay.setAttribute('aria-hidden', 'true');
    zoomImg.src = '';
    body.style.overflow = '';
  }

  // Click on zoom overlay closes it
  zoomOverlay.addEventListener('click', function (e) {
    // allow clicking the image itself to close as well
    closeZoom();
  });

  // ensure close when clicking on overlay but not on modal-content image etc.
  // (already handled by zoomOverlay click)

  // Accessibility: trap focus inside modal while open (basic)
  document.addEventListener('focusin', function (e) {
    const open = document.querySelector('.modal[style*="display: flex"]');
    if (!open) return;
    if (!open.contains(e.target)) {
      // if focus moves outside open modal, bring it back to modal
      const first = open.querySelector('.modal-content .close-btn') || open.querySelector('.modal-images img');
      if (first) first.focus();
    }
  });

  // Initialize existing modal-images to be keyboard accessible (in case page loaded with visible modals)
  document.querySelectorAll('.modal .modal-images img').forEach(img => {
    img.tabIndex = 0;
    if (!img.dataset.zoomHandler) {
      img.addEventListener('click', () => openZoom(img));
      img.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          openZoom(img);
        }
      });
      img.dataset.zoomHandler = '1';
    }
  });
});
