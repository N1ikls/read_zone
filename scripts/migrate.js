import knex from 'knex';
import config from '../knex.js';

const db = knex(config);

async function runMigrations() {
  try {
    console.log('🚀 Запуск миграций базы данных...');
    
    const [batchNo, log] = await db.migrate.latest();
    
    if (log.length === 0) {
      console.log('✅ Все миграции уже выполнены');
    } else {
      console.log(`✅ Выполнен batch ${batchNo}`);
      console.log('📋 Выполненные миграции:');
      log.forEach(migration => console.log(`   - ${migration}`));
    }
    
    console.log('🎉 Миграции завершены успешно');
  } catch (error) {
    console.error('❌ Ошибка выполнения миграций:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();
