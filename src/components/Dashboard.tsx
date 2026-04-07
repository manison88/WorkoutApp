import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getSessions, startSession } from '../api';
import Navigation from './Navigation';
import type { WorkoutSession } from '../types';

export default function Dashboard() {
  const { user, clearUser } = useUser();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleStartWorkout = async () => {
    try {
      const session = await startSession(user.id);
      navigate(`/workout/${session.id}`);
    } catch (err) {
      console.error('Failed to start session', err);
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
            Continue Workout 💪
          </button>
        ) : (
          <button
            onClick={handleStartWorkout}
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
                    <p className="text-white font-medium">{formatDate(s.started_at)}</p>
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
