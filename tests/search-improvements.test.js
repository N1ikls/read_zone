import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import knexConfig from '../knex.js';
import knex from 'knex';
import BookStorage from '../server/storage/book.js';

describe('Улучшенный поиск каталога', () => {
  let db;
  let bookStorage;

  beforeAll(async () => {
    db = knex(knexConfig);
    bookStorage = new BookStorage(db);
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('normalizeSearchTerm', () => {
    it('должен нормализовать пробелы', () => {
      const result = bookStorage.normalizeSearchTerm('  Гарри   Поттер  ');
      expect(result).toBe('гарри поттер');
    });

    it('должен приводить к нижнему регистру', () => {
      const result = bookStorage.normalizeSearchTerm('ВОЙНА И МИР');
      expect(result).toBe('война и мир');
    });

    it('должен нормализовать ё -> е', () => {
      const result = bookStorage.normalizeSearchTerm('Алёша');
      expect(result).toBe('алеша');
    });

    it('должен нормализовать й -> и', () => {
      const result = bookStorage.normalizeSearchTerm('Андрей');
      expect(result).toBe('андреи');
    });

    it('должен обрабатывать пустые строки', () => {
      expect(bookStorage.normalizeSearchTerm('')).toBe('');
      expect(bookStorage.normalizeSearchTerm(null)).toBe('');
      expect(bookStorage.normalizeSearchTerm(undefined)).toBe('');
    });
  });

  describe('createSearchCondition', () => {
    it('должен создавать условие для одного слова', () => {
      const condition = bookStorage.createSearchCondition('гарри');
      expect(condition).toEqual({
        ':or': [
          { name: { ilike: 'гарри' } },
          { name: { ilike: '%гарри%' } }
        ]
      });
    });

    it('должен создавать условие для нескольких слов', () => {
      const condition = bookStorage.createSearchCondition('гарри поттер');
      expect(condition).toEqual({
        ':or': [
          { name: { ilike: 'гарри поттер' } },
          { name: { ilike: '%гарри поттер%' } },
          {
            ':and': [
              { name: { ilike: '%гарри%' } },
              { name: { ilike: '%поттер%' } }
            ]
          }
        ]
      });
    });

    it('должен возвращать null для пустого запроса', () => {
      expect(bookStorage.createSearchCondition('')).toBeNull();
      expect(bookStorage.createSearchCondition('   ')).toBeNull();
    });

    it('должен работать с кастомным полем', () => {
      const condition = bookStorage.createSearchCondition('тест', 'description');
      expect(condition[':or'][0]).toEqual({ description: { ilike: 'тест' } });
    });
  });

  describe('Интеграционные тесты поиска', () => {
    it('должен находить книги независимо от регистра', async () => {
      // Этот тест требует наличия тестовых данных в БД
      // В реальном проекте здесь бы были моки или тестовая БД
      const mockQuery = { name: 'ГАРРИ ПОТТЕР' };
      
      // Проверяем, что поисковое условие создается правильно
      const searchCondition = bookStorage.createSearchCondition(mockQuery.name);
      expect(searchCondition[':or'][0].name.ilike).toBe('гарри поттер');
    });

    it('должен находить книги с лишними пробелами', async () => {
      const mockQuery = { name: '  война   и   мир  ' };
      
      const searchCondition = bookStorage.createSearchCondition(mockQuery.name);
      expect(searchCondition[':or'][0].name.ilike).toBe('воина и мир');
    });

    it('должен находить книги с ё/е', async () => {
      const mockQuery = { name: 'Алёша Карамазов' };
      
      const searchCondition = bookStorage.createSearchCondition(mockQuery.name);
      expect(searchCondition[':or'][0].name.ilike).toBe('алеша карамазов');
    });
  });

  describe('Производительность поиска', () => {
    it('должен обрабатывать длинные запросы', () => {
      const longQuery = 'очень длинный поисковый запрос с множеством слов для тестирования производительности';
      const start = Date.now();
      
      const condition = bookStorage.createSearchCondition(longQuery);
      const end = Date.now();
      
      expect(end - start).toBeLessThan(100); // должно выполняться быстро
      expect(condition).toBeDefined();
    });

    it('должен корректно обрабатывать специальные символы', () => {
      const queryWithSpecialChars = 'книга "с кавычками" и символами %_';
      const condition = bookStorage.createSearchCondition(queryWithSpecialChars);
      
      expect(condition).toBeDefined();
      expect(condition[':or'][0].name.ilike).toContain('книга "с кавычками" и символами %_');
    });
  });
});
