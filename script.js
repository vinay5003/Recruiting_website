document.addEventListener("DOMContentLoaded", function() {
    // --- SCROLL ANIMATIONS ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Start animation as soon as the element is a little bit visible
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    // Initial animation for the hero section, since it's visible on load
    const firstAnimateElement = document.querySelector('.animate-on-scroll');
    if (firstAnimateElement) {
        firstAnimateElement.classList.add('is-visible');
    }

    // Observe all other elements with the class
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // --- MOBILE MENU ---
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const openIcon = menuButton.querySelector('svg:first-child');
    const closeIcon = menuButton.querySelector('svg:last-child');
    let isMenuOpen = false;

    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        menuButton.setAttribute('aria-expanded', isMenuOpen);
        mobileMenu.classList.toggle('hidden');
        openIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
    };

    menuButton.addEventListener('click', toggleMenu);
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });

    // --- INTERACTIVE NETWORK CANVAS ---
    const canvas = document.getElementById('network-canvas');
    if (!canvas) return; // Stop if canvas is not found
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let mouse = {
        x: null,
        y: null
    };
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    const particles = [];
    const particleCount = window.innerWidth > 768 ? 60 : 30;
    const connectDistance = 120;
    const highlightDistance = 150;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() * 0.4) - 0.2;
            this.speedY = (Math.random() * 0.4) - 0.2;
        }
        update() {
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            this.x += this.speedX;
            this.y += this.speedY;
        }
        draw(isHighlighted) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = isHighlighted ? 'rgba(37, 99, 235, 0.8)' : 'rgba(100, 116, 139, 0.6)';
            ctx.fill();
        }
    }

    function initCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animateNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p1, i) => {
            p1.update();
            let dxMouse = mouse.x - p1.x;
            let dyMouse = mouse.y - p1.y;
            let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            let isHighlighted = mouse.x && distMouse < highlightDistance;

            p1.draw(isHighlighted);

            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                let dx = p1.x - p2.x;
                let dy = p1.y - p2.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < connectDistance) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    let opacity = 1 - (distance / connectDistance);
                    ctx.strokeStyle = isHighlighted ? `rgba(37, 99, 235, ${opacity * 0.8})` : `rgba(100, 116, 139, ${opacity * 0.4})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });
        animationFrameId = requestAnimationFrame(animateNetwork);
    }

    initCanvas();
    animateNetwork();

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            initCanvas();
            animateNetwork();
        }, 250);
    });
});
