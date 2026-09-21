// ==========================================================================
// Warren's Elite Detailing — front-end behavior
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initPromoCountdown();
  initEstimator();
  initQuoteForm();
  initGallery();
});

/* --------------------------------------------------------------------
   Instant estimate calculator
   --------------------------------------------------------------------
   Pricing tiers based on typical mobile detailing market ranges.
   TO ADJUST PRICING: edit the numbers in PACKAGE_PRICING / VEHICLE_MULTIPLIER
   / CONDITION_MULTIPLIER below — nothing else needs to change.
   -------------------------------------------------------------------- */

// Base price range + base time range (hours) per package, for a midsize vehicle in moderate condition
const PACKAGE_PRICING = {
  basic:    { label: 'Basic Wash / Exterior Detail',     low: 40,  high: 80,  timeLow: 1,   timeHigh: 1.5 },
  interior: { label: 'Interior Detail',                  low: 75,  high: 150, timeLow: 1.5, timeHigh: 2.5 },
  full:     { label: 'Full Detail (Interior & Exterior)', low: 150, high: 300, timeLow: 2.5, timeHigh: 3.5 },
  premium:  { label: 'Premium / Showroom Detail',        low: 250, high: 500, timeLow: 3.5, timeHigh: 5.5 },
};

const VEHICLE_LABELS = {
  sedan: 'Sedan / Coupe',
  midsize: 'Midsize Car / Small SUV',
  large: 'Large SUV / Truck / Van',
};

// Multiplier applied to the base package price/time
const VEHICLE_MULTIPLIER = { sedan: 0.9, midsize: 1.0, large: 1.25 };

const CONDITION_LABELS = {
  light: 'Light — regular upkeep',
  moderate: 'Moderate — normal daily use',
  heavy: 'Heavy — stains, pet hair, heavy soil',
};

const CONDITION_MULTIPLIER = { light: 0.9, moderate: 1.0, heavy: 1.25 };

function calculateEstimate() {
  const packageKey = document.getElementById('estPackage').value;
  const vehicleKey = document.getElementById('estVehicle').value;
  const conditionKey = document.getElementById('estCondition').value;
  const addonInputs = Array.from(document.querySelectorAll('.estimator-addons input[type="checkbox"]:checked'));

  const pkg = PACKAGE_PRICING[packageKey];
  const vehicleMult = VEHICLE_MULTIPLIER[vehicleKey];
  const conditionMult = CONDITION_MULTIPLIER[conditionKey];

  let low = pkg.low * vehicleMult * conditionMult;
  let high = pkg.high * vehicleMult * conditionMult;
  let timeLow = pkg.timeLow * vehicleMult * conditionMult;
  let timeHigh = pkg.timeHigh * vehicleMult * conditionMult;

  const addonNames = [];
  addonInputs.forEach((input) => {
    const addonPrice = parseFloat(input.dataset.price) || 0;
    const addonTime = parseFloat(input.dataset.time) || 0;
    low += addonPrice * 0.8;
    high += addonPrice * 1.2;
    timeLow += addonTime;
    timeHigh += addonTime;
    addonNames.push(input.parentElement.textContent.trim().split('+')[0].trim());
  });

  return {
    packageLabel: pkg.label,
    vehicleLabel: VEHICLE_LABELS[vehicleKey],
    conditionLabel: CONDITION_LABELS[conditionKey],
    addonNames,
    priceLow: Math.round(low / 5) * 5,
    priceHigh: Math.round(high / 5) * 5,
    timeLow: Math.round(timeLow * 2) / 2,
    timeHigh: Math.round(timeHigh * 2) / 2,
  };
}

function formatEstimate(est) {
  const priceRange = `$${est.priceLow} – $${est.priceHigh}`;
  const timeRange = `${est.timeLow} – ${est.timeHigh} hrs`;
  return { priceRange, timeRange };
}

function initEstimator() {
  const estimatorEl = document.getElementById('estimator');
  if (!estimatorEl) return;

  const priceEl = document.getElementById('estPriceRange');
  const timeEl = document.getElementById('estTimeRange');
  const packageSelect = document.getElementById('estPackage');
  const vehicleSelect = document.getElementById('estVehicle');
  const conditionSelect = document.getElementById('estCondition');
  const addonChecks = document.querySelectorAll('.estimator-addons input[type="checkbox"]');

  function refresh() {
    const est = calculateEstimate();
    const { priceRange, timeRange } = formatEstimate(est);
    priceEl.textContent = priceRange;
    timeEl.textContent = timeRange;
    return est;
  }

  [packageSelect, vehicleSelect, conditionSelect].forEach((el) => el.addEventListener('change', refresh));
  addonChecks.forEach((el) => el.addEventListener('change', refresh));

  refresh();

  // "Book Now" — sends the estimate to Warren by email AND opens the Google Calendar
  // booking page in a new tab so the customer can grab a time slot right away.
  const bookBtn = document.getElementById('estBookNowBtn');
  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      const est = refresh();
      applyEstimateToForm(est, 'Book Now');
      document.getElementById('quoteFormHeading').textContent = 'Confirm your details to book';
      document.getElementById('submitBtnLabel').textContent = 'Send Booking Request';

      // Open the booking calendar right away in a new tab
      window.open('https://calendar.app.google/R5X62DQGGWWicwbE6', '_blank', 'noopener');

      // Scroll to the form and auto-submit the estimate so Warren gets it by email
      document.getElementById('quote').scrollIntoView({ behavior: 'smooth', block: 'start' });
      showBookingReminder();
    });
  }

  // "Email Me This Estimate" — carries the estimate into the form as a plain request, no booking framing.
  const emailBtn = document.getElementById('estEmailBtn');
  if (emailBtn) {
    emailBtn.addEventListener('click', () => {
      const est = refresh();
      applyEstimateToForm(est, 'Email Estimate');
      document.getElementById('quoteFormHeading').textContent = 'Where should we send it?';
      document.getElementById('submitBtnLabel').textContent = 'Email Me This Estimate';
      document.getElementById('quote').scrollIntoView({ behavior: 'smooth', block: 'start' });
      const nameInput = document.querySelector('#quoteForm input[name="name"]');
      if (nameInput) setTimeout(() => nameInput.focus(), 400);
    });
  }
}

// Shows a one-time reminder banner above the form after "Book Now" opens the calendar tab,
// since the calendar itself can't be pre-filled with the estimate — the form fills that gap.
function showBookingReminder() {
  let reminderEl = document.getElementById('bookingReminderBanner');
  if (!reminderEl) {
    reminderEl = document.createElement('div');
    reminderEl.id = 'bookingReminderBanner';
    reminderEl.className = 'estimator-summary-banner booking-reminder';
    document.getElementById('quoteForm').prepend(reminderEl);
  }
  reminderEl.innerHTML = `
    <strong>Booking calendar opened in a new tab.</strong>
    <span>Pick your time there, then finish this form so we receive your estimate details and can confirm your appointment.</span>
  `;
  const nameInput = document.querySelector('#quoteForm input[name="name"]');
  if (nameInput) setTimeout(() => nameInput.focus(), 500);
}

function applyEstimateToForm(est, requestType) {
  const { priceRange, timeRange } = formatEstimate(est);
  const details = `Package: ${est.packageLabel} | Vehicle size: ${est.vehicleLabel} | Condition: ${est.conditionLabel}` +
    (est.addonNames.length ? ` | Add-ons: ${est.addonNames.join(', ')}` : '');

  document.getElementById('hiddenEstPrice').value = priceRange;
  document.getElementById('hiddenEstTime').value = timeRange;
  document.getElementById('hiddenEstDetails').value = details;
  document.getElementById('hiddenRequestType').value = requestType;
  document.getElementById('formSubject').value =
    requestType === 'Book Now'
      ? `Booking request (est. ${priceRange}) — Warren's Elite Detailing`
      : `Estimate request (est. ${priceRange}) — Warren's Elite Detailing`;

  // Show a summary banner above the form so the customer sees what they're submitting
  let summaryEl = document.getElementById('estSummaryBanner');
  if (!summaryEl) {
    summaryEl = document.createElement('div');
    summaryEl.id = 'estSummaryBanner';
    summaryEl.className = 'estimator-summary-banner';
    document.getElementById('quoteForm').prepend(summaryEl);
  }
  summaryEl.innerHTML = `
    <strong>Your estimate:</strong> ${priceRange} · ${timeRange}
    <span>${est.packageLabel} — ${est.vehicleLabel}, ${est.conditionLabel}</span>
  `;
}

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
