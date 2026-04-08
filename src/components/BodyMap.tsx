import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getBodyMap, getUsers } from '../api';
import type { User, BodyMapData } from '../types';
import BackButton from './BackButton';
import BodyMapSVG from './BodyMapSVG';

type Period = 'today' | 'week' | 'month';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
};

const LEGEND_STEPS = [
  { label: 'None', color: '#2a2a3e' },
  { label: 'Low', color: '#fef08a' },
  { label: 'Medium', color: '#fb923c' },
  { label: 'High', color: '#ef4444' },
  { label: 'Very High', color: '#dc2626' },
];

export default function BodyMap() {
  const { user } = useUser();
  const [period, setPeriod] = useState<Period>('week');
  const [muscleData, setMuscleData] = useState<BodyMapData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [viewUserId, setViewUserId] = useState<number | null>(null);

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    if (user && viewUserId === null) {
      setViewUserId(user.id);
    }
  }, [user, viewUserId]);

  useEffect(() => {
    if (!viewUserId) return;
    setLoading(true);
    setError(null);
    getBodyMap(viewUserId, period)
      .then((data) => {
        setMuscleData(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [viewUserId, period]);

  const maxCount = Math.max(1, ...Object.values(muscleData));
  const viewUser = users.find((u) => u.id === viewUserId);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <BackButton />
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          Muscle Map
          {viewUser && (
            <span className="text-gray-400 font-normal text-base ml-2">
              — {viewUser.name}
            </span>
          )}
        </h2>
      </div>

      {/* User Switcher */}
      {users.length > 1 && (
        <div className="flex gap-2 mb-4">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => setViewUserId(u.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                viewUserId === u.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {u.name}
            </button>
          ))}
        </div>
      )}

      {/* Period Filter */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Body Map */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-4 border border-gray-800">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Loading...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-400">
            {error}
          </div>
        ) : (
          <BodyMapSVG muscleData={muscleData} maxCount={maxCount} />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {LEGEND_STEPS.map((step) => (
          <div key={step.label} className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: step.color }}
            />
            <span className="text-xs text-gray-400">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
