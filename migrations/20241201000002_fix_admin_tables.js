export async function up(knex) {
  // Создаем таблицу expenses для статистики расходов
  await knex.schema.createTable('expenses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').unsigned().notNullable().references('user.id');
    
    table.datetime('updated_at').nullable();
    table.uuid('updated_by').unsigned().nullable().references('user.id');
    
    table.enu('type', ['advertising', 'server', 'other']).notNullable();
    table.integer('amount').unsigned().notNullable(); // сумма в копейках
    table.text('description').nullable();
    table.text('details').nullable();
    
    table.index('type');
    table.index('created_at');
  });

  // Добавляем недостающие поля в таблицу pay
  await knex.schema.alterTable('pay', (table) => {
    // Добавляем поле amount
    table.integer('amount').unsigned().nullable();
    
    // Добавляем поле status для отслеживания статуса платежа
    table.enu('status', ['pending', 'completed', 'failed', 'cancelled']).notNullable().default('pending');
  });

  // Обновляем enum типов в таблице pay для поддержки новых типов платежей
  await knex.raw(`
    ALTER TABLE pay 
    DROP CONSTRAINT pay_type_check;
  `);
  
  await knex.raw(`
    ALTER TABLE pay 
    ADD CONSTRAINT pay_type_check 
    CHECK (type IN ('chapters', 'chapter_purchase', 'donation', 'subscription', 'advertising'));
  `);

  // Создаем таблицу для отслеживания уникальных посетителей
  await knex.schema.createTable('site_visitors', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.string('session_id', 255).notNullable();
    table.string('ip_address', 45).nullable(); // поддержка IPv6
    table.string('user_agent', 500).nullable();
    table.uuid('user_id').unsigned().nullable().references('user.id').onDelete('SET NULL');
    
    table.datetime('first_visit').notNullable().defaultTo(knex.fn.now());
    table.datetime('last_visit').notNullable().defaultTo(knex.fn.now());
    table.integer('page_views').notNullable().default(1);
    
    table.unique('session_id');
    table.index('user_id');
    table.index('ip_address');
    table.index('first_visit');
    table.index('last_visit');
  });

  // Добавляем тестовые данные для демонстрации
  
  // Добавляем тестовые расходы
  const testExpenses = [
    {
      id: knex.raw('gen_random_uuid()'),
      created_by: knex.raw('(SELECT id FROM "user" WHERE role = \'admin\' LIMIT 1)'),
      type: 'advertising',
      amount: 50000, // 500 рублей в копейках
      description: 'Реклама в социальных сетях',
      created_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      created_by: knex.raw('(SELECT id FROM "user" WHERE role = \'admin\' LIMIT 1)'),
      type: 'server',
      amount: 120000, // 1200 рублей в копейках
      description: 'Оплата хостинга',
      created_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      created_by: knex.raw('(SELECT id FROM "user" WHERE role = \'admin\' LIMIT 1)'),
      type: 'other',
      amount: 25000, // 250 рублей в копейках
      description: 'Прочие расходы',
      created_at: knex.fn.now()
    }
  ];

  // Добавляем тестовые доходы
  const testRevenues = [
    {
      id: knex.raw('gen_random_uuid()'),
      created_by: knex.raw('(SELECT id FROM "user" LIMIT 1)'),
      type: 'chapter_purchase',
      amount: 15000, // 150 рублей в копейках
      status: 'completed',
      details: 'Покупка главы',
      created_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      created_by: knex.raw('(SELECT id FROM "user" LIMIT 1)'),
      type: 'donation',
      amount: 100000, // 1000 рублей в копейках
      status: 'completed',
      details: 'Донат от пользователя',
      created_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      created_by: knex.raw('(SELECT id FROM "user" LIMIT 1)'),
      type: 'subscription',
      amount: 50000, // 500 рублей в копейках
      status: 'completed',
      details: 'Подписка на месяц',
      created_at: knex.fn.now()
    }
  ];

  // Вставляем тестовые данные только если есть пользователи
  const userExists = await knex('user').first();
  if (userExists) {
    await knex('expenses').insert(testExpenses);
    
    // Обновляем существующие записи pay, добавляя amount
    await knex.raw(`
      UPDATE pay 
      SET amount = 10000, status = 'completed' 
      WHERE amount IS NULL
    `);
    
    await knex('pay').insert(testRevenues);
  }

  // Добавляем тестовых посетителей
  const testVisitors = [];
  for (let i = 0; i < 100; i++) {
    testVisitors.push({
      id: knex.raw('gen_random_uuid()'),
      session_id: `session_${i}_${Date.now()}`,
      ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
      user_agent: 'Mozilla/5.0 Test Browser',
      page_views: Math.floor(Math.random() * 10) + 1,
      first_visit: knex.raw(`NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days'`),
      last_visit: knex.raw(`NOW() - INTERVAL '${Math.floor(Math.random() * 7)} days'`)
    });
  }
  
  await knex('site_visitors').insert(testVisitors);
}

export async function down(knex) {
  await knex.schema.dropTable('site_visitors');
  
  await knex.schema.alterTable('pay', (table) => {
    table.dropColumn('amount');
    table.dropColumn('status');
  });
  
  // Возвращаем оригинальный constraint
  await knex.raw(`
    ALTER TABLE pay 
    DROP CONSTRAINT pay_type_check;
  `);
  
  await knex.raw(`
    ALTER TABLE pay 
    ADD CONSTRAINT pay_type_check 
    CHECK (type IN ('chapters'));
  `);
  
  await knex.schema.dropTable('expenses');
}
