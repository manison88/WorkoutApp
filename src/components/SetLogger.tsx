import { useState, useEffect } from 'react';
import { getProgress } from '../api';
import { useUser } from '../context/UserContext';
import ProgressIndicator from './ProgressIndicator';
import type { Exercise, WorkoutSetWithExercise, WorkoutSet } from '../types';

const BODY_PART_COLORS: Record<string, string> = {
  chest: 'gradient-purple-pink',
  back: 'gradient-blue-cyan',
  shoulders: 'gradient-orange-pink',
  arms: 'gradient-green-cyan',
  legs: 'gradient-purple-pink',
  core: 'gradient-blue-cyan',
};

interface SetLoggerProps {
  sessionId: number;
  exercise: Exercise;
  sets: WorkoutSetWithExercise[];
  onAddSet: (exerciseId: number, weight: number, reps: number) => void;
  onDeleteSet: (setId: number) => void;
}

export default function SetLogger({ sessionId, exercise, sets, onAddSet, onDeleteSet }: SetLoggerProps) {
  const { user } = useUser();
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [previousSets, setPreviousSets] = useState<WorkoutSet[]>([]);

  useEffect(() => {
    if (user) {
      getProgress(exercise.id, user.id, sessionId)
        .then((data) => {
          // The progress endpoint returns previous session sets as WorkoutSetWithExercise[]
          setPreviousSets(data);
        })
        .catch(() => setPreviousSets([]));
    }
  }, [exercise.id, user, sessionId]);

  const handleAdd = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (isNaN(w) || isNaN(r) || r <= 0) return;
    onAddSet(exercise.id, w, r);
    setWeight('');
    setReps('');
  };

  const colorClass = BODY_PART_COLORS[exercise.body_part] || 'gradient-purple-pink';

  return (
    <div className="gradient-card rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-lg">{exercise.name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-lg ${colorClass} text-white capitalize`}>
          {exercise.body_part}
        </span>
      </div>

      {/* Previous session reference */}
      {previousSets.length > 0 && (
        <div className="bg-dark-base/50 rounded-xl p-2 text-xs text-gray-400">
          <span className="font-medium text-gray-300">Previous session:</span>
          <div className="flex gap-3 mt-1 flex-wrap">
            {previousSets.map((ps, i) => (
              <span key={i}>
                Set {i + 1}: {ps.weight} lbs x {ps.reps}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Logged sets */}
      {sets.length > 0 && (
        <div className="space-y-1">
          {sets.map((s, i) => (
            <div key={s.id} className="flex items-center justify-between bg-dark-base/50 rounded-xl px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-12">Set {i + 1}</span>
                <span className="text-white font-medium">
                  {s.weight} lbs x {s.reps}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {previousSets[i] && (
                  <ProgressIndicator
                    currentWeight={s.weight}
                    currentReps={s.reps}
                    previousWeight={previousSets[i].weight}
                    previousReps={previousSets[i].reps}
                  />
                )}
                <button
                  onClick={() => onDeleteSet(s.id)}
                  className="text-gray-500 hover:text-accent-red transition-all duration-200 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add set row */}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="lbs"
          className="w-20 bg-dark-base border border-white/10 rounded-xl px-3 py-2 text-white text-center placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-all duration-200"
        />
        <span className="text-gray-500">x</span>
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="reps"
          className="w-20 bg-dark-base border border-white/10 rounded-xl px-3 py-2 text-white text-center placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-all duration-200"
        />
        <button
          onClick={handleAdd}
          className="flex-1 gradient-green-cyan text-white font-medium rounded-xl py-2 transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer"
        >
          + Add Set
        </button>
      </div>
    </div>
  );
}
