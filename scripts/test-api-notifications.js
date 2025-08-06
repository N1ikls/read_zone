import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testApiNotifications() {
  try {
    console.log('🧪 Тестирование API уведомлений...');

    // Авторизуемся как admin2
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'admin2@example.com',
        password: '123456',
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Ошибка авторизации');
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    const user = await loginResponse.json();
    console.log(`👤 Авторизован: ${user.name} (${user.email})`);

    // Получаем уведомления
    const notificationsResponse = await fetch(`${API_BASE}/notifications`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
    });

    if (!notificationsResponse.ok) {
      console.log('❌ Ошибка получения уведомлений');
      return;
    }

    const notificationsData = await notificationsResponse.json();
    console.log(
      `📋 Найдено ${notificationsData.notifications.length} уведомлений`,
    );
    console.log(`🔔 Непрочитанных: ${notificationsData.unread_count}`);

    if (notificationsData.notifications.length > 0) {
      console.log('\n📋 Последние уведомления:');
      notificationsData.notifications.slice(0, 3).forEach((notif, index) => {
        const status = notif.is_read ? '✅' : '🔔';
        console.log(`${index + 1}. ${status} [${notif.type}] ${notif.title}`);
        console.log(`   ${notif.message}`);
        if (notif.metadata) {
          console.log(`   Метаданные: ${JSON.stringify(notif.metadata)}`);
        }
      });

      // Тестируем пометку как прочитанное
      const firstNotifId = notificationsData.notifications[0].id;
      const markReadResponse = await fetch(
        `${API_BASE}/notifications/mark-read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies,
          },
          body: JSON.stringify({
            notification_ids: [firstNotifId],
          }),
        },
      );

      if (markReadResponse.ok) {
        const markReadData = await markReadResponse.json();
        console.log(`\n✅ Уведомление помечено как прочитанное`);
        console.log(`🔔 Непрочитанных осталось: ${markReadData.unread_count}`);
      }
    }

    // Получаем настройки уведомлений
    const settingsResponse = await fetch(`${API_BASE}/notifications/settings`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
    });

    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      console.log('\n⚙️ Настройки уведомлений:');
      console.log(
        `- Новые книги от авторов: ${settingsData.settings.user_new_book_enabled ? '✅' : '❌'}`,
      );
      console.log(
        `- Новые главы от авторов: ${settingsData.settings.user_new_chapter_enabled ? '✅' : '❌'}`,
      );
      console.log(
        `- Новые главы в закладках: ${settingsData.settings.book_new_chapter_enabled ? '✅' : '❌'}`,
      );
      console.log(
        `- Ответы на комментарии: ${settingsData.settings.comment_reply_enabled ? '✅' : '❌'}`,
      );
      console.log(
        `- Email уведомления: ${settingsData.settings.email_notifications_enabled ? '✅' : '❌'}`,
      );
    }

    // Получаем статистику
    const statsResponse = await fetch(`${API_BASE}/notifications/stats`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('\n📊 Статистика уведомлений:');

      if (statsData.stats) {
        console.log(`- Всего: ${statsData.stats.total || 0}`);
        console.log(`- Непрочитанных: ${statsData.stats.unread || 0}`);

        if (statsData.stats.by_type && statsData.stats.by_type.length > 0) {
          console.log('- По типам:');
          statsData.stats.by_type.forEach((stat) => {
            console.log(
              `  ${stat.type}: ${stat.count} (непрочитанных: ${stat.unread_count || 0})`,
            );
          });
        }
      } else {
        console.log('Статистика недоступна');
      }
    } else {
      console.log('❌ Ошибка получения статистики');
    }

    // Тестируем обновление настроек
    const updateSettingsResponse = await fetch(
      `${API_BASE}/notifications/settings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        body: JSON.stringify({
          comment_liked_enabled: true,
          email_notifications_enabled: false,
        }),
      },
    );

    if (updateSettingsResponse.ok) {
      const updateData = await updateSettingsResponse.json();
      console.log('\n✅ Настройки обновлены');
      console.log(
        `- Лайки комментариев: ${updateData.settings.comment_liked_enabled ? '✅' : '❌'}`,
      );
    }
  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error);
  }
}

testApiNotifications();
