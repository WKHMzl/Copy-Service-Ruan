// Importações de Módulos ES6 no topo do arquivo.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/**
 * Script principal para a Landing Page de Serviços
 * Autor: [@mizael_m.m]
 * Versão: 2.2 (Limpeza para Produção)
 * Funcionalidades:
 * 1. Animações de entrada de elementos ao rolar a página.
 * 2. Efeito de parallax nas imagens da seção de herói.
 * 3. Controle de carrossel horizontal para a seção de problemas (com drag/swipe e barra de progresso).
 * 4. Dica visual de "arraste para o lado" que desaparece após a interação.
 * 5. Renderização de modelo 3D (cérebro) na seção de serviços (APENAS DESKTOP).
 * 6. Accordion interativo para a seção de FAQ.
 */

document.addEventListener('DOMContentLoaded', () => {

    /**
     * Função 1: Animação de entrada para elementos com a classe .animate-on-scroll
     */
    const initScrollAnimation = () => {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if (animatedElements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        animatedElements.forEach(element => observer.observe(element));
    };

    /**
     * Função 2: Efeito de parallax nas imagens flutuantes da seção de herói.
     */
    const initParallaxEffect = () => {
        const parallaxImages = document.querySelectorAll('.floating-img');
        if (parallaxImages.length === 0) return;

        const initialTransforms = new Map();
        parallaxImages.forEach(img => {
            const transform = getComputedStyle(img).transform;
            initialTransforms.set(img, transform === 'none' ? '' : transform);
        });

        const handleScroll = () => {
            const scrollY = window.scrollY;
            parallaxImages.forEach(img => {
                const speed = parseFloat(img.getAttribute('data-parallax-speed')) || 0;
                const parallaxOffset = scrollY * speed * 0.3;
                const baseTransform = initialTransforms.get(img);
                img.style.transform = `${baseTransform} translateY(${parallaxOffset}px)`;
            });
        };

        window.addEventListener('scroll', () => {
            window.requestAnimationFrame(handleScroll);
        }, { passive: true });
    };

    /**
     * Função 3: Lógica do carrossel horizontal da seção de problemas.
     * Otimizada com drag/swipe e barra de progresso.
     */
    const initProblemsCarousel = () => {
        const trackWrapper = document.querySelector('.horizontal-track-wrapper');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const progressBarThumb = document.getElementById('progress-bar-thumb');

        if (!trackWrapper || !prevBtn || !nextBtn || !progressBarThumb) {
            // console.warn('Elementos do carrossel de problemas não encontrados.'); // Removido
            return;
        }

        const updateProgressBar = () => {
            if (!trackWrapper.offsetParent) return; 
            const maxScrollLeft = trackWrapper.scrollWidth - trackWrapper.clientWidth;
            
            if (maxScrollLeft <= 0) {
                progressBarThumb.style.width = '100%';
                return;
            }
            const progress = (trackWrapper.scrollLeft / maxScrollLeft) * 100;
            progressBarThumb.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        };

        const updateButtons = () => {
            if (!trackWrapper.offsetParent) return;
            const scrollEnd = trackWrapper.scrollWidth - trackWrapper.clientWidth - 2; 
            const scrollStart = 2;

            prevBtn.disabled = trackWrapper.scrollLeft <= scrollStart;
            nextBtn.disabled = trackWrapper.scrollLeft >= scrollEnd;
        };

        const scrollCarousel = (direction) => {
            const card = trackWrapper.querySelector('.problem-card-horizontal');
            if (!card) return;
            const gapStyle = getComputedStyle(card.parentElement).gap;
            const gap = parseInt(gapStyle) || 40;
            
            const scrollAmount = (card.offsetWidth + gap) * direction;
            trackWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        };

        prevBtn.addEventListener('click', () => scrollCarousel(-1));
        nextBtn.addEventListener('click', () => scrollCarousel(1));
        
        trackWrapper.addEventListener('scroll', () => {
            window.requestAnimationFrame(() => {
                updateButtons();
                updateProgressBar();
            });
        }, { passive: true });

        window.addEventListener('resize', () => {
            updateButtons();
            updateProgressBar();
        });

        let isDown = false;
        let startX;
        let scrollLeftStart;

        trackWrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            trackWrapper.classList.add('is-active');
            startX = e.pageX - trackWrapper.offsetLeft;
            scrollLeftStart = trackWrapper.scrollLeft;
            trackWrapper.style.scrollSnapType = 'none'; 
        });

        trackWrapper.addEventListener('mouseleave', () => {
            if (!isDown) return;
            isDown = false;
            trackWrapper.classList.remove('is-active');
            trackWrapper.style.scrollSnapType = 'x mandatory'; 
        });

        trackWrapper.addEventListener('mouseup', () => {
            if (!isDown) return;
            isDown = false;
            trackWrapper.classList.remove('is-active');
            trackWrapper.style.scrollSnapType = 'x mandatory'; 
        });

        trackWrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - trackWrapper.offsetLeft;
            const walk = (x - startX) * 2; 
            trackWrapper.scrollLeft = scrollLeftStart - walk;
            window.requestAnimationFrame(() => {
                updateProgressBar();
                updateButtons();
            });
        });
        
        setTimeout(() => {
            updateButtons();
            updateProgressBar();
        }, 150);
    };

    /**
     * Função 4: Lógica da dica "Arraste para o lado".
     */
    const initDragHint = () => {
        const problemsSection = document.querySelector('.problems-section');
        const simpleHint = document.querySelector('.simple-hint-container');
        const trackWrapper = document.querySelector('.horizontal-track-wrapper');

        if (!problemsSection || !simpleHint || !trackWrapper) return;

        const hintObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    simpleHint.classList.add('is-visible');
                    hintObserver.unobserve(problemsSection);
                }
            });
        }, { threshold: 0.5 });
        hintObserver.observe(problemsSection);

        const hideHint = () => {
            simpleHint.classList.add('is-hidden');
            trackWrapper.removeEventListener('scroll', hideHint);
        };
        trackWrapper.addEventListener('scroll', hideHint, { once: true });
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        if(prevBtn) prevBtn.addEventListener('click', hideHint, { once: true });
        if(nextBtn) nextBtn.addEventListener('click', hideHint, { once: true });
        trackWrapper.addEventListener('mousedown', hideHint, { once: true });
    };

    /**
     * Função 5: Renderização do modelo 3D do cérebro (APENAS PARA DESKTOP).
     */
    const initBrainModel = () => {
        if (!window.matchMedia("(min-width: 769px)").matches) {
            const container = document.getElementById('brain-canvas-container');
            if (container) container.style.display = 'none';
            return;
        }
        
        const container = document.getElementById('brain-canvas-container');
        if (!container) {
            // console.warn('#brain-canvas-container não encontrado para o modelo 3D.'); // Removido
            return;
        }

        if (!THREE || !GLTFLoader || !DRACOLoader) {
            container.innerHTML = '<p style="color:red;">Erro: Bibliotecas 3D não carregadas.</p>';
            console.error('THREE.js ou seus loaders não estão disponíveis.'); // Erro crítico mantido
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 0.2, 2.8);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
        directionalLight.position.set(5, 8, 5);
        scene.add(directionalLight);

        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://unpkg.com/three@0.164.1/examples/jsm/libs/draco/gltf/'); 
        loader.setDRACOLoader(dracoLoader);

        let brainModel;
        loader.load(
            'assets/brain_model.glb', 
            (gltf) => {
                brainModel = gltf.scene;
                const box = new THREE.Box3().setFromObject(brainModel);
                const center = box.getCenter(new THREE.Vector3());
                brainModel.position.sub(center);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 0) {
                    const scale = 1.7 / maxDim;
                    brainModel.scale.set(scale, scale, scale);
                }
                scene.add(brainModel);
            },
            undefined, 
            (error) => {
                console.error('Erro ao carregar o modelo 3D do cérebro:', error); // Erro crítico mantido
                if (container) container.innerHTML = `<p style="color:red; font-size:12px;">Erro ao carregar modelo 3D.</p>`;
            }
        );

        const clock = new THREE.Clock();

        const animate = () => {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            if (brainModel) {
                brainModel.rotation.y = elapsedTime * 0.3;
            }
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            if (container.clientWidth > 0 && container.clientHeight > 0) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        });
    };

    /**
     * Função 6: Accordion interativo para a seção de FAQ.
     */
    const initAccordion = () => {
        const accordionItems = document.querySelectorAll('.accordion-item');
        if (accordionItems.length === 0) return;

        accordionItems.forEach(item => {
            const questionButton = item.querySelector('.accordion-question');
            const answer = item.querySelector('.accordion-answer');

            if (!questionButton || !answer) return;

            questionButton.addEventListener('click', () => {
                const isOpen = item.classList.contains('is-open');

                accordionItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('is-open');
                        otherItem.querySelector('.accordion-answer').style.maxHeight = '0px';
                        otherItem.querySelector('.accordion-question').setAttribute('aria-expanded', 'false');
                    }
                });

                if (!isOpen) {
                    item.classList.add('is-open');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    questionButton.setAttribute('aria-expanded', 'true');
                } else {
                    item.classList.remove('is-open');
                    answer.style.maxHeight = '0px';
                    questionButton.setAttribute('aria-expanded', 'false');
                }
            });
        });
    };

    /**
     * Função de inicialização principal.
     */
    const initPage = () => {
        initScrollAnimation();
        initParallaxEffect();
        initProblemsCarousel();
        initDragHint();
        initBrainModel();
        initAccordion();
    };

    // Inicia tudo!
    initPage();
});
