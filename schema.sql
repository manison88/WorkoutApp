-- Users (just 2 hardcoded)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO users (name) VALUES ('Dad'), ('Son');

-- Exercises with body part categories
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  body_part TEXT NOT NULL CHECK (body_part IN ('chest','back','shoulders','arms','legs','core')),
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Default exercises (19 total)
INSERT INTO exercises (name, body_part, is_default) VALUES
  ('Bench Press', 'chest', 1),
  ('Incline Press', 'chest', 1),
  ('Dumbbell Fly', 'chest', 1),
  ('Pull-ups', 'back', 1),
  ('Barbell Row', 'back', 1),
  ('Lat Pulldown', 'back', 1),
  ('Overhead Press', 'shoulders', 1),
  ('Lateral Raise', 'shoulders', 1),
  ('Bicep Curl', 'arms', 1),
  ('Tricep Pushdown', 'arms', 1),
  ('Hammer Curl', 'arms', 1),
  ('Squat', 'legs', 1),
  ('Deadlift', 'legs', 1),
  ('Leg Press', 'legs', 1),
  ('Lunges', 'legs', 1),
  ('Calf Raise', 'legs', 1),
  ('Plank', 'core', 1),
  ('Crunches', 'core', 1),
  ('Russian Twist', 'core', 1);

-- Workout sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  started_at TEXT DEFAULT (datetime('now')),
  ended_at TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','completed'))
);

-- Individual sets within a session
CREATE TABLE IF NOT EXISTS workout_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES workout_sessions(id),
  exercise_id INTEGER NOT NULL REFERENCES exercises(id),
  set_number INTEGER NOT NULL,
  weight REAL,
  reps INTEGER,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_user ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sets_session ON workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise ON workout_sets(exercise_id);
