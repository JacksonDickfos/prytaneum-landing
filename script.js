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
    const hero = document.querySelector('.hero');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            shape.style.transform = `translateY(${rate * speed}px) rotate(${rate * 0.1}deg)`;
        });
        
        // Hero parallax effect
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 200; // Account for fixed navbar
                
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
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.email || !data.message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Submit to Formspree
            try {
                const response = await fetch('https://formspree.io/f/mblzgbyy', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: new FormData(this)
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
            }
        });
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
}

// Animations and Intersection Observer
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .stat, .fund-card');
    animateElements.forEach(el => observer.observe(el));
}

// Mobile Menu Toggle
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
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
                navbar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
            } else {
                navbar.style.background = '#FFFFFF';
                navbar.style.backdropFilter = 'none';
                navbar.style.borderBottom = '1px solid rgba(0,0,0,0.06)';
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
            width: 2px;
            height: 2px;
            background: rgba(102, 126, 234, 0.6);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Random positioning and animation
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = 3 + Math.random() * 4;
        const delay = Math.random() * 2;
        
        particle.style.left = x + '%';
        particle.style.top = y + '%';
        particle.style.animation = `particleFloat ${duration}s ${delay}s infinite linear`;
        
        hero.appendChild(particle);
        particles.push(particle);
    }
    
    // Add particle animation CSS
    if (!document.querySelector('#particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes particleFloat {
                0% {
                    transform: translateY(0px) translateX(0px);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) translateX(20px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize particles after a short delay
setTimeout(createParticles, 1000);

// Enhanced floating shapes animation
function enhanceFloatingShapes() {
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach((shape, index) => {
        // Add more complex animation
        const keyframes = [
            { transform: 'translateY(0px) rotate(0deg) scale(1)', opacity: 0.3 },
            { transform: 'translateY(-30px) rotate(90deg) scale(1.1)', opacity: 0.6 },
            { transform: 'translateY(-60px) rotate(180deg) scale(1)', opacity: 0.3 },
            { transform: 'translateY(-30px) rotate(270deg) scale(0.9)', opacity: 0.6 },
            { transform: 'translateY(0px) rotate(360deg) scale(1)', opacity: 0.3 }
        ];
        
        const options = {
            duration: 8000 + (index * 1000),
            iterations: Infinity,
            easing: 'ease-in-out'
        };
        
        shape.animate(keyframes, options);
    });
}

// Initialize enhanced animations
setTimeout(enhanceFloatingShapes, 2000);

// Typing effect for hero title
function initTypingEffect() {
    const heroTitle = document.querySelector('.hero-title .gradient-text');
    if (!heroTitle) return;
    
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    };
    
    // Start typing effect after a delay
    setTimeout(typeWriter, 1000);
}

// Initialize typing effect
setTimeout(initTypingEffect, 500);

// Add CSS for mobile menu
const mobileMenuStyles = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: rgba(10, 10, 10, 0.98);
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .nav-menu li {
            margin: 1rem 0;
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }
        
        .hamburger.active span:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    }
`;

// Add mobile menu styles to document
if (!document.querySelector('#mobile-menu-styles')) {
    const style = document.createElement('style');
    style.id = 'mobile-menu-styles';
    style.textContent = mobileMenuStyles;
    document.head.appendChild(style);
}

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(() => {
    // Scroll-based animations and effects
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    // Parallax effect for different sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const speed = 0.1;
        
        if (rect.top < windowHeight && rect.bottom > 0) {
            const yPos = -(scrolled * speed);
            section.style.transform = `translateY(${yPos}px)`;
        }
    });
}, 16)); // 60fps

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Add CSS for loading state
    const loadingStyles = `
        body:not(.loaded) {
            overflow: hidden;
        }
        
        body:not(.loaded)::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0a0a0a;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        body:not(.loaded)::after {
            content: 'PP';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #667eea;
            font-size: 3rem;
            font-weight: bold;
            z-index: 10000;
            animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
        }
    `;
    
    if (!document.querySelector('#loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = loadingStyles;
        document.head.appendChild(style);
    }
}); 

// Fire cursor tracking and direction effects
function initFireCursorTracking() {
    const logoArea = document.querySelector('.rotating-logo');
    const fireEffect = document.querySelector('.fire-effect');
    
    if (!logoArea || !fireEffect) return;
    
    logoArea.addEventListener('mousemove', (e) => {
        const rect = logoArea.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate cursor position relative to logo center
        const cursorX = e.clientX - centerX;
        const cursorY = e.clientY - centerY;
        
        // Calculate distance from center
        const distance = Math.sqrt(cursorX * cursorX + cursorY * cursorY);
        const maxDistance = Math.sqrt((rect.width / 2) * (rect.width / 2) + (rect.height / 2) * (rect.height / 2));
        
        // Normalize distance (0 to 1)
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        
        // Calculate angle for fire direction
        const angle = Math.atan2(cursorY, cursorX) * (180 / Math.PI);
        
        // Apply fire direction and intensity based on cursor
        if (fireEffect) {
            // Fire blows in cursor direction - limited movement
            const tiltX = (cursorX / maxDistance) * 8; // Reduced from 15px to 8px max tilt
            const tiltY = (cursorY / maxDistance) * 8;
            
            // Scale fire based on cursor distance (closer = bigger) - contained within logo
            const scale = 1 + (1 - normalizedDistance) * 0.3; // Reduced from 0.5 to 0.3 for more contained scaling
            
            // Apply transforms
            fireEffect.style.transform = `translateX(-50%) translate(${tiltX}px, ${tiltY}px) scale(${scale})`;
            
            // Adjust fire brightness based on cursor proximity - moderate increase
            const brightness = 1.2 + (1 - normalizedDistance) * 0.4; // Reduced from 0.8 to 0.4 for moderate brightness
            fireEffect.style.filter = `brightness(${brightness})`;
        }
    });
    
    // Reset fire position when cursor leaves logo area
    logoArea.addEventListener('mouseleave', () => {
        if (fireEffect) {
            fireEffect.style.transform = 'translateX(-50%)';
            fireEffect.style.filter = 'brightness(1.2)';
        }
    });
} 