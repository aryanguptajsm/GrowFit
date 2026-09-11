/**
 * GrowFit — Exercise Data (Stage 3)
 *
 * Expanded exercise library with muscle groups and category colors.
 * Overrides the EXERCISE_LIBRARY defined in storage.js by reassigning it
 * after storage.js loads (script order: storage.js → exercise-data.js → ...).
 */

// Re-declare with const won't work after storage.js already used const,
// so we mutate the existing array in place.
EXERCISE_LIBRARY.length = 0;

[
  // ── Strength ──────────────────────────────────────────────────
  { name: 'Push-ups',           category: 'strength',    muscles: 'Chest / Triceps',    defaultSets: 3, defaultReps: 10, icon: '\u{1F4AA}', color: '#4ade80' },
  { name: 'Pull-ups',           category: 'strength',    muscles: 'Back / Biceps',      defaultSets: 3, defaultReps: 8,  icon: '\u{1F3CB}', color: '#4ade80' },
  { name: 'Squats',             category: 'strength',    muscles: 'Quads / Glutes',     defaultSets: 3, defaultReps: 12, icon: '\u{1F9B5}', color: '#4ade80' },
  { name: 'Lunges',             category: 'strength',    muscles: 'Quads / Glutes',     defaultSets: 3, defaultReps: 10, icon: '\u{1F9B5}', color: '#4ade80' },
  { name: 'Dips',               category: 'strength',    muscles: 'Triceps / Chest',    defaultSets: 3, defaultReps: 10, icon: '\u{1F4AA}', color: '#4ade80' },
  { name: 'Deadlift',           category: 'strength',    muscles: 'Back / Hamstrings',  defaultSets: 3, defaultReps: 6,  icon: '\u{1F3CB}', color: '#4ade80' },
  { name: 'Bench Press',        category: 'strength',    muscles: 'Chest / Triceps',    defaultSets: 3, defaultReps: 8,  icon: '\u{1F4AA}', color: '#4ade80' },
  { name: 'Overhead Press',     category: 'strength',    muscles: 'Shoulders',          defaultSets: 3, defaultReps: 8,  icon: '\u{1F3CB}', color: '#4ade80' },
  { name: 'Bicep Curls',        category: 'strength',    muscles: 'Biceps',             defaultSets: 3, defaultReps: 12, icon: '\u{1F4AA}', color: '#4ade80' },
  { name: 'Rows',               category: 'strength',    muscles: 'Back / Biceps',      defaultSets: 3, defaultReps: 10, icon: '\u{1F3CB}', color: '#4ade80' },
  { name: 'Hip Thrusts',        category: 'strength',    muscles: 'Glutes',             defaultSets: 3, defaultReps: 12, icon: '\u{1F9B5}', color: '#4ade80' },
  // ── Core ──────────────────────────────────────────────────────
  { name: 'Plank',              category: 'core',        muscles: 'Core / Shoulders',   defaultSets: 3, defaultReps: 1,  icon: '\u{1F9D8}', color: '#fb923c', isDuration: true, defaultDuration: 30 },
  { name: 'Crunches',           category: 'core',        muscles: 'Abs',                defaultSets: 3, defaultReps: 20, icon: '\u{1F9D8}', color: '#fb923c' },
  { name: 'Leg Raises',         category: 'core',        muscles: 'Lower Abs',          defaultSets: 3, defaultReps: 15, icon: '\u{1F9D8}', color: '#fb923c' },
  { name: 'Russian Twists',     category: 'core',        muscles: 'Obliques',           defaultSets: 3, defaultReps: 20, icon: '\u{1F300}', color: '#fb923c' },
  { name: 'Mountain Climbers',  category: 'core',        muscles: 'Core / Shoulders',   defaultSets: 3, defaultReps: 20, icon: '\u{26F0}',  color: '#fb923c' },
  { name: 'Bicycle Crunches',   category: 'core',        muscles: 'Abs / Obliques',     defaultSets: 3, defaultReps: 20, icon: '\u{1F6B4}', color: '#fb923c' },
  // ── Cardio ────────────────────────────────────────────────────
  { name: 'Walking',            category: 'cardio',      muscles: 'Full Body',          defaultSets: 1, defaultReps: 1,  icon: '\u{1F6B6}', color: '#60a5fa', isDuration: true, defaultDuration: 30 },
  { name: 'Running',            category: 'cardio',      muscles: 'Legs / Cardio',      defaultSets: 1, defaultReps: 1,  icon: '\u{1F3C3}', color: '#60a5fa', isDuration: true, defaultDuration: 20 },
  { name: 'Cycling',            category: 'cardio',      muscles: 'Legs / Cardio',      defaultSets: 1, defaultReps: 1,  icon: '\u{1F6B4}', color: '#60a5fa', isDuration: true, defaultDuration: 30 },
  { name: 'Jumping Jacks',      category: 'cardio',      muscles: 'Full Body',          defaultSets: 3, defaultReps: 30, icon: '\u{2B50}',  color: '#60a5fa' },
  { name: 'Burpees',            category: 'cardio',      muscles: 'Full Body',          defaultSets: 3, defaultReps: 10, icon: '\u{1F525}', color: '#60a5fa' },
  { name: 'High Knees',         category: 'cardio',      muscles: 'Legs / Cardio',      defaultSets: 3, defaultReps: 30, icon: '\u{1F3C3}', color: '#60a5fa' },
  { name: 'Swimming',           category: 'cardio',      muscles: 'Full Body',          defaultSets: 1, defaultReps: 1,  icon: '\u{1F3CA}', color: '#60a5fa', isDuration: true, defaultDuration: 30 },
  // ── Flexibility ───────────────────────────────────────────────
  { name: 'Stretching',         category: 'flexibility', muscles: 'Full Body',          defaultSets: 1, defaultReps: 1,  icon: '\u{1F938}', color: '#c084fc', isDuration: true, defaultDuration: 10 },
  { name: 'Yoga',               category: 'flexibility', muscles: 'Full Body',          defaultSets: 1, defaultReps: 1,  icon: '\u{1F9D8}', color: '#c084fc', isDuration: true, defaultDuration: 20 },
  { name: 'Hip Flexor Stretch', category: 'flexibility', muscles: 'Hips / Lower Back',  defaultSets: 2, defaultReps: 1,  icon: '\u{1F938}', color: '#c084fc', isDuration: true, defaultDuration: 5  },
  { name: 'Hamstring Stretch',  category: 'flexibility', muscles: 'Hamstrings',         defaultSets: 2, defaultReps: 1,  icon: '\u{1F938}', color: '#c084fc', isDuration: true, defaultDuration: 5  },
  { name: 'Shoulder Rolls',     category: 'flexibility', muscles: 'Shoulders / Neck',   defaultSets: 1, defaultReps: 10, icon: '\u{1F938}', color: '#c084fc' },
].forEach(ex => EXERCISE_LIBRARY.push(ex));


// ─── Stage 3 Storage Helpers (added to GrowFitStorage) ────────────

/**
 * Get workouts (exercises) for a specific date.
 */
GrowFitStorage.getWorkoutsForDate = function(dateStr) {
  return this.getWorkouts().filter(w => w.date === dateStr);
};

/**
 * Get the last N days of dates with workouts logged.
 * Returns an array of {date, dayLabel, hasWorkout} for the past 7 days.
 */
GrowFitStorage.getWeeklyActivity = function(days = 7) {
  const workouts = this.getWorkouts();
  const activeDates = new Set(workouts.map(w => w.date));
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date:       dateStr,
      dayLabel:   DAY_LABELS[d.getDay()],
      hasWorkout: activeDates.has(dateStr),
      isToday:    i === 0,
    });
  }
  return result;
};

/**
 * Compute personal records (best weight) per exercise name.
 * Returns a Map: exerciseName => { weight, date, sets, reps }
 */
GrowFitStorage.getPersonalRecords = function() {
  const records = new Map();
  const workouts = this.getWorkouts();
  workouts.forEach(w => {
    const name = (w.exerciseName || w.name || '').trim();
    if (!name || !w.weight) return;
    const existing = records.get(name);
    if (!existing || w.weight > existing.weight) {
      records.set(name, { weight: w.weight, date: w.date, sets: w.sets, reps: w.reps });
    }
  });
  return records;
};

/**
 * Get this week's total workout minutes.
 */
GrowFitStorage.getWeeklyMinutes = function() {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
  weekStart.setHours(0, 0, 0, 0);
  return this.getWorkouts()
    .filter(w => new Date(w.date) >= weekStart)
    .reduce((sum, w) => sum + (Number(w.durationMinutes) || 0), 0);
};
