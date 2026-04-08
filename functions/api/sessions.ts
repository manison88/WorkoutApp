export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    const { results } = await context.env.DB.prepare(
      'SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY started_at DESC'
    )
      .bind(userId)
      .all();

    return Response.json(results);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const body = await context.request.json<{ user_id: number; workout_type?: string }>();

    if (!body.user_id) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const workoutType = body.workout_type || null;
    const result = await context.env.DB.prepare(
      'INSERT INTO workout_sessions (user_id, started_at, status, workout_type) VALUES (?, ?, ?, ?)'
    )
      .bind(body.user_id, now, 'active', workoutType)
      .run();

    return Response.json(
      { id: result.meta.last_row_id, user_id: body.user_id, started_at: now, status: 'active', workout_type: workoutType },
      { status: 201 }
    );
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
