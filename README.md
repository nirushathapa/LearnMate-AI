# LearnMate AI

LearnMate AI is a simple student tool for turning pasted study notes into multiple-choice quizzes and study questions.

## Technology

- React, Vite, and JavaScript frontend
- Node.js and Express backend
- MySQL database through `mysql2`
- Optional AI provider; a mock response is used when no API key is configured

## Install

```powershell
npm --prefix frontend install
npm --prefix backend install
```

## MySQL setup

1. Start your MySQL server.
2. Open MySQL Workbench or a MySQL terminal.
3. If you use **MySQL Workbench**, choose **File > Open SQL Script**, open `backend/database.sql`, and click the lightning-bolt **Execute** button. Do not type `SOURCE` into the Workbench query editor.

From the MySQL command-line client, run this command instead:

```powershell
mysql -u root -p < "C:\Users\Nirusha\OneDrive\Desktop\LearnMate AI\backend\database.sql"
```

If you are already inside the MySQL command-line client, use:

```sql
SOURCE "C:/Users/Nirusha/OneDrive/Desktop/LearnMate AI/backend/database.sql";
```

Copy `backend/.env.example` to `backend/.env` and set your MySQL values:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=learnmate_ai
AI_API_KEY=
AI_MODEL=gpt-4o-mini
```

Leave `AI_API_KEY` empty to use the built-in mock questions. Add a provider key to enable AI-generated questions. The key is read only by the backend.

Do not commit `.env`. The root `.gitignore` already excludes it.

## Run

Start the backend in one terminal:

```powershell
npm --prefix backend run dev
```

Start the frontend in another:

```powershell
npm --prefix frontend run dev
```

Open `http://localhost:5173`.

## API

- `POST /api/quiz/generate`
- `POST /api/quiz/save`
- `GET /api/quiz`
- `POST /api/questions/generate`
- `POST /api/questions/save`
- `GET /api/questions`
