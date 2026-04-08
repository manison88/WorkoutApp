import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getSessions, getSession, deleteSession } from '../api';
import BackButton from './BackButton';
import Navigation from './Navigation';
import type { WorkoutSession, SessionWithSets } from '../types';

export default function WorkoutHistory() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [sessionDetails, setSessionDetails] = useState<Map<number, SessionWithSets>>(new Map());
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

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


  const handleDelete = async (id: number) => {
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setSessionDetails((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error('Failed to delete session', err);
    } finally {
      setConfirmDeleteId(null);
    }
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
              const exerciseNames = getExerciseNames(s.id);

              return (
                <div key={s.id} className="relative">
                  <div
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
                      <div className="flex items-start gap-2">
                        <span className="gradient-purple-pink text-white text-xs font-medium px-2 py-1 rounded-lg">
                          {formatDuration(s.started_at, s.ended_at)}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(s.id); }}
                          className="text-gray-600 hover:text-red-400 transition-colors p-1 cursor-pointer"
                          title="Delete workout"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {exerciseNames && (
                      <p className="text-gray-300 text-sm mt-2">{exerciseNames}</p>
                    )}

                    {exerciseCount !== null && (
                      <p className="text-gray-400 text-xs mt-2">
                        {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {confirmDeleteId === s.id && (
                    <div className="absolute inset-0 bg-dark-card/95 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-3 z-10">
                      <p className="text-white text-sm font-medium">Delete this workout?</p>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-dark-surface hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}
