document.addEventListener("DOMContentLoaded", function () {

  // ===== SLIDESHOW =====
  const slides = document.querySelectorAll('.slide');
  let slideIndex = 0;

  function nextSlide() {
    if (slides.length === 0) return;
    slides.forEach(slide => slide.classList.remove('active'));
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add('active');
  }

  setInterval(nextSlide, 4000);

  // ===== FILTER FUNCTION =====
  filterSelection("all");

  function filterSelection(category) {
    let products = document.getElementsByClassName("product");
    for (let i = 0; i < products.length; i++) {
      products[i].style.display = "none";
      if (category === "all" || products[i].classList.contains(category)) {
        products[i].style.display = "block";
      }
    }
  }

  window.filterSelection = filterSelection;
});


/* ===== NAV TOGGLE (mobile) ===== */
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');
navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMenu.classList.remove('open'));
});

/* ===== CATALOG FILTER ===== */
function filterSelection(category, btn) {
  document.querySelectorAll('.buttons button').forEach(b => b.classList.remove('active-filter'));
  if (btn) btn.classList.add('active-filter');

  const hero = document.querySelector('.catalog-hero');
  if (hero) hero.style.display =
    (category === 'all' || hero.classList.contains(category)) ? 'flex' : 'none';

  document.querySelectorAll('.catalog-thumb').forEach(t => {
    t.style.display =
      (category === 'all' || t.classList.contains(category)) ? 'flex' : 'none';
  });

  const row = document.querySelector('.catalog-row');
  if (row) {
    const anyVisible = [...row.querySelectorAll('.catalog-thumb')]
      .some(t => t.style.display !== 'none');
    row.style.display = anyVisible ? 'flex' : 'none';
  }
}

/* ===== SET MIN DATE FOR APPOINTMENT ===== */
(function setMinDate() {
  const dateInput = document.getElementById('apptDate');
  if (!dateInput) return;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
})();


/* =========================================================
   FORM VALIDATION + DATABASE INTEGRATION
   ========================================================= */

// Backend API URL - Updated for Vercel Production
const API_URL = window.location.origin;

// --- Validation Helper: Show Error ---
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  clearError(inputId); // remove previous error
  input.style.borderColor = '#c0392b';
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.color = '#c0392b';
  errorDiv.style.fontSize = '12px';
  errorDiv.style.marginTop = '4px';
  errorDiv.style.fontWeight = '600';
  input.parentNode.appendChild(errorDiv);
}

// --- Validation Helper: Clear Error ---
function clearError(inputId) {
  const input = document.getElementById(inputId);
  input.style.borderColor = '#ddd';
  const existing = input.parentNode.querySelector('.field-error');
  if (existing) existing.remove();
}

// --- Validation Helper: Clear All Errors ---
function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.remove());
  document.querySelectorAll('.appt-form input, .appt-form select, .appt-form textarea').forEach(el => {
    el.style.borderColor = '#ddd';
  });
}

// --- Validate Full Name ---
function validateName(name) {
  if (!name || name.trim() === '') {
    return 'Full name is required.';
  }
  if (!/^[A-Za-z\s]+$/.test(name.trim())) {
    return 'Only letters and spaces allowed. No numbers or special characters.';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  if (name.trim().length > 100) {
    return 'Name must be less than 100 characters.';
  }
  return null; 
}

// --- Validate Phone Number ---
function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required.';
  }
  const cleaned = phone.trim().replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(cleaned)) {
    return 'Phone must be exactly 10 digits (numbers only).';
  }
  return null;
}

// --- Validate Date ---
function validateDate(date) {
  if (!date) {
    return 'Please select a date.';
  }
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selected <= today) {
    return 'Please select a future date.';
  }
  return null;
}

// --- Validate Time ---
function validateTime(time) {
  if (!time) {
    return 'Please select a time slot.';
  }
  return null;
}

// --- Validate Service ---
function validateService(service) {
  if (!service) {
    return 'Please select a service type.';
  }
  return null;
}

// --- Real-time Validation on Input ---
document.getElementById('apptName')?.addEventListener('input', function() {
  const err = validateName(this.value);
  if (err) showError('apptName', err);
  else clearError('apptName');
});

document.getElementById('apptPhone')?.addEventListener('input', function() {
  const err = validatePhone(this.value);
  if (err) showError('apptPhone', err);
  else clearError('apptPhone');
});

document.getElementById('apptDate')?.addEventListener('change', function() {
  const err = validateDate(this.value);
  if (err) showError('apptDate', err);
  else clearError('apptDate');
});


/* ===== APPOINTMENT FORM SUBMISSION ===== */
function submitAppointment(e) {
  e.preventDefault();
  clearAllErrors();

  const name    = document.getElementById('apptName').value;
  const phone   = document.getElementById('apptPhone').value;
  const date    = document.getElementById('apptDate').value;
  const time    = document.getElementById('apptTime').value;
  const service = document.getElementById('apptService').value;
  const notes   = document.getElementById('apptNotes').value.trim();

  let hasError = false;

  const nameErr = validateName(name);
  if (nameErr) { showError('apptName', nameErr); hasError = true; }

  const phoneErr = validatePhone(phone);
  if (phoneErr) { showError('apptPhone', phoneErr); hasError = true; }

  const dateErr = validateDate(date);
  if (dateErr) { showError('apptDate', dateErr); hasError = true; }

  const timeErr = validateTime(time);
  if (timeErr) { showError('apptTime', timeErr); hasError = true; }

  const serviceErr = validateService(service);
  if (serviceErr) { showError('apptService', serviceErr); hasError = true; }

  if (hasError) return;

  const cleanPhone = phone.trim().replace(/[\s-]/g, '');

  const submitBtn = document.querySelector('.appt-form .submit-btn');
  submitBtn.textContent = 'Booking...';
  submitBtn.disabled = true;

  fetch(`${API_URL}/api/add-appointment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name.trim(),
      phone: cleanPhone,
      date: date,
      time: time,
      service: service,
      notes: notes
    })
  })
  .then(response => response.json())
  .then(data => {
    submitBtn.textContent = 'Confirm Appointment';
    submitBtn.disabled = false;

    if (data.success) {
      const [yr, mo, dy] = date.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const readableDate = `${dy} ${months[parseInt(mo)-1]} ${yr}`;

      document.getElementById('appointmentForm').style.display = 'none';
      const successEl = document.getElementById('apptSuccess');
      document.getElementById('apptSuccessMsg').textContent =
        `Hi ${name.trim()}! Your appointment for ${service} on ${readableDate} at ${time} has been noted. (ID: #${data.appointmentId})`;
      successEl.style.display = 'block';

      const msg = encodeURIComponent(
        `*New Appointment Request*\n\n` +
        `Name: ${name.trim()}\nPhone: ${cleanPhone}\nDate: ${readableDate}\n` +
        `Time: ${time}\nService: ${service}` +
        (notes ? `\nNotes: ${notes}` : '')
      );
      setTimeout(() => {
        window.open(`https://wa.me/918975015482?text=${msg}`, '_blank');
      }, 800);
    } else {
      const errorMsg = data.errors ? data.errors.join('\n') : data.message;
      alert('Error: ' + errorMsg);
    }
  })
  .catch(err => {
    submitBtn.textContent = 'Confirm Appointment';
    submitBtn.disabled = false;
    console.error('Server error:', err);
    alert('Could not connect to server. Please try again later.');
  });
}

function resetAppointment() {
  document.getElementById('appointmentForm').reset();
  document.getElementById('appointmentForm').style.display = 'block';
  document.getElementById('apptSuccess').style.display = 'none';
  clearAllErrors();
}


/* ===== STAR RATING ===== */
const stars = document.querySelectorAll('.star');
stars.forEach(star => {
  star.addEventListener('click', () => {
    const val = parseInt(star.dataset.val);
    document.getElementById('reviewRating').value = val;
    stars.forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.val) <= val);
    });
  });
  star.addEventListener('mouseenter', () => {
    const val = parseInt(star.dataset.val);
    stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= val));
  });
  star.addEventListener('mouseleave', () => {
    const current = parseInt(document.getElementById('reviewRating').value);
    stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= current));
  });
});

/* ===== IMAGE UPLOAD PREVIEW ===== */
let uploadedImageData = null;

function handleImageUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be smaller than 5 MB.');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImageData = e.target.result;
    const preview = document.getElementById('imagePreview');
    preview.src = uploadedImageData;
    preview.style.display = 'block';
    document.getElementById('fileDropLabel').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

/* ===== SEED REVIEWS ===== */
const seedReviews = [
  {
    name: 'Rahul Sharma',
    bill: 'LM-20260101-001',
    rating: 5,
    text: 'Excellent stitching quality! The kurta fit perfectly and the fabric was exactly as discussed. Highly recommend Lucky Men\'s for any custom work.',
    img: null,
    date: '2 Jan 2026'
  },
  {
    name: 'Amit Deshmukh',
    bill: 'LM-20260210-007',
    rating: 5,
    text: 'Got a full suit stitched here and I couldn\'t be happier. Perfect measurements, on-time delivery, and great customer service throughout!',
    img: null,
    date: '10 Feb 2026'
  },
  {
    name: 'Priya Kulkarni',
    bill: 'LM-20260318-012',
    rating: 4,
    text: 'Ordered an indo-western outfit for my son\'s wedding and it turned out beautifully. Staff is very friendly and guided us well with fabric choices.',
    img: null,
    date: '18 Mar 2026'
  }
];

/* ===== RENDER REVIEWS ===== */
function renderReviews() {
  const stored = JSON.parse(localStorage.getItem('lm_reviews') || '[]');
  const all = [...stored, ...seedReviews];
  const grid = document.getElementById('reviewsGrid');
  if(!grid) return;
  grid.innerHTML = '';
  all.forEach(r => {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    grid.insertAdjacentHTML('beforeend', `
      <div class="review-card">
        <div class="review-card-top">
          <div class="reviewer-name">${escapeHtml(r.name)}</div>
          <div class="bill-tag">Bill: ${escapeHtml(r.bill)}</div>
        </div>
        <div class="review-stars">${stars}</div>
        <div class="review-text">${escapeHtml(r.text)}</div>
        ${r.img ? `<img class="review-img" src="${r.img}" alt="Customer photo">` : ''}
        <div class="review-date">${r.date}</div>
      </div>
    `);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

renderReviews();

/* ===== SUBMIT REVIEW ===== */
function submitReview(e) {
  e.preventDefault();
  const rating = parseInt(document.getElementById('reviewRating').value);
  if (!rating) { alert('Please select a star rating.'); return; }

  const name = document.getElementById('reviewName').value.trim();
  const bill = document.getElementById('reviewBill').value.trim();
  const text = document.getElementById('reviewText').value.trim();
  const now  = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  const review = { name, bill, rating, text, img: uploadedImageData, date: dateStr };

  const stored = JSON.parse(localStorage.getItem('lm_reviews') || '[]');
  stored.unshift(review);
  localStorage.setItem('lm_reviews', JSON.stringify(stored));

  renderReviews();

  document.getElementById('reviewForm').style.display = 'none';
  document.getElementById('reviewSuccess').style.display = 'block';
}

function resetReview() {
  document.getElementById('reviewForm').reset();
  document.getElementById('reviewRating').value = '0';
  document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
  uploadedImageData = null;
  const preview = document.getElementById('imagePreview');
  preview.style.display = 'none';
  document.getElementById('fileDropLabel').style.display = 'flex';
  document.getElementById('reviewForm').style.display = 'block';
  document.getElementById('reviewSuccess').style.display = 'none';
}