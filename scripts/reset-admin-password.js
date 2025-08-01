import { db } from '../config/config.ts';
import bcrypt from 'bcrypt';

async function resetAdminPassword() {
  try {
    // Хешируем пароль "admin123"
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Обновляем пароль для admin1@example.com
    const result = await db('user')
      .where('email', 'admin1@example.com')
      .update({ 
        password: hashedPassword,
        updated_at: new Date()
      });
    
    if (result > 0) {
      console.log('✅ Пароль успешно обновлен!');
      console.log('📧 Email: admin1@example.com');
      console.log('🔑 Пароль: admin123');
      console.log('\nТеперь вы можете войти в админ панель:');
      console.log('🌐 http://localhost:3001/admin');
    } else {
      console.log('❌ Пользователь admin1@example.com не найден');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при сбросе пароля:', error);
  } finally {
    await db.destroy();
  }
}

resetAdminPassword();
