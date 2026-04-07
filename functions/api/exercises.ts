export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const bodyPart = url.searchParams.get('body_part');

    let stmt;
    if (bodyPart) {
      stmt = context.env.DB.prepare('SELECT * FROM exercises WHERE body_part = ?').bind(bodyPart);
    } else {
      stmt = context.env.DB.prepare('SELECT * FROM exercises');
    }

    const { results } = await stmt.all();
    return Response.json(results);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const body = await context.request.json<{ name: string; body_part: string }>();

    if (!body.name || !body.body_part) {
      return Response.json({ error: 'name and body_part are required' }, { status: 400 });
    }

    const result = await context.env.DB.prepare(
      'INSERT INTO exercises (name, body_part) VALUES (?, ?)'
    )
      .bind(body.name, body.body_part)
      .run();

    return Response.json({ id: result.meta.last_row_id, name: body.name, body_part: body.body_part }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
