/**
 * Тестовый скрипт для проверки функционала жалоб
 */

import knex from '../knex.js';

async function testComplaints() {
  try {
    console.log('🧪 Тестирование функционала жалоб...\n');

    // 1. Проверяем структуру таблиц
    console.log('📋 Проверка структуры таблиц:');
    
    const complaintsTable = await knex.schema.hasTable('complaints');
    console.log(`✅ Таблица complaints: ${complaintsTable ? 'существует' : 'НЕ НАЙДЕНА'}`);
    
    const userBansTable = await knex.schema.hasTable('user_bans');
    console.log(`✅ Таблица user_bans: ${userBansTable ? 'существует' : 'НЕ НАЙДЕНА'}`);
    
    const teamCommentTable = await knex.schema.hasTable('team_comment');
    console.log(`✅ Таблица team_comment: ${teamCommentTable ? 'существует' : 'НЕ НАЙДЕНА'}\n`);

    // 2. Проверяем существующие жалобы
    console.log('📊 Статистика жалоб:');
    const complaintsCount = await knex('complaints').count('* as count').first();
    console.log(`📈 Всего жалоб: ${complaintsCount.count}`);

    const complaintsByType = await knex('complaints')
      .select('type')
      .count('* as count')
      .groupBy('type');
    
    console.log('📊 Жалобы по типам:');
    complaintsByType.forEach(row => {
      console.log(`  - ${row.type}: ${row.count}`);
    });

    const complaintsByStatus = await knex('complaints')
      .select('status')
      .count('* as count')
      .groupBy('status');
    
    console.log('📊 Жалобы по статусам:');
    complaintsByStatus.forEach(row => {
      console.log(`  - ${row.status}: ${row.count}`);
    });

    // 3. Проверяем активные баны
    console.log('\n🚫 Активные ограничения пользователей:');
    const activeBans = await knex('user_bans')
      .where('is_active', true)
      .where(function() {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .select('type', 'reason', 'created_at', 'expires_at');

    if (activeBans.length > 0) {
      activeBans.forEach(ban => {
        const expiresText = ban.expires_at ? `до ${ban.expires_at}` : 'постоянно';
        console.log(`  - ${ban.type}: ${ban.reason} (${expiresText})`);
      });
    } else {
      console.log('  Нет активных ограничений');
    }

    // 4. Проверяем комментарии команд
    console.log('\n💬 Комментарии команд:');
    const teamCommentsCount = await knex('team_comment').count('* as count').first();
    console.log(`📈 Всего комментариев: ${teamCommentsCount.count}`);

    const recentComments = await knex('team_comment')
      .select('id', 'content', 'created_at', 'created_by')
      .orderBy('created_at', 'desc')
      .limit(3);

    if (recentComments.length > 0) {
      console.log('📝 Последние комментарии:');
      recentComments.forEach(comment => {
        const content = comment.content.length > 50 
          ? comment.content.substring(0, 50) + '...' 
          : comment.content;
        console.log(`  - ${comment.id}: "${content}" (${comment.created_at})`);
      });
    }

    console.log('\n✅ Тестирование завершено успешно!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await knex.destroy();
  }
}

// Запускаем тест
testComplaints();
