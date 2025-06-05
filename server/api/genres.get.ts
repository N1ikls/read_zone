export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  const genres = await storage.genre.find({}, { toPublic: true });

  return genres;
});
