import knex from 'knex';
import config from '../knex.js';
import bcrypt from 'bcrypt';

const db = knex(config);

async function checkAllUsers() {
  try {
    console.log('👥 Проверка всех пользователей в базе данных...\n');
    
    // Получаем всех пользователей
    const users = await db('user')
      .select('id', 'email', 'name', 'role', 'password', 'created_at')
      .orderBy('role', 'desc')
      .orderBy('email', 'asc');
    
    console.log(`📊 Всего пользователей: ${users.length}\n`);
    
    // Группируем пользователей по ролям
    const admins = users.filter(user => user.role === 'admin');
    const moderators = users.filter(user => user.role === 'moderator');
    const regularUsers = users.filter(user => !user.role || user.role === '');
    
    console.log('👑 АДМИНИСТРАТОРЫ:');
    console.log('================');
    if (admins.length === 0) {
      console.log('❌ Администраторы не найдены!');
    } else {
      for (const admin of admins) {
        console.log(`📧 Email: ${admin.email}`);
        console.log(`👤 Имя: ${admin.name}`);
        console.log(`🔑 Хеш пароля: ${admin.password}`);
        
        // Проверяем стандартные пароли
        const testPasswords = ['123456', 'admin123', 'admin', 'password'];
        let foundPassword = null;
        
        for (const testPassword of testPasswords) {
          if (bcrypt.compareSync(testPassword, admin.password)) {
            foundPassword = testPassword;
            break;
          }
        }
        
        if (foundPassword) {
          console.log(`✅ Пароль: ${foundPassword}`);
        } else {
          console.log('❓ Пароль: неизвестен (не совпадает со стандартными)');
        }
        
        console.log(`📅 Создан: ${admin.created_at}`);
        console.log('---');
      }
    }
    
    console.log('\n🛡️ МОДЕРАТОРЫ:');
    console.log('==============');
    if (moderators.length === 0) {
      console.log('ℹ️ Модераторы не найдены');
    } else {
      for (const moderator of moderators) {
        console.log(`📧 Email: ${moderator.email}`);
        console.log(`👤 Имя: ${moderator.name}`);
        console.log(`📅 Создан: ${moderator.created_at}`);
        console.log('---');
      }
    }
    
    console.log('\n👤 ОБЫЧНЫЕ ПОЛЬЗОВАТЕЛИ (первые 10):');
    console.log('===================================');
    const firstUsers = regularUsers.slice(0, 10);
    
    for (const user of firstUsers) {
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Имя: ${user.name}`);
      
      // Проверяем стандартный пароль для обычных пользователей
      if (bcrypt.compareSync('123456', user.password)) {
        console.log('✅ Пароль: 123456');
      } else {
        console.log('❓ Пароль: неизвестен');
      }
      
      console.log(`📅 Создан: ${user.created_at}`);
      console.log('---');
    }
    
    if (regularUsers.length > 10) {
      console.log(`\n... и еще ${regularUsers.length - 10} обычных пользователей`);
    }
    
    // Статистика
    console.log('\n📈 СТАТИСТИКА:');
    console.log('==============');
    console.log(`👑 Администраторы: ${admins.length}`);
    console.log(`🛡️ Модераторы: ${moderators.length}`);
    console.log(`👤 Обычные пользователи: ${regularUsers.length}`);
    console.log(`📊 Всего: ${users.length}`);
    
    // Проверяем основного админа
    console.log('\n🔍 ПРОВЕРКА ОСНОВНОГО АДМИНА:');
    console.log('============================');
    const mainAdmin = await db('user').where('email', 'admin1@example.com').first();
    
    if (mainAdmin) {
      console.log('✅ Основной админ найден:');
      console.log(`📧 Email: ${mainAdmin.email}`);
      console.log(`👤 Имя: ${mainAdmin.name}`);
      console.log(`🔐 Роль: ${mainAdmin.role}`);
      
      // Проверяем пароли
      const passwords = ['admin123', '123456', 'admin', 'password'];
      let correctPassword = null;
      
      for (const pwd of passwords) {
        if (bcrypt.compareSync(pwd, mainAdmin.password)) {
          correctPassword = pwd;
          break;
        }
      }
      
      if (correctPassword) {
        console.log(`🔑 Пароль: ${correctPassword}`);
        console.log('🌐 Ссылка для входа: http://localhost:3001/admin');
      } else {
        console.log('❌ Пароль не найден среди стандартных');
      }
    } else {
      console.log('❌ Основной админ (admin1@example.com) не найден!');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке пользователей:', error.message);
  } finally {
    await db.destroy();
  }
}

checkAllUsers();
