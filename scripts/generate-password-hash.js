import bcrypt from 'bcrypt';

// Генерируем правильный хеш для пароля admin123
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('Пароль:', password);
console.log('Хеш:', hash);
console.log('\nSQL команда для обновления:');
console.log(`UPDATE "user" SET password = '${hash}' WHERE email = 'admin1@example.com';`);

// Проверяем, что хеш работает
const isValid = bcrypt.compareSync(password, hash);
console.log('\nПроверка хеша:', isValid ? '✅ Корректный' : '❌ Некорректный');
