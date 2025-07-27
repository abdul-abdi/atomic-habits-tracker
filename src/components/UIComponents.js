/**
 * Mobile-First UI Components
 * Minimalist, touch-friendly components with micro-interactions
 */

import { AnimationSystem } from '../animations/AnimationSystem.js';

export class UIComponents {
  constructor(animationSystem) {
    this.animations = animationSystem;
    this.touchStartY = 0;
    this.touchStartX = 0;
  }

  // Create habit card component
  createHabitCard(habit) {
    const card = document.createElement('div');
    card.className = 'habit-card animate-on-scroll';
    card.dataset.habitId = habit.id;
    
    const completionStatus = habit.isCompletedToday() ? 'completed' : 'pending';
    const progressPercentage = (habit.streak / Math.max(habit.longestStreak, 7)) * 100;

    card.innerHTML = `
      <div class="habit-card-inner">
        <div class="habit-header">
          <div class="habit-info">
            <h3 class="habit-name">${habit.name}</h3>
            <p class="habit-description">${habit.description}</p>
            <div class="habit-laws">
              <span class="law-tag cue" title="Cue: ${habit.cue}">👁️</span>
              <span class="law-tag craving" title="Craving: ${habit.craving}">💫</span>
              <span class="law-tag response" title="Response: ${habit.response}">⚡</span>
              <span class="law-tag reward" title="Reward: ${habit.reward}">🎉</span>
            </div>
          </div>
          <div class="habit-completion ${completionStatus}">
            <div class="habit-check">
              <svg viewBox="0 0 24 24" class="check-icon">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="habit-progress-section">
          <div class="habit-progress">
            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
          </div>
          <div class="habit-stats">
            <div class="stat-item">
              <span class="stat-value streak-counter">${habit.streak}</span>
              <span class="stat-label">Streak</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${habit.longestStreak}</span>
              <span class="stat-label">Best</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${Math.round(habit.getCompletionRate(7))}%</span>
              <span class="stat-label">Week</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.addHabitCardInteractions(card, habit);
    return card;
  }

  // Add interactions to habit card
  addHabitCardInteractions(card, habit) {
    const checkButton = card.querySelector('.habit-completion');
    
    // Touch/click interaction for completion
    checkButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleHabitCompletion(card, habit);
    });

    // Long press for options
    let longPressTimer;
    checkButton.addEventListener('touchstart', (e) => {
      longPressTimer = setTimeout(() => {
        this.showHabitOptions(card, habit);
      }, 800);
    });

    checkButton.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
    });

    // Swipe gestures
    this.addSwipeGestures(card, habit);
  }

  // Handle habit completion
  handleHabitCompletion(card, habit) {
    if (habit.isCompletedToday()) return;

    // Update habit
    habit.complete();
    
    // Update UI
    const checkButton = card.querySelector('.habit-completion');
    checkButton.classList.add('completed');
    
    // Update streak counter
    const streakCounter = card.querySelector('.streak-counter');
    streakCounter.textContent = habit.streak;

    // Animate completion
    this.animations.animateHabitCompletion(card, {
      onComplete: () => {
        // Check for streak milestones
        if ([7, 30, 100, 365].includes(habit.streak)) {
          this.animations.animateStreakMilestone(card, habit.streak);
        }
      }
    });

    // Dispatch custom event
    card.dispatchEvent(new CustomEvent('habitCompleted', {
      detail: { habit },
      bubbles: true
    }));
  }

  // Add swipe gestures
  addSwipeGestures(card, habit) {
    let startX, startY, startTime;

    card.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    });

    card.addEventListener('touchmove', (e) => {
      if (!startX || !startY) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = startX - currentX;
      const diffY = startY - currentY;

      // Prevent scrolling if horizontal swipe
      if (Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();
      }
    });

    card.addEventListener('touchend', (e) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;
      const timeDiff = Date.now() - startTime;

      // Swipe detection
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50 && timeDiff < 300) {
        if (diffX > 0) {
          // Swipe left - show options
          this.showHabitOptions(card, habit);
        } else {
          // Swipe right - quick complete
          this.handleHabitCompletion(card, habit);
        }
      }

      startX = startY = null;
    });
  }

  // Show habit options menu
  showHabitOptions(card, habit) {
    const overlay = document.createElement('div');
    overlay.className = 'habit-options-overlay';
    
    overlay.innerHTML = `
      <div class="habit-options-menu">
        <div class="options-header">
          <h4>${habit.name}</h4>
          <button class="close-options">×</button>
        </div>
        <div class="options-list">
          <button class="option-btn edit-habit">
            <span class="option-icon">✏️</span>
            Edit Habit
          </button>
          <button class="option-btn view-stats">
            <span class="option-icon">📊</span>
            View Statistics
          </button>
          <button class="option-btn duplicate-habit">
            <span class="option-icon">📋</span>
            Duplicate
          </button>
          <button class="option-btn delete-habit danger">
            <span class="option-icon">🗑️</span>
            Delete
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate menu appearance
    const menu = overlay.querySelector('.habit-options-menu');
    this.animations.animateHabitCardEntrance([menu]);

    // Add event listeners
    overlay.querySelector('.close-options').addEventListener('click', () => {
      this.closeHabitOptions(overlay);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeHabitOptions(overlay);
      }
    });

    // Option handlers
    overlay.querySelector('.edit-habit').addEventListener('click', () => {
      this.openHabitEditor(habit);
      this.closeHabitOptions(overlay);
    });

    overlay.querySelector('.delete-habit').addEventListener('click', () => {
      this.confirmDeleteHabit(habit, card);
      this.closeHabitOptions(overlay);
    });
  }

  // Close habit options
  closeHabitOptions(overlay) {
    this.animations.animateHabitCardExit(overlay.querySelector('.habit-options-menu'))
      .then(() => overlay.remove());
  }

  // Create floating action button
  createFloatingActionButton() {
    const fab = document.createElement('button');
    fab.className = 'floating-action-btn';
    fab.innerHTML = `
      <svg viewBox="0 0 24 24" class="fab-icon">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
    `;

    fab.addEventListener('click', () => {
      this.animations.animateFAB(fab, 'pulse');
      this.openHabitCreator();
    });

    return fab;
  }

  // Create habit creator modal
  openHabitCreator() {
    const modal = document.createElement('div');
    modal.className = 'habit-creator-modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create New Habit</h2>
          <button class="close-modal">×</button>
        </div>
        
        <form class="habit-form">
          <div class="form-section">
            <label class="form-label">Habit Name</label>
            <input type="text" class="form-input" name="name" placeholder="e.g., Drink 8 glasses of water" required>
          </div>
          
          <div class="form-section">
            <label class="form-label">Description</label>
            <textarea class="form-input" name="description" placeholder="Why is this habit important to you?"></textarea>
          </div>
          
          <div class="form-section">
            <label class="form-label">Category</label>
            <select class="form-input" name="category">
              <option value="health">Health</option>
              <option value="productivity">Productivity</option>
              <option value="learning">Learning</option>
              <option value="social">Social</option>
              <option value="creative">Creative</option>
              <option value="general">General</option>
            </select>
          </div>
          
          <div class="atomic-laws-section">
            <h3>The Four Laws of Behavior Change</h3>
            
            <div class="law-input">
              <label class="law-label">
                <span class="law-icon">👁️</span>
                <span class="law-title">Make it Obvious (Cue)</span>
              </label>
              <input type="text" class="form-input" name="cue" placeholder="When and where will you do this habit?">
            </div>
            
            <div class="law-input">
              <label class="law-label">
                <span class="law-icon">💫</span>
                <span class="law-title">Make it Attractive (Craving)</span>
              </label>
              <input type="text" class="form-input" name="craving" placeholder="What makes this habit appealing?">
            </div>
            
            <div class="law-input">
              <label class="law-label">
                <span class="law-icon">⚡</span>
                <span class="law-title">Make it Easy (Response)</span>
              </label>
              <input type="text" class="form-input" name="response" placeholder="What's the smallest version of this habit?">
            </div>
            
            <div class="law-input">
              <label class="law-label">
                <span class="law-icon">🎉</span>
                <span class="law-title">Make it Satisfying (Reward)</span>
              </label>
              <input type="text" class="form-input" name="reward" placeholder="How will you celebrate completing this?">
            </div>
          </div>
          
          <div class="form-section">
            <label class="form-label">Difficulty Level</label>
            <div class="difficulty-selector">
              <input type="range" class="difficulty-slider" name="difficulty" min="1" max="5" value="1">
              <div class="difficulty-labels">
                <span>Very Easy</span>
                <span>Easy</span>
                <span>Medium</span>
                <span>Hard</span>
                <span>Very Hard</span>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary create-btn">Create Habit</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Animate modal appearance
    const content = modal.querySelector('.modal-content');
    this.animations.animateHabitCardEntrance([content]);

    // Add event listeners
    this.addHabitCreatorListeners(modal);
  }

  // Add event listeners to habit creator
  addHabitCreatorListeners(modal) {
    const form = modal.querySelector('.habit-form');
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');

    // Close modal
    const closeModal = () => {
      this.animations.animateHabitCardExit(modal.querySelector('.modal-content'))
        .then(() => modal.remove());
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const habitData = Object.fromEntries(formData.entries());
      
      // Dispatch custom event
      modal.dispatchEvent(new CustomEvent('habitCreated', {
        detail: { habitData },
        bubbles: true
      }));
      
      closeModal();
    });

    // Difficulty slider interaction
    const slider = modal.querySelector('.difficulty-slider');
    const labels = modal.querySelectorAll('.difficulty-labels span');
    
    slider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value) - 1;
      labels.forEach((label, index) => {
        label.classList.toggle('active', index === value);
      });
    });
  }

  // Create progress dashboard
  createProgressDashboard(stats) {
    const dashboard = document.createElement('div');
    dashboard.className = 'progress-dashboard';
    
    dashboard.innerHTML = `
      <div class="dashboard-header">
        <h2>Today's Progress</h2>
        <div class="completion-ring">
          <svg class="ring-svg" viewBox="0 0 100 100">
            <circle class="ring-background" cx="50" cy="50" r="45"/>
            <circle class="ring-progress" cx="50" cy="50" r="45" 
                    style="stroke-dasharray: ${2 * Math.PI * 45}; 
                           stroke-dashoffset: ${2 * Math.PI * 45 * (1 - stats.completionRateToday / 100)}"/>
          </svg>
          <div class="ring-text">
            <span class="completion-percentage">${Math.round(stats.completionRateToday)}%</span>
            <span class="completion-label">Complete</span>
          </div>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-number">${stats.completedToday}/${stats.totalHabits}</div>
            <div class="stat-title">Habits Today</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-number">${Math.round(stats.averageStreak)}</div>
            <div class="stat-title">Avg Streak</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <div class="stat-number">${stats.longestStreak}</div>
            <div class="stat-title">Best Streak</div>
          </div>
        </div>
      </div>
    `;

    return dashboard;
  }

  // Create loading spinner
  createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    
    spinner.innerHTML = `
      <div class="spinner-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
      <p class="loading-text">Loading your habits...</p>
    `;

    this.animations.createLoadingAnimation(spinner);
    return spinner;
  }
}
