import HabitTracker from '../js/habitTracker.js';
import Storage from '../js/storage.js';

describe('HabitTracker class (without mocking Storage)', () => {
  let habitTracker;

  beforeEach(() => {
    localStorage.clear(); // Clear localStorage before each test
    habitTracker = new HabitTracker(); // Create a new instance for each test
  });

  afterEach(() => {
    localStorage.clear(); // Ensure localStorage is cleared after each test
  });

  test('should add a new habit', () => {
    // Arrange
    const habitData = { name: 'Drink Water', type: 'to-do', days: [1, 2, 3] };

    // Act
    const newHabit = habitTracker.addHabit(habitData);

    // Assert
    expect(newHabit).toMatchObject(habitData);
    expect(habitTracker.habits).toHaveLength(1);
    expect(Storage.getHabits()).toEqual(habitTracker.habits); // Verify localStorage is updated
  });

  test('should update an existing habit', () => {
    // Arrange
    const habitData = { id: '1', name: 'Exercise', type: 'to-do', days: [1, 2] };
    habitTracker.habits = [habitData];
    Storage.saveHabits(habitTracker.habits); // Save initial habits to localStorage
    const updatedData = { name: 'Morning Exercise', type: 'to-do', days: [1, 3] };

    // Act
    const updatedHabit = habitTracker.updateHabit('1', updatedData);

    // Assert
    expect(updatedHabit).toMatchObject(updatedData);
    expect(Storage.getHabits()).toEqual(habitTracker.habits); // Verify localStorage is updated
  });

  test('should delete a habit', () => {
    // Arrange
    const habit1 = { id: '1', name: 'Drink Water', streak: 2, days: [1, 3], completed: false };
    const habit2 = { id: '2', name: 'Exercise', streak: 1, days: [4], completed: false };
    habitTracker.habits = [habit1, habit2];
    Storage.saveHabits(habitTracker.habits); // Save initial habits to localStorage

    // Act
    const updatedHabits = habitTracker.deleteHabit('1');

    // Assert
    expect(updatedHabits).toEqual([habit2]);
    expect(Storage.getHabits()).toEqual([habit2]); // Verify localStorage is updated
  });

  test('should toggle habit completion and update streak', () => {
    // Arrange
    const habit = { id: '1', name: 'Drink Water', streak: 2, days: [1, 3], completed: false };
    habitTracker.habits = [habit];
    Storage.saveHabits(habitTracker.habits); // Save initial habits to localStorage

    // Act
    const updatedHabit = habitTracker.toggleHabitCompletion('1', true);

    // Assert
    expect(updatedHabit.completed).toBe(true);
    expect(updatedHabit.streak).toBe(3);
    expect(Storage.getHabits()).toEqual(habitTracker.habits); // Verify localStorage is updated
  });

  test('should return today\'s habits', () => {
    // Arrange
    const today = new Date().getDay();
    const habit1 = { id: '1', name: 'Drink Water', days: [today], completed: false };
    const habit2 = { id: '2', name: 'Exercise', days: [today + 1], completed: false };
    habitTracker.habits = [habit1, habit2];
    Storage.saveHabits(habitTracker.habits); // Save initial habits to localStorage

    // Act
    const todaysHabits = habitTracker.getTodaysHabits();

    // Assert
    expect(todaysHabits).toEqual([habit1]);
  });

  test('should calculate statistics', () => {
    // Arrange
    const habit1 = { id: '1', name: 'Drink Water', streak: 5, completed: true };
    const habit2 = { id: '2', name: 'Exercise', streak: 3, completed: false };
    habitTracker.habits = [habit1, habit2];
    Storage.saveHabits(habitTracker.habits); // Save initial habits to localStorage

    // Act
    const stats = habitTracker.calculateStats();

    // Assert
    expect(stats).toEqual({
      completionRate: 50,
      totalHabits: 2,
      completedHabits: 1,
      longestStreak: 5,
      averageStreak: 4,
    });
  });
});