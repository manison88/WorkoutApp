export const onRequestPost: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const body = await context.request.json<{
      session_id: number;
      exercise_id: number;
      set_number: number;
      weight: number;
      reps: number;
      notes?: string;
    }>();

    if (!body.session_id || !body.exercise_id || !body.set_number || body.weight === undefined || body.reps === undefined) {
      return Response.json(
        { error: 'session_id, exercise_id, set_number, weight, and reps are required' },
        { status: 400 }
      );
    }

    const result = await context.env.DB.prepare(
      'INSERT INTO workout_sets (session_id, exercise_id, set_number, weight, reps, notes) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(body.session_id, body.exercise_id, body.set_number, body.weight, body.reps, body.notes ?? null)
      .run();

    return Response.json(
      {
        id: result.meta.last_row_id,
        session_id: body.session_id,
        exercise_id: body.exercise_id,
        set_number: body.set_number,
        weight: body.weight,
        reps: body.reps,
        notes: body.notes ?? null,
      },
      { status: 201 }
    );
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
