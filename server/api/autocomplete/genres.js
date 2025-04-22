export default defineApiHandler(async (event) => {
  const { exclude_ids = '', text = '' } = getQuery(event);

  const genres = await event.context.storage.genre;

  // const filter = [];

  // const excludeIds = exclude_ids.split(',');
  // if (excludeIds.length) filter.push({ id: { '!=': excludeIds } });

  // if (text.length) filter.push({ name: { like: `%${text}%` } });

  // const genres = await storage.genre.find(filter, { limit: 10 });

  return genres;
});
