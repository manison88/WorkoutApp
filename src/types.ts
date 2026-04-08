export type BodyPart = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';

export interface User {
  id: number;
  name: string;
}

export interface Exercise {
  id: number;
  name: string;
  body_part: BodyPart;
  is_default: number;
}

export type WorkoutType = 'Pull' | 'Push' | 'Legs' | 'Full Body' | 'Cardio';

export const WORKOUT_TYPES: WorkoutType[] = ['Pull', 'Push', 'Legs', 'Full Body', 'Cardio'];

export interface WorkoutSession {
  id: number;
  user_id: number;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  status: 'active' | 'completed';
  workout_type: WorkoutType | null;
}

export interface WorkoutSet {
  id: number;
  session_id: number;
  exercise_id: number;
  set_number: number;
  weight: number | null;
  reps: number | null;
  notes: string | null;
  created_at: string;
}

export interface WorkoutSetWithExercise extends WorkoutSet {
  exercise_name: string;
  exercise_body_part: BodyPart;
}

export interface SessionWithSets extends WorkoutSession {
  sets: WorkoutSetWithExercise[];
}

export interface ProgressData {
  previous_sets: WorkoutSet[];
  current_sets: WorkoutSet[];
}

export type MuscleGroup =
  | 'chest' | 'upper_back' | 'lower_back' | 'shoulders'
  | 'biceps' | 'triceps' | 'forearms' | 'abs' | 'obliques'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves';

export interface BodyMapData {
  [muscle: string]: number;
}

export const EXERCISE_MUSCLE_MAP: Record<string, MuscleGroup[]> = {
  'Bench Press': ['chest', 'triceps', 'shoulders'],
  'Incline Press': ['chest', 'shoulders', 'triceps'],
  'Dumbbell Fly': ['chest', 'shoulders'],
  'Pull-ups': ['upper_back', 'biceps', 'forearms'],
  'Barbell Row': ['upper_back', 'lower_back', 'biceps'],
  'Lat Pulldown': ['upper_back', 'biceps'],
  'Overhead Press': ['shoulders', 'triceps'],
  'Lateral Raise': ['shoulders'],
  'Bicep Curl': ['biceps', 'forearms'],
  'Tricep Pushdown': ['triceps'],
  'Hammer Curl': ['biceps', 'forearms'],
  'Squat': ['quads', 'glutes', 'hamstrings'],
  'Deadlift': ['hamstrings', 'glutes', 'lower_back', 'forearms'],
  'Leg Press': ['quads', 'glutes'],
  'Lunges': ['quads', 'glutes', 'hamstrings'],
  'Calf Raise': ['calves'],
  'Plank': ['abs', 'obliques'],
  'Crunches': ['abs'],
  'Russian Twist': ['abs', 'obliques'],
};
