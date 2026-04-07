import { useState, useEffect } from 'react';
import { getExercises } from '../api';
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

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export default function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<BodyPart | 'all'>('all');

  useEffect(() => {
    getExercises().then(setExercises).catch(console.error);
  }, []);

  const filtered = exercises.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || e.body_part === activeTab;
    return matchesSearch && matchesTab;
  });

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
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === 'all' ? 'gradient-purple-pink text-white' : 'bg-dark-base text-gray-400'
            }`}
          >
            All
          </button>
          {BODY_PARTS.map((bp) => (
            <button
              key={bp}
              onClick={() => setActiveTab(bp)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap capitalize transition-all duration-200 cursor-pointer ${
                activeTab === bp ? BODY_PART_COLORS[bp] + ' text-white' : 'bg-dark-base text-gray-400'
              }`}
            >
              {bp}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2">
          {filtered.length === 0 && (
            <p className="text-gray-500 text-center py-8">No exercises found</p>
          )}
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
              <span className={`text-xs px-2 py-0.5 rounded-lg ${BODY_PART_COLORS[exercise.body_part]} text-white capitalize`}>
                {exercise.body_part}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
