# InfoQuest

Двуязычная образовательная веб-игра о цифровой безопасности для школьников, учителей, семей и сообщества. Интерфейс доступен на русском и румынском языках.

Актуальный scope: на карте показаны восемь модулей, но в текущем MVP для прохождения открыт только модуль «Фальшивый звонок оператора» с восемью этапами. Остальные модули отмечены как «Скоро». Подробности зафиксированы в [`docs/mvp-scope.md`](docs/mvp-scope.md).

## Стек

- Next.js 16, React 19 и TypeScript;
- Tailwind CSS 4, Base UI Dialog и Framer Motion;
- Supabase Auth/Postgres для Google-входа, профилей, ролей, прогресса и AI-квот;
- OpenAI-совместимый AI-провайдер для анализа текста и транскрипции аудио;
- Vitest и Playwright;
- Vercel для публикации.

## Локальный запуск

Требуется Node.js 20 или новее.

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

После заполнения `.env.local` откройте [http://localhost:3000/ro](http://localhost:3000/ro) или [http://localhost:3000/ru](http://localhost:3000/ru).

## Переменные окружения

| Переменная | Где используется | Обязательность |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical, hreflang, sitemap и локальные OAuth-переходы | рекомендуется; production fallback указывает на Vercel-домен |
| `NEXT_PUBLIC_SUPABASE_URL` | браузерный и серверный Supabase-клиенты | обязательно |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | публичный Supabase-ключ с RLS | обязательно |
| `AI_API_KEY` | серверный вызов AI-провайдера | обязательно для Chrono |
| `AI_API_BASE_URL` | OpenAI-совместимый `/v1` endpoint | обязательно для внешнего провайдера |
| `AI_ANALYSIS_MODEL` | модель анализа мошенничества | обязательно для выбранного провайдера |
| `AI_TRANSCRIPTION_MODEL` | модель распознавания аудио | обязательно для аудио |
| `AI_REQUEST_TIMEOUT_MS` | таймаут AI-запроса, ограничивается диапазоном 10–55 секунд | необязательно |
| `BLOCKLIST_IP_SALT` | необратимые отпечатки IP при блокировке | обязательно в Production и Preview |

Секретные значения нельзя добавлять с префиксом `NEXT_PUBLIC_`, коммитить или отправлять в сообщения. Конкретные ID AI-моделей должны существовать в кабинете выбранного провайдера.

## Supabase и Google OAuth

1. Создайте проект Supabase и заполните две публичные переменные.
2. Последовательно примените SQL-файлы из `supabase/migrations` или выполните `supabase db push` через настроенный Supabase CLI.
3. В Google Cloud создайте OAuth Client типа Web application.
4. В Google Authorized redirect URIs добавьте Supabase callback вида `https://<project-ref>.supabase.co/auth/v1/callback`.
5. В Supabase Authentication → URL Configuration добавьте локальный и production URL, включая `/auth/callback`.
6. В Supabase Google provider сохраните Client ID и новый Client Secret.

После изменения OAuth-настроек или Vercel Environment Variables сделайте новое развёртывание. Старые раскрытые secrets необходимо отзывать, а не только удалять из файлов.

Типы live-схемы обновляются командой:

```bash
npm run supabase:types
```

## AI Chrono

Chrono доступен только ролям `student`, `teacher` и `administrator`. API проверяет Supabase-сессию, роль, пользовательские и проектные квоты, конкурентный lock и таймаут. Аудио ограничено 4 МиБ и тремя анализами в день на пользователя. Денежный hard cap дополнительно настраивается в кабинете AI-провайдера.

Текст и аудио передаются внешнему AI-провайдеру только после согласия пользователя. Актуальное описание обработки находится на страницах политики конфиденциальности; перед публичным пилотом нужна юридическая проверка.

## Проверки

```bash
npm run check
```

Команда запускает ESLint, TypeScript, unit/contract-тесты и production build.

Публичные браузерные тесты:

```bash
npm run test:e2e
```

Полный набор:

```bash
npm run check:all
```

Настройка отдельного тестового Google-аккаунта и зашифрованной CI-сессии описана в [`docs/authenticated-e2e-setup.md`](docs/authenticated-e2e-setup.md).

## Развёртывание

Production размещён на `https://infoquest-cahul.vercel.app`. В Vercel добавьте переменные из `.env.example` для Production и Preview, затем выполните Redeploy без повторного использования старых секретов.

## Документация

- [`docs/application-overview.md`](docs/application-overview.md) — полное описание приложения, функций, страниц, данных и архитектуры;
- [`docs/mvp-scope.md`](docs/mvp-scope.md) — актуальный объём MVP;
- [`docs/public-pilot-definition-of-done.md`](docs/public-pilot-definition-of-done.md) — обязательные критерии GO/NO-GO публичного пилота;
- [`docs/architecture/adr-001-modular-monolith-boundaries.md`](docs/architecture/adr-001-modular-monolith-boundaries.md) — архитектурные границы и компромиссы;
- [`analis.md`](analis.md) — основной технический и продуктовый аудит;
- [`docs/privacy-legal-review-checklist.md`](docs/privacy-legal-review-checklist.md) — чек-лист юридической проверки;
- [`docs/authenticated-e2e-setup.md`](docs/authenticated-e2e-setup.md) — авторизованные E2E-тесты.
