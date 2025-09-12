# Используем официальный Node.js образ
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev) для сборки
RUN npm ci && npm cache clean --force

# Копируем остальные файлы проекта
COPY . .

# Строим приложение для production
RUN npm run build

# Экспортируем порт
EXPOSE 3000

# Запускаем setup-db перед стартом приложения, затем preview
CMD ["sh", "-c", "npm run setup-db && npm run preview"]
