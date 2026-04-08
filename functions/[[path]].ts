// SPA catch-all: serve index.html for all non-API routes so React Router
// can handle client-side routing on page refresh / direct navigation.
export const onRequest: PagesFunction<{ ASSETS: Fetcher }> = async (context) => {
  const url = new URL(context.request.url);
  url.pathname = '/index.html';
  return context.env.ASSETS.fetch(new Request(url.toString(), context.request));
};
