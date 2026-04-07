import { useState, useEffect } from 'react';
import { getExercises, addExercise } from '../api';
import Navigation from './Navigation';
import type { Exercise, BodyPart } from '../types';

const BODY_PARTS: BodyPart[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'];

const BODY_PART_COLORS: Record<BodyPart, string> = {
  chest: 'gradient-purple-pink',
  back: 'gradient-blue-cyan',
  shoulders: 'gradient-orange-pink',
  arms: 'gradient-green-cyan',
  legs: 'gradient-purple-pink',
  core: 'gradient-blue-cyan',
};

const BODY_PART_EMOJIS: Record<BodyPart, string> = {
  chest: '\u{1F4AA}',
  back: '\u{1F9CD}',
  shoulders: '\u{1F3CB}',
  arms: '\u{1F4AA}',
  legs: '\u{1F9B5}',
  core: '\u{1F525}',
};

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBodyPart, setNewBodyPart] = useState<BodyPart>('chest');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchExercises = () => {
    getExercises()
      .then((data) => {
        setExercises(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleAddExercise = async () => {
    if (!newName.trim()) {
      setError('Exercise name is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await addExercise(newName.trim(), newBodyPart);
      setNewName('');
      setNewBodyPart('chest');
      setShowForm(false);
      fetchExercises();
    } catch (err) {
      setError('Failed to add exercise');
    } finally {
      setSubmitting(false);
    }
  };

  // Group exercises by body part
  const grouped = new Map<BodyPart, Exercise[]>();
  for (const bp of BODY_PARTS) {
    grouped.set(bp, []);
  }
  for (const ex of exercises) {
    const list = grouped.get(ex.body_part);
    if (list) list.push(ex);
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-3xl font-bold">Exercise Library</h1>
            <p className="text-gray-400 text-sm mt-1">
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="gradient-green-cyan text-white font-medium text-sm rounded-xl px-4 py-2 transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer"
          >
            {showForm ? 'Cancel' : '+ Add New'}
          </button>
        </div>

        {/* Add exercise form */}
        {showForm && (
          <div className="gradient-card rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white">Add Custom Exercise</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Exercise name"
              className="w-full bg-dark-base border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-all duration-200"
            />
            <select
              value={newBodyPart}
              onChange={(e) => setNewBodyPart(e.target.value as BodyPart)}
              className="w-full bg-dark-base border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent-purple transition-all duration-200"
            >
              {BODY_PARTS.map((bp) => (
                <option key={bp} value={bp} className="capitalize">
                  {bp.charAt(0).toUpperCase() + bp.slice(1)}
                </option>
              ))}
            </select>
            {error && <p className="text-accent-red text-sm">{error}</p>}
            <button
              onClick={handleAddExercise}
              disabled={submitting}
              className="w-full gradient-purple-pink text-white font-medium rounded-xl py-2 transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Adding...' : 'Add Exercise'}
            </button>
          </div>
        )}

        {/* Exercise groups */}
        {loading ? (
          <p className="text-gray-500 text-center py-10">Loading...</p>
        ) : (
          BODY_PARTS.map((bp) => {
            const list = grouped.get(bp) ?? [];
            if (list.length === 0) return null;
            return (
              <div key={bp}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{BODY_PART_EMOJIS[bp]}</span>
                  <h2
                    className={`text-lg font-bold ${BODY_PART_COLORS[bp]} bg-clip-text text-transparent capitalize`}
                  >
                    {bp}
                  </h2>
                  <span className="text-gray-500 text-sm">({list.length})</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Exercise list */}
                <div className="space-y-2">
                  {list.map((ex) => (
                    <div
                      key={ex.id}
                      className="gradient-card rounded-xl p-3 flex items-center justify-between transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{ex.name}</span>
                        {ex.is_default === 1 && (
                          <span className="text-accent-yellow text-xs" title="Default exercise">
                            ★
                          </span>
                        )}
                      </div>
                      {ex.is_default === 0 && (
                        <span className="text-xs text-gray-500">Custom</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Navigation />
    </div>
  );
}
