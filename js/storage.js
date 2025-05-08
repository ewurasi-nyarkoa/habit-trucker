export default class Storage {
  static getUserName() {
    return localStorage.getItem('userName');
  }

  static saveUserName(name) {
    localStorage.setItem('userName', name);
  }

  static getHabits() {
    return JSON.parse(localStorage.getItem('habits') || '[]');
  }

  static saveHabits(habits) {
    localStorage.setItem('habits', JSON.stringify(habits));
  }

  static deleteHabit(habitId) {
    const habits = this.getHabits();
    const updatedHabits = habits.filter(h => h.id !== habitId);
    this.saveHabits(updatedHabits);
    return updatedHabits;
  }
}