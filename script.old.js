/* ===================================================================
   prokyi Portfolio — Interactive Script
   =================================================================== */
(function () {
  'use strict';

  /* ---------- Canvas Particle System ---------- */
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, particles;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function createParticles() {
      const count = Math.min(Math.floor((w * h) / 18000), 80);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.3,
          dx: (Math.random() - 0.5) * 0.25,
          dy: (Math.random() - 0.5) * 0.15 - 0.05,
          opacity: Math.random() * 0.4 + 0.1,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(79,172,254,${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      // Draw particles
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        p.pulse += 0.008;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const a = p.opacity + Math.sin(p.pulse) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79,172,254,${Math.max(0, a)})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        createParticles();
      }, 200);
    });
  }

  /* ---------- Scroll Reveal (staggered) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    let revealIndex = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${revealIndex * 80}ms`;
            entry.target.classList.add('is-visible');
            revealIndex++;
            observer.unobserve(entry.target);
            setTimeout(() => { revealIndex = 0; }, 600);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
  }

  /* ---------- Hero Entrance Animation ---------- */
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      hero.style.transition = 'opacity .8s ease, transform .8s ease';
      hero.style.opacity = '1';
      hero.style.transform = 'translateY(0)';
    });
  }

  /* ---------- Hamburger Menu ---------- */
  const menuBtn = document.querySelector('.header__menu-btn');
  const navEl = document.querySelector('.header__nav');
  if (menuBtn && navEl) {
    menuBtn.addEventListener('click', () => {
      const open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!open));
      navEl.classList.toggle('is-open', !open);
    });

    // Close on link click
    navEl.querySelectorAll('.header__link').forEach((link) => {
      link.addEventListener('click', () => {
        menuBtn.setAttribute('aria-expanded', 'false');
        navEl.classList.remove('is-open');
      });
    });
  }

  /* ---------- Smooth Scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Active Nav on Scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__link');
  if (sections.length && navLinks.length) {
    const onScroll = () => {
      const scrollY = window.scrollY + 120;
      sections.forEach((section) => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === '#' + id) {
            link.classList.toggle('is-active', scrollY >= top && scrollY < bottom);
          }
        });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Access Counter Animation ---------- */
  const counterEl = document.getElementById('accessCount');
  if (counterEl) {
    // Use localStorage for visit count persistence
    let count = parseInt(localStorage.getItem('prokyi_visits') || '0', 10);
    count++;
    localStorage.setItem('prokyi_visits', String(count));

    // Animate number
    const target = count;
    let current = 0;
    const duration = 1200;
    const start = performance.now();

    function animate(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * target);
      counterEl.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  /* ---------- Header Shrink on Scroll ---------- */
  const header = document.querySelector('.header');
  if (header) {
    let lastY = 0;
    window.addEventListener(
      'scroll',
      () => {
        const y = window.scrollY;
        if (y > 100) {
          header.style.boxShadow = '0 2px 24px rgba(0,0,0,.4)';
        } else {
          header.style.boxShadow = '';
        }
        lastY = y;
      },
      { passive: true }
    );
  }
})();
