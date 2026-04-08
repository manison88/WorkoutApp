import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getExercises, getExerciseHistory } from '../api';
import BackButton from './BackButton';
import Navigation from './Navigation';
import type { Exercise, ExerciseHistoryEntry } from '../types';

interface SessionGroup {
  sessionId: number;
  date: string;
  workoutType: string | null;
  sets: ExerciseHistoryEntry[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ExerciseHistory() {
  const { id } = useParams<{ id: string }>();
  const exerciseId = Number(id);
  const { user } = useUser();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [sessions, setSessions] = useState<SessionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !exerciseId || isNaN(exerciseId)) return;

    Promise.all([
      getExercises(),
      getExerciseHistory(exerciseId, user.id),
    ])
      .then(([exercises, history]) => {
        setExercise(exercises.find((e) => e.id === exerciseId) ?? null);

        // Group by session
        const grouped = new Map<number, SessionGroup>();
        for (const entry of history) {
          let group = grouped.get(entry.session_id);
          if (!group) {
            group = {
              sessionId: entry.session_id,
              date: entry.started_at,
              workoutType: entry.workout_type,
              sets: [],
            };
            grouped.set(entry.session_id, group);
          }
          group.sets.push(entry);
        }
        setSessions(Array.from(grouped.values()));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, exerciseId]);

  if (!user) return null;

  // Compute personal records
  let maxWeight = 0;
  let maxReps = 0;
  for (const s of sessions) {
    for (const set of s.sets) {
      if ((set.weight ?? 0) > maxWeight) maxWeight = set.weight ?? 0;
      if ((set.reps ?? 0) > maxReps) maxReps = set.reps ?? 0;
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <BackButton />

        {loading ? (
          <p className="text-gray-500 text-center py-10">Loading...</p>
        ) : !exercise ? (
          <p className="text-red-400 text-center py-10">Exercise not found</p>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold text-white">{exercise.name}</h1>
              <p className="text-gray-400 text-sm mt-1 capitalize">{exercise.body_part}</p>
            </div>

            {/* Personal records */}
            {sessions.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="gradient-card rounded-2xl p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Sessions</p>
                  <p className="text-white text-xl font-bold mt-1">{sessions.length}</p>
                </div>
                <div className="gradient-card rounded-2xl p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Best Weight</p>
                  <p className="text-white text-xl font-bold mt-1">{maxWeight}<span className="text-sm font-normal"> lbs</span></p>
                </div>
                <div className="gradient-card rounded-2xl p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Best Reps</p>
                  <p className="text-white text-xl font-bold mt-1">{maxReps}</p>
                </div>
              </div>
            )}

            {/* Session history */}
            {sessions.length === 0 ? (
              <div className="gradient-card rounded-2xl p-8 text-center">
                <p className="text-gray-400 text-lg">No history yet</p>
                <p className="text-gray-500 text-sm mt-1">Complete a workout with this exercise to see your progress</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.sessionId} className="gradient-card rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-bold">
                          {session.workoutType && (
                            <span className="text-accent-purple">{session.workoutType} · </span>
                          )}
                          {formatDate(session.date)}
                        </p>
                      </div>
                    </div>

                    {/* Sets table */}
                    <div className="space-y-1.5">
                      <div className="flex text-gray-500 text-xs uppercase tracking-wide px-1">
                        <span className="w-12">Set</span>
                        <span className="flex-1 text-right">Weight</span>
                        <span className="flex-1 text-right">Reps</span>
                      </div>
                      {session.sets.map((set, i) => (
                        <div
                          key={i}
                          className="flex items-center bg-dark-base/50 rounded-lg px-2 py-1.5"
                        >
                          <span className="w-12 text-gray-400 text-sm">{set.set_number}</span>
                          <span className="flex-1 text-right text-white font-medium text-sm">
                            {set.weight ?? '-'} <span className="text-gray-500 text-xs">lbs</span>
                          </span>
                          <span className="flex-1 text-right text-white font-medium text-sm">
                            {set.reps ?? '-'} <span className="text-gray-500 text-xs">reps</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Navigation />
    </div>
  );
}
