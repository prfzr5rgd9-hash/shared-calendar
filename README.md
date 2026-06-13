# 📅 Общий Календарь — PWA

Мобильное приложение-календарь с синхронизацией в реальном времени через Firebase.

---

## 🚀 Деплой за 5 шагов

### Шаг 1 — Firebase (бесплатная база данных)

1. Открой [console.firebase.google.com](https://console.firebase.google.com)
2. Нажми **"Add project"** → дай имя (например `my-calendar`) → создай
3. В левом меню → **Realtime Database** → **Create database**
   - Выбери регион (любой)
   - Выбери **"Start in test mode"** (можно потом закрыть)
4. В левом меню → **Project Settings** (шестерёнка) → **Your apps** → `</>`
5. Зарегистрируй web app → скопируй `firebaseConfig`
6. Открой файл `src/firebase.js` и вставь свои данные вместо `ЗАМЕНИ_НА_СВОЁ`

---

### Шаг 2 — Иконки приложения

Создай две PNG-иконки и положи в папку `public/icons/`:
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

Можно сгенерировать на [favicon.io](https://favicon.io) или [realfavicongenerator.net](https://realfavicongenerator.net)

---

### Шаг 3 — GitHub

```bash
git init
git add .
git commit -m "init"
# Создай репозиторий на github.com и запушь:
git remote add origin https://github.com/ТВО_ИМЯ/calendar.git
git push -u origin main
```

---

### Шаг 4 — Vercel (бесплатный хостинг)

1. Открой [vercel.com](https://vercel.com) → войди через GitHub
2. **"Add New Project"** → выбери свой репозиторий
3. Framework: **Create React App** (Vercel определит автоматически)
4. Нажми **Deploy** — через ~2 минуты приложение живое!

---

### Шаг 5 — Установить на телефон

**iPhone (Safari):**
1. Открой ссылку приложения в Safari
2. Нажми иконку **Поделиться** (квадрат со стрелкой вверх)
3. → **"На экран Домой"** → **Добавить**

**Android (Chrome):**
1. Открой ссылку в Chrome
2. Нажми **⋮** (три точки) → **"Добавить на главный экран"**
3. → **Установить**

---

## 📲 Как поделиться с участниками

Просто отправь им ссылку вида `https://ТВО-ПРОЕКТ.vercel.app`  
Все видят одни и те же события в реальном времени.

---

## 🔒 Закрыть базу данных (после тестирования)

В Firebase Console → Realtime Database → **Rules**:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Это оставляет открытый доступ для всех участников по ссылке.  
Если нужна авторизация — напиши, добавим Firebase Auth.

---

## 📁 Структура проекта

```
calendar-app/
├── public/
│   ├── index.html
│   ├── manifest.json      ← PWA конфиг
│   ├── sw.js              ← Service Worker
│   └── icons/
│       ├── icon-192.png   ← НУЖНО ДОБАВИТЬ
│       └── icon-512.png   ← НУЖНО ДОБАВИТЬ
├── src/
│   ├── App.js             ← весь UI и логика
│   ├── firebase.js        ← ЗАПОЛНИ СВОИМИ ДАННЫМИ
│   └── index.js
├── package.json
└── README.md
```
