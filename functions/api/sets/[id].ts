export const onRequestPut: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const id = context.params.id as string;
    const body = await context.request.json<Record<string, any>>();

    const allowedFields = ['set_number', 'weight', 'reps', 'notes', 'exercise_id'];
    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    await context.env.DB.prepare(
      `UPDATE workout_sets SET ${updates.join(', ')} WHERE id = ?`
    )
      .bind(...values)
      .run();

    const updated = await context.env.DB.prepare(
      'SELECT * FROM workout_sets WHERE id = ?'
    )
      .bind(id)
      .first();

    if (!updated) {
      return Response.json({ error: 'Set not found' }, { status: 404 });
    }

    return Response.json(updated);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const id = context.params.id as string;

    const existing = await context.env.DB.prepare(
      'SELECT * FROM workout_sets WHERE id = ?'
    )
      .bind(id)
      .first();

    if (!existing) {
      return Response.json({ error: 'Set not found' }, { status: 404 });
    }

    await context.env.DB.prepare('DELETE FROM workout_sets WHERE id = ?')
      .bind(id)
      .run();

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
