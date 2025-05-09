import UITest from './uiTest.js';
import HabitTracker from '../js/habitTracker.js';

describe('UITest class', () => {
  let app;
  let habitTracker;

  beforeEach(() => {
    // Set up the DOM structure required by the UI class
    document.body.innerHTML = `
      <div class="dashboard-header">
        <h1 class="title"></h1>
      </div>
      <div class="today-box">
        <p></p>
      </div>
      <div class="week-main"></div>
      <div id="habitModal" class="modal">
        <div class="modal-content">
          <form>
            <input type="text" />
            <div class="day-buttons">
              <button type="button" class="day" data-day="1">Mon</button>
              <button type="button" class="day" data-day="2">Tue</button>
            </div>
            <button type="submit">Add Habit</button>
          </form>
        </div>
      </div>
    `;

    // Clear localStorage before each test
    localStorage.clear();

    // Create a custom HabitTracker instance
    habitTracker = new HabitTracker();

    // Inject the custom HabitTracker instance into the UI class
    app = new UITest();
    app.tracker = habitTracker; // Replace the internal tracker with the custom instance
  });

  afterEach(() => {
    // Clear localStorage after each test
    localStorage.clear();
  });

  test('should add a new habit and render it', () => {
    // Arrange
    const form = document.querySelector('#habitModal form');
    form.querySelector('input[type="text"]').value = 'Drink Water';
    form.querySelector('button[data-day="1"]').classList.add('selected');
    form.querySelector('button[data-day="2"]').classList.add('selected');

    // Act
    form.dispatchEvent(new Event('submit'));

    // Assert
    const habits = document.querySelectorAll('.week-main .habit-item');
    expect(habits).toHaveLength(1); // Ensure one habit is rendered
    expect(habits[0].querySelector('.habit-name').textContent).toBe('Drink Water'); // Check habit name
    expect(habitTracker.habits).toHaveLength(1); // Ensure the habit is added to the tracker
  });
});