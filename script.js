document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Custom Cursor Logic ---
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Add hover effect for interactive elements
        const hoverables = document.querySelectorAll('a, button, .card');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
    }

    // --- 2. Navbar Scroll Effect (Glassmorphism) ---
    const nav = document.querySelector('.main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // --- 3. Scroll Reveal Animation ---
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-text, .reveal-card, .reveal-line, .show-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // --- 4. Three.js - Hero Section Background (Abstract Floating Board) ---
    function initHero3D() {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        const scene = new THREE.Scene();
        // Fog for depth
        scene.fog = new THREE.FogExp2(0xf9f9f7, 0.002);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;
        camera.position.y = 20;
        camera.rotation.x = -0.5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Create Grid of Cubes
        const geometry = new THREE.BoxGeometry(2, 0.5, 2);
        const materialWhite = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
        const materialBlack = new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.1 });
        const materialAccent = new THREE.MeshBasicMaterial({ color: 0x8B0000, transparent: true, opacity: 0.8 });

        const cubes = [];
        const gridSize = 20;
        const spacing = 4;

        for (let x = -gridSize; x < gridSize; x++) {
            for (let z = -gridSize; z < gridSize; z++) {
                // Checkerboard pattern
                const isWhite = (Math.abs(x) + Math.abs(z)) % 2 === 0;
                // Randomly skip some to make it "fragmented"
                if (Math.random() > 0.7) continue;

                let material = isWhite ? materialWhite : materialBlack;

                // Rarely add an accent cube
                if (Math.random() > 0.99) material = materialAccent;

                const cube = new THREE.Mesh(geometry, material);
                cube.position.x = x * spacing;
                cube.position.z = z * spacing - 50; // Push back
                cube.position.y = Math.sin(x * 0.5 + z * 0.5) * 2; // Wavy

                // Store initial Y for animation
                cube.userData = {
                    initialY: cube.position.y,
                    offset: Math.random() * 100,
                    speed: Math.random() * 0.002 + 0.001
                };

                scene.add(cube);
                cubes.push(cube);
            }
        }

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);

            const time = Date.now();

            cubes.forEach(cube => {
                // Wave movement
                cube.position.y = cube.userData.initialY + Math.sin(time * cube.userData.speed + cube.userData.offset) * 5;
            });

            // Gentle camera movement
            camera.position.x = Math.sin(time * 0.0001) * 10;
            camera.lookAt(0, 0, -50);

            renderer.render(scene, camera);
        }

        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // --- 5. Three.js - Moving Piece (King/Queen Abstract) ---
    function initPiece3D() {
        const container = document.getElementById('chess-piece-container');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 15;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        const accentLight = new THREE.PointLight(0x8B0000, 2, 20);
        accentLight.position.set(-5, 0, 5);
        scene.add(accentLight);

        // Construct Abstract King
        const group = new THREE.Group();

        // Base
        const baseGeo = new THREE.CylinderGeometry(2, 2.5, 1, 32);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.3,
            metalness: 0.8
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -3;
        group.add(base);

        // Body
        const bodyGeo = new THREE.ConeGeometry(1.5, 6, 8); // Faceted look
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.2,
            metalness: 0.9,
            flatShading: true
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.5;
        group.add(body);

        // Neck ring
        const neckGeo = new THREE.TorusGeometry(1, 0.3, 16, 100);
        const neckMat = new THREE.MeshStandardMaterial({ color: 0x8B0000, emissive: 0x330000 });
        const neck = new THREE.Mesh(neckGeo, neckMat);
        neck.position.y = 3;
        neck.rotation.x = Math.PI / 2;
        group.add(neck);

        // Cross/Top
        const topGeo = new THREE.BoxGeometry(0.5, 1.5, 0.5);
        const topMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1 });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = 4.5;
        group.add(top);

        const crossBarGeo = new THREE.BoxGeometry(1.2, 0.4, 0.4);
        const crossBar = new THREE.Mesh(crossBarGeo, topMat);
        crossBar.position.y = 4.5;
        group.add(crossBar);

        // Floating "Halo" Fragments
        for (let i = 0; i < 5; i++) {
            const fragGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
            const fragMat = new THREE.MeshBasicMaterial({ color: 0x8B0000 });
            const frag = new THREE.Mesh(fragGeo, fragMat);

            frag.userData = {
                angle: (Math.PI * 2 / 5) * i,
                speed: 0.02,
                yOffset: Math.random() * 2
            };
            group.add(frag);
        }

        scene.add(group);

        // Animation
        function animate() {
            requestAnimationFrame(animate);
            const time = Date.now() * 0.001;

            // Rotate entire piece
            group.rotation.y += 0.005;
            group.rotation.x = Math.sin(time) * 0.1; // Gentle sway

            // Animate halo fragments
            group.children.forEach((child, index) => {
                if (index > 4) { // It's a fragment
                    child.userData.angle += child.userData.speed;
                    const radius = 3 + Math.sin(time * 2 + index) * 0.5;
                    child.position.x = Math.cos(child.userData.angle) * radius;
                    child.position.z = Math.sin(child.userData.angle) * radius;
                    child.position.y = 4 + Math.sin(time + index) * 0.5;
                    child.rotation.x += 0.05;
                    child.rotation.y += 0.05;
                }
            });

            renderer.render(scene, camera);
        }
        animate();

        // Mouse interaction for the piece
        document.addEventListener('mousemove', (e) => {
            const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

            // Tilt the group slightly towards mouse
            group.rotation.z = -mouseX * 0.2;
            group.rotation.x = mouseY * 0.2;
        });

        window.addEventListener('resize', () => {
            // Update container dimensions
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        });
    }

    // Initialize 3D Scenes
    if (window.THREE) {
        initHero3D();
        initPiece3D();
    } else {
        console.warn('Three.js not loaded');
        // Fallback or retry logic could go here
    }

    // Scroll Smoothness for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
