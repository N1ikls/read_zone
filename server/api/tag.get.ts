export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const { book_id } = getQuery(event);

  if (book_id) {
    const bookTags = await storage.book.getTags(book_id);

    return bookTags;
  }

  const allTags = await storage.tag.find({}, { toPublic: true });

  return allTags;
});
