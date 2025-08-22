import knex from 'knex';
import config from '../knex.js';

const db = knex(config);

async function checkDatabase() {
  try {
    console.log('🔍 Проверка состояния базы данных read_zone...\n');
    
    // Проверяем подключение
    console.log('📡 Проверка подключения к PostgreSQL...');
    await db.raw('SELECT 1');
    console.log('✅ Подключение к базе данных работает\n');
    
    // Проверяем миграции
    console.log('🗂️ Проверка миграций...');
    const migrations = await db('knex_migrations').count('* as count').first();
    console.log(`✅ Выполнено миграций: ${migrations.count}\n`);
    
    // Проверяем основные таблицы и их данные
    const tables = [
      { name: 'fandom', label: 'Фандомы' },
      { name: 'genre', label: 'Жанры' },
      { name: 'tag', label: 'Теги' },
      { name: 'user', label: 'Пользователи' },
      { name: 'author', label: 'Авторы' },
      { name: 'book', label: 'Книги' },
      { name: 'book_fandom', label: 'Связи книга-фандом' },
      { name: 'book_genre', label: 'Связи книга-жанр' },
      { name: 'notifications', label: 'Уведомления' }
    ];
    
    console.log('📊 Статистика данных:');
    for (const table of tables) {
      try {
        const count = await db(table.name).count('* as count').first();
        const status = count.count > 0 ? '✅' : '⚠️';
        console.log(`${status} ${table.label}: ${count.count} записей`);
      } catch (error) {
        console.log(`❌ ${table.label}: таблица не найдена или ошибка`);
      }
    }
    
    console.log('\n🎯 Примеры данных:');
    
    // Показываем примеры фандомов
    const fandoms = await db('fandom').select('name').limit(3);
    if (fandoms.length > 0) {
      console.log('📚 Фандомы:');
      fandoms.forEach(f => console.log(`   - ${f.name}`));
    }
    
    // Показываем примеры жанров
    const genres = await db('genre').select('name').limit(3);
    if (genres.length > 0) {
      console.log('🎭 Жанры:');
      genres.forEach(g => console.log(`   - ${g.name}`));
    }
    
    // Показываем примеры книг
    const books = await db('book').select('name').limit(3);
    if (books.length > 0) {
      console.log('📖 Книги:');
      books.forEach(b => console.log(`   - ${b.name}`));
    }
    
    // Проверяем админа
    const admin = await db('user').where('email', 'admin1@example.com').first();
    if (admin) {
      console.log(`👤 Админ: ${admin.name} (${admin.email})`);
    }
    
    console.log('\n🎉 База данных настроена корректно!');
    console.log('💡 Для запуска проекта используйте: npm run dev');
    
  } catch (error) {
    console.error('❌ Ошибка при проверке базы данных:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Возможные решения:');
      console.log('1. Убедитесь, что PostgreSQL запущен');
      console.log('2. Проверьте настройки подключения в knex.js');
      console.log('3. Создайте базу данных: createdb -U postgres read_zone_db');
    }
    
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

checkDatabase();
