document.addEventListener('DOMContentLoaded', () => {
  // Global Variables
  const header = document.getElementById('header');
  const burgerMenu = document.getElementById('burger-menu');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // 1. Sticky Header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Navigation Toggle
  burgerMenu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = burgerMenu.querySelector('i');
    if (navMenu.classList.contains('active')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    } else {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  });

  // Close mobile menu when clicking nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      const icon = burgerMenu.querySelector('i');
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    });
  });

  // 3. Fetch & Render Menu from API
  let allMenuItems = [];
  const menuGrid = document.getElementById('menu-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  async function fetchMenu() {
    try {
      const response = await fetch('/api/menu');
      const result = await response.json();
      if (result.success) {
        allMenuItems = result.data;
        renderMenu(allMenuItems);
      }
    } catch (error) {
      console.error('Gagal mengambil data menu:', error);
      menuGrid.innerHTML = '<p class="text-center">Gagal memuat menu. Silakan coba beberapa saat lagi.</p>';
    }
  }

  function renderMenu(items) {
    menuGrid.innerHTML = '';
    if (items.length === 0) {
      menuGrid.innerHTML = '<p class="text-center">Tidak ada menu ditemukan.</p>';
      return;
    }

    items.forEach(item => {
      const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.harga);
      
      const card = document.createElement('div');
      card.className = 'menu-card reveal active';
      card.innerHTML = `
        <div class="menu-img-wrapper">
          <img src="${item.gambar_url}" alt="${item.nama}" loading="lazy">
        </div>
        <div class="menu-content">
          <div class="menu-header-info">
            <span class="menu-category">${item.kategori}</span>
            <span class="menu-rating"><i class="fa-solid fa-star"></i> ${item.rating}</span>
          </div>
          <h3 class="menu-name">${item.nama}</h3>
          <p class="menu-desc">${item.deskripsi}</p>
          <div class="menu-footer">
            <span class="menu-price">${formattedPrice}</span>
          </div>
        </div>
      `;
      menuGrid.appendChild(card);
    });
  }

  // Filter Menu Click Events
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      if (filterValue === 'all') {
        renderMenu(allMenuItems);
      } else {
        const filtered = allMenuItems.filter(item => item.kategori === filterValue);
        renderMenu(filtered);
      }
    });
  });

  fetchMenu();

  // 4. Fetch & Render Testimonials Carousel
  let testimonialsData = [];
  let currentSlide = 0;
  let autoSlideInterval;
  const testimonialTrack = document.getElementById('testimonial-track');
  const carouselDots = document.getElementById('carousel-dots');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  async function fetchTestimonials() {
    try {
      const response = await fetch('/api/testimonials');
      const result = await response.json();
      if (result.success) {
        testimonialsData = result.data;
        renderTestimonials();
        startAutoSlide();
      }
    } catch (error) {
      console.error('Gagal mengambil testimoni:', error);
    }
  }

  function renderTestimonials() {
    testimonialTrack.innerHTML = '';
    carouselDots.innerHTML = '';

    testimonialsData.forEach((item, index) => {
      // Create Slide
      const slide = document.createElement('div');
      slide.className = 'testimonial-slide';
      
      let starsHTML = '';
      for (let i = 0; i < item.rating; i++) {
        starsHTML += '<i class="fa-solid fa-star" style="color: var(--color-gold);"></i>';
      }

      slide.innerHTML = `
        <img src="${item.foto_url}" alt="${item.nama}" class="testimonial-avatar" loading="lazy">
        <div class="testimonial-rating mb-2">${starsHTML}</div>
        <p class="testimonial-text">"${item.teks}"</p>
        <h4 class="testimonial-name">${item.nama}</h4>
        <p class="testimonial-job">${item.profesi}</p>
      `;
      testimonialTrack.appendChild(slide);

      // Create Dot
      const dot = document.createElement('div');
      dot.className = `dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        currentSlide = index;
        updateCarousel();
        resetAutoSlide();
      });
      carouselDots.appendChild(dot);
    });
  }

  function updateCarousel() {
    testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    const dots = carouselDots.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }

  function nextSlideFunc() {
    currentSlide = (currentSlide + 1) % testimonialsData.length;
    updateCarousel();
  }

  function prevSlideFunc() {
    currentSlide = (currentSlide - 1 + testimonialsData.length) % testimonialsData.length;
    updateCarousel();
  }

  nextBtn.addEventListener('click', () => {
    nextSlideFunc();
    resetAutoSlide();
  });

  prevBtn.addEventListener('click', () => {
    prevSlideFunc();
    resetAutoSlide();
  });

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlideFunc, 5000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  fetchTestimonials();

  // 5. Reservation Form Validation & Submission
  const reservationForm = document.getElementById('reservation-form');
  const tanggalInput = document.getElementById('tanggal');

  // Set min date to today for date picker
  const todayStr = new Date().toISOString().split('T')[0];
  tanggalInput.setAttribute('min', todayStr);

  reservationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => el.classList.remove('error'));

    const formData = {
      nama: document.getElementById('nama').value.trim(),
      email: document.getElementById('email').value.trim(),
      telepon: document.getElementById('telepon').value.trim(),
      tanggal: document.getElementById('tanggal').value,
      waktu: document.getElementById('waktu').value,
      jumlah_tamu: document.getElementById('jumlah_tamu').value,
      catatan: document.getElementById('catatan').value.trim()
    };

    // Client-side validation
    let isValid = true;
    if (!formData.nama) {
      showError('nama', 'Nama wajib diisi');
      isValid = false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError('email', 'Email tidak valid');
      isValid = false;
    }
    if (!formData.telepon || !/^[0-9+\-\s]+$/.test(formData.telepon)) {
      showError('telepon', 'Nomor telepon tidak valid');
      isValid = false;
    }
    if (!formData.tanggal) {
      showError('tanggal', 'Tanggal wajib dipilih');
      isValid = false;
    }
    if (!formData.waktu) {
      showError('waktu', 'Waktu wajib dipilih');
      isValid = false;
    }
    if (!formData.jumlah_tamu || formData.jumlah_tamu < 1) {
      showError('jumlah_tamu', 'Jumlah tamu minimal 1 orang');
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();

      if (result.success) {
        showModal('Berhasil!', 'Terima kasih! Reservasi Anda telah kami terima. Kami akan konfirmasi via WhatsApp/email.', 'success');
        reservationForm.reset();
      } else {
        showModal('Gagal!', result.error || 'Terjadi kesalahan pada server.', 'error');
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      showModal('Gagal!', 'Tidak dapat terhubung ke server.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Kirim Reservasi';
    }
  });

  function showError(fieldId, message) {
    const inputEl = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    inputEl.classList.add('error');
    errorEl.textContent = message;
  }

  // 6. Modal Control
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalIcon = document.getElementById('modal-icon');

  function showModal(title, message, type) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    if (type === 'success') {
      modalIcon.className = 'modal-icon';
      modalIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    } else {
      modalIcon.className = 'modal-icon error';
      modalIcon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
    }
    modalOverlay.classList.add('active');
  }

  modalCloseBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  // 7. Intersection Observer for Scroll Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
});