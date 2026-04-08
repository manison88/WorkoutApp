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
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-dark-card rounded-t-3xl w-full max-w-lg flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* Drag handle + header */}
        <div className="pt-3 pb-4 px-5">
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Add Exercise</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-4">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/8 transition-all"
            />
          </div>
        </div>

        {/* Filter tabs - wrapping grid so all are visible */}
        <div className="px-5 pb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
              }`}
            >
              All
            </button>
            {BODY_PARTS.map((bp) => (
              <button
                key={bp}
                onClick={() => setActiveTab(bp)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all cursor-pointer ${
                  activeTab === bp
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                {bp}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mx-5" />

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5" style={{ minHeight: 0 }}>
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => onSelect(exercise)}
              className="w-full text-left rounded-xl px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer hover:bg-white/5 active:bg-white/8"
            >
              <span className="text-white font-medium text-[15px]">{exercise.name}</span>
              <span className="text-gray-500 text-xs capitalize ml-3 shrink-0">{exercise.body_part}</span>
            </button>
          ))}

          {filtered.length === 0 && !showAddForm && (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm">
                {search ? `No exercises matching "${search}"` : 'No exercises in this category'}
              </p>
              <button
                onClick={openAddForm}
                className="mt-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-colors cursor-pointer"
              >
                Create Custom Exercise
              </button>
            </div>
          )}

          {filtered.length > 0 && !showAddForm && (
            <button
              onClick={openAddForm}
              className="w-full text-center text-gray-500 hover:text-gray-300 rounded-xl px-4 py-3 text-sm transition-colors cursor-pointer"
            >
              + Create custom exercise
            </button>
          )}

          {/* Add custom exercise form */}
          {showAddForm && (
            <div className="rounded-2xl p-5 space-y-4 bg-white/5 border border-white/10">
              <h3 className="text-white font-semibold">New Exercise</h3>

              <div>
                <label className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1.5 block">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Cable Fly"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2 block">Body Part</label>
                <div className="flex flex-wrap gap-2">
                  {BODY_PARTS.map((bp) => (
                    <button
                      key={bp}
                      type="button"
                      onClick={() => setNewBodyPart(bp)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all cursor-pointer ${
                        newBodyPart === bp
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-gray-200'
                      }`}
                    >
                      {bp}
                    </button>
                  ))}
                </div>
              </div>

              {addError && <p className="text-red-400 text-sm">{addError}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleAddCustom}
                  disabled={adding}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl py-3 text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add & Select'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-5 bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-xl py-3 text-sm cursor-pointer transition-colors"
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
