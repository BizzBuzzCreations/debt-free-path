/* ============================================
   DEBT FREE PATH — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

  /* ---- Navbar Scroll Effect ---- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* ---- Mobile Menu Toggle ---- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
    });
  }

  /* ---- Active Nav Link ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- FAQ Accordion ---- */
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', function() {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---- Smooth Scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Scroll Animations ---- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  /* ---- Animated Progress Bars (Hero) ---- */
  const progressBars = document.querySelectorAll('.progress-bar-fill[data-width]');
  if (progressBars.length) {
    setTimeout(() => {
      progressBars.forEach(bar => {
        bar.style.width = bar.getAttribute('data-width') + '%';
      });
    }, 600);
  }

  /* ---- Counter Animation ---- */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString() + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  /* ---- Debt Calculator ---- */
  const calcForm = document.getElementById('calcForm');
  if (calcForm) {
    calcForm.addEventListener('submit', function(e) {
      e.preventDefault();
      calculateDebt();
    });
    // Also recalculate on Enter key in inputs
    calcForm.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateDebt();
      });
    });
  }

  function calculateDebt() {
    const totalDebt = parseFloat(document.getElementById('totalDebt')?.value);
    const interestRate = parseFloat(document.getElementById('interestRate')?.value);
    const monthlyPayment = parseFloat(document.getElementById('monthlyPayment')?.value);
    const resultsEl = document.getElementById('calcResults');
    const placeholderEl = document.getElementById('calcPlaceholder');

    if (!totalDebt || !interestRate || !monthlyPayment || totalDebt <= 0 || monthlyPayment <= 0) {
      showCalcError('Please enter valid values for all fields.');
      return;
    }

    const monthlyRate = interestRate / 100 / 12;
    let balance = totalDebt;
    let months = 0;
    let totalPaid = 0;

    if (monthlyRate === 0) {
      months = Math.ceil(totalDebt / monthlyPayment);
      totalPaid = monthlyPayment * months;
    } else {
      const minPayment = balance * monthlyRate;
      if (monthlyPayment <= minPayment) {
        showCalcError('Monthly payment must exceed the minimum interest charge of £' + minPayment.toFixed(2) + '. Please increase your payment.');
        return;
      }
      while (balance > 0 && months < 600) {
        const interest = balance * monthlyRate;
        const principal = Math.min(monthlyPayment - interest, balance);
        balance -= principal;
        totalPaid += monthlyPayment;
        months++;
        if (balance <= 0.01) break;
      }
    }

    const totalInterest = Math.max(0, totalPaid - totalDebt);
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    let timeStr = '';
    if (years > 0) timeStr += years + ' year' + (years > 1 ? 's' : '');
    if (years > 0 && remMonths > 0) timeStr += ', ';
    if (remMonths > 0) timeStr += remMonths + ' month' + (remMonths > 1 ? 's' : '');

    if (placeholderEl) placeholderEl.style.display = 'none';
    if (resultsEl) {
      resultsEl.style.display = 'flex';
      document.getElementById('resultMonths').textContent = timeStr;
      document.getElementById('resultTotal').textContent = '£' + totalPaid.toLocaleString('en-GB', {minimumFractionDigits:2,maximumFractionDigits:2});
      document.getElementById('resultInterest').textContent = '£' + totalInterest.toLocaleString('en-GB', {minimumFractionDigits:2,maximumFractionDigits:2});
    }
  }

  function showCalcError(msg) {
    const resultsEl = document.getElementById('calcResults');
    const placeholderEl = document.getElementById('calcPlaceholder');
    if (placeholderEl) { placeholderEl.style.display = 'flex'; }
    if (resultsEl) resultsEl.style.display = 'none';
    const errEl = document.getElementById('calcError');
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    setTimeout(() => { if (errEl) errEl.style.display = 'none'; }, 4000);
  }

  /* ---- Blog Search ---- */
  const blogSearch = document.getElementById('blogSearch');
  const blogSearchBtn = document.getElementById('blogSearchBtn');
  const blogCards = document.querySelectorAll('.blog-card');
  const noResults = document.getElementById('noResults');

  function doSearch() {
    if (!blogSearch) return;
    const query = blogSearch.value.toLowerCase().trim();
    let visible = 0;
    blogCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (query === '' || text.includes(query)) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
  }

  if (blogSearch) {
    blogSearch.addEventListener('input', doSearch);
    blogSearch.addEventListener('keypress', e => { if (e.key === 'Enter') doSearch(); });
  }
  if (blogSearchBtn) blogSearchBtn.addEventListener('click', doSearch);

  /* ---- Blog Category Filter ---- */
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', function() {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const cat = this.getAttribute('data-cat');
      let visible = 0;
      blogCards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-cat') === cat) {
          card.classList.remove('hidden');
          visible++;
        } else {
          card.classList.add('hidden');
        }
      });
      if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
      if (blogSearch) blogSearch.value = '';
    });
  });

  /* ---- Contact Form — Validation + Email via Web3Forms ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!validateForm()) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending… please wait';

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        const result = await response.json();

        if (result.success) {
          const modal = document.getElementById('thankYouModal');
          if (modal) modal.classList.add('open');
          contactForm.reset();
          document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
        } else {
          alert('Something went wrong. Please call us directly on +44 7446461601 or email advisor@debtfreepath.co.uk');
        }
      } catch (err) {
        alert('Could not send your enquiry. Please call us on +44 7446461601 or email advisor@debtfreepath.co.uk');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    });

    // Real-time validation
    contactForm.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
    });
  }

  function validateField(field) {
    const group = field.closest('.form-group');
    if (!group) return true;
    const value = field.value.trim();
    let valid = true;
    let errorMsg = '';

    if (field.required && value === '') {
      valid = false;
      errorMsg = 'This field is required.';
    } else if (field.type === 'email' && value !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        valid = false;
        errorMsg = 'Please enter a valid email address.';
      }
    } else if (field.type === 'tel' && value !== '') {
      if (!/^[\d\s\+\-\(\)]{7,15}$/.test(value)) {
        valid = false;
        errorMsg = 'Please enter a valid phone number.';
      }
    }

    if (!valid) {
      group.classList.add('has-error');
      const errEl = group.querySelector('.field-error');
      if (errEl) errEl.textContent = errorMsg;
    } else {
      group.classList.remove('has-error');
    }
    return valid;
  }

  function validateForm() {
    let valid = true;
    if (!contactForm) return false;
    contactForm.querySelectorAll('input, textarea, select').forEach(field => {
      if (!validateField(field)) valid = false;
    });
    return valid;
  }

  /* ---- Modal Close ---- */
  document.querySelectorAll('.modal-close, #modalCloseBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('open');
    });
  });

  /* ---- Newsletter Form ---- */
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      if (emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        const success = this.nextElementSibling;
        if (success) { success.classList.add('show'); }
        emailInput.value = '';
        setTimeout(() => { if (success) success.classList.remove('show'); }, 5000);
      }
    });
  });

  /* ---- Pagination ---- */
  document.querySelectorAll('.pg-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const parent = this.closest('.pagination');
      if (!parent) return;
      parent.querySelectorAll('.pg-btn').forEach(b => b.classList.remove('active'));
      if (!this.querySelector('svg')) this.classList.add('active');
    });
  });

});
