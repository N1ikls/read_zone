export default defineApiHandler(async (event) => {
  const query = getQuery(event);
  const storage = event.context.storage;

  // const books = await storage.book.catalogSearch(query);

  // return books.map((book) => storage.book.toPublic(book));

  const books = (key = 5) =>
    Array.from({ length: key }, (_, i) => ({
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
      grad: 130,
    }));

  const news = books(4);

  return {
    books: books(5),
    news,
    filters: books(20),
  };
});
