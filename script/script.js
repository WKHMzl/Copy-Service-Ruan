// Importações no topo (como já temos)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

document.addEventListener('DOMContentLoaded', () => {
    // ... (suas funções initScrollAnimation, initParallaxEffect, etc. permanecem as mesmas) ...

    const initBrainModel = () => {
        console.log('[Mobile Test] Tentando iniciar initBrainModel...');
        const container = document.getElementById('brain-canvas-container');
        if (!container) {
            console.error('[Mobile Test] #brain-canvas-container não encontrado.');
            return;
        }

        if (!THREE || !GLTFLoader) {
            console.error('[Mobile Test] ERRO CRÍTICO: Three.js ou GLTFLoader não importados.');
            return;
        }

        const scene = new THREE.Scene();
        // Para debug no mobile, adicione um fundo visível à cena
        // scene.background = new THREE.Color(0xabcdef); // Um azul claro para ver se a cena renderiza

        const camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        // AFASTE A CÂMERA PARA GARANTIR QUE O OBJETO NÃO ESTÁ MUITO PERTO/DENTRO DELA
        camera.position.set(0, 0, 5); // Aumentado de 3 para 5 (ou até 10 para teste)
        console.log('[Mobile Test] Câmera posicionada em z=5');

        const renderer = new THREE.WebGLRenderer({
            antialias: false, // 1. DESABILITAR ANTIALIASING PARA TESTE NO MOBILE (menos custoso)
            alpha: true,
            powerPreference: "low-power" // Manter low-power por enquanto
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        // 2. TENTAR REDUZIR O PIXEL RATIO NO MOBILE (menos custoso, mas menos nítido)
        // renderer.setPixelRatio(window.devicePixelRatio > 1.5 ? 1.5 : window.devicePixelRatio);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // Força no máximo 1 para teste

        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // 3. ILUMINAÇÃO MAIS SIMPLES E FORTE PARA TESTE
        const ambientLight = new THREE.AmbientLight(0xffffff, 3.0); // Intensidade bem alta
        scene.add(ambientLight);
        // Comente outras luzes para o teste inicial no mobile
        // const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
        // directionalLight.position.set(5, 8, 6);
        // scene.add(directionalLight);
        console.log('[Mobile Test] Iluminação ambiente forte adicionada.');

        const loader = new GLTFLoader();

        if (DRACOLoader) {
            const dracoLoader = new DRACOLoader();
            // 4. TENTAR FORÇAR O CAMINHO COMPLETO DA CDN PARA O DECODER DRACO
            // Se o `three/addons/...` não resolver corretamente no mobile via importmap na Vercel.
            dracoLoader.setDecoderPath('https://www.unpkg.com/three@0.164.1/examples/jsm/libs/draco/gltf/');
            loader.setDRACOLoader(dracoLoader);
            console.log('[Mobile Test] DRACOLoader configurado com caminho explícito da CDN.');
        }

        let testObject; // Usaremos para o modelo ou um cubo de teste
        const modelPath = 'assets/brain_model.glb';

        // 5. TESTE COM UM CUBO SIMPLES PRIMEIRO
        const useTestCube = false; // MUDE PARA 'true' PARA TESTAR O CUBO

        if (useTestCube) {
            console.log('[Mobile Test] Usando CUBO DE TESTE.');
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Verde
            testObject = new THREE.Mesh(geometry, material);
            scene.add(testObject);
            console.log('[Mobile Test] Cubo de teste adicionado à cena.');
        } else {
            console.log(`[Mobile Test] Tentando carregar modelo: ${modelPath}`);
            loader.load(
                modelPath,
                (gltf) => {
                    console.log('[Mobile Test] Modelo GLTF carregado:', gltf);
                    testObject = gltf.scene;
                    testObject.visible = true;

                    const box = new THREE.Box3().setFromObject(testObject);
                    const center = box.getCenter(new THREE.Vector3());
                    testObject.position.sub(center);

                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);

                    if (maxDim === 0 || !isFinite(maxDim)) {
                        testObject.scale.set(1, 1, 1);
                    } else {
                        const desiredSize = 1.5; // Mantenha um tamanho razoável
                        const scale = desiredSize / maxDim;
                        testObject.scale.set(scale, scale, scale);
                        console.log(`[Mobile Test] Modelo escalado por: ${scale}`);
                    }
                    
                    // 6. APLICAR MATERIAL BÁSICO E OPACO NO MODELO PARA TESTE NO MOBILE
                    testObject.traverse((child) => {
                        if (child.isMesh) {
                            console.log('[Mobile Test] Aplicando material de teste (MeshBasicMaterial) à mesh:', child.name);
                            child.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }); // Verde e wireframe para fácil visualização
                            child.material.needsUpdate = true;
                        }
                    });
                    scene.add(testObject);
                    console.log('[Mobile Test] Modelo do cérebro adicionado com material de TESTE.');
                },
                undefined,
                (error) => {
                    console.error(`[Mobile Test] Erro ao carregar ${modelPath}:`, error);
                    if (container) container.innerHTML = `<p style="color:red; font-size:12px;">Erro ao carregar. Console (F12).</p>`;
                }
            );
        }

        const animate = () => {
            requestAnimationFrame(animate);
            if (testObject) {
                testObject.rotation.y += 0.005;
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

    // ... (sua função initPage chamando initBrainModel)
    const initPage = () => {
        initScrollAnimation();
        initParallaxEffect();
        initProblemsCarousel();
        initDragHint();
        initBrainModel();
    };
    initPage();
    console.log('initPage() chamado.');
});
