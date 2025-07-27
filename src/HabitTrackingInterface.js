/**
 * Main Habit Tracking Interface
 * Orchestrates the entire habit tracking experience
 */

import { HabitTracker } from './core/AtomicHabits.js';
import { AnimationSystem } from './animations/AnimationSystem.js';
import { UIComponents } from './components/UIComponents.js';

export class HabitTrackingInterface {
  constructor() {
    this.habitTracker = new HabitTracker();
    this.animationSystem = new AnimationSystem();
    this.uiComponents = new UIComponents(this.animationSystem);
    
    this.currentView = 'today';
    this.isLoading = false;
    
    this.init();
  }

  // Initialize the interface
  async init() {
    this.showLoading();
    await this.setupDOM();
    this.bindEvents();
    this.loadInitialData();
    this.hideLoading();
  }

  // Setup DOM structure
  async setupDOM() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="header-content">
            <h1 class="app-title">Atomic Habits</h1>
            <div class="header-actions">
              <button class="view-toggle" data-view="today">Today</button>
              <button class="view-toggle" data-view="all">All</button>
              <button class="view-toggle" data-view="stats">Stats</button>
            </div>
          </div>
        </header>

        <main class="app-main">
          <div class="loading-container" id="loading-container"></div>
          
          <div class="view-container" id="today-view">
            <div class="progress-section" id="progress-section"></div>
            <div class="habits-section" id="habits-section">
              <div class="section-header">
                <h2>Today's Habits</h2>
                <p class="section-subtitle">Build your atomic habits, one day at a time</p>
              </div>
              <div class="habits-list" id="habits-list"></div>
              <div class="empty-state" id="empty-state" style="display: none;">
                <div class="empty-icon">🌱</div>
                <h3>Start Your Journey</h3>
                <p>Create your first habit and begin building a better you</p>
                <button class="btn btn-primary create-first-habit">Create Your First Habit</button>
              </div>
            </div>
          </div>

          <div class="view-container" id="all-view" style="display: none;">
            <div class="categories-filter" id="categories-filter"></div>
            <div class="all-habits-list" id="all-habits-list"></div>
          </div>

          <div class="view-container" id="stats-view" style="display: none;">
            <div class="stats-dashboard" id="stats-dashboard"></div>
          </div>
        </main>

        <div class="fab-container" id="fab-container"></div>
      </div>
    `;

    // Add floating action button
    const fabContainer = document.getElementById('fab-container');
    const fab = this.uiComponents.createFloatingActionButton();
    fabContainer.appendChild(fab);
  }

  // Bind event listeners
  bindEvents() {
    // View toggle buttons
    document.querySelectorAll('.view-toggle').forEach(button => {
      button.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.switchView(view);
      });
    });

    // Habit completion events
    document.addEventListener('habitCompleted', (e) => {
      this.handleHabitCompleted(e.detail.habit);
    });

    // Habit creation events
    document.addEventListener('habitCreated', (e) => {
      this.handleHabitCreated(e.detail.habitData);
    });

    // Create first habit button
    document.querySelector('.create-first-habit')?.addEventListener('click', () => {
      this.uiComponents.openHabitCreator();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Window resize for responsive adjustments
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  // Load initial data
  loadInitialData() {
    this.renderTodayView();
    this.updateProgressDashboard();
    
    // If no habits exist, show empty state
    const habits = this.habitTracker.getActiveHabits();
    if (habits.length === 0) {
      this.showEmptyState();
    }
  }

  // Show loading state
  showLoading() {
    this.isLoading = true;
    const loadingContainer = document.getElementById('loading-container');
    const spinner = this.uiComponents.createLoadingSpinner();
    loadingContainer.appendChild(spinner);
    loadingContainer.style.display = 'flex';
  }

  // Hide loading state
  hideLoading() {
    this.isLoading = false;
    const loadingContainer = document.getElementById('loading-container');
    loadingContainer.style.display = 'none';
    loadingContainer.innerHTML = '';
  }

  // Switch between views
  switchView(viewName) {
    // Update active button
    document.querySelectorAll('.view-toggle').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Hide all views
    document.querySelectorAll('.view-container').forEach(view => {
      view.style.display = 'none';
    });

    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`);
    targetView.style.display = 'block';

    // Load view-specific content
    switch (viewName) {
      case 'today':
        this.renderTodayView();
        break;
      case 'all':
        this.renderAllHabitsView();
        break;
      case 'stats':
        this.renderStatsView();
        break;
    }

    this.currentView = viewName;
  }

  // Render today's view
  renderTodayView() {
    const todaysHabits = this.habitTracker.getTodaysHabits();
    const habitsList = document.getElementById('habits-list');
    
    // Clear existing content
    habitsList.innerHTML = '';

    if (todaysHabits.length === 0) {
      this.showEmptyState();
      return;
    }

    // Create habit cards
    todaysHabits.forEach((habit, index) => {
      const card = this.uiComponents.createHabitCard(habit);
      habitsList.appendChild(card);
    });

    // Animate cards entrance
    const cards = habitsList.querySelectorAll('.habit-card');
    this.animationSystem.animateHabitCardEntrance(cards);

    this.hideEmptyState();
  }

  // Render all habits view
  renderAllHabitsView() {
    const allHabits = this.habitTracker.getAllHabits();
    const allHabitsList = document.getElementById('all-habits-list');
    
    // Group habits by category
    const habitsByCategory = allHabits.reduce((acc, habit) => {
      if (!acc[habit.category]) {
        acc[habit.category] = [];
      }
      acc[habit.category].push(habit);
      return acc;
    }, {});

    allHabitsList.innerHTML = '';

    Object.entries(habitsByCategory).forEach(([category, habits]) => {
      const categorySection = document.createElement('div');
      categorySection.className = 'category-section';
      
      categorySection.innerHTML = `
        <h3 class="category-title">${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
        <div class="category-habits"></div>
      `;

      const categoryHabits = categorySection.querySelector('.category-habits');
      habits.forEach(habit => {
        const card = this.uiComponents.createHabitCard(habit);
        categoryHabits.appendChild(card);
      });

      allHabitsList.appendChild(categorySection);
    });

    // Animate sections
    const sections = allHabitsList.querySelectorAll('.category-section');
    this.animationSystem.animateHabitCardEntrance(sections);
  }

  // Render stats view
  renderStatsView() {
    const stats = this.habitTracker.getOverallStats();
    const statsContainer = document.getElementById('stats-dashboard');
    
    const dashboard = this.uiComponents.createProgressDashboard(stats);
    statsContainer.innerHTML = '';
    statsContainer.appendChild(dashboard);

    // Add detailed analytics
    this.addDetailedAnalytics(statsContainer);
  }

  // Add detailed analytics to stats view
  addDetailedAnalytics(container) {
    const habits = this.habitTracker.getActiveHabits();
    
    const analyticsSection = document.createElement('div');
    analyticsSection.className = 'analytics-section';
    
    analyticsSection.innerHTML = `
      <h3>Habit Analytics</h3>
      <div class="analytics-grid">
        ${habits.map(habit => {
          const analytics = habit.getAnalytics();
          return `
            <div class="analytics-card">
              <h4>${habit.name}</h4>
              <div class="analytics-stats">
                <div class="analytics-stat">
                  <span class="stat-value">${analytics.currentStreak}</span>
                  <span class="stat-label">Current Streak</span>
                </div>
                <div class="analytics-stat">
                  <span class="stat-value">${Math.round(analytics.completionRate7Days)}%</span>
                  <span class="stat-label">7-Day Rate</span>
                </div>
                <div class="analytics-stat">
                  <span class="stat-value">${analytics.totalCompletions}</span>
                  <span class="stat-label">Total</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.appendChild(analyticsSection);
  }

  // Update progress dashboard
  updateProgressDashboard() {
    const stats = this.habitTracker.getOverallStats();
    const progressSection = document.getElementById('progress-section');
    
    if (stats.totalHabits === 0) {
      progressSection.style.display = 'none';
      return;
    }

    progressSection.style.display = 'block';
    const dashboard = this.uiComponents.createProgressDashboard(stats);
    progressSection.innerHTML = '';
    progressSection.appendChild(dashboard);

    // Animate progress ring
    const progressRing = progressSection.querySelector('.ring-progress');
    if (progressRing) {
      this.animationSystem.animateProgressBar(progressSection, stats.completionRateToday);
    }
  }

  // Handle habit completion
  handleHabitCompleted(habit) {
    // Update progress dashboard
    this.updateProgressDashboard();
    
    // Update stats if in stats view
    if (this.currentView === 'stats') {
      this.renderStatsView();
    }

    // Show motivational message for milestones
    this.checkForMilestones(habit);
  }

  // Handle habit creation
  handleHabitCreated(habitData) {
    const habit = this.habitTracker.addHabit(habitData);
    
    // Refresh current view
    switch (this.currentView) {
      case 'today':
        this.renderTodayView();
        break;
      case 'all':
        this.renderAllHabitsView();
        break;
    }

    this.updateProgressDashboard();
    
    // Show success message
    this.showSuccessMessage(`"${habit.name}" habit created successfully!`);
  }

  // Check for milestones and celebrations
  checkForMilestones(habit) {
    const milestones = [7, 30, 100, 365];
    
    if (milestones.includes(habit.streak)) {
      this.showMilestoneMessage(habit.streak);
    }

    // Check for perfect week/month
    const completionRate7Days = habit.getCompletionRate(7);
    const completionRate30Days = habit.getCompletionRate(30);

    if (completionRate7Days === 100 && habit.completions.length >= 7) {
      this.showSuccessMessage("🎉 Perfect week! You're on fire!");
    }

    if (completionRate30Days === 100 && habit.completions.length >= 30) {
      this.showSuccessMessage("🏆 Perfect month! You're a habit master!");
    }
  }

  // Show milestone message
  showMilestoneMessage(streak) {
    const messages = {
      7: "🔥 One week streak! You're building momentum!",
      30: "🌟 30-day streak! This is becoming automatic!",
      100: "💎 100-day streak! You're a habit diamond!",
      365: "👑 One year streak! You're a habit legend!"
    };

    this.showSuccessMessage(messages[streak] || `${streak}-day streak achieved!`);
  }

  // Show success message
  showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);

    // Animate toast
    this.animationSystem.animateHabitCardEntrance([toast])
      .then(() => {
        setTimeout(() => {
          this.animationSystem.animateHabitCardExit(toast)
            .then(() => toast.remove());
        }, 3000);
      });
  }

  // Show/hide empty state
  showEmptyState() {
    document.getElementById('empty-state').style.display = 'block';
    document.getElementById('habits-list').style.display = 'none';
  }

  hideEmptyState() {
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('habits-list').style.display = 'block';
  }

  // Handle keyboard shortcuts
  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'n':
          e.preventDefault();
          this.uiComponents.openHabitCreator();
          break;
        case '1':
          e.preventDefault();
          this.switchView('today');
          break;
        case '2':
          e.preventDefault();
          this.switchView('all');
          break;
        case '3':
          e.preventDefault();
          this.switchView('stats');
          break;
      }
    }
  }

  // Handle window resize
  handleResize() {
    // Adjust animations for different screen sizes
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Optimize animations for mobile
      this.animationSystem.defaultEasing = 'outQuart';
    } else {
      // Use more elaborate animations on desktop
      this.animationSystem.defaultEasing = 'spring(1, 80, 10, 0)';
    }
  }

  // Cleanup when destroying the interface
  destroy() {
    this.animationSystem.cleanup();
    document.removeEventListener('habitCompleted', this.handleHabitCompleted);
    document.removeEventListener('habitCreated', this.handleHabitCreated);
  }
}
