export default defineApiHandler(async (event) => {
  const query = getQuery(event);

  const storage = event.context.storage;

  const news = await storage.news.find(query);

  return news.map((item) => storage.news.toPublic(item));
});
