# Code Review Checklist

## 1. DRY (Don't Repeat Yourself)
- [x] Поиск дублирующегося кода в компонентах
- [x] Выявление повторяющейся логики для выноса в composables
- [x] Проверка переиспользования стилей

### Выполненные улучшения:
- `utils/formatters.ts` — вынесены formatDate, formatDevice, formatContactKind
- `useApiMutation` composable — для унификации обработки API-мутаций
- `useEditableField` composable — для управления состоянием редактирования полей
- `BaseHeader.vue` — общий компонент для AppHeader и PublicHeader
- `UnderConstructionPage.vue` — компонент для placeholder страниц

## 2. Безопасность
- [x] XSS-уязвимости (v-html, пользовательский ввод)
- [x] Утечки токенов/credentials в коде
- [x] CSRF-защита
- [x] Проверка зависимостей (`pnpm audit`)

### Результаты проверки:

**XSS:** Не найдено. v-html и innerHTML не используются.

**Credentials:** Не найдено hardcoded токенов. Токены хранятся в cookies через useCookie.

**CSRF:** Аутентификация через cookies. Рекомендуется настроить SameSite=Strict на бэкенде.

**Уязвимые зависимости (pnpm audit):**
| Пакет | Уровень | Проблема | Исправление |
|-------|---------|----------|-------------|
| devalue | high | DoS через memory exhaustion | Обновить nuxt |
| h3 | high | Request Smuggling | Обновить @nuxt/eslint |
| tar | high | Arbitrary File Overwrite | Обновить nuxt |
| diff | low | DoS в parsePatch | Обновить nuxt |

**Статус:** Исправлено обновлением пакетов. Overrides больше не нужны.

## 3. Типизация TypeScript
- [x] Отсутствие `any` и необоснованных `as` кастов
- [x] Правильное использование generics
- [x] Полнота типов для API-ответов

### Результаты проверки:

**`any`:** Используется только в автогенерированных файлах `api/` — OK.

**`as` касты:** Обоснованные касты:
- DOM события (`event.target as HTMLInputElement`) — стандартный паттерн
- API responses в composables — необходимо из-за генерика hey-api клиента
- OAuth provider проверки после `includes()` — OK

**Исправлено:**
- Создан тип `UserWithLanguage` в `types/api.ts` (расширение автогенерированного типа)
- Убраны хаки с кастами `as { language?: string }` в `profile.vue`
- Исправлена ошибка типизации `user.email` в `UserDropdown.vue`

## 4. Производительность
- [x] Bundle size (lazy loading, code splitting)
- [x] Избыточные ре-рендеры компонентов
- [x] Правильное использование `computed` vs `ref`
- [x] Оптимизация изображений и ассетов

### Результаты проверки:

**Bundle size:** Nuxt автоматически делает code splitting для страниц. OK.

**Изображения:** Нет статических изображений, используются только иконки через @nuxt/icon. OK.

**computed vs ref:** Правильно используются — фильтрации в computed, не в шаблонах.

**Исправлено:**
- Memory leak в `useTheme.ts` — добавлен `removeEventListener` в `onUnmounted`

## 5. Архитектура и структура
- [x] Разделение ответственности компонентов
- [x] Правильное разделение на слои (UI, логика, API)
- [x] Консистентность структуры файлов

### Результаты проверки:

**Оценка: 9/10**

**Хорошо:**
- UI компоненты (`components/ui/`) — чистые, без бизнес-логики ✅
- Composables правильно инкапсулируют API логику ✅
- Store только для глобального состояния (токен) ✅
- Структура файлов консистентна ✅

**Исправлено:**
- `UserDropdown.vue` — теперь эмитит `@logout` event вместо прямого вызова logout
- `AppHeader.vue` / `PublicHeader.vue` — получают user через props
- Layouts (`default.vue`, `public.vue`) — загружают user и обрабатывают logout

**Оставшиеся рекомендации:**
- Pages содержат много UI state — можно вынести в composables (низкий приоритет)

## 6. Доступность (a11y)
- [x] Семантическая разметка
- [x] ARIA-атрибуты
- [ ] Навигация с клавиатуры (требует ручного тестирования)
- [ ] Контрастность цветов (требует ручного тестирования)

### Результаты проверки:

**Исправлено:**
- `UiToast.vue` — добавлен `aria-live="polite"`, `role="region"`, `role="alert/status"` для уведомлений
- `UserDropdown.vue` — добавлены `aria-haspopup`, `aria-expanded`, `aria-controls`, `role="menu/menuitem"`
- `UiSelect.vue` — добавлены `aria-invalid`, `aria-describedby`, поддержка `hint`
- `BaseHeader.vue` — добавлен `aria-label` на кнопку меню
- `CookieConsent.vue` — исправлен `aria-controls`, добавлен `id` на контролируемый элемент
- Декоративные иконки — добавлен `aria-hidden="true"`

**Оставшиеся рекомендации:**
- Добавить skip-to-main-content ссылку (низкий приоритет)
- Проверить навигацию с клавиатуры вручную
- Проверить контрастность цветов с помощью инструментов (axe, Lighthouse)

## 7. Обработка ошибок
- [x] Обработка ошибок API
- [x] Loading/error states в UI
- [x] Edge cases и граничные условия

### Результаты проверки:

**Подход:** Fail first — ошибки не скрываются, пробрасываются наверх для быстрого обнаружения.

**Текущее состояние:**
- `useEditableField` — ошибки пробрасываются, поле остаётся в режиме редактирования при ошибке ✅
- `useFetch` в Nuxt — ошибки видны в консоли и devtools ✅
- Toast уведомления показываются при ошибках API ✅

**Исправлено:**
- `blog/[...slug].vue` — добавлен `throw createError({ statusCode: 404 })` если страница не найдена
- `docs/[...slug].vue` — добавлен `throw createError({ statusCode: 404 })` если страница не найдена

## 8. Зависимости
- [x] Устаревшие пакеты
- [x] Неиспользуемые зависимости
- [x] Дублирующиеся зависимости

### Результаты проверки:

**Устаревшие пакеты (`pnpm outdated`):**
- Все пакеты обновлены до последних версий ✅
- Уязвимости исправлены в новых версиях, overrides удалены

**Неиспользуемые зависимости:**
- Удалена секция `msw` из package.json (остаток от удалённой зависимости)
- Удалён файл `public/mockServiceWorker.js`

**Дублирующиеся зависимости (`pnpm dedupe --check`):**
- Есть дубликаты в транзитивных зависимостях (`ufo`, `@babel/code-frame`, `@vue/shared`)
- Можно исправить через `pnpm dedupe` (опционально)

## 9. Консистентность кода
- [x] Единообразие именования
- [x] Соблюдение ESLint правил
- [x] Соответствие code style из CLAUDE.md

### Результаты проверки:

**Оценка: 95%**

**Именование файлов:** ✅
- Компоненты в PascalCase
- Composables начинаются с `use`
- Utils в camelCase

**Именование в коде:** ✅
- Переменные и функции в camelCase
- Константы в UPPER_SNAKE_CASE
- Типы и интерфейсы в PascalCase

**Паттерны:** ✅
- `const` везде где возможно
- Arrow functions
- Деструктуризация
- Нет лишних комментариев

**Vue паттерны:** ✅
- `<script setup lang="ts">`
- `ref` вместо `reactive`
- Правильный порядок секций

**ESLint:** ✅ Проходит без ошибок

**Примечание:**
- `useMobileMenus.ts` использует глобальное состояние — это намеренно для shared state между компонентами
