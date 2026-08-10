# Авторизованные E2E-тесты InfoQuest

Эти тесты проверяют настоящую сессию Google/Supabase без хранения пароля Google в репозитории или GitHub Actions.

## 1. Подготовить отдельный аккаунт

Создайте отдельный Google-аккаунт только для тестирования InfoQuest. Не используйте личный аккаунт администратора. Один раз войдите этим аккаунтом на опубликованный сайт, чтобы профиль появился в Supabase. Роль `user` подходит для теста первого модуля.

## 2. Сохранить сессию локально

В корне проекта выполните:

```bash
npm run auth:capture
```

Откроется Chrome со страницей входа InfoQuest. Нажмите «Продолжить с Google» и завершите вход тестовым аккаунтом. После перехода на `/ru/profile` Playwright сохранит сессию в `tests/.auth/google-user.json`.

Файл содержит access/refresh token. Он исключён из Git и не должен отправляться в сообщения, issue или commit.

## 3. Проверить авторизованный сценарий локально

```bash
npm run test:e2e:auth
```

Тест проверит:

- открытие `/ru/profile` без возврата на login;
- открытие первого модуля;
- вызов Supabase RPC при завершении первого этапа;
- сохранение статуса этапа после перезагрузки страницы.

## 4. Передать сессию GitHub Actions

В PowerShell из корня проекта выполните:

```powershell
$state = [Convert]::ToBase64String([IO.File]::ReadAllBytes("tests/.auth/google-user.json"))
$state | gh secret set E2E_AUTH_STATE_B64
Remove-Variable state
```

Если GitHub CLI не установлен, создайте repository secret `E2E_AUTH_STATE_B64` вручную в GitHub: **Settings → Secrets and variables → Actions → New repository secret**. Значением должна быть Base64-строка файла сессии.

GitHub Actions намеренно завершится ошибкой, если этот secret не настроен: авторизованный тест нельзя незаметно пропустить.

## 5. Обновление сессии

Если Google или Supabase отзовёт refresh token, снова выполните `npm run auth:capture` и обновите `E2E_AUTH_STATE_B64`. Пароль Google для этого тестового аккаунта нигде в проекте не хранится.
