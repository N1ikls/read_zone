import knex from 'knex';
import config from '../knex.js';

const db = knex(config);

async function runAllSeeds() {
  try {
    console.log('🌱 Запуск заполнения базы данных...\n');
    
    // Запускаем seeds в правильном порядке
    const seedFiles = [
      { file: '001_refs.js', name: 'Справочники (фандомы, жанры, теги)' },
      { file: '002_user.js', name: 'Пользователи' },
      { file: '003_misc.js', name: 'Разное (FAQ, новости)' },
      { file: '004_author.js', name: 'Авторы' },
      { file: '005_book.js', name: 'Книги' },
      { file: '006_team.js', name: 'Команды' }
    ];
    
    for (const seedInfo of seedFiles) {
      try {
        console.log(`📝 Выполняется: ${seedInfo.name}...`);
        
        const { seed } = await import(`../seeds/${seedInfo.file}`);
        await seed(db);
        
        console.log(`✅ ${seedInfo.name} - выполнено`);
        
      } catch (error) {
        console.error(`❌ Ошибка в ${seedInfo.file}:`, error.message);
        
        // Для некоторых seeds ошибки могут быть не критичными (например, дубликаты)
        if (error.message.includes('duplicate') || error.message.includes('уже существует')) {
          console.log(`⚠️  ${seedInfo.name} - пропущено (данные уже существуют)`);
        } else {
          throw error; // Критичная ошибка - останавливаем выполнение
        }
      }
    }
    
    console.log('\n📊 Проверка результатов...');
    
    // Проверяем что данные заполнились
    const stats = await Promise.all([
      db('fandom').count('* as count').first(),
      db('genre').count('* as count').first(),
      db('tag').count('* as count').first(),
      db('user').count('* as count').first(),
      db('author').count('* as count').first(),
      db('book').count('* as count').first()
    ]);
    
    console.log('Результаты заполнения:');
    console.log(`- Фандомы: ${stats[0].count}`);
    console.log(`- Жанры: ${stats[1].count}`);
    console.log(`- Теги: ${stats[2].count}`);
    console.log(`- Пользователи: ${stats[3].count}`);
    console.log(`- Авторы: ${stats[4].count}`);
    console.log(`- Книги: ${stats[5].count}`);
    
    // Проверяем админа
    const admin = await db('user').where('email', 'admin1@example.com').first();
    if (admin) {
      console.log(`👤 Админ создан: ${admin.name} (${admin.email})`);
    }
    
    console.log('\n🎉 Заполнение базы данных завершено успешно!');
    
  } catch (error) {
    console.error('\n❌ Критическая ошибка при заполнении базы данных:');
    console.error(error.message);
    
    if (error.stack) {
      console.error('\nПодробности:');
      console.error(error.stack);
    }
    
    console.log('\n💡 Возможные решения:');
    console.log('1. Убедитесь, что миграции выполнены: npm run migration');
    console.log('2. Проверьте подключение к базе данных');
    console.log('3. Убедитесь, что файл manga_2.csv существует в корне проекта');
    
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runAllSeeds();
