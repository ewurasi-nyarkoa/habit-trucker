import Storage from '../js/storage.js';
import HabitTracker from '../js/habitTracker.js';

export default class UITest {
  constructor() {
    this.tracker = new HabitTracker();
    this.init();
  }

  init() {
    this.loadUser();
    this.setupEventListeners();
    this.renderAll();
  }

  loadUser() {
    const userName = Storage.getUserName();
    if (!userName) {
      this.showModal('nameModal'); // Show the modal if no user name is found
    } else {
      this.updateGreeting(userName);
    }
  }

  renderAll() {
    this.renderHabits();
    this.renderTodaysHabits();
  }

  renderHabits() {
    const container = document.querySelector('.week-main');
    container.innerHTML = '';

    this.tracker.habits.forEach(habit => {
      container.appendChild(this.createHabitElement(habit));
    });
  }

  createHabitElement(habit) {
    const habitElement = document.createElement('div');
    habitElement.className = 'habit-item';
    habitElement.dataset.id = habit.id;

    habitElement.innerHTML = `
      <div class="habit-info">
        <h3 class="habit-name">${habit.name}</h3>
        <p class="streak">🔥 Streak: ${habit.streak || 0} day streak</p>
      </div>
      <div class="habit-menu habit-actions">
        <button class="delete-habit-btn" title="Delete habit">Delete</button>
      </div>
    `;

    return habitElement;
  }

  renderTodaysHabits() {
    const today = new Date().getDay();
    const container = document.querySelector('.today-box');
    const habits = this.tracker.getTodaysHabits();

    container.innerHTML = `
      <h4>📅 Today</h4>
      <p><strong>${this.formatDate(new Date())}</strong><br>
      ${habits.length ? '0%' : 'No habits for today'}</p>
    `;

    habits.forEach(habit => {
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="checkbox" data-id="${habit.id}" ${habit.completed ? 'checked' : ''}>
        ${habit.name}
      `;
      label.querySelector('input').addEventListener('change', (e) => {
        this.tracker.toggleHabitCompletion(habit.id, e.target.checked);
      });
      container.appendChild(label);
    });
  }

  setupEventListeners() {
    document.getElementById('habitModal').querySelector('form').addEventListener('submit', (e) => this.handleAddHabit(e));
    document.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-habit-btn');
      if (deleteBtn) {
        const habitId = deleteBtn.closest('.habit-item').dataset.id;
        this.handleDeleteHabit(habitId);
      }
    });
  }

  handleAddHabit(e) {
    e.preventDefault();
    const habitNameInput = e.target.querySelector('input[type="text"]');
    const habitName = habitNameInput.value.trim();
    const selectedDays = Array.from(document.querySelectorAll('.day.selected'))
      .map(btn => parseInt(btn.dataset.day))
      .filter(day => !isNaN(day));

    if (habitName) {
      const newHabit = this.tracker.addHabit({
        name: habitName,
        type: 'to-do',
        days: selectedDays
      });

      this.renderHabits();
      this.renderTodaysHabits();

      e.target.reset();
      document.querySelectorAll('.day.selected').forEach(day => day.classList.remove('selected'));
    }
  }

  handleDeleteHabit(habitId) {
    this.tracker.deleteHabit(habitId);
    this.renderHabits();
    this.renderTodaysHabits();
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
    }
  }

  updateGreeting(name) {
    const greeting = this.getGreeting();
    document.querySelector('.dashboard-header .title').textContent = `${greeting}, ${name}`;
  }

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  formatDate(date) {
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}