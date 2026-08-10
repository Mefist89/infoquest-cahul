# InfoQuest Cahul

Двуязычная образовательная веб-игра о цифровой безопасности для школьников, учителей, семей и сообщества Кагула.

## Возможности главной страницы

- интерфейс на русском и румынском языках;
- карта из пяти миссий MVP и трёх будущих миссий;
- адаптивная версия для компьютеров и телефонов;
- прогресс щита, бейджи и материалы проекта;
- QR-код для быстрого открытия игры.

## Стек

Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand, next-intl и Playwright.

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Проверка

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Полная проверка, включая браузерные smoke-тесты:

```bash
npm run check:all
```

Настройка тестовой Google-сессии для проверки профиля и сохранения прогресса описана в [`docs/authenticated-e2e-setup.md`](docs/authenticated-e2e-setup.md).
