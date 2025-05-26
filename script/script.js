// Importações de Módulos ES6 no topo do arquivo.
// O importmap no seu HTML dirá ao navegador onde encontrar esses módulos.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'; // Importe se seu modelo usar compressão Draco

/**
 * Script principal para a Landing Page de Serviços
 * Autor: [@mizael_m.m]
 * Versão: 1.3 (com imports ES6 explícitos e importmap) - ESTA VERSÃO FUNCIONAVA NO PC
 * Funcionalidades:
 * 1. Animações de entrada de elementos ao rolar a página.
 * 2. Efeito de parallax nas imagens da seção de herói.
 * 3. Controle de carrossel horizontal para a seção de problemas.
 * 4. Dica visual de "arraste para o lado" que desaparece após a interação.
 * 5. Renderização de modelo 3D (cérebro) na seção de serviços.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Carregado. Iniciando scripts...');

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
            const scrollY = window.pageYOffset;
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
     */
    const initProblemsCarousel = () => {
        const trackWrapper = document.querySelector('.horizontal-track-wrapper');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (!trackWrapper || !prevBtn || !nextBtn) return;

        const updateButtons = () => {
            if (!trackWrapper.offsetParent) return;
            const scrollEnd = trackWrapper.scrollWidth - trackWrapper.clientWidth - 1;
            prevBtn.disabled = trackWrapper.scrollLeft <= 0;
            nextBtn.disabled = trackWrapper.scrollLeft >= scrollEnd;
        };

        const scrollCarousel = (direction) => {
            const card = trackWrapper.querySelector('.problem-card-horizontal');
            if (!card) return;
            const gap = parseInt(getComputedStyle(card.parentElement).gap) || 30;
            const scrollAmount = (card.offsetWidth + gap) * direction;
            trackWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        };

        prevBtn.addEventListener('click', () => scrollCarousel(-1));
        nextBtn.addEventListener('click', () => scrollCarousel(1));
        trackWrapper.addEventListener('scroll', updateButtons, { passive: true });
        
        setTimeout(updateButtons, 100);
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
            document.getElementById('prev-btn')?.removeEventListener('click', hideHint);
            document.getElementById('next-btn')?.removeEventListener('click', hideHint);
        };
        trackWrapper.addEventListener('scroll', hideHint, { once: true });
        document.getElementById('prev-btn')?.addEventListener('click', hideHint, { once: true });
        document.getElementById('next-btn')?.addEventListener('click', hideHint, { once: true });
    };

    /**
     * Função 5: Inicializa e renderiza o modelo 3D do cérebro.
     */
    const initBrainModel = () => {
        console.log('Tentando iniciar initBrainModel...');
        const container = document.getElementById('brain-canvas-container');
        if (!container) {
            console.error('#brain-canvas-container não encontrado no DOM.');
            return;
        }
        console.log('Contêiner do canvas encontrado:', container);

        if (!THREE || !GLTFLoader) { // GLTFLoader e DRACOLoader são importados no topo
            console.error('ERRO CRÍTICO: Three.js, GLTFLoader ou DRACOLoader não foram importados corretamente no topo do script.');
            container.innerHTML = '<p style="color:red; font-size:12px;">Erro: Bibliotecas 3D não carregadas.</p>';
            return;
        }
        console.log('THREE, GLTFLoader e DRACOLoader estão disponíveis.');

        const scene = new THREE.Scene();
        console.log('Cena criada.');

        const camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 3); 
        console.log('Câmera criada e posicionada.');

        const renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            // powerPreference: "low-power" // Podemos testar com e sem depois para mobile
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        console.log('Renderizador criado e adicionado ao contêiner.');

        // Iluminação
        const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); 
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8); 
        directionalLight.position.set(5, 7, 5); 
        scene.add(directionalLight);
        // const pointLight = new THREE.PointLight(0xffffff, 0.7, 100);
        // pointLight.position.set(-4, -3, 4);
        // scene.add(pointLight);
        console.log('Luzes adicionadas à cena.');

        const loader = new GLTFLoader();

        if (DRACOLoader) {
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('three/addons/libs/draco/gltf/');
            loader.setDRACOLoader(dracoLoader);
            console.log('DRACOLoader configurado e associado ao GLTFLoader.');
        } else {
            console.warn('DRACOLoader não foi importado/disponível. Modelos comprimidos com Draco podem não carregar.');
        }

        let brainModel;
        const modelPath = 'assets/brain_model.glb'; 
        console.log(`Tentando carregar modelo de: ${modelPath}`);

        loader.load(
            modelPath,
            (gltf) => {
                console.log('Modelo GLTF carregado com sucesso:', gltf);
                brainModel = gltf.scene;
                brainModel.visible = true;

                const box = new THREE.Box3().setFromObject(brainModel);
                const center = box.getCenter(new THREE.Vector3());
                brainModel.position.sub(center);

                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);

                if (maxDim === 0 || !isFinite(maxDim)) {
                    console.warn("Dimensões do modelo são zero ou inválidas. Aplicando escala padrão de 1.");
                    brainModel.scale.set(1, 1, 1);
                } else {
                    const desiredSize = 1.7; 
                    const scale = desiredSize / maxDim;
                    brainModel.scale.set(scale, scale, scale);
                    console.log(`Modelo escalado por um fator de: ${scale}. Tamanho desejado: ${desiredSize}`);
                }
                
                brainModel.traverse((child) => {
                    if (child.isMesh) {
                        if (child.material) {
                            child.material.transparent = true;
                            child.material.opacity = 0.85; 
                            child.material.depthWrite = false; 
                            
                            if (child.material.metalness !== undefined) child.material.metalness = 0.1;
                            if (child.material.roughness !== undefined) child.material.roughness = 0.5;
                            child.material.needsUpdate = true;
                        }
                    }
                });

                scene.add(brainModel);
                console.log('Modelo do cérebro adicionado à cena e materiais ajustados.');
            },
            (xhr) => {
                 // console.log(`Modelo: ${(xhr.loaded / xhr.total * 100).toFixed(0)}% carregado`);
            },
            (error) => {
                console.error(`Erro DETALHADO ao carregar o modelo 3D de "${modelPath}":`, error);
                if (container) container.innerHTML = `<p style="color:red; font-size:12px;">Erro ao carregar modelo 3D. Verifique o console (F12).</p><p style="color:red; font-size:10px;">${error.message || 'Erro desconhecido'}</p>`;
            }
        );

        const animate = () => {
            requestAnimationFrame(animate);
            if (brainModel) {
                brainModel.rotation.y += 0.0035; 
            }
            renderer.render(scene, camera);
        };
        animate();
        console.log('Loop de animação iniciado.');

        const onWindowResize = () => {
            if (container && container.clientWidth > 0 && container.clientHeight > 0) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        };
        window.addEventListener('resize', onWindowResize);
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
    };

    // Inicia tudo!
    initPage();
    console.log('initPage() chamado. Todos os scripts de inicialização executados.');
});
