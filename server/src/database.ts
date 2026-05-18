import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'vocabulary.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS vocabulary (
    id TEXT PRIMARY KEY,
    word TEXT NOT NULL,
    meaning TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK(grade >= 2 AND grade <= 6),
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'mastered', 'error')),
    correctCount INTEGER DEFAULT 0,
    errorCount INTEGER DEFAULT 0,
    addedAt TEXT NOT NULL,
    lastReviewedAt TEXT,
    isCustom INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS daily_tasks (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    grade INTEGER NOT NULL,
    completed INTEGER DEFAULT 0,
    markedErrorWords TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, grade)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    currentGrade INTEGER DEFAULT 4,
    lastStudyDate TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_vocabulary_grade ON vocabulary(grade);
  CREATE INDEX IF NOT EXISTS idx_vocabulary_status ON vocabulary(status);
  CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON daily_tasks(date);
`);

const initSettings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
if (!initSettings) {
  const today = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO settings (id, currentGrade, lastStudyDate) VALUES (1, 4, ?)').run(today);
}

export default db;
