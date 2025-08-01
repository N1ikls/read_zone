import { db } from '../config/config.ts';
import bcrypt from 'bcrypt';

async function testLogin() {
  try {
    const email = 'admin1@example.com';
    const password = 'admin123';
    
    // Получаем пользователя из базы
    const users = await db('user')
      .where({ email })
      .select('*');
      
    if (!users.length) {
      console.log('❌ Пользователь не найден');
      return;
    }
    
    const user = users[0];
    console.log('👤 Пользователь найден:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🔑 Хеш в БД:', user.password);
    
    // Проверяем пароль
    const isValid = bcrypt.compareSync(password, user.password);
    console.log('🔐 Проверка пароля:', isValid ? '✅ Корректный' : '❌ Некорректный');
    
    if (!isValid) {
      // Генерируем новый правильный хеш
      const newHash = bcrypt.hashSync(password, 10);
      console.log('\n🔧 Новый хеш для пароля "admin123":', newHash);
      
      // Обновляем пароль
      await db('user')
        .where('email', email)
        .update({ password: newHash });
        
      console.log('✅ Пароль обновлен в базе данных');
      
      // Проверяем еще раз
      const isValidNow = bcrypt.compareSync(password, newHash);
      console.log('🔐 Повторная проверка:', isValidNow ? '✅ Корректный' : '❌ Некорректный');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await db.destroy();
  }
}

testLogin();
