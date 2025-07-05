import errors from '../../errors';

export default defineEventHandler(async (event) => {
  const storage = event.context.storage;

  const user = await event.context.context.user();

  if (!user) throw new errors.Unauthorized();

  const { book_id, number = 'desc' } = getQuery(event);

  const chapters = await storage.chapter.find(
    { book_id: book_id },
    {
      order: {
        number,
      },
    },
    {
      with: ['is_readable'],
      actor: user,
    },
  );

  const chaptersIds = chapters.map((c) => c.id);

  const likedMap = await storage.chapter.getLiked(chaptersIds, user);

  return chapters.map((chapter) => ({
    ...storage.chapter.toPublic(chapter),
    is_liked: !!likedMap[chapter.id],
  }));
});
