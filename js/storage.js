/**
 * GrowFit — Storage Module
 * 
 * All data lives in localStorage for now.
 * This module wraps localStorage so we can later swap it
 * for fetch() calls to an Express API without changing the rest of the app.
 * 
 * Data structure:
 *   growfit_user           → User profile
 *   growfit_exercises      → Array of exercise records
 *   growfit_foods          → Array of food records
 *   growfit_weight_records → Array of weight records
 *   growfit_journal        → Array of journal entries
 *   growfit_settings       → App settings
 */

// ─── Storage Key Constants ───────────────────────────────────────
const STORAGE_KEYS = {
  USER: 'growfit_user',
  EXERCISES: 'growfit_exercises',
  FOODS: 'growfit_foods',
  WEIGHT_RECORDS: 'growfit_weight_records',
  JOURNAL: 'growfit_journal',
  SETTINGS: 'growfit_settings',
};

// ─── Default Data (used on first launch) ─────────────────────────
const DEFAULT_USER = {
  name: 'User',
  age: null,
  height: null,          // in cm
  currentWeight: null,   // in kg
  targetCalories: 2500,
  targetProtein: 100,    // in grams
  createdAt: new Date().toISOString(),
};

const DEFAULT_SETTINGS = {
  theme: 'dark',
  unit: 'metric',   // 'metric' or 'imperial'
};

// ─── Food Library (common Indian foods, approximate values) ──────
// Values are per standard serving. Marked as approximate.
const FOOD_LIBRARY = [
  { name: 'Milk (1 glass)',       calories: 150, protein: 8,  carbs: 12, fat: 8,    category: 'dairy' },
  { name: 'Curd (1 bowl)',        calories: 120, protein: 7,  carbs: 8,  fat: 6,    category: 'dairy' },
  { name: 'Paneer (100g)',        calories: 265, protein: 18, carbs: 4,  fat: 20,   category: 'dairy' },
  { name: 'Egg (1 whole)',        calories: 78,  protein: 6,  carbs: 1,  fat: 5,    category: 'protein' },
  { name: 'Boiled Eggs (2)',      calories: 156, protein: 12, carbs: 2,  fat: 10,   category: 'protein' },
  { name: 'Dal (1 bowl)',         calories: 180, protein: 12, carbs: 28, fat: 2,    category: 'legume' },
  { name: 'Chana (1 bowl)',       calories: 240, protein: 15, carbs: 35, fat: 4,    category: 'legume' },
  { name: 'Rajma (1 bowl)',       calories: 210, protein: 13, carbs: 32, fat: 1,    category: 'legume' },
  { name: 'Rice (1 plate)',       calories: 260, protein: 5,  carbs: 56, fat: 1,    category: 'grain' },
  { name: 'Roti (1 piece)',       calories: 120, protein: 3,  carbs: 20, fat: 4,    category: 'grain' },
  { name: 'Banana (1 medium)',    calories: 105, protein: 1,  carbs: 27, fat: 0,    category: 'fruit' },
  { name: 'Peanuts (30g)',        calories: 170, protein: 7,  carbs: 5,  fat: 14,   category: 'nut' },
  { name: 'Oats (40g dry)',       calories: 150, protein: 5,  carbs: 27, fat: 3,    category: 'grain' },
  { name: 'Chicken Breast (100g)',calories: 165, protein: 31, carbs: 0,  fat: 4,    category: 'protein' },
  { name: 'Peanut Butter (2 tbsp)', calories: 190, protein: 7, carbs: 7, fat: 16,  category: 'nut' },
  { name: 'Banana Shake',         calories: 300, protein: 10, carbs: 45, fat: 10,   category: 'drink' },
  { name: 'Lassi (1 glass)',      calories: 170, protein: 6,  carbs: 22, fat: 6,    category: 'drink' },
  { name: 'Idli (2 pieces)',      calories: 130, protein: 4,  carbs: 24, fat: 1,    category: 'grain' },
  { name: 'Dosa (1 plain)',       calories: 120, protein: 3,  carbs: 18, fat: 4,    category: 'grain' },
  { name: 'Paratha (1 piece)',    calories: 200, protein: 4,  carbs: 28, fat: 8,    category: 'grain' },
];

// ─── Exercise Library (beginner-friendly) ────────────────────────
const EXERCISE_LIBRARY = [
  { name: 'Push-ups',       category: 'strength', defaultSets: 3, defaultReps: 10, icon: '💪' },
  { name: 'Squats',         category: 'strength', defaultSets: 3, defaultReps: 12, icon: '🦵' },
  { name: 'Lunges',         category: 'strength', defaultSets: 3, defaultReps: 10, icon: '🦵' },
  { name: 'Plank',          category: 'core',     defaultSets: 3, defaultReps: 1,  icon: '🧘', isDuration: true, defaultDuration: 30 },
  { name: 'Crunches',       category: 'core',     defaultSets: 3, defaultReps: 15, icon: '🧘' },
  { name: 'Jumping Jacks',  category: 'cardio',   defaultSets: 3, defaultReps: 20, icon: '⭐' },
  { name: 'Walking',        category: 'cardio',   defaultSets: 1, defaultReps: 1,  icon: '🚶', isDuration: true, defaultDuration: 30 },
  { name: 'Running',        category: 'cardio',   defaultSets: 1, defaultReps: 1,  icon: '🏃', isDuration: true, defaultDuration: 20 },
  { name: 'Cycling',        category: 'cardio',   defaultSets: 1, defaultReps: 1,  icon: '🚴', isDuration: true, defaultDuration: 30 },
  { name: 'Stretching',     category: 'flexibility', defaultSets: 1, defaultReps: 1, icon: '🤸', isDuration: true, defaultDuration: 10 },
  { name: 'Burpees',        category: 'cardio',   defaultSets: 3, defaultReps: 8,  icon: '🔥' },
  { name: 'Mountain Climbers', category: 'cardio', defaultSets: 3, defaultReps: 15, icon: '⛰️' },
];


// ─── Main Storage Object ─────────────────────────────────────────
const GrowFitStorage = {

  // ── Core read/write ──────────────────────────────────────────

  /** Get parsed data for a key, or null if not found */
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`GrowFitStorage.get("${key}") failed:`, e);
      return null;
    }
  },

  /** Save data under a key (auto-stringifies) */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`GrowFitStorage.set("${key}") failed:`, e);
    }
  },

  /** Delete a key */
  delete(key) {
    localStorage.removeItem(key);
  },


  // ── Initialization ───────────────────────────────────────────

  /** Set up default data if this is the first launch */
  init() {
    if (!this.get(STORAGE_KEYS.USER)) {
      this.set(STORAGE_KEYS.USER, DEFAULT_USER);
    }
    if (!this.get(STORAGE_KEYS.EXERCISES)) {
      this.set(STORAGE_KEYS.EXERCISES, []);
    }
    if (!this.get(STORAGE_KEYS.FOODS)) {
      this.set(STORAGE_KEYS.FOODS, []);
    }
    if (!this.get(STORAGE_KEYS.WEIGHT_RECORDS)) {
      this.set(STORAGE_KEYS.WEIGHT_RECORDS, []);
    }
    if (!this.get(STORAGE_KEYS.JOURNAL)) {
      this.set(STORAGE_KEYS.JOURNAL, []);
    }
    if (!this.get(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
  },


  // ── User ─────────────────────────────────────────────────────

  getUser() {
    return this.get(STORAGE_KEYS.USER) || DEFAULT_USER;
  },

  updateUser(updates) {
    const user = this.getUser();
    Object.assign(user, updates);
    this.set(STORAGE_KEYS.USER, user);
    return user;
  },


  // ── Exercises ────────────────────────────────────────────────

  getExercises() {
    return this.get(STORAGE_KEYS.EXERCISES) || [];
  },

  getExercisesForDate(dateStr) {
    // dateStr = 'YYYY-MM-DD'
    return this.getExercises().filter(e => e.date === dateStr);
  },

  addExercise(exercise) {
    const exercises = this.getExercises();
    exercise.id = generateId();
    exercise.createdAt = new Date().toISOString();
    exercises.push(exercise);
    this.set(STORAGE_KEYS.EXERCISES, exercises);
    return exercise;
  },

  updateExercise(id, updates) {
    const exercises = this.getExercises();
    const index = exercises.findIndex(e => e.id === id);
    if (index !== -1) {
      Object.assign(exercises[index], updates);
      this.set(STORAGE_KEYS.EXERCISES, exercises);
      return exercises[index];
    }
    return null;
  },

  deleteExercise(id) {
    const exercises = this.getExercises().filter(e => e.id !== id);
    this.set(STORAGE_KEYS.EXERCISES, exercises);
  },


  // ── Foods ────────────────────────────────────────────────────

  getFoods() {
    return this.get(STORAGE_KEYS.FOODS) || [];
  },

  getFoodsForDate(dateStr) {
    return this.getFoods().filter(f => f.date === dateStr);
  },

  addFood(food) {
    const foods = this.getFoods();
    food.id = generateId();
    food.createdAt = new Date().toISOString();
    foods.push(food);
    this.set(STORAGE_KEYS.FOODS, foods);
    return food;
  },

  updateFood(id, updates) {
    const foods = this.getFoods();
    const index = foods.findIndex(f => f.id === id);
    if (index !== -1) {
      Object.assign(foods[index], updates);
      this.set(STORAGE_KEYS.FOODS, foods);
      return foods[index];
    }
    return null;
  },

  deleteFood(id) {
    const foods = this.getFoods().filter(f => f.id !== id);
    this.set(STORAGE_KEYS.FOODS, foods);
  },


  // ── Weight Records ──────────────────────────────────────────

  getWeightRecords() {
    return this.get(STORAGE_KEYS.WEIGHT_RECORDS) || [];
  },

  getLatestWeight() {
    const records = this.getWeightRecords();
    if (records.length === 0) return null;
    // Sort by date descending, return most recent
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    return records[0];
  },

  getPreviousWeight() {
    const records = this.getWeightRecords();
    if (records.length < 2) return null;
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    return records[1];
  },

  addWeightRecord(record) {
    const records = this.getWeightRecords();
    record.id = generateId();
    record.createdAt = new Date().toISOString();
    records.push(record);
    this.set(STORAGE_KEYS.WEIGHT_RECORDS, records);
    return record;
  },

  deleteWeightRecord(id) {
    const records = this.getWeightRecords().filter(r => r.id !== id);
    this.set(STORAGE_KEYS.WEIGHT_RECORDS, records);
  },


  // ── Journal ──────────────────────────────────────────────────

  getJournalEntries() {
    return this.get(STORAGE_KEYS.JOURNAL) || [];
  },

  getJournalForDate(dateStr) {
    return this.getJournalEntries().find(j => j.date === dateStr) || null;
  },

  addJournalEntry(entry) {
    const entries = this.getJournalEntries();
    // Replace existing entry for the same date
    const existingIndex = entries.findIndex(j => j.date === entry.date);
    entry.id = entry.id || generateId();
    entry.createdAt = entry.createdAt || new Date().toISOString();
    if (existingIndex !== -1) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    this.set(STORAGE_KEYS.JOURNAL, entries);
    return entry;
  },

  deleteJournalEntry(id) {
    const entries = this.getJournalEntries().filter(j => j.id !== id);
    this.set(STORAGE_KEYS.JOURNAL, entries);
  },


  // ── Settings ─────────────────────────────────────────────────

  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
  },

  updateSettings(updates) {
    const settings = this.getSettings();
    Object.assign(settings, updates);
    this.set(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },


  // ── Data Management ──────────────────────────────────────────

  /** Export all data as a JSON object */
  exportAll() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      exercises: this.getExercises(),
      foods: this.getFoods(),
      weightRecords: this.getWeightRecords(),
      journal: this.getJournalEntries(),
      settings: this.getSettings(),
    };
  },

  /** Import data from a JSON object (replaces everything) */
  importAll(data) {
    if (data.user)          this.set(STORAGE_KEYS.USER, data.user);
    if (data.exercises)     this.set(STORAGE_KEYS.EXERCISES, data.exercises);
    if (data.foods)         this.set(STORAGE_KEYS.FOODS, data.foods);
    if (data.weightRecords) this.set(STORAGE_KEYS.WEIGHT_RECORDS, data.weightRecords);
    if (data.journal)       this.set(STORAGE_KEYS.JOURNAL, data.journal);
    if (data.settings)      this.set(STORAGE_KEYS.SETTINGS, data.settings);
  },

  /** Clear all GrowFit data (keeps other localStorage data safe) */
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => this.delete(key));
  },
};


// ─── Utility: Generate a unique ID ──────────────────────────────
// Simple but good enough for localStorage. 
// Format: timestamp + random chars
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ─── Utility: Get today's date as 'YYYY-MM-DD' ──────────────────
function getTodayDate() {
  const now = new Date();
  return now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
}
