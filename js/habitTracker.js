import Storage from './storage.js';

export default class HabitTracker {
  constructor() {
    this.habits = Storage.getHabits();
  }

  addHabit({ name, type, days }) {
    const newHabit = {
      id: Date.now().toString(),
      name,
      type,
      days,
      streak: 0,
      completed: false
    };
    
    this.habits.push(newHabit);
    Storage.saveHabits(this.habits);
    return newHabit;
  }

  updateHabit(habitId, { name, type, days }) {
    const habit = this.habits.find(h => h.id === habitId);
    if (habit) {
      Object.assign(habit, { name, type, days });
      Storage.saveHabits(this.habits);
    }
    return habit;
  }

  deleteHabit(habitId) {
    this.habits = this.habits.filter(h => h.id !== habitId);
    Storage.saveHabits(this.habits);  // Make sure this saves to localStorage
    return this.habits;  // Return updated habits array
  }

  toggleHabitCompletion(habitId, completed) {
    const habit = this.habits.find(h => h.id === habitId);
    if (habit) {
      habit.completed = completed;
      habit.streak = completed ? habit.streak + 1 : Math.max(0, habit.streak - 1);
      Storage.saveHabits(this.habits);
    }
    return habit;
  }

  getTodaysHabits() {
    const today = new Date().getDay(); // 0-6 (Sun-Sat)
    return this.habits.filter(habit => 
        Array.isArray(habit.days) && habit.days.includes(today)
    );
}



  calculateStats() {
    if (!this.habits.length) {
      return {
        completionRate: 0,
        totalHabits: 0,
        completedHabits: 0,
        longestStreak: 0,
        averageStreak: 0
      };
    }

    const completedHabits = this.habits.filter(h => h.completed).length;
    const totalStreaks = this.habits.reduce((sum, h) => sum + h.streak, 0);

    return {
      completionRate: (completedHabits / this.habits.length) * 100,
      totalHabits: this.habits.length,
      completedHabits,
      longestStreak: Math.max(...this.habits.map(h => h.streak)),
      averageStreak: totalStreaks / this.habits.length
    };
  }
}