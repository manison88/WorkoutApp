import { useState, useEffect } from 'react';
import { getExercises, addExercise } from '../api';
import type { Exercise, BodyPart } from '../types';

const BODY_PARTS: BodyPart[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'];

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export default function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<BodyPart | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBodyPart, setNewBodyPart] = useState<BodyPart>('chest');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getExercises().then(setExercises).catch(console.error);
  }, []);

  const filtered = exercises.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || e.body_part === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleAddCustom = async () => {
    const name = newName.trim();
    if (!name) {
      setAddError('Enter an exercise name');
      return;
    }
    setAdding(true);
    setAddError('');
    try {
      const exercise = await addExercise(name, newBodyPart);
      onSelect(exercise);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add exercise');
    } finally {
      setAdding(false);
    }
  };

  const openAddForm = () => {
    setNewName(search);
    setShowAddForm(true);
    setAddError('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-dark-card rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold">Pick Exercise</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-200 text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-dark-base border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-all duration-200"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === 'all' ? 'bg-purple-600 text-white' : 'bg-dark-base text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {BODY_PARTS.map((bp) => (
            <button
              key={bp}
              onClick={() => setActiveTab(bp)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap capitalize transition-all duration-200 cursor-pointer ${
                activeTab === bp ? 'bg-purple-600 text-white' : 'bg-dark-base text-gray-400 hover:text-white'
              }`}
            >
              {bp}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2">
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => onSelect(exercise)}
              className="w-full text-left bg-dark-base hover:bg-dark-surface rounded-xl p-3 flex items-center justify-between transition-all duration-200 cursor-pointer"
            >
              <div>
                <span className="text-white font-medium">{exercise.name}</span>
                {exercise.is_default === 1 && (
                  <span className="ml-2 text-accent-yellow text-xs">★</span>
                )}
              </div>
              <span className="text-xs text-gray-500 capitalize">
                {exercise.body_part}
              </span>
            </button>
          ))}

          {/* No results message + add prompt */}
          {filtered.length === 0 && !showAddForm && (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3">No exercises found{search ? ` for "${search}"` : ''}</p>
              <button
                onClick={openAddForm}
                className="gradient-orange-pink text-white font-medium rounded-xl px-4 py-2 text-sm cursor-pointer"
              >
                + Create Custom Exercise
              </button>
            </div>
          )}

          {/* Always-visible add button when results exist */}
          {filtered.length > 0 && !showAddForm && (
            <button
              onClick={openAddForm}
              className="w-full text-center text-gray-400 hover:text-white bg-dark-base hover:bg-dark-surface rounded-xl p-3 text-sm transition-all duration-200 cursor-pointer border border-dashed border-white/10"
            >
              + Add Custom Exercise
            </button>
          )}

          {/* Add custom exercise form */}
          {showAddForm && (
            <div className="bg-dark-base rounded-xl p-4 space-y-3 border border-accent-purple/30">
              <h3 className="text-white font-semibold text-sm">New Custom Exercise</h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Exercise name"
                className="w-full bg-dark-card border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-all duration-200"
                autoFocus
              />
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Body Part</label>
                <select
                  value={newBodyPart}
                  onChange={(e) => setNewBodyPart(e.target.value as BodyPart)}
                  className="w-full bg-dark-card border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-purple transition-all duration-200"
                >
                  {BODY_PARTS.map((bp) => (
                    <option key={bp} value={bp} className="capitalize">
                      {bp.charAt(0).toUpperCase() + bp.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {addError && <p className="text-accent-red text-xs">{addError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleAddCustom}
                  disabled={adding}
                  className="flex-1 gradient-green-cyan text-white font-medium rounded-xl py-2 text-sm transition-all duration-200 hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add & Select'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 bg-dark-card text-gray-400 rounded-xl py-2 text-sm cursor-pointer hover:text-white transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
