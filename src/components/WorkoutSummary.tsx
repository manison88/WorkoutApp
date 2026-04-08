import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { getSession } from '../api';
import BackButton from './BackButton';
import type { SessionWithSets, WorkoutSetWithExercise, MuscleGroup } from '../types';
import { EXERCISE_MUSCLE_MAP } from '../types';

type AspectRatio = 'story' | 'post';

interface ExerciseSummary {
  name: string;
  bestWeight: number;
  bestReps: number;
  totalSets: number;
  totalVolume: number;
  bodyPart: string;
}

function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return 'In progress';
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  const diffMs = end - start;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMuscleGroups(exerciseName: string): MuscleGroup[] {
  return EXERCISE_MUSCLE_MAP[exerciseName] || [];
}

const MUSCLE_COLORS: Record<string, string> = {
  chest: '#ef4444',
  upper_back: '#3b82f6',
  lower_back: '#6366f1',
  shoulders: '#f97316',
  biceps: '#eab308',
  triceps: '#a855f7',
  forearms: '#14b8a6',
  abs: '#ec4899',
  obliques: '#f43f5e',
  quads: '#22c55e',
  hamstrings: '#10b981',
  glutes: '#06b6d4',
  calves: '#84cc16',
};

const MOTIVATIONAL_QUOTES = [
  'Every rep counts. Keep pushing.',
  'Stronger than yesterday.',
  'The only bad workout is the one you skipped.',
  'Progress, not perfection.',
  'Discipline beats motivation.',
  'You vs. You. Always.',
];

export default function WorkoutSummary() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const [session, setSession] = useState<SessionWithSets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('story');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!sessionId || isNaN(sessionId)) return;
    setLoading(true);
    getSession(sessionId)
      .then(setSession)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Loading workout summary...
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400">
        {error || 'Session not found'}
      </div>
    );
  }

  // Aggregate exercise data
  const exerciseMap = new Map<number, { sets: WorkoutSetWithExercise[]; name: string; bodyPart: string }>();
  for (const set of session.sets) {
    const existing = exerciseMap.get(set.exercise_id);
    if (existing) {
      existing.sets.push(set);
    } else {
      exerciseMap.set(set.exercise_id, {
        sets: [set],
        name: set.exercise_name,
        bodyPart: set.exercise_body_part,
      });
    }
  }

  const exercises: ExerciseSummary[] = [];
  for (const [, data] of exerciseMap) {
    let bestWeight = 0;
    let bestReps = 0;
    let totalVolume = 0;
    for (const s of data.sets) {
      const w = s.weight ?? 0;
      const r = s.reps ?? 0;
      totalVolume += w * r;
      if (w > bestWeight || (w === bestWeight && r > bestReps)) {
        bestWeight = w;
        bestReps = r;
      }
    }
    exercises.push({
      name: data.name,
      bestWeight,
      bestReps,
      totalSets: data.sets.length,
      totalVolume,
      bodyPart: data.bodyPart,
    });
  }

  const totalVolume = exercises.reduce((sum, e) => sum + e.totalVolume, 0);
  const totalSets = session.sets.length;
  const duration = formatDuration(session.started_at, session.ended_at);
  const date = formatDate(session.started_at);

  const muscleGroupSet = new Set<string>();
  for (const ex of exercises) {
    const muscles = getMuscleGroups(ex.name);
    muscles.forEach((m) => muscleGroupSet.add(m));
  }
  const muscleGroups = Array.from(muscleGroupSet);

  const quote = MOTIVATIONAL_QUOTES[sessionId % MOTIVATIONAL_QUOTES.length];

  const handleDownload = async () => {
    const element = document.getElementById('summary-card');
    if (!element) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(element, {
        width: 1080,
        height: aspectRatio === 'story' ? 1920 : 1080,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `workout-${sessionId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!navigator.share) return;
    const element = document.getElementById('summary-card');
    if (!element) return;
    try {
      const dataUrl = await toPng(element, {
        width: 1080,
        height: aspectRatio === 'story' ? 1920 : 1080,
        pixelRatio: 2,
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `workout-${sessionId}.png`, { type: 'image/png' });
      await navigator.share({
        title: 'Workout Summary',
        files: [file],
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const isStory = aspectRatio === 'story';
  const cardWidth = 1080;
  const cardHeight = isStory ? 1920 : 1080;

  return (
    <div className="max-w-lg mx-auto p-4 pb-8">
      <BackButton />
      <h2 className="text-2xl font-bold text-white mb-1">
        {session.workout_type && <span className="text-accent-purple">{session.workout_type} </span>}
        Summary
      </h2>
      <p className="text-gray-400 text-sm mb-4">{date}</p>

      {/* ===== MOBILE-FRIENDLY VISIBLE SUMMARY ===== */}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="gradient-card rounded-2xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Duration</p>
          <p className="text-white text-2xl font-bold mt-1">{duration}</p>
        </div>
        <div className="gradient-card rounded-2xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Volume</p>
          <p className="text-white text-2xl font-bold mt-1">
            {totalVolume.toLocaleString()} <span className="text-base font-normal">lbs</span>
          </p>
        </div>
        <div className="gradient-card rounded-2xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Total Sets</p>
          <p className="text-white text-2xl font-bold mt-1">{totalSets}</p>
        </div>
        <div className="gradient-card rounded-2xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Exercises</p>
          <p className="text-white text-2xl font-bold mt-1">{exercises.length}</p>
        </div>
      </div>

      {/* Exercise list */}
      <div className="gradient-card rounded-2xl p-4 mb-4">
        <h3 className="text-gray-300 text-xs uppercase tracking-widest font-semibold mb-3">Exercises</h3>
        <div className="space-y-3">
          {exercises.map((ex, i) => (
            <div
              key={i}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-white font-semibold">{ex.name}</p>
                <p className="text-gray-500 text-xs">{ex.totalSets} sets</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{ex.bestWeight} lbs</p>
                <p className="text-gray-500 text-xs">x {ex.bestReps} reps</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Muscle groups */}
      {muscleGroups.length > 0 && (
        <div className="mb-4">
          <h3 className="text-gray-300 text-xs uppercase tracking-widest font-semibold mb-2">Muscles Worked</h3>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map((mg) => (
              <span
                key={mg}
                className="text-white text-xs font-semibold px-3 py-1.5 rounded-full capitalize"
                style={{ background: MUSCLE_COLORS[mg] || 'rgba(255,255,255,0.2)' }}
              >
                {mg.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quote */}
      <p className="text-gray-500 text-sm italic text-center mb-6">"{quote}"</p>

      {/* Export controls */}
      <div className="gradient-card rounded-2xl p-4 space-y-3">
        <h3 className="text-gray-300 text-xs uppercase tracking-widest font-semibold">Share to Instagram</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAspectRatio('story')}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              aspectRatio === 'story'
                ? 'bg-purple-600 text-white'
                : 'bg-dark-base text-gray-400 hover:bg-dark-surface'
            }`}
          >
            Story (9:16)
          </button>
          <button
            onClick={() => setAspectRatio('post')}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              aspectRatio === 'post'
                ? 'bg-purple-600 text-white'
                : 'bg-dark-base text-gray-400 hover:bg-dark-surface'
            }`}
          >
            Post (1:1)
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 gradient-orange-pink text-white font-medium rounded-xl py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {downloading ? 'Exporting...' : 'Download Image'}
          </button>
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              onClick={handleShare}
              className="flex-1 gradient-blue-cyan text-white font-medium rounded-xl py-2.5 text-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              Share
            </button>
          )}
        </div>
      </div>

      {/* ===== HIDDEN EXPORT CARD (off-screen, used only for image generation) ===== */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
      <div
        id="summary-card"
        style={{
          width: cardWidth,
          height: cardHeight,
          background: 'linear-gradient(135deg, #4c1d95 0%, #be185d 40%, #ea580c 80%, #facc15 100%)',
          padding: isStory ? 80 : 50,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#ffffff',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />

        {/* Top section */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontSize: isStory ? 42 : 32,
              fontWeight: 900,
              letterSpacing: 6,
              marginBottom: 8,
              textTransform: 'uppercase' as const,
            }}
          >
            {session.workout_type ? `${session.workout_type.toUpperCase()} DAY` : 'WORKOUT TRACKER'}
          </div>
          <div style={{ fontSize: isStory ? 28 : 20, fontWeight: 500, opacity: 0.85 }}>
            {date}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isStory ? '1fr 1fr' : '1fr 1fr 1fr',
              gap: isStory ? 20 : 16,
              marginBottom: isStory ? 40 : 24,
            }}
          >
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 20, padding: isStory ? '28px 24px' : '20px 18px' }}>
              <div style={{ fontSize: isStory ? 18 : 14, opacity: 0.7, marginBottom: 4 }}>Duration</div>
              <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 800 }}>{duration}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 20, padding: isStory ? '28px 24px' : '20px 18px' }}>
              <div style={{ fontSize: isStory ? 18 : 14, opacity: 0.7, marginBottom: 4 }}>Volume</div>
              <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 800 }}>
                {totalVolume.toLocaleString()} lbs
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 20, padding: isStory ? '28px 24px' : '20px 18px' }}>
              <div style={{ fontSize: isStory ? 18 : 14, opacity: 0.7, marginBottom: 4 }}>Sets</div>
              <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 800 }}>{totalSets}</div>
            </div>
          </div>

          {/* Exercise list */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: isStory ? '28px 24px' : '20px 18px', marginBottom: isStory ? 40 : 24 }}>
            <div style={{ fontSize: isStory ? 20 : 16, fontWeight: 700, marginBottom: isStory ? 16 : 12, opacity: 0.8, textTransform: 'uppercase' as const, letterSpacing: 2 }}>
              Exercises
            </div>
            {exercises.map((ex, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: isStory ? '12px 0' : '8px 0',
                  borderBottom: i < exercises.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: isStory ? 22 : 17, fontWeight: 600 }}>{ex.name}</div>
                  <div style={{ fontSize: isStory ? 16 : 13, opacity: 0.6 }}>{ex.totalSets} sets</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ fontSize: isStory ? 22 : 17, fontWeight: 700 }}>{ex.bestWeight} lbs</div>
                  <div style={{ fontSize: isStory ? 16 : 13, opacity: 0.6 }}>x {ex.bestReps} reps</div>
                </div>
              </div>
            ))}
          </div>

          {/* Muscle groups */}
          {muscleGroups.length > 0 && (
            <div style={{ marginBottom: isStory ? 40 : 24 }}>
              <div style={{ fontSize: isStory ? 18 : 14, fontWeight: 700, marginBottom: 12, opacity: 0.7, textTransform: 'uppercase' as const, letterSpacing: 2 }}>
                Muscles Worked
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {muscleGroups.map((mg) => (
                  <span
                    key={mg}
                    style={{
                      background: MUSCLE_COLORS[mg] || 'rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      padding: isStory ? '8px 18px' : '6px 14px',
                      borderRadius: 50,
                      fontSize: isStory ? 18 : 14,
                      fontWeight: 600,
                      textTransform: 'capitalize' as const,
                    }}
                  >
                    {mg.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom quote */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' as const }}>
          <div style={{ fontSize: isStory ? 22 : 16, fontWeight: 600, fontStyle: 'italic' as const, opacity: 0.7, marginBottom: 8 }}>
            "{quote}"
          </div>
          <div style={{ fontSize: isStory ? 16 : 12, opacity: 0.4, letterSpacing: 3, textTransform: 'uppercase' as const }}>
            WORKOUT TRACKER
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
