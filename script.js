// ==========================================================================
// Warren's Elite Detailing — front-end behavior
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initPromoCountdown();
  initQuoteForm();
  initGallery();
});

/* --------------------------------------------------------------------
   Gallery: completed job photos
   --------------------------------------------------------------------
   TO ADD A NEW PHOTO:
     1. Drop the image file into the "assets/gallery/" folder.
     2. Add one line below with its filename and a short caption.
     3. Save — that's it, no HTML or CSS editing needed.

   The newest entry at the TOP of the list shows first on the site.
   -------------------------------------------------------------------- */
const GALLERY_PHOTOS = [
  // { src: 'assets/gallery/job-01-after.jpg', caption: 'Full interior & exterior detail — Kinston, NC' },
];

function initGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  if (GALLERY_PHOTOS.length === 0) {
    grid.innerHTML = '<div class="gallery-empty">Photos from our first completed details are coming soon — check back shortly.</div>';
    return;
  }

  grid.innerHTML = GALLERY_PHOTOS.map((photo) => `
    <div class="gallery-item">
      <img src="${photo.src}" alt="${photo.caption ? photo.caption.replace(/"/g, '&quot;') : 'Completed detailing job'}" loading="lazy">
      ${photo.caption ? `<div class="gallery-caption">${photo.caption}</div>` : ''}
    </div>
  `).join('');
}

/* --------------------------------------------------------------------
   Promo countdown timer
   -------------------------------------------------------------------- */
function initPromoCountdown() {
  const timerEl = document.getElementById('promoTimer');
  if (!timerEl) return;

  // ---- EDIT THIS DATE to change the launch-rate deadline ----
  // Format: YYYY-MM-DDTHH:mm:ss (interpreted in the visitor's local time)
  const DEADLINE = new Date('2026-09-25T23:59:59');

  const daysEl = document.getElementById('tDays');
  const hoursEl = document.getElementById('tHours');
  const minutesEl = document.getElementById('tMinutes');
  const secondsEl = document.getElementById('tSeconds');
  const labelEl = timerEl.querySelector('.promo-timer-label');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function render() {
    const now = new Date();
    const diff = DEADLINE.getTime() - now.getTime();

    if (diff <= 0) {
      timerEl.classList.add('expired');
      if (labelEl) labelEl.textContent = 'Launch rate has ended';
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      clearInterval(intervalId);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  render();
  const intervalId = setInterval(render, 1000);
}

/* --------------------------------------------------------------------
   Quote form: inline validation + async submit + loading state
   -------------------------------------------------------------------- */
function initQuoteForm() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  const statusEl = document.getElementById('formStatus');
  const submitBtn = form.querySelector('button[type="submit"]');

  const validators = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name.'),
    phone: (v) => (/^[\d\s()+-]{7,}$/.test(v.trim()) ? '' : 'Please enter a valid phone number.'),
    email: (v) => (v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.'),
    vehicle: (v) => (v.trim().length >= 2 ? '' : 'Please enter your vehicle year, make, and model.'),
    package: (v) => (v.trim() !== '' ? '' : 'Please select a package.'),
  };

  function showFieldError(name, message) {
    const input = form.elements[name];
    const errorEl = form.querySelector(`[data-error-for="${name}"]`);
    if (input) input.classList.toggle('invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message;
  }

  function validateField(name) {
    const input = form.elements[name];
    if (!input || !validators[name]) return true;
    const message = validators[name](input.value);
    showFieldError(name, message);
    return message === '';
  }

  // Validate on blur for immediate, non-annoying feedback
  Object.keys(validators).forEach((name) => {
    const input = form.elements[name];
    if (!input) return;
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) validateField(name);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Honeypot: if a bot filled this hidden field, silently drop the submission
    const honeypot = form.elements['_gotcha'];
    if (honeypot && honeypot.value.trim() !== '') {
      return;
    }

    const fieldsToValidate = Object.keys(validators);
    const results = fieldsToValidate.map(validateField);
    const isValid = results.every(Boolean);

    if (!isValid) {
      statusEl.textContent = 'Please fix the highlighted fields above.';
      statusEl.className = 'form-status error';
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    statusEl.textContent = 'Sending your request…';
    statusEl.className = 'form-status';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        statusEl.textContent = "Thanks! Your quote request is in — we'll be in touch shortly.";
        statusEl.className = 'form-status success';
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      statusEl.textContent = 'Something went wrong sending your request. Please call/text instead so we don\u2019t miss you.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });
}
