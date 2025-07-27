/**
 * Enhanced Animation System using Anime.js
 * Creates immersive, minimalist animations for the habit tracker
 */

import { animate, stagger, Timeline, onScroll } from 'animejs';

export class AnimationSystem {
  constructor() {
    this.activeAnimations = new Map();
    this.scrollObservers = new Map();
    this.defaultEasing = 'spring(1, 80, 10, 0)';
    this.fastEasing = 'cubicBezier(0.25, 0.46, 0.45, 0.94)';
    this.slowEasing = 'cubicBezier(0.55, 0.055, 0.675, 0.19)';
    this.bounceEasing = 'cubicBezier(0.68, -0.55, 0.265, 1.55)';
    
    this.initializeGlobalAnimations();
  }

  // Initialize global page animations
  initializeGlobalAnimations() {
    // Page load animation
    this.animatePageLoad();
    
    // Setup scroll-triggered animations
    this.setupScrollAnimations();
    
    // Setup parallax effects
    this.setupParallaxEffects();
  }

  // Enhanced page load animation sequence
  animatePageLoad() {
    const tl = new Timeline({
      autoplay: true,
      duration: 2500
    });

    // Animate header with elegant entrance
    tl.add({
      targets: '.app-header',
      translateY: [-30, 0],
      opacity: [0, 1],
      duration: 1000,
      ease: this.fastEasing
    })
    .add({
      targets: '.app-title',
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 800,
      ease: this.bounceEasing
    }, '-=600')
    .add({
      targets: '.view-toggle',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 600,
      delay: stagger(100),
      ease: this.fastEasing
    }, '-=400')
    .add({
      targets: '.progress-dashboard',
      translateY: [30, 0],
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 800,
      ease: this.defaultEasing
    }, '-=300')
    .add({
      targets: '.habit-card',
      translateY: [50, 0],
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 700,
      delay: stagger(120, { start: 200 }),
      ease: this.defaultEasing
    }, '-=500')
    .add({
      targets: '.floating-action-btn',
      scale: [0, 1.2, 1],
      rotate: [180, 0],
      duration: 600,
      ease: this.bounceEasing
    }, '-=300');

    this.activeAnimations.set('pageLoad', tl);
  }

  // Enhanced habit completion animation
  animateHabitCompletion(element, options = {}) {
    const {
      onComplete = () => {},
      showConfetti = true,
      pulseIntensity = 1.3
    } = options;

    const tl = new Timeline({
      complete: onComplete
    });

    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'completion-ripple';
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(46, 204, 113, 0.3);
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 1;
    `;
    element.appendChild(ripple);

    // Main completion animation with ripple
    tl.add({
      targets: element,
      scale: [1, pulseIntensity, 1],
      duration: 500,
      ease: this.bounceEasing
    })
    .add({
      targets: ripple,
      width: [0, 200],
      height: [0, 200],
      opacity: [1, 0],
      duration: 600,
      ease: 'outQuart'
    }, '-=400')
    .add({
      targets: element.querySelector('.habit-check'),
      rotate: [0, 360],
      scale: [0, 1.3, 1],
      duration: 700,
      ease: this.bounceEasing
    }, '-=300')
    .add({
      targets: element.querySelector('.habit-progress'),
      width: '100%',
      duration: 1000,
      ease: this.slowEasing
    }, '-=500')
    .add({
      targets: element.querySelector('.progress-fill'),
      background: [
        'linear-gradient(90deg, #667eea, #764ba2)',
        'linear-gradient(90deg, #2ecc71, #27ae60)',
        'linear-gradient(90deg, #667eea, #764ba2)'
      ],
      duration: 1200,
      ease: 'easeInOutSine'
    }, '-=1000');

    // Streak counter animation with number counting
    const streakElement = element.querySelector('.streak-counter');
    if (streakElement) {
      const oldValue = parseInt(streakElement.textContent);
      const newValue = oldValue + 1;
      
      tl.add({
        targets: streakElement,
        scale: [1, 1.4, 1],
        color: ['#666', '#2ecc71', '#666'],
        duration: 600,
        ease: this.bounceEasing,
        update: function(anim) {
          const currentValue = Math.round(oldValue + (newValue - oldValue) * anim.progress);
          streakElement.textContent = currentValue;
        }
      }, '-=400');
    }

    // Confetti effect
    if (showConfetti) {
      this.createEnhancedConfettiEffect(element);
    }

    // Cleanup ripple
    setTimeout(() => ripple.remove(), 600);

    return tl;
  }

  // Enhanced confetti effect
  createEnhancedConfettiEffect(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create different types of confetti
    const confettiTypes = [
      { shape: 'circle', color: '#2ecc71' },
      { shape: 'square', color: '#3498db' },
      { shape: 'triangle', color: '#e74c3c' },
      { shape: 'star', color: '#f39c12' }
    ];

    const particles = [];
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement('div');
      const type = confettiTypes[i % confettiTypes.length];
      
      particle.className = 'confetti-particle';
      particle.style.cssText = `
        position: fixed;
        width: ${8 + Math.random() * 4}px;
        height: ${8 + Math.random() * 4}px;
        background: ${type.color};
        border-radius: ${type.shape === 'circle' ? '50%' : '0'};
        pointer-events: none;
        z-index: 1000;
        left: ${centerX}px;
        top: ${centerY}px;
        transform: rotate(${Math.random() * 360}deg);
      `;
      
      if (type.shape === 'triangle') {
        particle.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
      } else if (type.shape === 'star') {
        particle.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      }
      
      document.body.appendChild(particle);
      particles.push(particle);
    }

    // Animate particles with physics
    animate(particles, {
      translateX: () => (Math.random() - 0.5) * 300,
      translateY: () => -Math.random() * 200 - 100,
      scale: [1, 0],
      rotate: () => Math.random() * 720,
      duration: 2000,
      delay: stagger(50),
      ease: 'outQuart',
      complete: () => {
        particles.forEach(p => p.remove());
      }
    });
  }

  // Enhanced streak milestone animation
  animateStreakMilestone(element, streakCount) {
    const colors = {
      7: { primary: '#4ecdc4', secondary: '#44a08d' },
      30: { primary: '#45b7d1', secondary: '#96c93d' },
      100: { primary: '#f39c12', secondary: '#e67e22' },
      365: { primary: '#e74c3c', secondary: '#c0392b' }
    };

    const milestoneColor = colors[streakCount] || { primary: '#95a5a6', secondary: '#7f8c8d' };

    const tl = new Timeline();

    // Create glowing border effect
    element.style.boxShadow = `0 0 0 2px ${milestoneColor.primary}`;
    
    tl.add({
      targets: element,
      boxShadow: [
        `0 0 0 2px ${milestoneColor.primary}`,
        `0 0 30px ${milestoneColor.primary}, 0 0 60px ${milestoneColor.secondary}`,
        `0 0 0 2px ${milestoneColor.primary}`
      ],
      duration: 2500,
      ease: 'inOutSine',
      loop: 2
    })
    .add({
      targets: element.querySelector('.streak-number'),
      scale: [1, 1.6, 1],
      color: ['#333', milestoneColor.primary, '#333'],
      duration: 1200,
      ease: this.bounceEasing
    }, '-=2000');

    // Create milestone badge with enhanced design
    this.createEnhancedMilestoneBadge(element, streakCount, milestoneColor);

    return tl;
  }

  // Enhanced milestone badge
  createEnhancedMilestoneBadge(element, streakCount, color) {
    const badge = document.createElement('div');
    badge.className = 'milestone-badge enhanced';
    badge.innerHTML = `
      <div class="badge-content">
        <span class="badge-icon">🎉</span>
        <span class="badge-text">${streakCount} Day Streak!</span>
      </div>
      <div class="badge-sparkles">
        <span class="sparkle">✨</span>
        <span class="sparkle">✨</span>
        <span class="sparkle">✨</span>
      </div>
    `;
    
    badge.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%) scale(0);
      background: linear-gradient(135deg, ${color.primary}, ${color.secondary});
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: bold;
      white-space: nowrap;
      z-index: 100;
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    `;

    element.style.position = 'relative';
    element.appendChild(badge);

    // Animate badge appearance with sparkles
    const badgeContent = badge.querySelector('.badge-content');
    const sparkles = badge.querySelectorAll('.sparkle');
    
    animate(badge, {
      scale: [0, 1.2, 1],
      translateY: [-20, 0],
      duration: 800,
      ease: this.bounceEasing
    });

    animate(sparkles, {
      scale: [0, 1.5, 1],
      rotate: [0, 360],
      duration: 1000,
      delay: stagger(100),
      ease: this.bounceEasing
    });

    // Remove badge after delay
    setTimeout(() => {
      animate(badge, {
        opacity: [1, 0],
        translateY: [0, -30],
        scale: [1, 0.8],
        duration: 500,
        complete: () => badge.remove()
      });
    }, 4000);
  }

  // Enhanced habit card entrance animation
  animateHabitCardEntrance(elements) {
    return animate(elements, {
      translateY: [60, 0],
      opacity: [0, 1],
      scale: [0.85, 1],
      rotateX: [15, 0],
      duration: 800,
      delay: stagger(150, { start: 300 }),
      ease: this.defaultEasing
    });
  }

  // Enhanced habit card exit animation
  animateHabitCardExit(element) {
    return animate(element, {
      translateX: [-400, 0],
      opacity: [1, 0],
      scale: [1, 0.8],
      rotateY: [0, -15],
      duration: 500,
      ease: this.fastEasing
    });
  }

  // Enhanced progress bar animation
  animateProgressBar(element, progress) {
    const progressBar = element.querySelector('.progress-fill');
    const progressText = element.querySelector('.progress-text');

    const tl = new Timeline();

    tl.add({
      targets: progressBar,
      width: `${progress}%`,
      duration: 1200,
      ease: this.slowEasing
    })
    .add({
      targets: progressText,
      innerHTML: [0, Math.round(progress)],
      duration: 1200,
      ease: 'linear',
      round: 1
    }, '-=1200')
    .add({
      targets: progressBar,
      background: [
        'linear-gradient(90deg, #667eea, #764ba2)',
        'linear-gradient(90deg, #2ecc71, #27ae60)',
        'linear-gradient(90deg, #667eea, #764ba2)'
      ],
      duration: 1500,
      ease: 'easeInOutSine'
    }, '-=1200');

    return tl;
  }

  // Enhanced floating action button animations
  animateFAB(element, action = 'pulse') {
    switch (action) {
      case 'pulse':
        return animate(element, {
          scale: [1, 1.15, 1],
          rotate: [0, 5, -5, 0],
          duration: 400,
          ease: this.bounceEasing
        });

      case 'rotate':
        return animate(element, {
          rotate: '+=180',
          scale: [1, 1.1, 1],
          duration: 500,
          ease: this.fastEasing
        });

      case 'bounce':
        return animate(element, {
          translateY: [0, -15, 0],
          scale: [1, 1.05, 1],
          duration: 600,
          ease: this.bounceEasing
        });

      case 'shake':
        return animate(element, {
          translateX: [0, -10, 10, -10, 10, 0],
          duration: 500,
          ease: 'easeInOutSine'
        });
    }
  }

  // Enhanced scroll-triggered animations
  setupScrollAnimations() {
    const scrollObserver = onScroll({
      targets: '.animate-on-scroll',
      translateY: [60, 0],
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 1000,
      ease: this.defaultEasing,
      onEnter: (el) => {
        el.classList.add('animated');
      }
    });

    this.scrollObservers.set('main', scrollObserver);
  }

  // Setup parallax effects
  setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  // Enhanced morphing animation for habit categories
  animateCategoryMorph(fromElement, toElement) {
    const tl = new Timeline();

    tl.add({
      targets: fromElement,
      scale: [1, 0],
      opacity: [1, 0],
      rotateY: [0, 90],
      duration: 400,
      ease: this.fastEasing
    })
    .add({
      targets: toElement,
      scale: [0, 1],
      opacity: [0, 1],
      rotateY: [-90, 0],
      duration: 500,
      ease: this.defaultEasing
    }, '-=200');

    return tl;
  }

  // Enhanced text animation for dynamic content
  animateTextChange(element, newText) {
    const tl = new Timeline();

    tl.add({
      targets: element,
      translateY: [0, -30],
      opacity: [1, 0],
      scale: [1, 0.8],
      duration: 300,
      ease: this.fastEasing,
      complete: () => {
        element.textContent = newText;
      }
    })
    .add({
      targets: element,
      translateY: [30, 0],
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 400,
      ease: this.bounceEasing
    });

    return tl;
  }

  // Enhanced loading animation
  createLoadingAnimation(element) {
    const dots = element.querySelectorAll('.loading-dot');
    
    return animate(dots, {
      scale: [1, 1.8, 1],
      opacity: [0.3, 1, 0.3],
      translateY: [0, -10, 0],
      duration: 1200,
      delay: stagger(200),
      loop: true,
      ease: 'inOutSine'
    });
  }

  // Enhanced button press animation
  animateButtonPress(element) {
    return animate(element, {
      scale: [1, 0.95, 1],
      duration: 200,
      ease: 'easeInOutQuad'
    });
  }

  // Enhanced modal entrance
  animateModalEntrance(modal) {
    const backdrop = modal.querySelector('.modal-backdrop') || modal;
    const content = modal.querySelector('.modal-content') || modal;
    
    // Animate backdrop
    animate(backdrop, {
      opacity: [0, 1],
      duration: 300,
      ease: 'easeOutQuad'
    });

    // Animate content
    return animate(content, {
      scale: [0.8, 1],
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 400,
      ease: this.bounceEasing
    });
  }

  // Enhanced modal exit
  animateModalExit(modal) {
    const backdrop = modal.querySelector('.modal-backdrop') || modal;
    const content = modal.querySelector('.modal-content') || modal;
    
    // Animate content
    animate(content, {
      scale: [1, 0.8],
      opacity: [1, 0],
      translateY: [0, 50],
      duration: 300,
      ease: 'easeInQuad'
    });

    // Animate backdrop
    return animate(backdrop, {
      opacity: [1, 0],
      duration: 300,
      ease: 'easeInQuad'
    });
  }

  // Cleanup animations
  cleanup() {
    this.activeAnimations.forEach(animation => {
      if (animation.pause) animation.pause();
    });
    this.activeAnimations.clear();

    this.scrollObservers.forEach(observer => {
      if (observer.revert) observer.revert();
    });
    this.scrollObservers.clear();
  }

  // Utility: Get animation by name
  getAnimation(name) {
    return this.activeAnimations.get(name);
  }

  // Utility: Pause all animations
  pauseAll() {
    this.activeAnimations.forEach(animation => {
      if (animation.pause) animation.pause();
    });
  }

  // Utility: Resume all animations
  resumeAll() {
    this.activeAnimations.forEach(animation => {
      if (animation.play) animation.play();
    });
  }
}
