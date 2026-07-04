import type Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
const betterSqlite3 = require('better-sqlite3');

const dbDir = path.join(__dirname, '../data');
const dbPath = path.join(dbDir, 'vocabulary.db');

// 确保数据目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = betterSqlite3(dbPath);
db.pragma('journal_mode = WAL');

// ========== 工具函数 ==========

/**
 * 安全添加列（如果列不存在）
 */
function addColumnIfNotExists(table: string, column: string, definition: string): void {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
  if (!columns.some(col => col.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`  ✓ 添加列 ${table}.${column}`);
  }
}

/**
 * 备份数据库文件（含 WAL/SHM）
 */
function backupDatabase(): void {
  try {
    if (!fs.existsSync(dbPath)) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(dbDir, `vocabulary.db.backup-${timestamp}`);
    fs.copyFileSync(dbPath, backupPath);
    const walPath = dbPath + '-wal';
    const shmPath = dbPath + '-shm';
    if (fs.existsSync(walPath)) fs.copyFileSync(walPath, backupPath + '-wal');
    if (fs.existsSync(shmPath)) fs.copyFileSync(shmPath, backupPath + '-shm');
    console.log(`✓ 数据库已备份到: ${backupPath}`);
  } catch (e) {
    console.error('⚠ 数据库备份失败:', e);
  }
}

// ========== 建表（仅在不存在时创建）==========
// 保留 a1b5a9d 基线的完整 schema：新 status 体系 + 新字段 + 四大模块表

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
    studentId TEXT,
    type TEXT NOT NULL DEFAULT 'word' CHECK(type IN ('word', 'phrase', 'sentence')),
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'old', 'review', 'mastered')),
    correctCount INTEGER DEFAULT 0,
    errorCount INTEGER DEFAULT 0,
    consecutiveCorrectCount INTEGER DEFAULT 0,
    addedAt TEXT NOT NULL,
    lastReviewedAt TEXT,
    lastErrorDate TEXT,
    becomeMasteredAt TEXT,
    lastAppearedDate TEXT,
    isCustom INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS daily_tasks (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    studentId TEXT,
    completed INTEGER DEFAULT 0,
    markedErrorWords TEXT,
    newWords TEXT,
    reviewedWords TEXT,
    correctCount INTEGER DEFAULT 0,
    errorCount INTEGER DEFAULT 0,
    totalCount INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    currentStudentId TEXT,
    lastStudyDate TEXT,
    dailyTaskCount INTEGER DEFAULT 30,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
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
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS grammar_weaknesses (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'grammar',
    example TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
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
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// ========== 安全的数据库迁移 ==========

function migrateDatabase(): void {
  console.log('开始数据库迁移检查...');

  // 1. 备份数据库
  backupDatabase();

  // 2. 安全添加缺失字段（不会丢数据）
  console.log('检查并添加缺失字段...');
  addColumnIfNotExists('vocabulary', 'type', 'TEXT DEFAULT "word"');
  addColumnIfNotExists('vocabulary', 'consecutiveCorrectCount', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('vocabulary', 'lastErrorDate', 'TEXT');
  addColumnIfNotExists('vocabulary', 'becomeMasteredAt', 'TEXT');
  addColumnIfNotExists('vocabulary', 'lastAppearedDate', 'TEXT');

  addColumnIfNotExists('daily_tasks', 'newWords', 'TEXT');
  addColumnIfNotExists('daily_tasks', 'reviewedWords', 'TEXT');
  addColumnIfNotExists('daily_tasks', 'correctCount', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('daily_tasks', 'errorCount', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('daily_tasks', 'totalCount', 'INTEGER DEFAULT 0');

  addColumnIfNotExists('students', 'dailyTaskCount', 'INTEGER DEFAULT 30');
  addColumnIfNotExists('settings', 'dailyTaskCount', 'INTEGER DEFAULT 30');

  // 3. 迁移旧 status 值（reviewed→old, error→review）
  // a1b5a9d 基线的新 status 体系：new/old/review/mastered
  console.log('迁移旧 status 值 (reviewed→old, error→review)...');
  try {
    const oldStatusCount = db.prepare("SELECT COUNT(*) as c FROM vocabulary WHERE status = 'reviewed' OR status = 'error'").get() as any;
    if (oldStatusCount.c > 0) {
      db.prepare("UPDATE vocabulary SET status = 'old' WHERE status = 'reviewed'").run();
      db.prepare("UPDATE vocabulary SET status = 'review' WHERE status = 'error'").run();
      console.log(`  ✓ 迁移了 ${oldStatusCount.c} 条旧 status 记录`);
    } else {
      console.log('  ✓ 无需迁移 status 值');
    }
  } catch (e) {
    console.error('  ⚠ 迁移 status 值失败:', e);
  }

  // 4. 如果表有 grade 字段或旧 CHECK 约束，需要重建表
  // 危险操作：必须在事务中执行，并验证数据量，失败自动回滚
  const vocabColumns = db.prepare("PRAGMA table_info(vocabulary)").all() as any[];
  const hasGradeColumn = vocabColumns.some(col => col.name === 'grade');
  const tableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='vocabulary'").get() as any;
  const needsRebuild = hasGradeColumn || (tableSql && (tableSql.sql.includes("'reviewed'") || tableSql.sql.includes("'error'")));

  if (needsRebuild) {
    console.log('⚠ 检测到需要重建 vocabulary 表（移除 grade 字段 / 更新 CHECK 约束）...');

    const originalCount = db.prepare('SELECT COUNT(*) as c FROM vocabulary').get() as any;
    console.log(`  原始数据量: ${originalCount.c} 条`);

    try {
      const migrate = db.transaction(() => {
        db.exec('DROP TABLE IF EXISTS vocabulary_temp;');

        db.exec(`
          CREATE TABLE vocabulary_temp (
            id TEXT PRIMARY KEY,
            word TEXT NOT NULL,
            meaning TEXT NOT NULL,
            studentId TEXT,
            type TEXT NOT NULL DEFAULT 'word' CHECK(type IN ('word', 'phrase', 'sentence')),
            status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'old', 'review', 'mastered')),
            correctCount INTEGER DEFAULT 0,
            errorCount INTEGER DEFAULT 0,
            consecutiveCorrectCount INTEGER DEFAULT 0,
            addedAt TEXT NOT NULL,
            lastReviewedAt TEXT,
            lastErrorDate TEXT,
            becomeMasteredAt TEXT,
            lastAppearedDate TEXT,
            isCustom INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 动态检测列，兼容旧 schema
        const actualColumns = db.prepare("PRAGMA table_info(vocabulary)").all() as any[];
        const colNames = actualColumns.map(c => c.name);

        const selectCols = [
          'id', 'word', 'meaning',
          'COALESCE(studentId, NULL) as studentId',
          "COALESCE(type, 'word') as type",
          "CASE status WHEN 'reviewed' THEN 'old' WHEN 'error' THEN 'review' ELSE COALESCE(status, 'new') END as status",
          'COALESCE(correctCount, 0) as correctCount',
          'COALESCE(errorCount, 0) as errorCount',
          colNames.includes('consecutiveCorrectCount') ? 'COALESCE(consecutiveCorrectCount, 0)' : '0',
          'COALESCE(addedAt, CURRENT_TIMESTAMP) as addedAt',
          'lastReviewedAt',
          colNames.includes('lastErrorDate') ? 'lastErrorDate' : 'NULL',
          colNames.includes('becomeMasteredAt') ? 'becomeMasteredAt' : 'NULL',
          colNames.includes('lastAppearedDate') ? 'lastAppearedDate' : 'NULL',
          'COALESCE(isCustom, 0) as isCustom',
          'COALESCE(createdAt, CURRENT_TIMESTAMP) as createdAt',
          'COALESCE(updatedAt, CURRENT_TIMESTAMP) as updatedAt'
        ];

        db.exec(`
          INSERT INTO vocabulary_temp (
            id, word, meaning, studentId, type, status,
            correctCount, errorCount, consecutiveCorrectCount,
            addedAt, lastReviewedAt, lastErrorDate, becomeMasteredAt, lastAppearedDate,
            isCustom, createdAt, updatedAt
          )
          SELECT ${selectCols.join(', ')}
          FROM vocabulary;
        `);

        const newCount = db.prepare('SELECT COUNT(*) as c FROM vocabulary_temp').get() as any;
        if (newCount.c !== originalCount.c) {
          throw new Error(`数据量不匹配: 原始 ${originalCount.c} 条, 迁移后 ${newCount.c} 条`);
        }
        console.log(`  ✓ 数据迁移验证通过: ${newCount.c} 条`);

        db.exec('DROP TABLE vocabulary;');
        db.exec('ALTER TABLE vocabulary_temp RENAME TO vocabulary;');
      });

      migrate();
      console.log('✓ vocabulary 表迁移完成');
      db.exec('DROP TABLE IF EXISTS vocabulary_new;');
    } catch (error) {
      console.error('⚠ vocabulary 表迁移失败:', error);
      console.error('⚠ 迁移已回滚，保留原始数据');
      try { db.exec('DROP TABLE IF EXISTS vocabulary_temp;'); } catch {}
    }
  } else {
    console.log('✓ vocabulary 表 schema 已是最新，无需重建');
    try { db.exec('DROP TABLE IF EXISTS vocabulary_new;'); } catch {}
  }

  // 5. 迁移 students 表（移除 grade 字段）
  const studentsColumns = db.prepare("PRAGMA table_info(students)").all() as any[];
  const studentsHasGrade = studentsColumns.some(col => col.name === 'grade');

  if (studentsHasGrade) {
    console.log('⚠ 检测到 students 表有 grade 字段，正在迁移...');
    const originalCount = db.prepare('SELECT COUNT(*) as c FROM students').get() as any;

    try {
      const migrate = db.transaction(() => {
        db.exec('DROP TABLE IF EXISTS students_temp;');
        db.exec(`
          CREATE TABLE students_temp (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            dailyTaskCount INTEGER DEFAULT 30,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name)
          );
        `);
        db.exec(`
          INSERT INTO students_temp (id, name, dailyTaskCount, createdAt, updatedAt)
          SELECT id, name, COALESCE(dailyTaskCount, 30), createdAt, updatedAt
          FROM students;
        `);
        const newCount = db.prepare('SELECT COUNT(*) as c FROM students_temp').get() as any;
        if (newCount.c !== originalCount.c) {
          throw new Error(`数据量不匹配: 原始 ${originalCount.c} 条, 迁移后 ${newCount.c} 条`);
        }
        db.exec('DROP TABLE students;');
        db.exec('ALTER TABLE students_temp RENAME TO students;');
      });
      migrate();
      console.log('✓ students 表迁移完成');
    } catch (error) {
      console.error('⚠ students 表迁移失败:', error);
      try { db.exec('DROP TABLE IF EXISTS students_temp;'); } catch {}
    }
  }

  // 6. 迁移 daily_tasks 表（移除 grade 字段和旧 UNIQUE 约束）
  const dailyTasksColumns = db.prepare("PRAGMA table_info(daily_tasks)").all() as any[];
  const dailyTasksHasGrade = dailyTasksColumns.some(col => col.name === 'grade');

  if (dailyTasksHasGrade) {
    console.log('⚠ 检测到 daily_tasks 表有 grade 字段，正在迁移...');
    const originalCount = db.prepare('SELECT COUNT(*) as c FROM daily_tasks').get() as any;

    try {
      const migrate = db.transaction(() => {
        db.exec('DROP TABLE IF EXISTS daily_tasks_temp;');
        db.exec(`
          CREATE TABLE daily_tasks_temp (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            studentId TEXT,
            completed INTEGER DEFAULT 0,
            markedErrorWords TEXT,
            newWords TEXT,
            reviewedWords TEXT,
            correctCount INTEGER DEFAULT 0,
            errorCount INTEGER DEFAULT 0,
            totalCount INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);
        const cols = dailyTasksColumns.map(c => c.name);
        const hasNewWords = cols.includes('newWords');
        const hasReviewedWords = cols.includes('reviewedWords');
        const hasCorrectCount = cols.includes('correctCount');
        const hasErrorCount = cols.includes('errorCount');
        const hasTotalCount = cols.includes('totalCount');
        db.exec(`
          INSERT INTO daily_tasks_temp (id, date, studentId, completed, markedErrorWords, newWords, reviewedWords, correctCount, errorCount, totalCount, createdAt)
          SELECT
            id, date, studentId, COALESCE(completed, 0), COALESCE(markedErrorWords, '[]'),
            ${hasNewWords ? 'newWords' : 'NULL'},
            ${hasReviewedWords ? 'reviewedWords' : 'NULL'},
            ${hasCorrectCount ? 'COALESCE(correctCount, 0)' : '0'},
            ${hasErrorCount ? 'COALESCE(errorCount, 0)' : '0'},
            ${hasTotalCount ? 'COALESCE(totalCount, 0)' : '0'},
            COALESCE(createdAt, CURRENT_TIMESTAMP)
          FROM daily_tasks;
        `);
        const newCount = db.prepare('SELECT COUNT(*) as c FROM daily_tasks_temp').get() as any;
        if (newCount.c !== originalCount.c) {
          throw new Error(`数据量不匹配: 原始 ${originalCount.c} 条, 迁移后 ${newCount.c} 条`);
        }
        db.exec('DROP TABLE daily_tasks;');
        db.exec('ALTER TABLE daily_tasks_temp RENAME TO daily_tasks;');
      });
      migrate();
      console.log('✓ daily_tasks 表迁移完成');
    } catch (error) {
      console.error('⚠ daily_tasks 表迁移失败:', error);
      try { db.exec('DROP TABLE IF EXISTS daily_tasks_temp;'); } catch {}
    }
  }

  // 7. 重建索引（含四大模块表的索引）
  db.exec(`
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

  // 8. 修复数据关联：vocabulary.studentId 为 null 时关联到唯一学生
  try {
    const nullSidCount = db.prepare('SELECT COUNT(*) as c FROM vocabulary WHERE studentId IS NULL').get() as any;
    if (nullSidCount.c > 0) {
      const students = db.prepare('SELECT id FROM students ORDER BY createdAt ASC LIMIT 1').get() as any;
      if (students) {
        db.prepare('UPDATE vocabulary SET studentId = ? WHERE studentId IS NULL').run(students.id);
        console.log(`  ✓ 修复 ${nullSidCount.c} 条 vocabulary.studentId 为 null 的记录 → 学生 ${students.id}`);
      }
    }
  } catch (e) {
    console.error('  ⚠ 修复 vocabulary.studentId 失败:', e);
  }

  console.log('✓ 数据库迁移完成！');
}

// 执行迁移
try {
  migrateDatabase();
} catch (error) {
  console.error('⚠ 数据库迁移过程中出错:', error);
  console.error('⚠ 服务器将继续启动，但建议检查数据库');
}

// ========== 初始化默认设置 ==========

const initSettings = db.prepare('SELECT * FROM settings WHERE id = 1').get() as any;
if (!initSettings) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localToday = `${year}-${month}-${day}`;
  db.prepare('INSERT INTO settings (id, lastStudyDate, dailyTaskCount) VALUES (1, ?, 30)').run(localToday);
}

// ========== 修复 settings.currentStudentId 为 null ==========
try {
  const settings = db.prepare('SELECT currentStudentId FROM settings WHERE id = 1').get() as any;
  if (settings && !settings.currentStudentId) {
    const firstStudent = db.prepare('SELECT id FROM students ORDER BY createdAt ASC LIMIT 1').get() as any;
    if (firstStudent) {
      db.prepare('UPDATE settings SET currentStudentId = ? WHERE id = 1').run(firstStudent.id);
      console.log(`✓ 自动设置当前学生: ${firstStudent.id}`);
    }
  }
} catch (e) {
  console.error('⚠ 修复 settings.currentStudentId 失败:', e);
}

export default db;
