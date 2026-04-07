const EXERCISE_MUSCLE_MAP: Record<string, string[]> = {
  'Bench Press': ['chest', 'triceps', 'shoulders'],
  'Incline Press': ['chest', 'shoulders', 'triceps'],
  'Dumbbell Fly': ['chest', 'shoulders'],
  'Pull-ups': ['upper_back', 'biceps', 'forearms'],
  'Barbell Row': ['upper_back', 'lower_back', 'biceps'],
  'Lat Pulldown': ['upper_back', 'biceps'],
  'Overhead Press': ['shoulders', 'triceps'],
  'Lateral Raise': ['shoulders'],
  'Bicep Curl': ['biceps', 'forearms'],
  'Tricep Pushdown': ['triceps'],
  'Hammer Curl': ['biceps', 'forearms'],
  'Squat': ['quads', 'glutes', 'hamstrings'],
  'Deadlift': ['hamstrings', 'glutes', 'lower_back', 'forearms'],
  'Leg Press': ['quads', 'glutes'],
  'Lunges': ['quads', 'glutes', 'hamstrings'],
  'Calf Raise': ['calves'],
  'Plank': ['abs', 'obliques'],
  'Crunches': ['abs'],
  'Russian Twist': ['abs', 'obliques'],
};

export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const userId = context.params.userId as string;
    const url = new URL(context.request.url);
    const period = url.searchParams.get('period') || 'week';

    let dateFilter: string;
    switch (period) {
      case 'day':
        dateFilter = "date(s.started_at) = date('now')";
        break;
      case 'month':
        dateFilter = "s.started_at >= date('now', '-30 days')";
        break;
      case 'week':
      default:
        dateFilter = "s.started_at >= date('now', '-7 days')";
        break;
    }

    const { results } = await context.env.DB.prepare(
      `SELECT e.name AS exercise_name, COUNT(ws.id) AS set_count
       FROM workout_sets ws
       JOIN workout_sessions s ON ws.session_id = s.id
       JOIN exercises e ON ws.exercise_id = e.id
       WHERE s.user_id = ? AND ${dateFilter}
       GROUP BY e.name`
    )
      .bind(userId)
      .all();

    const muscleMap: Record<string, number> = {};

    for (const row of results as any[]) {
      const muscles = EXERCISE_MUSCLE_MAP[row.exercise_name];
      if (muscles) {
        for (const muscle of muscles) {
          muscleMap[muscle] = (muscleMap[muscle] || 0) + row.set_count;
        }
      }
    }

    return Response.json(muscleMap);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
