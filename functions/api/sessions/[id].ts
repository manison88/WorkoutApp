export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const id = context.params.id as string;

    const session = await context.env.DB.prepare(
      'SELECT * FROM workout_sessions WHERE id = ?'
    )
      .bind(id)
      .first();

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const { results: sets } = await context.env.DB.prepare(
      `SELECT ws.*, e.name AS exercise_name, e.body_part AS exercise_body_part
       FROM workout_sets ws
       JOIN exercises e ON ws.exercise_id = e.id
       WHERE ws.session_id = ?
       ORDER BY ws.set_number ASC`
    )
      .bind(id)
      .all();

    return Response.json({ ...session, sets });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const id = context.params.id as string;
    const body = await context.request.json<{ status?: string; notes?: string; ended_at?: string }>();

    const updates: string[] = [];
    const values: any[] = [];

    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
    }

    if (body.notes !== undefined) {
      updates.push('notes = ?');
      values.push(body.notes);
    }

    if (body.ended_at !== undefined) {
      updates.push('ended_at = ?');
      values.push(body.ended_at);
    } else if (body.status === 'completed') {
      updates.push('ended_at = ?');
      values.push(new Date().toISOString());
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    await context.env.DB.prepare(
      `UPDATE workout_sessions SET ${updates.join(', ')} WHERE id = ?`
    )
      .bind(...values)
      .run();

    const updated = await context.env.DB.prepare(
      'SELECT * FROM workout_sessions WHERE id = ?'
    )
      .bind(id)
      .first();

    return Response.json(updated);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const id = context.params.id as string;

    // Delete child sets first, then the session
    await context.env.DB.prepare('DELETE FROM workout_sets WHERE session_id = ?').bind(id).run();
    await context.env.DB.prepare('DELETE FROM workout_sessions WHERE id = ?').bind(id).run();

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
