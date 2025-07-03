import errors from '../../errors';

export default defineEventHandler(async (event) => {
  const storage = event.context.storage;

  const user = await event.context.context.user();

  if (!user) throw new errors.Unauthorized();

  const { book_id } = getQuery(event);

  const chapters = await storage.chapter.find(
    { book_id: book_id },
    {
      order: { number: 'desc' },
      with: ['is_readable'],
      actor: user,
    },
  );

  return chapters.map((chapter) => storage.chapter.toPublic(chapter));
});
