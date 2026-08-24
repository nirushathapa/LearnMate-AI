# LearnMate AI

LearnMate AI is a beginner-friendly student learning platform. Students can organize notes, practice flashcards and quizzes, plan study tasks, and view learning progress.

## Features

- Landing page and student dashboard
- Simple signup and login with JWT
- Local note uploads for PDF, DOCX, and TXT files
- Notes, study plans, quizzes, flashcards, and progress API structure
- Demo summary and chat responses ready for a future AI service
- Responsive layout for desktop and mobile

## Technologies

React, Vite, JavaScript, regular CSS, Node.js, Express, MongoDB, Mongoose, bcryptjs, JSON Web Token, Multer, dotenv, and cors.

## Project Structure

- `frontend/` contains the React and Vite application.
- `backend/` contains the Express API, Mongoose models, routes, authentication middleware, and local uploads folder.

## Installation

Install frontend packages:

```powershell
cd frontend
npm install
```

Install backend packages:

```powershell
cd ..\backend
npm install
```

## MongoDB Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGO_URI` to your local MongoDB or MongoDB Atlas connection string.
3. Set `JWT_SECRET` to a private random string.
4. Keep `.env` private. It is already included in `.gitignore`.

## Run the Project

Start the frontend in one terminal:

```powershell
npm --prefix frontend run dev
```

Start the backend in another terminal:

```powershell
npm --prefix backend run dev
```

The frontend normally runs at `http://localhost:5173` and the backend at `http://localhost:5000`.

Test the backend after MongoDB is configured:

```text
GET http://localhost:5000/api/test
```

## Future Improvements

Connect a real AI provider, add PDF text extraction, improve file management, and add more complete database-backed dashboard data.
