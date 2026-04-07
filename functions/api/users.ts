export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare('SELECT * FROM users').all();
    return Response.json(results);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
