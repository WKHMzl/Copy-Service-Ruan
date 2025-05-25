// ================================================================
// SCRIPT FINAL E COMPLETO (COM DICA DE SETA SIMPLES)
// ================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ANIMAÇÃO GERAL AO ROLAR A TELA ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .problem-card-horizontal');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { 
            threshold: 0.15 
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // --- 2. PARALLAX DO HERO SECTION ---
    const parallaxImages = document.querySelectorAll('.floating-img');
    const initialHeroTransforms = new Map();
    if (parallaxImages.length > 0) {
        parallaxImages.forEach(img => {
            let initialTransform = getComputedStyle(img).transform;
            if (initialTransform === "none") initialTransform = "";
            initialHeroTransforms.set(img, initialTransform.replace(/translateY\([^)]+\)/g, '').trim());
        });

        window.addEventListener('scroll', () => {
            window.requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;
                parallaxImages.forEach(img => {
                    if (img.classList.contains('is-visible')) {
                        const speed = parseFloat(img.getAttribute('data-parallax-speed')) || 0;
                        const parallaxOffset = scrollY * speed * 0.3;
                        const baseTransform = initialHeroTransforms.get(img) || '';
                        img.style.transform = `${baseTransform} translateY(${parallaxOffset}px)`;
                    }
                });
            });
        }, { passive: true });
    }

    // --- 3. LÓGICA DO CARROSSEL DE PROBLEMAS ---
    const trackWrapper = document.querySelector('.horizontal-track-wrapper');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (trackWrapper && prevBtn && nextBtn) {
        const updateButtons = () => {
            requestAnimationFrame(() => {
                const scrollLeft = trackWrapper.scrollLeft;
                const maxScrollLeft = trackWrapper.scrollWidth - trackWrapper.clientWidth;
                prevBtn.disabled = scrollLeft <= 0;
                nextBtn.disabled = scrollLeft >= maxScrollLeft - 1;
            });
        };

        prevBtn.addEventListener('click', () => {
            const cardWidth = trackWrapper.querySelector('.problem-card-horizontal').offsetWidth;
            const gap = parseInt(getComputedStyle(trackWrapper.querySelector('.horizontal-track')).gap);
            trackWrapper.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            const cardWidth = trackWrapper.querySelector('.problem-card-horizontal').offsetWidth;
            const gap = parseInt(getComputedStyle(trackWrapper.querySelector('.horizontal-track')).gap);
            trackWrapper.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        });

        trackWrapper.addEventListener('scroll', updateButtons, { passive: true });
        updateButtons();
    }
    
    // --- 4. LÓGICA DA DICA DE ARRASTAR ---
    const problemsSection = document.querySelector('.problems-section-final');
    const simpleHint = document.querySelector('.simple-hint-container');

    if (problemsSection && simpleHint && trackWrapper) {
      // Observador para MOSTRAR a dica
      const hintObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            simpleHint.classList.add('is-visible');
            hintObserver.unobserve(problemsSection);
          }
        });
      }, { 
          threshold: 0.5 
      });
      
      hintObserver.observe(problemsSection);

      // Evento para ESCONDER a dica para sempre após a primeira interação
      trackWrapper.addEventListener('scroll', () => {
        simpleHint.classList.add('is-hidden');
      }, { 
          once: true // Importante: faz o evento ser executado apenas uma vez
      });
    }
});