/**
 * Atomic Habits Tracker - Main Entry Point
 * An immersive, minimalist habit tracker based on James Clear's Atomic Habits
 */

import './style.css'
import { HabitTrackingInterface } from './HabitTrackingInterface.js'

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Create the main interface
  const habitTracker = new HabitTrackingInterface();

  // Add some demo habits if none exist
  if (habitTracker.habitTracker.getAllHabits().length === 0) {
    addDemoHabits(habitTracker.habitTracker);
  }

  // Add service worker for offline support (if available)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, but app still works
    });
  }
});

// Add demo habits for first-time users
function addDemoHabits(tracker) {
  const demoHabits = [
    {
      name: 'Drink Water',
      description: 'Start each day with a glass of water',
      category: 'health',
      cue: 'When I wake up',
      craving: 'I want to feel refreshed and energized',
      response: 'I will drink a full glass of water',
      reward: 'I will feel hydrated and ready for the day',
      difficulty: 1
    },
    {
      name: 'Read for 10 Minutes',
      description: 'Read something educational or inspiring',
      category: 'learning',
      cue: 'After I have my morning coffee',
      craving: 'I want to learn something new',
      response: 'I will read for at least 10 minutes',
      reward: 'I will feel intellectually stimulated',
      difficulty: 2
    },
    {
      name: 'Practice Gratitude',
      description: 'Write down three things I\'m grateful for',
      category: 'general',
      cue: 'Before I go to bed',
      craving: 'I want to end the day on a positive note',
      response: 'I will write three things I\'m grateful for',
      reward: 'I will feel peaceful and content',
      difficulty: 1
    }
  ];

  demoHabits.forEach(habitData => {
    tracker.addHabit(habitData);
  });
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Application error:', event.error);

  // Show user-friendly error message
  const errorToast = document.createElement('div');
  errorToast.className = 'error-toast';
  errorToast.textContent = 'Something went wrong. Please refresh the page.';
  errorToast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #e74c3c;
    color: white;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1100;
  `;

  document.body.appendChild(errorToast);

  setTimeout(() => {
    errorToast.remove();
  }, 5000);
});

// Handle offline/online status
window.addEventListener('online', () => {
  const onlineToast = document.createElement('div');
  onlineToast.className = 'success-toast';
  onlineToast.textContent = '🌐 Back online!';
  document.body.appendChild(onlineToast);

  setTimeout(() => {
    onlineToast.remove();
  }, 3000);
});

window.addEventListener('offline', () => {
  const offlineToast = document.createElement('div');
  offlineToast.className = 'warning-toast';
  offlineToast.textContent = '📱 You\'re offline. Changes will sync when reconnected.';
  offlineToast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #f39c12;
    color: white;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1100;
  `;

  document.body.appendChild(offlineToast);

  setTimeout(() => {
    offlineToast.remove();
  }, 5000);
});
