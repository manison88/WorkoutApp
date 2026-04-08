export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const exerciseId = context.params.id as string;
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    const { results } = await context.env.DB.prepare(
      `SELECT ws.set_number, ws.weight, ws.reps, ws.notes, ws.created_at,
              s.id as session_id, s.started_at, s.workout_type
       FROM workout_sets ws
       JOIN workout_sessions s ON ws.session_id = s.id
       WHERE ws.exercise_id = ? AND s.user_id = ? AND s.status = 'completed'
       ORDER BY s.started_at DESC, ws.set_number ASC`
    )
      .bind(exerciseId, userId)
      .all();

    return Response.json(results);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
