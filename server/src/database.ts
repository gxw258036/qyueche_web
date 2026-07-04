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
 * 备份数据库文件
 */
function backupDatabase(): string | null {
  try {
    if (!fs.existsSync(dbPath)) return null;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(dbDir, `vocabulary.db.backup-${timestamp}`);
    fs.copyFileSync(dbPath, backupPath);
    // 同时备份 WAL 和 SHM 文件（如果存在）
    const walPath = dbPath + '-wal';
    const shmPath = dbPath + '-shm';
    if (fs.existsSync(walPath)) fs.copyFileSync(walPath, backupPath + '-wal');
    if (fs.existsSync(shmPath)) fs.copyFileSync(shmPath, backupPath + '-shm');
    console.log(`✓ 数据库已备份到: ${backupPath}`);
    return backupPath;
  } catch (e) {
    console.error('⚠ 数据库备份失败:', e);
    return null;
  }
}

/**
 * 从备份恢复数据库
 */
function restoreFromBackup(backupPath: string): void {
  try {
    db.close();
    fs.copyFileSync(backupPath, dbPath);
    const walPath = backupPath + '-wal';
    const shmPath = backupPath + '-shm';
    if (fs.existsSync(walPath)) fs.copyFileSync(walPath, dbPath + '-wal');
    if (fs.existsSync(shmPath)) fs.copyFileSync(shmPath, dbPath + '-shm');
    console.log('✓ 已从备份恢复数据库');
  } catch (e) {
    console.error('⚠ 从备份恢复失败:', e);
  }
}

// ========== 建表（仅在不存在时创建）==========

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
    type TEXT NOT NULL DEFAULT 'word',
    status TEXT NOT NULL DEFAULT 'new',
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
`);

// ========== 安全的数据库迁移 ==========

function migrateDatabase(): void {
  console.log('开始数据库迁移检查...');

  // 1. 备份数据库
  const backupPath = backupDatabase();

  // 2. 检查是否需要迁移 vocabulary 表
  const vocabColumns = db.prepare("PRAGMA table_info(vocabulary)").all() as any[];
  const hasGradeColumn = vocabColumns.some(col => col.name === 'grade');
  const hasStatusCheck = vocabColumns.length > 0; // 表存在

  // 检查 status 的 CHECK 约束是否需要更新
  const tableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='vocabulary'").get() as any;
  const needsStatusMigration = tableSql && (
    tableSql.sql.includes("'reviewed'") || tableSql.sql.includes("'error'")
  );

  // 检查是否有新字段
  const hasNewFields = vocabColumns.some(col => col.name === 'consecutiveCorrectCount');

  // 3. 添加缺失的字段（安全操作，不会丢数据）
  console.log('检查并添加缺失字段...');
  addColumnIfNotExists('vocabulary', 'type', 'TEXT DEFAULT "word"');
  addColumnIfNotExists('vocabulary', 'consecutiveCorrectCount', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('vocabulary', 'lastErrorDate', 'TEXT');
  addColumnIfNotExists('vocabulary', 'lastAppearedDate', 'TEXT');
  addColumnIfNotExists('vocabulary', 'becomeMasteredAt', 'TEXT');

  // daily_tasks 表字段
  addColumnIfNotExists('daily_tasks', 'newWords', 'TEXT');
  addColumnIfNotExists('daily_tasks', 'reviewedWords', 'TEXT');
  addColumnIfNotExists('daily_tasks', 'correctCount', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('daily_tasks', 'errorCount', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('daily_tasks', 'totalCount', 'INTEGER DEFAULT 0');

  // students 表字段
  addColumnIfNotExists('students', 'dailyTaskCount', 'INTEGER DEFAULT 30');

  // settings 表字段
  addColumnIfNotExists('settings', 'dailyTaskCount', 'INTEGER DEFAULT 30');

  // 4. 迁移旧 status 值（reviewed→old, error→review）
  // 这一步在添加字段后执行，不需要重建表
  console.log('迁移旧 status 值...');
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
    // 不阻断启动，继续
  }

  // 5. 如果有 grade 字段或旧的 CHECK 约束，需要重建表
  // 这是危险操作，必须在事务中执行，并验证数据量
  if (hasGradeColumn || needsStatusMigration) {
    console.log('⚠ 检测到需要重建 vocabulary 表（移除 grade 字段 / 更新 CHECK 约束）...');

    const originalCount = db.prepare('SELECT COUNT(*) as c FROM vocabulary').get() as any;
    console.log(`  原始数据量: ${originalCount.c} 条`);

    try {
      const migrate = db.transaction(() => {
        // 清理可能残留的 vocabulary_new 表
        db.exec('DROP TABLE IF EXISTS vocabulary_temp;');

        // 创建临时表（新 schema，无 CHECK 约束限制 status）
        db.exec(`
          CREATE TABLE vocabulary_temp (
            id TEXT PRIMARY KEY,
            word TEXT NOT NULL,
            meaning TEXT NOT NULL,
            studentId TEXT,
            type TEXT NOT NULL DEFAULT 'word',
            status TEXT NOT NULL DEFAULT 'new',
            correctCount INTEGER DEFAULT 0,
            errorCount INTEGER DEFAULT 0,
            addedAt TEXT NOT NULL,
            lastReviewedAt TEXT,
            isCustom INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            consecutiveCorrectCount INTEGER DEFAULT 0,
            lastErrorDate TEXT,
            lastAppearedDate TEXT,
            becomeMasteredAt TEXT
          );
        `);

        // 复制数据（处理 grade 字段可能不存在的情况）
        // 使用动态列检测
        const actualColumns = db.prepare("PRAGMA table_info(vocabulary)").all() as any[];
        const colNames = actualColumns.map(c => c.name);
        
        const selectCols = [
          'id', 'word', 'meaning',
          'COALESCE(studentId, NULL) as studentId',
          'COALESCE(type, "word") as type',
          'CASE status WHEN "reviewed" THEN "old" WHEN "error" THEN "review" ELSE status END as status',
          'COALESCE(correctCount, 0) as correctCount',
          'COALESCE(errorCount, 0) as errorCount',
          'COALESCE(addedAt, CURRENT_TIMESTAMP) as addedAt',
          'lastReviewedAt',
          'COALESCE(isCustom, 0) as isCustom',
          'COALESCE(createdAt, CURRENT_TIMESTAMP) as createdAt',
          'COALESCE(updatedAt, CURRENT_TIMESTAMP) as updatedAt',
          colNames.includes('consecutiveCorrectCount') ? 'COALESCE(consecutiveCorrectCount, 0)' : '0',
          colNames.includes('lastErrorDate') ? 'lastErrorDate' : 'NULL',
          colNames.includes('lastAppearedDate') ? 'lastAppearedDate' : 'NULL',
          colNames.includes('becomeMasteredAt') ? 'becomeMasteredAt' : 'NULL'
        ];

        const insertSql = `
          INSERT INTO vocabulary_temp (
            id, word, meaning, studentId, type, status,
            correctCount, errorCount, addedAt, lastReviewedAt,
            isCustom, createdAt, updatedAt,
            consecutiveCorrectCount, lastErrorDate, lastAppearedDate, becomeMasteredAt
          )
          SELECT ${selectCols.join(', ')}
          FROM vocabulary;
        `;
        db.exec(insertSql);

        // 验证数据量
        const newCount = db.prepare('SELECT COUNT(*) as c FROM vocabulary_temp').get() as any;
        if (newCount.c !== originalCount.c) {
          throw new Error(`数据量不匹配: 原始 ${originalCount.c} 条, 迁移后 ${newCount.c} 条`);
        }
        console.log(`  ✓ 数据迁移验证通过: ${newCount.c} 条`);

        // 删除旧表
        db.exec('DROP TABLE vocabulary;');
        // 重命名临时表
        db.exec('ALTER TABLE vocabulary_temp RENAME TO vocabulary;');
      });

      migrate();
      console.log('✓ vocabulary 表迁移完成');

      // 清理可能残留的 vocabulary_new 表
      db.exec('DROP TABLE IF EXISTS vocabulary_new;');
    } catch (error) {
      console.error('⚠ vocabulary 表迁移失败:', error);
      console.error('⚠ 迁移已回滚，保留原始数据');
      // 事务会自动回滚，数据不会丢失
      // 清理临时表
      try { db.exec('DROP TABLE IF EXISTS vocabulary_temp;'); } catch {}
    }
  } else {
    console.log('✓ vocabulary 表 schema 已是最新，无需重建');
    // 清理可能残留的 vocabulary_new 表
    try { db.exec('DROP TABLE IF EXISTS vocabulary_new;'); } catch {}
  }

  // 6. 迁移 students 表（移除 grade 字段）
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

  // 7. 重建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
    CREATE INDEX IF NOT EXISTS idx_vocabulary_status ON vocabulary(status);
    CREATE INDEX IF NOT EXISTS idx_vocabulary_studentId ON vocabulary(studentId);
    CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON daily_tasks(date);
    CREATE INDEX IF NOT EXISTS idx_daily_tasks_studentId ON daily_tasks(studentId);
  `);

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

const initSettings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
if (!initSettings) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localToday = `${year}-${month}-${day}`;
  db.prepare('INSERT INTO settings (id, lastStudyDate, dailyTaskCount) VALUES (1, ?, 30)').run(localToday);
}

export default db;
