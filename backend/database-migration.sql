USE learnmate_ai;

ALTER TABLE quizzes ADD COLUMN number_of_questions INT NULL AFTER notes;
UPDATE quizzes SET number_of_questions = JSON_LENGTH(questions) WHERE number_of_questions IS NULL;
ALTER TABLE quizzes
  MODIFY number_of_questions INT NOT NULL,
  MODIFY difficulty VARCHAR(20) NOT NULL,
  MODIFY score INT DEFAULT NULL,
  MODIFY total_questions INT NOT NULL,
  MODIFY created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE question_sets ADD COLUMN number_of_questions INT NULL AFTER notes;
ALTER TABLE question_sets ADD COLUMN difficulty VARCHAR(20) NULL AFTER number_of_questions;
UPDATE question_sets
SET number_of_questions = JSON_LENGTH(questions), difficulty = question_type
WHERE number_of_questions IS NULL;
ALTER TABLE question_sets
  MODIFY number_of_questions INT NOT NULL,
  MODIFY difficulty VARCHAR(20) NULL,
  MODIFY created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  DROP COLUMN question_type;
