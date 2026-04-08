import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getSessions, startSession } from '../api';
import Navigation from './Navigation';
import type { WorkoutSession, WorkoutType } from '../types';
import { WORKOUT_TYPES } from '../types';

const TYPE_CONFIG: Record<WorkoutType, { gradient: string; icon: string; desc: string }> = {
  Pull: { gradient: 'gradient-blue-cyan', icon: '🔵', desc: 'Back & Biceps' },
  Push: { gradient: 'gradient-purple-pink', icon: '🟣', desc: 'Chest, Shoulders & Triceps' },
  Legs: { gradient: 'gradient-green-cyan', icon: '🟢', desc: 'Quads, Hamstrings & Glutes' },
  'Full Body': { gradient: 'gradient-orange-pink', icon: '🟠', desc: 'All muscle groups' },
  Cardio: { gradient: 'from-yellow-500 to-red-500 bg-gradient-to-r', icon: '🔴', desc: 'Heart rate & endurance' },
};

export default function Dashboard() {
  const { user, clearUser } = useUser();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!user) return;
    getSessions(user.id)
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const activeSession = sessions.find((s) => s.status === 'active');
  const recentSessions = sessions
    .filter((s) => s.status === 'completed')
    .slice(0, 5);

  const handleStartWorkout = async (workoutType: WorkoutType) => {
    setStarting(true);
    try {
      const session = await startSession(user.id, workoutType);
      navigate(`/workout/${session.id}`);
    } catch (err) {
      console.error('Failed to start session', err);
      setStarting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return 'In progress';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(ms / 60000);
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <h1 className="text-3xl font-bold">{user.name}</h1>
          </div>
          <button
            onClick={() => { clearUser(); navigate('/'); }}
            className="text-gray-500 hover:text-white transition-all duration-200 text-sm cursor-pointer"
          >
            Switch User
          </button>
        </div>

        {/* Main action */}
        {activeSession ? (
          <button
            onClick={() => navigate(`/workout/${activeSession.id}`)}
            className="w-full gradient-orange-pink text-white font-bold text-xl rounded-2xl py-5 transition-all duration-200 hover:opacity-90 active:scale-95 pulse-glow cursor-pointer"
          >
            Continue {activeSession.workout_type || 'Workout'} 💪
          </button>
        ) : showTypePicker ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white font-bold text-lg">What are you training?</p>
              <button
                onClick={() => setShowTypePicker(false)}
                className="text-gray-500 hover:text-white transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <div className="space-y-2">
              {WORKOUT_TYPES.map((type) => {
                const config = TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleStartWorkout(type)}
                    disabled={starting}
                    className="w-full gradient-card rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    <div className={`${config.gradient} w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0`}>
                      {config.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold text-lg">{type}</p>
                      <p className="text-gray-400 text-xs">{config.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowTypePicker(true)}
            className="w-full gradient-purple-pink text-white font-bold text-xl rounded-2xl py-5 transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer"
          >
            Start Workout 🏋️
          </button>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/body-map')}
            className="gradient-card rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          >
            <span className="text-2xl">🧍</span>
            <p className="text-white font-medium mt-1">Body Map</p>
            <p className="text-gray-400 text-xs">Muscle activity</p>
          </button>
          <button
            onClick={() => navigate('/exercises')}
            className="gradient-card rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          >
            <span className="text-2xl">📖</span>
            <p className="text-white font-medium mt-1">Exercises</p>
            <p className="text-gray-400 text-xs">Browse library</p>
          </button>
        </div>

        {/* Recent workouts */}
        <div>
          <h2 className="text-lg font-bold mb-3">Recent Workouts</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : recentSessions.length === 0 ? (
            <div className="gradient-card rounded-2xl p-6 text-center">
              <p className="text-gray-400">No workouts yet. Start your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/summary/${s.id}`)}
                  className="w-full gradient-card rounded-2xl p-4 flex items-center justify-between transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                >
                  <div className="text-left">
                    <p className="text-white font-medium">
                      {s.workout_type && <span className="text-accent-purple font-semibold">{s.workout_type} · </span>}
                      {formatDate(s.started_at)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {formatDuration(s.started_at, s.ended_at)}
                    </p>
                  </div>
                  <span className="text-gray-500 text-lg">›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
}
