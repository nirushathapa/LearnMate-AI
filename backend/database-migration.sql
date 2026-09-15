USE learnmate_ai;

ALTER TABLE quizzes ADD COLUMN total_questions INT NULL AFTER score;
UPDATE quizzes SET total_questions = JSON_LENGTH(questions);
ALTER TABLE quizzes
  MODIFY difficulty VARCHAR(10) DEFAULT 'medium',
  MODIFY score INT DEFAULT NULL,
  MODIFY total_questions INT NOT NULL,
  MODIFY created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  DROP COLUMN number_of_questions;

ALTER TABLE question_sets
  MODIFY question_type VARCHAR(10) DEFAULT 'mixed',
  MODIFY created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  DROP COLUMN number_of_questions;
