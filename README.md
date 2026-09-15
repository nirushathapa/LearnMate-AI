# LearnMate AI

LearnMate AI turns study notes or uploaded files into source-grounded quizzes and study questions. The React frontend calls an Express backend, the backend extracts text and sends it to local LM Studio, and MySQL stores saved quizzes and question sets.

## Setup

1. Create the database by running `backend/database.sql` in MySQL.
2. If an older LearnMate AI database already exists, run `backend/database-migration.sql` once.
3. Copy `backend/.env.example` to `backend/.env` and set the LM Studio URL and model.
4. Install dependencies and start the backend:

```text
cd backend
npm install
npm start
```

5. Start the frontend in another terminal:

```text
cd frontend
npm install
npm run dev
```

The backend runs on `http://localhost:5000`. Set `VITE_API_URL` in `frontend/.env` only when the backend uses another URL.

## Main API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/test` | Check that the backend is running |
| POST | `/api/quiz/generate` | Generate a multiple-choice quiz |
| POST | `/api/quiz/save` | Save a completed quiz |
| GET | `/api/quizzes` | List saved quizzes |
| POST | `/api/questions/generate` | Generate study questions |
| POST | `/api/questions/save` | Save a question set |
| GET | `/api/questions` | List saved question sets |

Generation requests use `notes`, `numberOfQuestions` (`3`, `5`, or `10`), and `difficulty` or `questionType`. File uploads use the `files` field.

## How it works

- The frontend sends notes and selected settings to Express using `fetch`.
- Express extracts text from text, PDF, DOCX, or image files.
- The backend sends the cleaned source to LM Studio through its local OpenAI-compatible API. No cloud API key is required.
- AI output is parsed and checked for the requested number of source-grounded questions before it reaches the frontend.
- Quiz answers are compared with each question's `correctAnswer`; the percentage is calculated from the number of correct answers.
- Saved JSON questions, scores, and question totals are stored in MySQL.
- Missing keys, quota errors, timeouts, invalid AI JSON, empty input, and unsupported counts return readable error messages.

## Validation commands

```text
cd frontend
npm run lint
npm run build
```

```text
cd backend
node --check server.js
node --check services/aiService.js
```
