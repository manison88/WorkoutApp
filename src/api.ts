import type { User, Exercise, WorkoutSession, WorkoutSet, SessionWithSets, WorkoutSetWithExercise, BodyMapData } from './types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

// Users
export const getUsers = () => request<User[]>('/users');

// Exercises
export const getExercises = (bodyPart?: string) =>
  request<Exercise[]>(`/exercises${bodyPart ? `?body_part=${bodyPart}` : ''}`);

export const addExercise = (name: string, bodyPart: string) =>
  request<Exercise>('/exercises', {
    method: 'POST',
    body: JSON.stringify({ name, body_part: bodyPart }),
  });

// Sessions
export const getSessions = (userId: number) =>
  request<WorkoutSession[]>(`/sessions?userId=${userId}`);

export const getSession = (id: number) =>
  request<SessionWithSets>(`/sessions/${id}`);

export const startSession = (userId: number) =>
  request<WorkoutSession>('/sessions', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });

export const endSession = (id: number, notes?: string) =>
  request<WorkoutSession>(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'completed', notes }),
  });

export const updateSessionNotes = (id: number, notes: string) =>
  request<WorkoutSession>(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ notes }),
  });

// Sets
export const addSet = (data: { session_id: number; exercise_id: number; set_number: number; weight: number; reps: number; notes?: string }) =>
  request<WorkoutSet>('/sets', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateSet = (id: number, data: Partial<WorkoutSet>) =>
  request<WorkoutSet>(`/sets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteSet = (id: number) =>
  request<void>(`/sets/${id}`, { method: 'DELETE' });

// Progress
export const getProgress = (exerciseId: number, userId: number, sessionId: number) =>
  request<WorkoutSetWithExercise[]>(`/progress/${exerciseId}?userId=${userId}&sessionId=${sessionId}`);

// Body Map
export const getBodyMap = (userId: number, period: string = 'week') =>
  request<BodyMapData>(`/body-map/${userId}?period=${period}`);
