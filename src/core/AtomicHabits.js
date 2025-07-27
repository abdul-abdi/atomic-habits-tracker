/**
 * Core Atomic Habits Implementation
 * Based on James Clear's Four Laws of Behavior Change:
 * 1. Make it Obvious (Cue)
 * 2. Make it Attractive (Craving)
 * 3. Make it Easy (Response)
 * 4. Make it Satisfying (Reward)
 */

export class Habit {
  constructor({
    id = null,
    name = '',
    description = '',
    category = 'general',
    cue = '',
    craving = '',
    response = '',
    reward = '',
    difficulty = 1, // 1-5 scale
    frequency = 'daily', // daily, weekly, monthly
    targetCount = 1,
    streak = 0,
    longestStreak = 0,
    completions = [],
    isActive = true,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id || this.generateId();
    this.name = name;
    this.description = description;
    this.category = category;
    this.cue = cue;
    this.craving = craving;
    this.response = response;
    this.reward = reward;
    this.difficulty = difficulty;
    this.frequency = frequency;
    this.targetCount = targetCount;
    this.streak = streak;
    this.longestStreak = longestStreak;
    this.completions = completions;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  generateId() {
    return 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Law 1: Make it Obvious
  setCue(cue) {
    this.cue = cue;
    this.updatedAt = new Date();
    return this;
  }

  // Law 2: Make it Attractive
  setCraving(craving) {
    this.craving = craving;
    this.updatedAt = new Date();
    return this;
  }

  // Law 3: Make it Easy
  setResponse(response) {
    this.response = response;
    this.updatedAt = new Date();
    return this;
  }

  // Law 4: Make it Satisfying
  setReward(reward) {
    this.reward = reward;
    this.updatedAt = new Date();
    return this;
  }

  // Complete habit for today
  complete(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if already completed today
    if (this.isCompletedToday(date)) {
      return false;
    }

    this.completions.push({
      date: dateStr,
      timestamp: date,
      count: 1
    });

    this.updateStreak();
    this.updatedAt = new Date();
    return true;
  }

  // Check if habit is completed today
  isCompletedToday(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];
    return this.completions.some(completion => completion.date === dateStr);
  }

  // Update streak calculation
  updateStreak() {
    if (this.completions.length === 0) {
      this.streak = 0;
      return;
    }

    // Sort completions by date
    const sortedCompletions = this.completions
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let currentStreak = 0;
    let tempStreak = 1;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if completed today or yesterday to maintain streak
    const lastCompletion = new Date(sortedCompletions[sortedCompletions.length - 1].date);
    const daysDiff = Math.floor((today - lastCompletion) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 1) {
      // Calculate current streak
      for (let i = sortedCompletions.length - 2; i >= 0; i--) {
        const current = new Date(sortedCompletions[i + 1].date);
        const previous = new Date(sortedCompletions[i].date);
        const diff = Math.floor((current - previous) / (1000 * 60 * 60 * 24));

        if (diff === 1) {
          tempStreak++;
        } else {
          break;
        }
      }
      currentStreak = tempStreak;
    }

    this.streak = currentStreak;
    this.longestStreak = Math.max(this.longestStreak, this.streak);
  }

  // Get completion rate for a period
  getCompletionRate(days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completionsInPeriod = this.completions.filter(completion => {
      const completionDate = new Date(completion.date);
      return completionDate >= startDate && completionDate <= endDate;
    });

    return (completionsInPeriod.length / days) * 100;
  }

  // Get habit data for analytics
  getAnalytics() {
    return {
      totalCompletions: this.completions.length,
      currentStreak: this.streak,
      longestStreak: this.longestStreak,
      completionRate30Days: this.getCompletionRate(30),
      completionRate7Days: this.getCompletionRate(7),
      averagePerWeek: this.completions.length > 0 ? 
        (this.completions.length / this.getDaysSinceCreation()) * 7 : 0,
      difficulty: this.difficulty,
      category: this.category
    };
  }

  getDaysSinceCreation() {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.floor((now - created) / (1000 * 60 * 60 * 24)) + 1;
  }

  // Convert to JSON for storage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      cue: this.cue,
      craving: this.craving,
      response: this.response,
      reward: this.reward,
      difficulty: this.difficulty,
      frequency: this.frequency,
      targetCount: this.targetCount,
      streak: this.streak,
      longestStreak: this.longestStreak,
      completions: this.completions,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create from JSON
  static fromJSON(data) {
    return new Habit(data);
  }
}

export class HabitTracker {
  constructor() {
    this.habits = new Map();
    this.categories = new Set(['health', 'productivity', 'learning', 'social', 'creative', 'general']);
    this.loadFromStorage();
  }

  // Add new habit
  addHabit(habitData) {
    const habit = new Habit(habitData);
    this.habits.set(habit.id, habit);
    this.saveToStorage();
    return habit;
  }

  // Get habit by ID
  getHabit(id) {
    return this.habits.get(id);
  }

  // Get all habits
  getAllHabits() {
    return Array.from(this.habits.values());
  }

  // Get active habits
  getActiveHabits() {
    return this.getAllHabits().filter(habit => habit.isActive);
  }

  // Get habits by category
  getHabitsByCategory(category) {
    return this.getAllHabits().filter(habit => habit.category === category);
  }

  // Complete habit
  completeHabit(id, date = new Date()) {
    const habit = this.getHabit(id);
    if (habit && habit.complete(date)) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Delete habit
  deleteHabit(id) {
    const deleted = this.habits.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // Get today's habits
  getTodaysHabits() {
    return this.getActiveHabits().map(habit => ({
      ...habit,
      isCompletedToday: habit.isCompletedToday()
    }));
  }

  // Get overall statistics
  getOverallStats() {
    const habits = this.getActiveHabits();
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.isCompletedToday()).length;
    const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0);
    const avgStreak = totalHabits > 0 ? totalStreaks / totalHabits : 0;

    return {
      totalHabits,
      completedToday,
      completionRateToday: totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0,
      averageStreak: avgStreak,
      longestStreak: Math.max(...habits.map(h => h.longestStreak), 0)
    };
  }

  // Save to localStorage
  saveToStorage() {
    const data = {
      habits: Array.from(this.habits.entries()).map(([id, habit]) => [id, habit.toJSON()]),
      categories: Array.from(this.categories)
    };
    localStorage.setItem('atomicHabitsTracker', JSON.stringify(data));
  }

  // Load from localStorage
  loadFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem('atomicHabitsTracker') || '{}');
      
      if (data.habits) {
        this.habits = new Map(
          data.habits.map(([id, habitData]) => [id, Habit.fromJSON(habitData)])
        );
      }
      
      if (data.categories) {
        this.categories = new Set(data.categories);
      }
    } catch (error) {
      console.error('Error loading habits from storage:', error);
      this.habits = new Map();
    }
  }

  // Add custom category
  addCategory(category) {
    this.categories.add(category);
    this.saveToStorage();
  }

  // Get all categories
  getCategories() {
    return Array.from(this.categories);
  }
}
