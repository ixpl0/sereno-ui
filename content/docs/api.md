---
title: API Reference
description: Справочник по API Sereno
---

# API Reference

Базовый URL: `https://api.sereno.systems/v1`

## Аутентификация

Все запросы требуют заголовок `Authorization` с токеном команды.

```
Authorization: Bearer <your-team-token>
```

---

## Алерты

### GET /alerts

Получить список алертов.

**Параметры запроса:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| status | string | Фильтр по статусу: `active`, `resolved` |
| limit | number | Количество записей (по умолчанию 50) |

**Пример ответа:**

```json
{
  "alerts": [
    {
      "id": "alert_123",
      "title": "High CPU Usage",
      "severity": "warning",
      "status": "active",
      "created_at": 1705234567
    }
  ]
}
```

### POST /alerts/{id}/resolve

Отметить алерт как решённый.

**Пример ответа:**

```json
{
  "success": true
}
```

---

## Инциденты

### GET /incidents

Получить список инцидентов.

**Пример ответа:**

```json
{
  "incidents": [
    {
      "id": "inc_456",
      "title": "Database Connection Lost",
      "status": "investigating",
      "created_at": 1705234567
    }
  ]
}
```

### POST /incidents

Создать новый инцидент.

**Тело запроса:**

```json
{
  "title": "Service Outage",
  "description": "Users cannot access the dashboard"
}
```
