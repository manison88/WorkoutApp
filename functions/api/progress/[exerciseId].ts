export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const exerciseId = context.params.exerciseId as string;
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('userId');
    const sessionId = url.searchParams.get('sessionId');

    if (!userId || !sessionId) {
      return Response.json(
        { error: 'userId and sessionId query parameters are required' },
        { status: 400 }
      );
    }

    const { results } = await context.env.DB.prepare(
      `SELECT ws.* FROM workout_sets ws
       JOIN workout_sessions s ON ws.session_id = s.id
       WHERE ws.exercise_id = ? AND s.user_id = ? AND s.id != ? AND s.status = 'completed'
       AND s.started_at < (SELECT started_at FROM workout_sessions WHERE id = ?)
       ORDER BY s.started_at DESC
       LIMIT 20`
    )
      .bind(exerciseId, userId, sessionId, sessionId)
      .all();

    // Filter to only the most recent session's sets
    if (results.length === 0) {
      return Response.json([]);
    }

    const mostRecentSessionId = (results[0] as any).session_id;
    const filteredSets = results.filter(
      (set: any) => set.session_id === mostRecentSessionId
    );

    return Response.json(filteredSets);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
