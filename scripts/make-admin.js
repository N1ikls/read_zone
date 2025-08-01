import { db } from '../config/config.ts';

async function makeAdmin() {
  try {
    // Показываем всех пользователей
    console.log('Список пользователей:');
    const users = await db('user').select('id', 'name', 'email', 'role');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - роль: ${user.role || 'user'}`);
    });
    
    if (users.length === 0) {
      console.log('Пользователи не найдены. Сначала зарегистрируйтесь на сайте.');
      process.exit(1);
    }
    
    // Берем первого пользователя и делаем его админом
    const firstUser = users[0];
    
    await db('user')
      .where('id', firstUser.id)
      .update({ role: 'admin' });
    
    console.log(`\n✅ Пользователь ${firstUser.name} (${firstUser.email}) назначен администратором!`);
    console.log('\nТеперь вы можете войти в админ панель: http://localhost:3001/admin');
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await db.destroy();
  }
}

makeAdmin();
