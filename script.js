// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initParallax();
    initSmoothScrolling();
    initFormHandling();
    initAnimations();
    initMobileMenu();
    initScrollEffects();
    initFireCursorTracking();
});

// Parallax Effects
function initParallax() {
    const shapes = document.querySelectorAll('.shape');
    if (shapes.length === 0) return;

    shapes.forEach(shape => {
        const speed = shape.dataset.speed || 0.5;
        const direction = shape.dataset.direction || 'up';
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -speed;
            
            if (direction === 'up') {
                shape.style.transform = `translateY(${rate}px)`;
            } else if (direction === 'down') {
                shape.style.transform = `translateY(${-rate}px)`;
            } else if (direction === 'left') {
                shape.style.transform = `translateX(${rate}px)`;
            } else if (direction === 'right') {
                shape.style.transform = `translateX(${-rate}px)`;
            }
        });
    });
}

// Smooth Scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form Handling
function initFormHandling() {
    const form = document.querySelector('#contact-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Submit to Formspree
            const response = await fetch('https://formspree.io/f/mblzgbyy', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (response.ok) {
                showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
                this.reset();
            } else {
                const result = await response.json().catch(() => ({}));
                const errorMsg = result.errors && result.errors.length ? result.errors.map(e => e.message).join(', ') : 'Submission failed. Please try again later.';
                showNotification(errorMsg, 'error');
            }
        } catch (err) {
            console.error('Form submission error:', err);
            showNotification('Network error. Please try again later.', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe elements that should animate
    const animateElements = document.querySelectorAll('.service-card, .stat, .info-item');
    animateElements.forEach(el => observer.observe(el));
}

// Mobile Menu
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !mobileMenu) return;
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Close menu when clicking on a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

// Scroll Effects
function initScrollEffects() {
    let ticking = false;
    
    function updateOnScroll() {
        const scrolled = window.pageYOffset;
        const navbar = document.querySelector('.navbar');
        
        // Navbar background effect
        if (navbar) {
            if (scrolled > 50) {
                navbar.style.background = '#FFFFFF';
                navbar.style.backdropFilter = 'none';
                navbar.style.borderBottom = '1px solid rgba(0,0,0,0.06)';
                navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            } else {
                navbar.style.background = '#FFFFFF';
                navbar.style.backdropFilter = 'none';
                navbar.style.borderBottom = 'none';
                navbar.style.boxShadow = 'none';
            }
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });
}

// Particle System for Hero Section
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particleCount = 50;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(209, 173, 92, 0.6);
            border-radius: 50%;
            pointer-events: none;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        
        hero.appendChild(particle);
        particles.push(particle);
    }
}

// Fire Cursor Tracking
function initFireCursorTracking() {
    const logoArea = document.querySelector('.nav-logo');
    const fireEffect = document.querySelector('.fire-effect');
    
    if (!logoArea || !fireEffect) return;
    
    logoArea.addEventListener('mouseenter', () => {
        fireEffect.style.opacity = '1';
        fireEffect.style.transform = 'translateX(-50%) scale(1.1)';
        fireEffect.style.filter = 'brightness(1.5)';
    });
    
    logoArea.addEventListener('mousemove', (e) => {
        const rect = logoArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        fireEffect.style.left = x + 'px';
        fireEffect.style.top = y + 'px';
        fireEffect.style.transform = 'translateX(-50%) scale(1.2)';
        fireEffect.style.filter = 'brightness(1.8)';
    });
    
    // Reset fire position when cursor leaves logo area
    logoArea.addEventListener('mouseleave', () => {
        if (fireEffect) {
            fireEffect.style.transform = 'translateX(-50%)';
            fireEffect.style.filter = 'brightness(1.2)';
        }
    });
} 
