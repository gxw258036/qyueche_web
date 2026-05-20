import type Database from 'better-sqlite3';
import path from 'path';
const betterSqlite3 = require('better-sqlite3');

const dbPath = path.join(__dirname, '../data', 'vocabulary.db');
const db = betterSqlite3(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK(grade >= 2 AND grade <= 6),
    dailyTaskCount INTEGER DEFAULT 30,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, grade)
  );

  CREATE TABLE IF NOT EXISTS vocabulary (
    id TEXT PRIMARY KEY,
    word TEXT NOT NULL,
    meaning TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK(grade >= 2 AND grade <= 6),
    studentId TEXT,
    type TEXT NOT NULL DEFAULT 'word' CHECK(type IN ('word', 'phrase', 'sentence')),
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'mastered', 'error')),
    correctCount INTEGER DEFAULT 0,
    errorCount INTEGER DEFAULT 0,
    addedAt TEXT NOT NULL,
    lastReviewedAt TEXT,
    isCustom INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS daily_tasks (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    grade INTEGER NOT NULL,
    studentId TEXT,
    completed INTEGER DEFAULT 0,
    markedErrorWords TEXT,
    newWords TEXT,
    reviewedWords TEXT,
    correctCount INTEGER DEFAULT 0,
    errorCount INTEGER DEFAULT 0,
    totalCount INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(date, grade, studentId)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    currentGrade INTEGER DEFAULT 4,
    currentStudentId TEXT,
    lastStudyDate TEXT,
    dailyTaskCount INTEGER DEFAULT 30,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (currentStudentId) REFERENCES students(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
  CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
  CREATE INDEX IF NOT EXISTS idx_vocabulary_grade ON vocabulary(grade);
  CREATE INDEX IF NOT EXISTS idx_vocabulary_status ON vocabulary(status);
  CREATE INDEX IF NOT EXISTS idx_vocabulary_studentId ON vocabulary(studentId);
  CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON daily_tasks(date);
  CREATE INDEX IF NOT EXISTS idx_daily_tasks_studentId ON daily_tasks(studentId);
`);

// 为 vocabulary 表添加缺失的字段
try {
  db.prepare('ALTER TABLE vocabulary ADD COLUMN type TEXT DEFAULT "word"').run();
} catch (e) {
  // 列已存在，忽略
}

// 为 daily_tasks 表添加缺失的字段
try {
  db.prepare('ALTER TABLE daily_tasks ADD COLUMN newWords TEXT').run();
} catch (e) {
  // 列已存在，忽略
}
try {
  db.prepare('ALTER TABLE daily_tasks ADD COLUMN reviewedWords TEXT').run();
} catch (e) {
  // 列已存在，忽略
}
try {
  db.prepare('ALTER TABLE daily_tasks ADD COLUMN correctCount INTEGER DEFAULT 0').run();
} catch (e) {
  // 列已存在，忽略
}
try {
  db.prepare('ALTER TABLE daily_tasks ADD COLUMN errorCount INTEGER DEFAULT 0').run();
} catch (e) {
  // 列已存在，忽略
}
try {
  db.prepare('ALTER TABLE daily_tasks ADD COLUMN totalCount INTEGER DEFAULT 0').run();
} catch (e) {
  // 列已存在，忽略
}

// 为 students 表添加缺失的字段
try {
  db.prepare('ALTER TABLE students ADD COLUMN dailyTaskCount INTEGER DEFAULT 30').run();
} catch (e) {
  // 列已存在，忽略
}

// 为 settings 表添加缺失的字段
try {
  db.prepare('ALTER TABLE settings ADD COLUMN dailyTaskCount INTEGER DEFAULT 30').run();
} catch (e) {
  // 列已存在，忽略
}

const initSettings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
if (!initSettings) {
  const today = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO settings (id, currentGrade, lastStudyDate, dailyTaskCount) VALUES (1, 4, ?, 30)').run(today);
}

export default db;
