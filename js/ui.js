import HabitTracker from './habitTracker.js';
import Storage from './storage.js';

import {
  Chart,
  PieController,
  ArcElement,
  Legend,
  Title
} from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/+esm';

// Register required components
Chart.register(PieController, ArcElement, Legend, Title);


export default class UI {
  constructor() {
    this.tracker = new HabitTracker();
    this.init();
    console.log("UI instance created");
    console.log('Imported Chart:', Chart);
  }

  init() {
    this.loadUser();
    this.setupEventListeners();
    this.renderAll();
  }

  loadUser() {
    const userName = Storage.getUserName();
    if (!userName) {
      this.showModal('nameModal');
    } else {
      this.updateGreeting(userName);
    }
  }

  renderAll() {
    this.renderHabits();
    this.renderTodaysHabits();
    this.updateDateDisplay();
    this.updateStatistics();
  }

  // DOM Rendering Methods
  renderHabits() {
    const container = document.querySelector('.week-main');
    // console.log("Week-main element:", container); // Debugging line
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
        <button class="menu-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
         <button class="delete-habit-btn" title="Delete habit">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
      </div>
    `;

    return habitElement;
  }

  renderTodaysHabits() {

    const today = new Date().getDay();
    const container = document.querySelector('.today-box')
    const habits = this.tracker.getTodaysHabits();
    const buttonNumberedDay = today === 0 ? 0 : today;

    // console.log(`[DEBUG] JS Day: ${today}, Button Day: ${buttonNumberedDay}`);
    // console.log("[DEBUG] All habits:", this.tracker.habits.map(h => 
    //     `${h.name}: days [${h.days.join(',')}]`
    // ));

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
        this.updateProgress();
      });
      container.appendChild(label);
    });
  }

  // Helper function (add to your class)
  calculateCompletion(habits) {
    if (!habits.length) return 0;
    const completed = habits.filter(h => h.completed).length;
    return Math.round((completed / habits.length) * 100);
  }

  // Event Handlers
  setupEventListeners() {
    // Modal Open/Close
    document.querySelector('.white-button button').addEventListener('click', () => this.showModal('habitModal'));

    document.querySelector('#about-me').addEventListener('click', () => this.showModal('nameModal'));

    // Close buttons
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        this.closeModal(modal);
      });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });

    // Day selection in Add/Edit modals
    document.querySelectorAll('.day-buttons .day').forEach(day => {
      day.addEventListener('click', function () {
        this.classList.toggle('selected');
      });
    });

    // Frequency buttons
    document.querySelectorAll('.frequency-buttons .btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const frequency = this.dataset.frequency;
        const days = document.querySelectorAll('.day-buttons .day');

        days.forEach(day => {
          if (frequency === 'everyday') {
            day.classList.add('selected');
          } else if (frequency === 'weekdays') {
            const index = Array.from(days).indexOf(day);
            if (index < 5) { // Monday to Friday
              day.classList.add('selected');
            } else {
              day.classList.remove('selected');
            }
          }
        });
      });
    });

    // Form Submissions
    document.getElementById('nameForm').addEventListener('submit', (e) => this.handleNameSubmit(e));
    document.getElementById('habitModal').querySelector('form').addEventListener('submit', (e) => this.handleAddHabit(e));
    document.getElementById('editHabitForm').addEventListener('submit', (e) => this.handleEditHabit(e));

    // Habit menu buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.menu-btn')) {
        const habitItem = e.target.closest('.habit-item');
        const habitName = habitItem.querySelector('.habit-name').textContent;
        const habit = this.tracker.habits.find(h => h.name === habitName);

        if (habit) {
          this.prepareEditModal(habit);
          this.showModal('editHabitModal');
        }
      }
    });

    // Tab selection
    document.querySelectorAll('.date-range-tabs .tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelector('.tab.active').classList.remove('active');
        this.classList.add('active');
        // Would update view based on selected tab
      });
    });



    // Improved statistics button handler
    document.querySelectorAll('.button').forEach(button => {
      if (button.textContent.includes('📊 Statistics')) {
        button.addEventListener('click', () => {
          this.showModal('statsModal');
          this.updateStatistics(); // This will trigger the pie chart update
        });
      }
    });
    document.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-habit-btn');
      if (deleteBtn) {
        const habitId = deleteBtn.closest('.habit-item').dataset.id;
        this.handleDeleteHabit(habitId);
      }
    });



  }

  // Form Handlers
  handleNameSubmit(e) {
    e.preventDefault();
    const nameInput = e.target.querySelector('input');
    const name = nameInput.value.trim();

    if (name) {
      Storage.saveUserName(name);
      this.updateGreeting(name);
      this.closeModal(document.getElementById('nameModal'));
    }
  }

  handleAddHabit(e) {
    e.preventDefault();
    const habitNameInput = e.target.querySelector('input[type="text"]');
    const habitName = habitNameInput.value.trim();
    const habitType = document.querySelector('input[name="type"]:checked').value;
    const selectedDays = Array.from(document.querySelectorAll('.day.selected'))
  .map(btn => parseInt(btn.dataset.day))
  .filter(day => !isNaN(day));

// console.log("Correctly selected days:", selectedDays); 

    if (habitName) {
      const newHabit = this.tracker.addHabit({
        name: habitName,
        type: habitType,
        days: selectedDays
      });

      this.renderHabits();
      this.renderTodaysHabits();

      // Reset form
      e.target.reset();
      document.querySelectorAll('.day-buttons .day.selected').forEach(day => {
        day.classList.remove('selected');
      });
      this.closeModal(document.getElementById('habitModal'));
    }
  }

  handleEditHabit(e) {
    e.preventDefault();
    const habitId = e.target.dataset.habitId;
    const habitName = document.getElementById('editHabitName').value.trim();
    const habitType = document.querySelector('input[name="editType"]:checked').value;
      const selectedDays = Array.from(document.querySelectorAll('.day.selected'))
  .map(btn => parseInt(btn.dataset.day))
  .filter(day => !isNaN(day));

// console.log("Correctly selected days:", selectedDays); 

    if (habitName && habitId) {
      this.tracker.updateHabit(habitId, {
        name: habitName,
        type: habitType,
        days: selectedDays
      });

      this.renderAll();
      this.closeModal(document.getElementById('editHabitModal'));
    }
  }

  // Modal Methods
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.add('slide-up');

    setTimeout(() => {
      modalContent.classList.remove('slide-up');
    }, 500);
  }

  closeModal(modal) {
    modal.classList.remove('show');
  }

  prepareEditModal(habit) {
    const editForm = document.getElementById('editHabitForm');
    const nameInput = document.getElementById('editHabitName');

    nameInput.value = habit.name;
    editForm.dataset.habitId = habit.id;

    // Set habit type
    document.querySelector(`input[name="editType"][value="${habit.type}"]`).checked = true;

    // Reset day selection
    document.querySelectorAll('#editHabitModal .day-buttons .day').forEach((day, index) => {
      if (habit.days.includes(index)) {
        day.classList.add('selected');
      } else {
        day.classList.remove('selected');
      }
    });
  }

  // Add this method to your UI class
  handleDeleteHabit(habitId) {
    if (confirm('Are you sure you want to delete this habit?')) {
      try {
        // 1. Delete from tracker and storage
        this.tracker.deleteHabit(habitId);

        // 2. Remove from UI
        const habitElement = document.querySelector(`.habit-item[data-id="${habitId}"]`);
        if (habitElement) {
          habitElement.style.transition = 'all 0.3s ease';
          habitElement.style.opacity = '0';
          habitElement.style.height = '0';
          habitElement.style.margin = '0';
          habitElement.style.padding = '0';

          // Wait for animation to complete before removing
          setTimeout(() => {
            habitElement.remove();

            // 3. Update all dependent UI
            this.updateStatistics();
            this.updateProgress();
            this.renderTodaysHabits(); // Refresh today's habits if needed
          }, 300);
        }
      } catch (error) {
        // console.error('Error deleting habit:', error);
        alert('Failed to delete habit. Please try again.');
      }
    }
  }

  // Update Methods
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

  updateDateDisplay() {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(now.getDate() - diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    document.querySelector('.main-top-header span').textContent =
      `${this.formatDateShort(startOfWeek)} - ${this.formatDateShort(endOfWeek)}`;
  }

  updateStatistics() {
    const stats = this.tracker.calculateStats();
    this.updateProgress();

    // Always update the chart when stats modal is opened
    const statsModal = document.getElementById('statsModal');
    if (statsModal && statsModal.classList.contains('show')) {
      this.updatePieChart(stats);
    }
  }

  updatePieChart(stats) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    if (!ctx) {
      // console.error("Canvas element not found!");
      return;
    }

    if (window.habitChart) {
      window.habitChart.destroy();
    }

    window.habitChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          data: [stats.completedHabits, stats.totalHabits - stats.completedHabits],
          backgroundColor: ['#2B95E2', '#E0E0E0'],
          borderColor: ['#2B95E2', '#BDBDBD'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  updateProgress() {
    const checkboxes = document.querySelectorAll('.today-box input[type="checkbox"]');
    const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
    const total = checkboxes.length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    document.querySelector('.today-box p').innerHTML = `
      <strong>${this.formatDate(new Date())}</strong><br>
      ${total ? `${percentage}% complete` : 'No habits for today'}
    `; 

    // Update streak bar
    const streakBar = document.querySelector('.streak.bar');
    if (streakBar) {
      streakBar.innerHTML = `
        <div class="progress-container">
          <div class="progress-bar" style="width: ${percentage}%"></div>
        </div>
        <p class="progress-text">${completed} of ${total} habits complete • ${percentage}% achieved</p>
      `;
    }
  }

  // Utility Methods
  formatDate(date) {
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatDateShort(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' });
  }
}
const app = new UI();