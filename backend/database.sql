CREATE DATABASE IF NOT EXISTS learnmate_ai;
USE learnmate_ai;

CREATE TABLE IF NOT EXISTS quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notes TEXT NOT NULL,
  number_of_questions INT NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  questions JSON NOT NULL,
  score DECIMAL(5,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question_sets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notes TEXT NOT NULL,
  number_of_questions INT NOT NULL,
  question_type VARCHAR(20) NOT NULL,
  questions JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



