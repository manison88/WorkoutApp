import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getSessions, getSession } from '../api';
import BackButton from './BackButton';
import Navigation from './Navigation';
import type { WorkoutSession, SessionWithSets } from '../types';

export default function WorkoutHistory() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [sessionDetails, setSessionDetails] = useState<Map<number, SessionWithSets>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getSessions(user.id)
      .then(async (data) => {
        const completed = data.filter((s) => s.status === 'completed');
        setSessions(completed);
        setLoading(false);

        // Fetch details for each session to get exercise info and volume
        const details = new Map<number, SessionWithSets>();
        const fetches = completed.slice(0, 20).map(async (s) => {
          try {
            const detail = await getSession(s.id);
            details.set(s.id, detail);
          } catch {
            // skip
          }
        });
        await Promise.all(fetches);
        setSessionDetails(new Map(details));
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return 'In progress';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(ms / 60000);
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const getExerciseCount = (sessionId: number) => {
    const detail = sessionDetails.get(sessionId);
    if (!detail) return null;
    const uniqueExercises = new Set(detail.sets.map((s) => s.exercise_id));
    return uniqueExercises.size;
  };

  const getTotalVolume = (sessionId: number) => {
    const detail = sessionDetails.get(sessionId);
    if (!detail) return null;
    const volume = detail.sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
    return volume;
  };

  const getExerciseNames = (sessionId: number) => {
    const detail = sessionDetails.get(sessionId);
    if (!detail || detail.sets.length === 0) return '';
    const names = [...new Set(detail.sets.map((s) => s.exercise_name))];
    if (names.length <= 3) return names.join(', ');
    return `${names.slice(0, 3).join(', ')} +${names.length - 3}`;
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold">Workout History</h1>
          <p className="text-gray-400 text-sm mt-1">{user.name}'s past sessions</p>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-10">Loading...</p>
        ) : sessions.length === 0 ? (
          <div className="gradient-card rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-lg">No workouts yet</p>
            <p className="text-gray-500 text-sm mt-1">Complete your first workout to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const exerciseCount = getExerciseCount(s.id);
              const volume = getTotalVolume(s.id);
              const exerciseNames = getExerciseNames(s.id);

              return (
                <button
                  key={s.id}
                  onClick={() => navigate(`/summary/${s.id}`)}
                  className="w-full gradient-card rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-bold">
                        {s.workout_type && <span className="text-accent-purple">{s.workout_type} · </span>}
                        {formatDate(s.started_at)}
                      </p>
                      <p className="text-gray-500 text-xs">{formatTime(s.started_at)}</p>
                    </div>
                    <span className="gradient-purple-pink text-white text-xs font-medium px-2 py-1 rounded-lg">
                      {formatDuration(s.started_at, s.ended_at)}
                    </span>
                  </div>

                  {exerciseNames && (
                    <p className="text-gray-300 text-sm mt-2">{exerciseNames}</p>
                  )}

                  <div className="flex gap-4 mt-2">
                    {exerciseCount !== null && (
                      <span className="text-gray-400 text-xs">
                        {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {volume !== null && volume > 0 && (
                      <span className="text-gray-400 text-xs">
                        {volume.toLocaleString()} lbs total volume
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}
