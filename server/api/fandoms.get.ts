export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  
  const fandoms = await storage.fandom.find({}, { toPublic: true });
  
  return fandoms;
});
