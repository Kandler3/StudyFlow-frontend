## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Режимы работы

### Мок-режим (разработка без бэкенда)
```
VITE_USE_MOCKS=true
npm run dev
```

- Не требует запущенного бэкенда
- Все данные in-memory (сбрасываются при перезагрузке)
- Мгновенный вход как тьютор или студент

### Реальный режим (с бэкендом)
```
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost  # или ngrok URL
npm run dev
```

- Требуется запущенный docker-compose up в studyflow_backend
- Авторизация через Telegram Mini App (tma initData)
- Все запросы идут в реальный бэкенд
