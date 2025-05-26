/**
 * Script principal para a Landing Page de Serviços
 * Autor: [@mizael_m.m]
 * Versão: 1.2 (com integração 3D e GLTFLoader via importmap)
 * Funcionalidades:
 * 1. Animações de entrada de elementos ao rolar a página.
 * 2. Efeito de parallax nas imagens da seção de herói.
 * 3. Controle de carrossel horizontal para a seção de problemas.
 * 4. Dica visual de "arraste para o lado" que desaparece após a interação.
 * 5. Renderização de modelo 3D (cérebro) na seção de serviços.
 */

// Executa o script principal quando o conteúdo do HTML estiver completamente carregado.
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
        updateButtons();
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
    const initBrainModel = async () => {
        const container = document.getElementById('brain-canvas-container');
        if (!container) {
            console.warn('Contêiner do modelo 3D (#brain-canvas-container) não encontrado.');
            return;
        }

        // O THREE já deve estar disponível globalmente devido ao importmap
        if (typeof THREE === 'undefined') {
            console.error('THREE (Three.js) não está definido. Verifique seu importmap.');
            container.innerHTML = '<p style="color:red; font-size:12px;">Erro: Biblioteca Three.js não carregada.</p>';
            return;
        }

        // Importa GLTFLoader do namespace THREE, que é populado pelo importmap.
        // Não é necessário um import dinâmico `await import(...)` aqui se o importmap estiver correto.
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
        if (!GLTFLoader) {
             console.error('GLTFLoader não pôde ser carregado. Verifique o caminho no importmap: "three/addons/loaders/GLTFLoader.js"');
             container.innerHTML = '<p style="color:red; font-size:12px;">Erro: GLTFLoader não carregado.</p>';
             return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            50, // Campo de visão
            container.clientWidth / container.clientHeight, // Proporção
            0.1, // Plano de corte próximo
            1000 // Plano de corte distante
        );
        // Ajuste a posição Z da câmera para melhor visualização do modelo
        // Modelos diferentes podem exigir valores diferentes. Comece com um valor maior e diminua se necessário.
        camera.position.set(0, 0, 3); 

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.innerHTML = ''; // Limpa o contêiner antes de adicionar o novo canvas
        container.appendChild(renderer.domElement);

        // Iluminação
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.8); // Cor branca, intensidade aumentada
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(3, 5, 5); // Ajuste a posição para melhor iluminação
        scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
        pointLight.position.set(-3, -2, 4);
        scene.add(pointLight);

        const loader = new GLTFLoader();
        let brainModel;
        const modelPath = 'assets/brain_model.glb'; // CERTIFIQUE-SE DE QUE ESTE CAMINHO ESTÁ CORRETO

        loader.load(
            modelPath,
            (gltf) => {
                brainModel = gltf.scene;
                brainModel.visible = true;

                // Centralizar e escalar o modelo
                const box = new THREE.Box3().setFromObject(brainModel);
                const center = box.getCenter(new THREE.Vector3());
                brainModel.position.sub(center); 

                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                
                if (maxDim === 0 || !isFinite(maxDim)) {
                    brainModel.scale.set(1, 1, 1); 
                } else {
                    const desiredSize = 1.8; // Aumentei um pouco o tamanho desejado na cena
                    const scale = desiredSize / maxDim;
                    brainModel.scale.set(scale, scale, scale);
                }
                
                // Ajustes de material para modelos que podem ser translúcidos ou muito escuros
                brainModel.traverse((child) => {
                    if (child.isMesh) {
                        if (child.material) {
                            // Se o modelo for intencionalmente translúcido
                            if (child.material.transparent && child.material.opacity < 1.0) {
                                child.material.depthWrite = false; 
                            } else { // Para materiais opacos, garanta que depthWrite seja true
                                child.material.depthWrite = true;
                            }
                            // Ajustes gerais para melhor resposta à luz
                            if (child.material.metalness !== undefined) child.material.metalness = 0.2;
                            if (child.material.roughness !== undefined) child.material.roughness = 0.6;
                            child.material.needsUpdate = true;
                        }
                    }
                });

                scene.add(brainModel);
            },
            undefined,
            (error) => {
                console.error(`Erro ao carregar o modelo 3D de "${modelPath}":`, error);
                if(container) container.innerHTML = `<p style="color:red; font-size:12px;">Erro ao carregar modelo. Verifique o console (F12).</p>`;
            }
        );

        const animate = () => {
            requestAnimationFrame(animate);
            if (brainModel) {
                brainModel.rotation.y += 0.004; // Ajuste a velocidade de rotação aqui
            }
            renderer.render(scene, camera);
        };
        animate();

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
        initBrainModel(); // Chama a nova função para o modelo 3D
    };

    // Inicia tudo!
    initPage();
});
