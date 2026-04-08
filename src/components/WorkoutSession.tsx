import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getSession, addSet, deleteSet, endSession, updateSessionNotes } from '../api';
import BackButton from './BackButton';
import ExercisePicker from './ExercisePicker';
import SetLogger from './SetLogger';
import NoteEditor from './NoteEditor';
import type { Exercise, SessionWithSets, WorkoutSetWithExercise } from '../types';

export default function WorkoutSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [session, setSession] = useState<SessionWithSets | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [elapsed, setElapsed] = useState('00:00');
  const [finishing, setFinishing] = useState(false);
  const [addedExercises, setAddedExercises] = useState<Exercise[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sessionId = Number(id);

  const fetchSession = useCallback(() => {
    getSession(sessionId)
      .then((data) => {
        setSession(data);
        setNotes(data.notes ?? '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Timer
  useEffect(() => {
    if (!session) return;
    const startTime = new Date(session.started_at).getTime();

    const tick = () => {
      const diffMs = Date.now() - startTime;
      const totalSeconds = Math.floor(diffMs / 1000);
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      if (hrs > 0) {
        setElapsed(`${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      } else {
        setElapsed(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session]);

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading workout...</p>
      </div>
    );
  }
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Session not found</p>
      </div>
    );
  }

  // Group sets by exercise
  const exerciseMap = new Map<number, { exercise: Exercise; sets: WorkoutSetWithExercise[] }>();
  for (const s of session.sets) {
    if (!exerciseMap.has(s.exercise_id)) {
      exerciseMap.set(s.exercise_id, {
        exercise: {
          id: s.exercise_id,
          name: s.exercise_name,
          body_part: s.exercise_body_part,
          is_default: 0,
        },
        sets: [],
      });
    }
    exerciseMap.get(s.exercise_id)!.sets.push(s);
  }

  // Merge in added exercises that have no sets yet
  const allExercises: { exercise: Exercise; sets: WorkoutSetWithExercise[] }[] = [
    ...Array.from(exerciseMap.values()),
    ...addedExercises
      .filter((e) => !exerciseMap.has(e.id))
      .map((e) => ({ exercise: e, sets: [] as WorkoutSetWithExercise[] })),
  ];

  const handleSelectExercise = (exercise: Exercise) => {
    setShowPicker(false);
    setAddedExercises((prev) => {
      if (prev.some((e) => e.id === exercise.id)) return prev;
      return [...prev, exercise];
    });
  };

  const handleAddSet = async (exerciseId: number, weight: number, reps: number) => {
    const exerciseSets = session.sets.filter((s) => s.exercise_id === exerciseId);
    const setNumber = exerciseSets.length + 1;
    try {
      await addSet({
        session_id: sessionId,
        exercise_id: exerciseId,
        set_number: setNumber,
        weight,
        reps,
      });
      fetchSession();
    } catch (err) {
      console.error('Failed to add set', err);
    }
  };

  const handleDeleteSet = async (setId: number) => {
    try {
      await deleteSet(setId);
      fetchSession();
    } catch (err) {
      console.error('Failed to delete set', err);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await endSession(sessionId, notes);
      navigate(`/summary/${sessionId}`);
    } catch (err) {
      console.error('Failed to end session', err);
      setFinishing(false);
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    updateSessionNotes(sessionId, value).catch(console.error);
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <BackButton />
        {/* Header with timer */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-all duration-200 cursor-pointer"
          >
            &larr; Back
          </button>
          <div className="text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Workout Time</p>
            <p className="text-3xl font-bold gradient-purple-pink bg-clip-text text-transparent">
              {elapsed}
            </p>
          </div>
          <div className="w-12" />
        </div>

        {/* Exercise list with set loggers */}
        {allExercises.map(({ exercise, sets }) => (
          <SetLogger
            key={exercise.id}
            sessionId={sessionId}
            exercise={exercise}
            sets={sets}
            onAddSet={handleAddSet}
            onDeleteSet={handleDeleteSet}
          />
        ))}

        {allExercises.length === 0 && (
          <div className="gradient-card rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-lg">No exercises yet</p>
            <p className="text-gray-500 text-sm mt-1">Tap below to add your first exercise</p>
          </div>
        )}

        {/* Add Exercise button */}
        <button
          onClick={() => setShowPicker(true)}
          className="w-full gradient-blue-cyan text-white font-bold rounded-2xl py-4 transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer"
        >
          + Add Exercise
        </button>

        {/* Notes */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Session Notes</p>
          <NoteEditor
            value={notes}
            onChange={handleNotesChange}
            placeholder="How's the workout going?"
          />
        </div>

        {/* Finish button */}
        <button
          onClick={handleFinish}
          disabled={finishing}
          className="w-full gradient-orange-pink text-white font-bold text-lg rounded-2xl py-4 transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {finishing ? 'Finishing...' : 'Finish Workout'}
        </button>
      </div>

      {showPicker && (
        <ExercisePicker onSelect={handleSelectExercise} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}
