export default defineApiHandler(async (event) => {
  const query = getQuery(event);
  const storage = event.context.storage;

  const books = await storage.book.catalogSearch(query);

  // return books.map((book) => storage.book.toPublic(book));

  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `Название манги ${i + 1}`,
    rate: (4.8 + Math.random() * 0.2).toFixed(2),
    genres: [
      { name: 'Романтика' },
      { name: 'Повседневность' },
      { name: 'Психология' },
      { name: 'Романтика' },
      { name: 'Повседневность' },
      { name: 'Психология' },
    ],
    description: `Глава 1 Том ${i + 1}`,
    actions: `${Math.floor(Math.random() * 60)} минут назад`,
  }));
});
