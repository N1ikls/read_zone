export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  const tag = await storage.tag.find({}, { toPublic: true });

  return tag;
});
