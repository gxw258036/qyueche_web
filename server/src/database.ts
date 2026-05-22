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
    dailyTaskCount INTEGER DEFAULT 30,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
  );

  CREATE TABLE IF NOT EXISTS vocabulary (
    id TEXT PRIMARY KEY,
    word TEXT NOT NULL,
    meaning TEXT NOT NULL,
    studentId TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'word' CHECK(type IN ('word', 'phrase', 'sentence')),
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'mastered', 'error')),
    correctCount INTEGER DEFAULT 0,
    errorCount INTEGER DEFAULT 0,
    addedAt TEXT NOT NULL,
    lastReviewedAt TEXT,
    isCustom INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS daily_tasks (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    studentId TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    markedErrorWords TEXT,
    newWords TEXT,
    reviewedWords TEXT,
    correctCount INTEGER DEFAULT 0,
    errorCount INTEGER DEFAULT 0,
    totalCount INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(date, studentId)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    currentStudentId TEXT,
    lastStudyDate TEXT,
    dailyTaskCount INTEGER DEFAULT 30,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (currentStudentId) REFERENCES students(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS error_collections (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    title TEXT NOT NULL,
    question TEXT,
    answer TEXT NOT NULL,
    imageData TEXT,
    category TEXT DEFAULT 'general',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS grammar_weaknesses (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'grammar',
    example TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS grammar_questions (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    weaknessId TEXT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    type TEXT DEFAULT 'fill_blank',
    options TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (weaknessId) REFERENCES grammar_weaknesses(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
  CREATE INDEX IF NOT EXISTS idx_vocabulary_status ON vocabulary(status);
  CREATE INDEX IF NOT EXISTS idx_vocabulary_studentId ON vocabulary(studentId);
  CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON daily_tasks(date);
  CREATE INDEX IF NOT EXISTS idx_daily_tasks_studentId ON daily_tasks(studentId);

  CREATE INDEX IF NOT EXISTS idx_error_collections_studentId ON error_collections(studentId);
  CREATE INDEX IF NOT EXISTS idx_grammar_weaknesses_studentId ON grammar_weaknesses(studentId);
  CREATE INDEX IF NOT EXISTS idx_grammar_questions_studentId ON grammar_questions(studentId);
  CREATE INDEX IF NOT EXISTS idx_grammar_questions_weaknessId ON grammar_questions(weaknessId);
`);

// 数据库迁移：移除旧的 grade 字段
function migrateDatabase() {
  try {
    // 检查 students 表是否有 grade 列
    const studentsColumns = db.prepare("PRAGMA table_info(students)").all() as any[];
    const hasGradeColumn = studentsColumns.some(col => col.name === 'grade');

    if (hasGradeColumn) {
      console.log('⚠ 检测到旧数据库 schema，正在迁移...');

      // 1. 创建新的 students 表（不含 grade 列）
      db.exec(`
        CREATE TABLE IF NOT EXISTS students_new (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          dailyTaskCount INTEGER DEFAULT 30,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(name)
        );
      `);

      // 2. 复制数据到新表（排除 grade 列）
      db.exec(`
        INSERT INTO students_new (id, name, dailyTaskCount, createdAt, updatedAt)
        SELECT id, name, COALESCE(dailyTaskCount, 30), createdAt, updatedAt
        FROM students;
      `);

      // 3. 删除旧表
      db.exec('DROP TABLE students;');

      // 4. 重命名新表
      db.exec('ALTER TABLE students_new RENAME TO students;');

      console.log('✓ students 表迁移完成');
    }

    // 检查 vocabulary 表是否有 grade 列
    const vocabColumns = db.prepare("PRAGMA table_info(vocabulary)").all() as any[];
    const hasVocabGradeColumn = vocabColumns.some(col => col.name === 'grade');

    if (hasVocabGradeColumn) {
      console.log('⚠ 检测到 vocabulary 表的旧 schema，正在迁移...');

      // 1. 创建新的 vocabulary 表（不含 grade 列）
      db.exec(`
        CREATE TABLE IF NOT EXISTS vocabulary_new (
          id TEXT PRIMARY KEY,
          word TEXT NOT NULL,
          meaning TEXT NOT NULL,
          studentId TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'word' CHECK(type IN ('word', 'phrase', 'sentence')),
          status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'mastered', 'error')),
          correctCount INTEGER DEFAULT 0,
          errorCount INTEGER DEFAULT 0,
          addedAt TEXT NOT NULL,
          lastReviewedAt TEXT,
          isCustom INTEGER DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
        );
      `);

      // 2. 复制数据到新表（排除 grade 列，使用默认值补充缺失字段）
      db.exec(`
        INSERT INTO vocabulary_new (id, word, meaning, studentId, type, status, correctCount, errorCount, addedAt, lastReviewedAt, isCustom, createdAt, updatedAt)
        SELECT 
          id, 
          word, 
          meaning, 
          COALESCE(studentId, '') as studentId,
          COALESCE(type, 'word') as type,
          COALESCE(status, 'new') as status,
          COALESCE(correctCount, 0) as correctCount,
          COALESCE(errorCount, 0) as errorCount,
          COALESCE(addedAt, CURRENT_TIMESTAMP) as addedAt,
          lastReviewedAt,
          COALESCE(isCustom, 0) as isCustom,
          COALESCE(createdAt, CURRENT_TIMESTAMP) as createdAt,
          COALESCE(updatedAt, CURRENT_TIMESTAMP) as updatedAt
        FROM vocabulary;
      `);

      // 3. 删除旧表
      db.exec('DROP TABLE vocabulary;');

      // 4. 重命名新表
      db.exec('ALTER TABLE vocabulary_new RENAME TO vocabulary;');

      console.log('✓ vocabulary 表迁移完成');
    }

    if (hasGradeColumn || hasVocabGradeColumn) {
      console.log('✓ 数据库迁移完成！');
    }
  } catch (error) {
    console.error('⚠ 数据库迁移失败，请手动删除数据库文件重试:', error);
  }
}

// 执行数据库迁移
migrateDatabase();

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
  // 获取本地日期而不是 UTC 日期
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localToday = `${year}-${month}-${day}`;
  
  db.prepare('INSERT INTO settings (id, lastStudyDate, dailyTaskCount) VALUES (1, ?, 30)').run(localToday);
}

export default db;
