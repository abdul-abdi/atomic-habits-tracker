/**
 * Advanced Animation System using Anime.js
 * Creates immersive, minimalist animations for the habit tracker
 */

import { animate, timeline, stagger, scroll } from 'animejs';

export class AnimationSystem {
  constructor() {
    this.activeAnimations = new Map();
    this.scrollObservers = new Map();
    this.defaultEasing = 'spring(1, 80, 10, 0)';
    this.fastEasing = 'outExpo';
    this.slowEasing = 'inOutQuart';
    
    this.initializeGlobalAnimations();
  }

  // Initialize global page animations
  initializeGlobalAnimations() {
    // Page load animation
    this.animatePageLoad();
    
    // Setup scroll-triggered animations
    this.setupScrollAnimations();
  }

  // Page load animation sequence
  animatePageLoad() {
    const tl = timeline({
      autoplay: true,
      duration: 2000
    });

    // Animate page elements in sequence
    tl.add({
      targets: '.app-header',
      translateY: [-50, 0],
      opacity: [0, 1],
      duration: 800,
      ease: this.fastEasing
    })
    .add({
      targets: '.habit-card',
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 600,
      delay: stagger(100),
      ease: this.defaultEasing
    }, '-=400')
    .add({
      targets: '.floating-action-btn',
      scale: [0, 1],
      rotate: [180, 0],
      duration: 500,
      ease: 'outBack'
    }, '-=200');

    this.activeAnimations.set('pageLoad', tl);
  }

  // Habit completion animation
  animateHabitCompletion(element, options = {}) {
    const {
      onComplete = () => {},
      showConfetti = true,
      pulseIntensity = 1.2
    } = options;

    const tl = timeline({
      complete: onComplete
    });

    // Main completion animation
    tl.add({
      targets: element,
      scale: [1, pulseIntensity, 1],
      duration: 400,
      ease: 'outElastic'
    })
    .add({
      targets: element.querySelector('.habit-check'),
      rotate: [0, 360],
      scale: [0, 1.2, 1],
      duration: 600,
      ease: this.defaultEasing
    }, '-=200')
    .add({
      targets: element.querySelector('.habit-progress'),
      width: '100%',
      duration: 800,
      ease: this.slowEasing
    }, '-=400');

    // Confetti effect
    if (showConfetti) {
      this.createConfettiEffect(element);
    }

    // Streak counter animation
    const streakElement = element.querySelector('.streak-counter');
    if (streakElement) {
      tl.add({
        targets: streakElement,
        scale: [1, 1.3, 1],
        color: ['#666', '#ff6b6b', '#666'],
        duration: 500,
        ease: 'outBounce'
      }, '-=300');
    }

    return tl;
  }

  // Create confetti particle effect
  createConfettiEffect(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create confetti particles
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      particle.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: hsl(${Math.random() * 360}, 70%, 60%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${centerX}px;
        top: ${centerY}px;
      `;
      document.body.appendChild(particle);
      particles.push(particle);
    }

    // Animate particles
    animate(particles, {
      translateX: () => (Math.random() - 0.5) * 200,
      translateY: () => -Math.random() * 150 - 50,
      scale: [1, 0],
      rotate: () => Math.random() * 720,
      duration: 1500,
      delay: stagger(50),
      ease: 'outQuart',
      complete: () => {
        particles.forEach(p => p.remove());
      }
    });
  }

  // Streak milestone animation
  animateStreakMilestone(element, streakCount) {
    const colors = {
      7: '#4ecdc4',   // Week
      30: '#45b7d1',  // Month
      100: '#f39c12', // 100 days
      365: '#e74c3c'  // Year
    };

    const milestoneColor = colors[streakCount] || '#95a5a6';

    const tl = timeline();

    // Pulsing glow effect
    tl.add({
      targets: element,
      boxShadow: [
        '0 0 0 rgba(255,255,255,0)',
        `0 0 30px ${milestoneColor}`,
        '0 0 0 rgba(255,255,255,0)'
      ],
      duration: 2000,
      ease: 'inOutSine',
      loop: 3
    })
    .add({
      targets: element.querySelector('.streak-number'),
      scale: [1, 1.5, 1],
      color: ['#333', milestoneColor, '#333'],
      duration: 1000,
      ease: this.defaultEasing
    }, '-=1500');

    // Create milestone badge
    this.createMilestoneBadge(element, streakCount, milestoneColor);

    return tl;
  }

  // Create milestone achievement badge
  createMilestoneBadge(element, streakCount, color) {
    const badge = document.createElement('div');
    badge.className = 'milestone-badge';
    badge.innerHTML = `🎉 ${streakCount} Day Streak!`;
    badge.style.cssText = `
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%) scale(0);
      background: ${color};
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
      z-index: 100;
    `;

    element.style.position = 'relative';
    element.appendChild(badge);

    // Animate badge appearance
    animate(badge, {
      scale: [0, 1.1, 1],
      translateY: [-10, 0],
      duration: 800,
      ease: 'outBack',
      complete: () => {
        setTimeout(() => {
          animate(badge, {
            opacity: [1, 0],
            translateY: [0, -20],
            duration: 500,
            complete: () => badge.remove()
          });
        }, 3000);
      }
    });
  }

  // Habit card entrance animation
  animateHabitCardEntrance(elements) {
    return animate(elements, {
      translateY: [50, 0],
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 600,
      delay: stagger(100, { start: 200 }),
      ease: this.defaultEasing
    });
  }

  // Habit card exit animation
  animateHabitCardExit(element) {
    return animate(element, {
      translateX: [-300, 0],
      opacity: [1, 0],
      scale: [1, 0.8],
      duration: 400,
      ease: this.fastEasing
    });
  }

  // Progress bar animation
  animateProgressBar(element, progress) {
    const progressBar = element.querySelector('.progress-fill');
    const progressText = element.querySelector('.progress-text');

    const tl = timeline();

    tl.add({
      targets: progressBar,
      width: `${progress}%`,
      duration: 1000,
      ease: this.slowEasing
    })
    .add({
      targets: progressText,
      innerHTML: [0, Math.round(progress)],
      duration: 1000,
      ease: 'linear',
      round: 1
    }, '-=1000');

    return tl;
  }

  // Floating action button animations
  animateFAB(element, action = 'pulse') {
    switch (action) {
      case 'pulse':
        return animate(element, {
          scale: [1, 1.1, 1],
          duration: 300,
          ease: 'outQuad'
        });

      case 'rotate':
        return animate(element, {
          rotate: '+=180',
          duration: 400,
          ease: this.fastEasing
        });

      case 'bounce':
        return animate(element, {
          translateY: [0, -10, 0],
          duration: 500,
          ease: 'outBounce'
        });
    }
  }

  // Setup scroll-triggered animations
  setupScrollAnimations() {
    // Animate elements as they come into view
    const scrollObserver = scroll({
      targets: '.animate-on-scroll',
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 800,
      ease: this.defaultEasing,
      onEnter: (el) => {
        el.classList.add('animated');
      }
    });

    this.scrollObservers.set('main', scrollObserver);
  }

  // Morphing animation for habit categories
  animateCategoryMorph(fromElement, toElement) {
    const tl = timeline();

    tl.add({
      targets: fromElement,
      scale: [1, 0],
      opacity: [1, 0],
      duration: 300,
      ease: this.fastEasing
    })
    .add({
      targets: toElement,
      scale: [0, 1],
      opacity: [0, 1],
      duration: 400,
      ease: this.defaultEasing
    }, '-=100');

    return tl;
  }

  // Text animation for dynamic content
  animateTextChange(element, newText) {
    const tl = timeline();

    tl.add({
      targets: element,
      translateY: [0, -20],
      opacity: [1, 0],
      duration: 200,
      ease: this.fastEasing,
      complete: () => {
        element.textContent = newText;
      }
    })
    .add({
      targets: element,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 300,
      ease: this.defaultEasing
    });

    return tl;
  }

  // Loading animation
  createLoadingAnimation(element) {
    const dots = element.querySelectorAll('.loading-dot');
    
    return animate(dots, {
      scale: [1, 1.5, 1],
      opacity: [0.3, 1, 0.3],
      duration: 1000,
      delay: stagger(200),
      loop: true,
      ease: 'inOutSine'
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
