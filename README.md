# Nest Auth

REST API для аутентификации пользователей на NestJS с JWT, refresh-токенами в httpOnly cookie и PostgreSQL (Prisma).

## Стек

- [NestJS](https://nestjs.com/) 11
- [Prisma](https://www.prisma.io/) 7 + PostgreSQL
- JWT (access token) + httpOnly cookie (refresh token)
- [Argon2](https://github.com/ranisalt/node-argon2) для хеширования паролей
- [Swagger](https://swagger.io/) для документации API

## Требования

- Node.js **20.19+** (см. `.nvmrc`)
- Yarn 4
- Docker (для PostgreSQL)

## Быстрый старт

```bash
# Установка зависимостей
yarn install

# Переменные окружения
cp .env.example .env

# Запуск PostgreSQL
docker compose up -d

# Генерация Prisma Client
yarn prisma:generate

# Применение миграций
yarn prisma:migrate

# Запуск в режиме разработки
yarn start:dev
```

API: `http://localhost:3000`  
Swagger: `http://localhost:3000/api`

## Переменные окружения

| Переменная | Описание | Пример |
|---|---|---|
| `NODE_ENV` | Окружение | `development` |
| `PORT` | Порт сервера (опционально) | `3000` |
| `JWT_SECRET` | Секрет для подписи JWT | `supersecretkey` |
| `JWT_ACCESS_TOKEN_TTL` | Время жизни access token | `2h` |
| `JWT_REFRESH_TOKEN_TTL` | Время жизни refresh token | `7d` |
| `COOKIE_DOMAIN` | Домен для cookie | `localhost` |
| `DATABASE_URL` | Строка подключения к PostgreSQL | см. `.env.example` |
| `POSTGRES_*` | Параметры для Docker Compose | см. `.env.example` |

## API

### Эндпоинты

| Метод | Путь | Описание | Авторизация |
|---|---|---|---|
| `GET` | `/` | Health check | — |
| `POST` | `/auth/register` | Регистрация | — |
| `POST` | `/auth/login` | Вход | — |
| `POST` | `/auth/refresh` | Обновление токенов | Cookie `refreshToken` |
| `POST` | `/auth/logout` | Выход | Cookie `refreshToken` |
| `GET` | `/auth/me` | Текущий пользователь | Bearer JWT |

### Схема аутентификации

```
1. POST /auth/register или POST /auth/login
   → accessToken в теле ответа
   → refreshToken в httpOnly cookie

2. Защищённые запросы
   → Authorization: Bearer <accessToken>

3. POST /auth/refresh
   → новый accessToken + обновлённый refresh cookie

4. POST /auth/logout
   → cookie refreshToken удаляется
```

### Примеры запросов

**Регистрация**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePassword123"}'
```

**Вход**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"john@example.com","password":"SecurePassword123"}'
```

**Профиль**

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

**Обновление токена**

```bash
curl -X POST http://localhost:3000/auth/refresh -b cookies.txt -c cookies.txt
```

## Swagger

Интерактивная документация доступна по адресу `/api`.

1. Выполни `POST /auth/login` или `POST /auth/register`.
2. Скопируй `accessToken` из ответа.
3. Нажми **Authorize** и вставь токен в поле `access-token`.
4. Вызови `GET /auth/me`.

JSON/YAML спецификация: `/api-json`, `/api-yaml`.

## Скрипты

```bash
yarn start:dev       # разработка с hot-reload
yarn build             # сборка
yarn lint              # ESLint
yarn prisma:generate   # генерация Prisma Client
yarn prisma:migrate    # миграции БД
yarn prisma:studio     # Prisma Studio (GUI для БД)
```

## Структура проекта

```
src/
├── auth/                 # модуль аутентификации
│   ├── dto/              # DTO запросов и ответов
│   ├── guards/           # JWT guard
│   ├── strategies/       # Passport JWT strategy
│   └── decorators/       # @Authorized()
├── prisma/               # PrismaService
├── config/               # конфигурация JWT, Swagger
└── common/               # middleware, pipes, общие DTO
prisma/
├── schema.prisma         # схема БД
└── migrations/           # миграции
```

## Модель данных

```prisma
User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime
  updatedAt DateTime
}
```
