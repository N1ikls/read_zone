/**
 * Система логирования и мониторинга поисковых запросов
 * Для production-ready мониторинга производительности поиска
 */

class SearchLogger {
  constructor() {
    this.searchStats = new Map();
    this.slowQueries = [];
    this.popularQueries = new Map();
    this.maxSlowQueries = 100;
    this.maxPopularQueries = 50;
  }

  /**
   * Логирует поисковый запрос с метриками производительности
   * @param {object} searchData - данные о поиске
   */
  logSearch(searchData) {
    const {
      query,
      normalizedQuery,
      resultCount,
      executionTime,
      userAgent,
      ip,
      userId,
      timestamp = new Date(),
    } = searchData;

    // Логируем в консоль для разработки
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Search Query:', {
        query,
        normalizedQuery,
        resultCount,
        executionTime: `${executionTime}ms`,
        timestamp: timestamp.toISOString(),
      });
    }

    // Собираем статистику
    this.updateSearchStats(query, normalizedQuery, resultCount, executionTime);

    // Отслеживаем медленные запросы
    if (executionTime > 1000) { // запросы медленнее 1 секунды
      this.trackSlowQuery({
        query,
        normalizedQuery,
        executionTime,
        resultCount,
        timestamp,
        userAgent,
        ip,
        userId,
      });
    }

    // Отслеживаем популярные запросы
    this.trackPopularQuery(normalizedQuery);

    // В production можно отправлять в систему мониторинга
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(searchData);
    }
  }

  /**
   * Обновляет статистику поисковых запросов
   */
  updateSearchStats(query, normalizedQuery, resultCount, executionTime) {
    const key = normalizedQuery || query;
    const existing = this.searchStats.get(key) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0,
      totalResults: 0,
      avgResults: 0,
      lastSearched: null,
    };

    existing.count++;
    existing.totalTime += executionTime;
    existing.avgTime = existing.totalTime / existing.count;
    existing.minTime = Math.min(existing.minTime, executionTime);
    existing.maxTime = Math.max(existing.maxTime, executionTime);
    existing.totalResults += resultCount;
    existing.avgResults = existing.totalResults / existing.count;
    existing.lastSearched = new Date();

    this.searchStats.set(key, existing);
  }

  /**
   * Отслеживает медленные запросы
   */
  trackSlowQuery(queryData) {
    this.slowQueries.push(queryData);
    
    // Ограничиваем размер массива
    if (this.slowQueries.length > this.maxSlowQueries) {
      this.slowQueries.shift();
    }

    // Логируем предупреждение о медленном запросе
    console.warn('⚠️ Slow Search Query:', {
      query: queryData.query,
      executionTime: `${queryData.executionTime}ms`,
      resultCount: queryData.resultCount,
    });
  }

  /**
   * Отслеживает популярные запросы
   */
  trackPopularQuery(normalizedQuery) {
    if (!normalizedQuery) return;

    const count = this.popularQueries.get(normalizedQuery) || 0;
    this.popularQueries.set(normalizedQuery, count + 1);

    // Ограничиваем размер Map
    if (this.popularQueries.size > this.maxPopularQueries) {
      // Удаляем наименее популярные запросы
      const sorted = Array.from(this.popularQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, this.maxPopularQueries);
      
      this.popularQueries.clear();
      sorted.forEach(([query, count]) => {
        this.popularQueries.set(query, count);
      });
    }
  }

  /**
   * Отправляет метрики в систему мониторинга (заглушка для production)
   */
  sendToMonitoring(searchData) {
    // Здесь можно интегрировать с системами мониторинга:
    // - Prometheus
    // - DataDog
    // - New Relic
    // - Custom analytics service
    
    // Пример для Prometheus (если используется):
    // prometheus.searchDuration.observe(searchData.executionTime);
    // prometheus.searchResults.observe(searchData.resultCount);
  }

  /**
   * Возвращает статистику поиска
   */
  getSearchStats() {
    return {
      totalSearches: Array.from(this.searchStats.values())
        .reduce((sum, stat) => sum + stat.count, 0),
      uniqueQueries: this.searchStats.size,
      avgExecutionTime: this.calculateOverallAvgTime(),
      slowQueries: this.slowQueries.slice(-10), // последние 10 медленных запросов
      popularQueries: Array.from(this.popularQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10), // топ 10 популярных запросов
      searchStats: Object.fromEntries(this.searchStats),
    };
  }

  /**
   * Вычисляет общее среднее время выполнения
   */
  calculateOverallAvgTime() {
    const stats = Array.from(this.searchStats.values());
    if (stats.length === 0) return 0;

    const totalTime = stats.reduce((sum, stat) => sum + stat.totalTime, 0);
    const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);
    
    return totalCount > 0 ? totalTime / totalCount : 0;
  }

  /**
   * Очищает статистику (для тестирования или периодической очистки)
   */
  clearStats() {
    this.searchStats.clear();
    this.slowQueries.length = 0;
    this.popularQueries.clear();
  }

  /**
   * Создает отчет о производительности поиска
   */
  generatePerformanceReport() {
    const stats = this.getSearchStats();
    
    return {
      summary: {
        totalSearches: stats.totalSearches,
        uniqueQueries: stats.uniqueQueries,
        avgExecutionTime: Math.round(stats.avgExecutionTime * 100) / 100,
        slowQueriesCount: this.slowQueries.length,
      },
      performance: {
        slowQueries: stats.slowQueries.map(q => ({
          query: q.query,
          executionTime: q.executionTime,
          resultCount: q.resultCount,
          timestamp: q.timestamp,
        })),
        fastestQueries: this.getFastestQueries(),
        slowestQueries: this.getSlowestQueries(),
      },
      usage: {
        popularQueries: stats.popularQueries,
        recentQueries: this.getRecentQueries(),
      },
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Получает самые быстрые запросы
   */
  getFastestQueries() {
    return Array.from(this.searchStats.entries())
      .sort((a, b) => a[1].avgTime - b[1].avgTime)
      .slice(0, 5)
      .map(([query, stats]) => ({
        query,
        avgTime: Math.round(stats.avgTime * 100) / 100,
        count: stats.count,
      }));
  }

  /**
   * Получает самые медленные запросы
   */
  getSlowestQueries() {
    return Array.from(this.searchStats.entries())
      .sort((a, b) => b[1].avgTime - a[1].avgTime)
      .slice(0, 5)
      .map(([query, stats]) => ({
        query,
        avgTime: Math.round(stats.avgTime * 100) / 100,
        count: stats.count,
      }));
  }

  /**
   * Получает недавние запросы
   */
  getRecentQueries() {
    return Array.from(this.searchStats.entries())
      .sort((a, b) => new Date(b[1].lastSearched) - new Date(a[1].lastSearched))
      .slice(0, 10)
      .map(([query, stats]) => ({
        query,
        lastSearched: stats.lastSearched,
        count: stats.count,
      }));
  }

  /**
   * Генерирует рекомендации по оптимизации
   */
  generateRecommendations() {
    const recommendations = [];
    const avgTime = this.calculateOverallAvgTime();

    if (avgTime > 500) {
      recommendations.push('Рассмотрите добавление дополнительных индексов для ускорения поиска');
    }

    if (this.slowQueries.length > 10) {
      recommendations.push('Высокое количество медленных запросов - проверьте производительность БД');
    }

    const popularQueries = Array.from(this.popularQueries.entries())
      .sort((a, b) => b[1] - a[1]);
    
    if (popularQueries.length > 0) {
      recommendations.push(`Рассмотрите кеширование для популярного запроса: "${popularQueries[0][0]}"`);
    }

    return recommendations;
  }
}

// Создаем глобальный экземпляр логгера
const searchLogger = new SearchLogger();

export default searchLogger;
