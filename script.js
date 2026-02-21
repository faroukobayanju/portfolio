// Custom Cursor
    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
      cursor.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });

    document.addEventListener('mouseup', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.backgroundColor = 'transparent';
    });

    // Interactive hover states for cursor
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-card, .growth-card, .nav-item');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '40px';
        cursor.style.height = '40px';
        cursor.style.backgroundColor = 'var(--text)';
        cursor.style.mixBlendMode = 'difference';
        cursor.style.border = 'none';
        cursorDot.style.opacity = '0';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.backgroundColor = 'transparent';
        cursor.style.mixBlendMode = 'normal';
        cursor.style.border = '1px solid var(--accent)';
        cursorDot.style.opacity = '1';
      });
    });

    // Reveal Animations on Scroll
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) {
          return;
        } else {
          // Add a slight delay based on index for staggered effect
          setTimeout(() => {
            entry.target.classList.add('active');
          }, (index % 5) * 100);
          observer.unobserve(entry.target);
        }
      });
    }, revealOptions);

    revealElements.forEach(el => {
      revealOnScroll.observe(el);
    });

    // Hero Text Glitch/Typewriter effect
    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
      const originalText = heroSub.innerText;
      heroSub.innerText = '';
      let i = 0;
      function typeWriter() {
        if (i < originalText.length) {
          heroSub.innerHTML += originalText.charAt(i);
          i++;
          setTimeout(typeWriter, 30);
        }
      }
      setTimeout(typeWriter, 500);
    }