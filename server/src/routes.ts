import { Router } from 'express';
import db from './database';
import { initializeVocabulary } from './initData';

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  studentId: string;
  type: string;
  status: 'new' | 'old' | 'review' | 'mastered';
  correctCount: number;
  errorCount: number;
  addedAt: string;
  lastReviewedAt?: string;
  isCustom: number;
  createdAt?: string;
  updatedAt?: string;
  consecutiveCorrectCount: number;
  lastErrorDate?: string;
  lastAppearedDate?: string;
  becomeMasteredAt?: string;
}

const router = Router();

router.get('/init', (req, res) => {
  initializeVocabulary();
  res.json({ message: '数据初始化完成' });
});

router.get('/students', (req, res) => {
  try {
    const students = db.prepare('SELECT * FROM students ORDER BY name ASC').all();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: '获取学生列表失败' });
  }
});

router.post('/students', (req, res) => {
  try {
    const { name, dailyTaskCount } = req.body;
    // 获取本地日期而不是 UTC 日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    db.prepare(`
      INSERT INTO students (id, name, dailyTaskCount, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, dailyTaskCount || 30, localToday, localToday);

    res.json({ id, name, dailyTaskCount: dailyTaskCount || 30, message: '学生添加成功' });
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: '该学生已存在' });
    } else {
      res.status(500).json({ error: '添加学生失败' });
    }
  }
});

router.put('/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, dailyTaskCount } = req.body;
    // 获取本地日期而不是 UTC 日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;

    const updateFields: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      params.push(name);
    }
    if (dailyTaskCount !== undefined) {
      updateFields.push('dailyTaskCount = ?');
      params.push(dailyTaskCount);
    }
    updateFields.push('updatedAt = ?');
    params.push(localToday);
    params.push(id);

    if (updateFields.length > 0) {
      db.prepare(`UPDATE students SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);
    }

    res.json({ message: '学生信息更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新学生失败' });
  }
});

router.delete('/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM students WHERE id = ?').run(id);
    res.json({ message: '学生删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除学生失败' });
  }
});

router.get('/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: '获取设置失败' });
  }
});

router.put('/settings', (req, res) => {
  try {
    const { currentStudentId, dailyTaskCount } = req.body;
    // 获取本地日期而不是 UTC 日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;
    
    const updateFields: string[] = [];
    const params: any[] = [];

    if (currentStudentId !== undefined) {
      updateFields.push('currentStudentId = ?');
      params.push(currentStudentId);
    }
    if (dailyTaskCount !== undefined) {
      updateFields.push('dailyTaskCount = ?');
      params.push(dailyTaskCount);
    }
    updateFields.push('updatedAt = ?');
    params.push(localToday);
    params.push(1);

    if (updateFields.length > 0) {
      db.prepare(`UPDATE settings SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);
    }

    res.json({ message: '设置更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新设置失败' });
  }
});

router.post('/settings', (req, res) => {
  try {
    const { currentStudentId, dailyTaskCount } = req.body;
    // 获取本地日期而不是 UTC 日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;
    
    const updateFields: string[] = [];
    const params: any[] = [];

    if (currentStudentId !== undefined) {
      updateFields.push('currentStudentId = ?');
      params.push(currentStudentId);
    }
    if (dailyTaskCount !== undefined) {
      updateFields.push('dailyTaskCount = ?');
      params.push(dailyTaskCount);
    }
    updateFields.push('updatedAt = ?');
    params.push(localToday);
    params.push(1);

    if (updateFields.length > 0) {
      db.prepare(`UPDATE settings SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);
    }

    res.json({ message: '设置更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新设置失败' });
  }
});

router.get('/vocabulary', (req, res) => {
  try {
    const status = req.query.status as string;
    const search = req.query.search as string;
    const studentId = req.query.studentId as string;

    let query = 'SELECT * FROM vocabulary WHERE 1=1';
    const params: any[] = [];

    if (studentId) {
      query += ' AND studentId = ?';
      params.push(studentId);
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (word LIKE ? OR meaning LIKE ?)';
      params.push('%' + search + '%', '%' + search + '%');
    }

    query += ' ORDER BY addedAt DESC';

    const vocabulary = db.prepare(query).all(...params);
    res.json(vocabulary);
  } catch (error) {
    res.status(500).json({ error: '获取词汇失败' });
  }
});

router.post('/vocabulary', (req, res) => {
  try {
    const { word, meaning, status, type, studentId } = req.body;
    // 获取本地日期而不是 UTC 日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    db.prepare(`
      INSERT INTO vocabulary (id, word, meaning, type, studentId, status, correctCount, errorCount, addedAt, isCustom)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, 1)
    `).run(id, word, meaning, type || 'word', studentId, status || 'new', localToday);

    res.json({ id, message: '词汇添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加词汇失败' });
  }
});

router.put('/vocabulary/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { word, meaning, type, status } = req.body;
    // 获取本地日期而不是 UTC 日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;

    db.prepare(`
      UPDATE vocabulary 
      SET word = ?, meaning = ?, type = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `).run(word, meaning, type || 'word', status, localToday, id);

    res.json({ message: '词汇更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新词汇失败' });
  }
});

router.delete('/vocabulary/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM vocabulary WHERE id = ?').run(id);
    res.json({ message: '词汇删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除词汇失败' });
  }
});

router.post('/vocabulary/bulk-delete', (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: '请选择要删除的词汇' });
      return;
    }

    const placeholders = ids.map(() => '?').join(',');
    const result = db.prepare(`DELETE FROM vocabulary WHERE id IN (${placeholders})`).run(...ids);
    
    res.json({ message: `成功删除 ${result.changes} 个词汇` });
  } catch (error) {
    res.status(500).json({ error: '批量删除失败' });
  }
});

router.post('/vocabulary/bulk', (req, res) => {
  try {
    const words = req.body.words;
    const studentId = req.body.studentId;
    // 获取本地日期而不是 UTC 日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;
    let count = 0;

    const insert = db.prepare(`
      INSERT INTO vocabulary (id, word, meaning, type, studentId, status, correctCount, errorCount, addedAt, isCustom)
      VALUES (?, ?, ?, ?, ?, 'reviewed', 0, 0, ?, 1)
    `);

    const insertMany = db.transaction((items: any[]) => {
      for (const item of items) {
        const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        insert.run(id, item.word, item.meaning, item.type || 'word', studentId, localToday);
        count++;
      }
    });

    insertMany(words);
    res.json({ message: '成功导入 ' + count + ' 个词汇' });
  } catch (error) {
    console.error('批量导入错误:', error);
    res.status(500).json({ error: '批量导入失败' });
  }
});

router.get('/daily-task', (req, res) => {
  try {
    const studentId = req.query.studentId as string;
    // 获取本地日期而不是 UTC 日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;

    const task = db.prepare('SELECT * FROM daily_tasks WHERE date = ? AND studentId = ?')
      .get(localToday, studentId) as any;

    if (task) {
      let newWords: Vocabulary[] = [];
      let reviewedWords: Vocabulary[] = [];
      let markedErrorWords: string[] = [];

      try {
        if (task.newWords) {
          newWords = JSON.parse(task.newWords);
        }
        if (task.reviewedWords) {
          reviewedWords = JSON.parse(task.reviewedWords);
        }
        if (task.markedErrorWords) {
          markedErrorWords = JSON.parse(task.markedErrorWords);
        }
      } catch (e) {
        console.error('解析单词数据失败:', e);
      }

      res.json({
        id: task.id,
        date: task.date,
        studentId: task.studentId,
        completed: task.completed === 1,
        newWords,
        reviewedWords,
        markedErrorWords
      });
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('获取任务失败:', error);
    res.status(500).json({ error: '获取任务失败' });
  }
});

// 获取本地日期的工具函数
function getLocalToday(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

router.post('/daily-task/generate', (req, res) => {
  try {
    const { studentId } = req.body;
    const localToday = getLocalToday();

    let TARGET_COUNT = 30;
    
    if (studentId) {
      const student = db.prepare('SELECT dailyTaskCount FROM students WHERE id = ?').get(studentId) as any;
      if (student && student.dailyTaskCount) {
        TARGET_COUNT = student.dailyTaskCount;
      }
    }
    if (TARGET_COUNT === 30) {
      const settings = db.prepare('SELECT dailyTaskCount FROM settings WHERE id = 1').get() as any;
      if (settings && settings.dailyTaskCount) {
        TARGET_COUNT = settings.dailyTaskCount;
      }
    }

    // 统计各类词汇数量
    const countByStatus = db.prepare(`
      SELECT status, COUNT(*) as count FROM vocabulary WHERE studentId = ? GROUP BY status
    `).all(studentId) as { status: string; count: number }[];

    const counts: Record<string, number> = { new: 0, old: 0, review: 0, mastered: 0 };
    for (const row of countByStatus) {
      counts[row.status] = row.count;
    }

    const totalVocab = counts.new + counts.old + counts.review + counts.mastered;
    if (totalVocab === 0) {
      res.json({ id: null, date: localToday, studentId, newWords: [], reviewedWords: [], completed: false, markedErrorWords: [], message: '暂无词汇，请先添加词汇' });
      return;
    }

    // === 确定基准比例 ===
    let baseReview = 15, baseOld = 9, baseNew = 5, baseMastered = 1;
    if (counts.review > 40) {
      baseReview = 20; baseOld = 4; baseNew = 5; baseMastered = 1;
    } else if (counts.review < 8) {
      baseReview = 8; baseOld = 16; baseNew = 5; baseMastered = 1;
    }
    const baseSum = baseReview + baseOld + baseNew + baseMastered;

    // === 按比例缩放 ===
    let needReview = Math.ceil((baseReview / baseSum) * TARGET_COUNT);
    let needOld = Math.ceil((baseOld / baseSum) * TARGET_COUNT);
    let needNewCap = Math.ceil((baseNew / baseSum) * TARGET_COUNT);
    let needMastered = Math.ceil((baseMastered / baseSum) * TARGET_COUNT);

    // 修正总数偏差
    let totalNeeded = needReview + needOld + needNewCap + needMastered;
    if (totalNeeded > TARGET_COUNT) {
      const diff = totalNeeded - TARGET_COUNT;
      needReview = Math.max(0, needReview - diff);
      totalNeeded = needReview + needOld + needNewCap + needMastered;
      if (totalNeeded > TARGET_COUNT) {
        needOld = Math.max(0, needOld - (totalNeeded - TARGET_COUNT));
      }
    }

    const selectedIds = new Set<string>();
    const selectedReview: any[] = [];
    const selectedOld: any[] = [];
    const selectedNew: any[] = [];
    const selectedMastered: any[] = [];

    // === 1. 选取需复习单词 ===
    if (needReview > 0) {
      const reviewQuery = `
        SELECT * FROM vocabulary
        WHERE studentId = ? AND status = 'review'
        ORDER BY lastErrorDate ASC, errorCount DESC
      `;
      const candidates = db.prepare(reviewQuery).all(studentId) as Vocabulary[];
      for (const w of candidates) {
        if (w.lastAppearedDate === localToday) continue;
        if (selectedIds.has(w.id)) continue;
        selectedReview.push(w);
        selectedIds.add(w.id);
        if (selectedReview.length >= needReview) break;
      }
    }
    if (selectedReview.length < needReview) {
      const deficit = needReview - selectedReview.length;
      const fillQuery = `SELECT * FROM vocabulary WHERE studentId = ? AND status = 'old' ORDER BY lastReviewedAt ASC`;
      const fillCandidates = db.prepare(fillQuery).all(studentId) as Vocabulary[];
      for (const w of fillCandidates) {
        if (selectedIds.has(w.id)) continue;
        selectedReview.push(w);
        selectedIds.add(w.id);
        if (selectedReview.length >= needReview) break;
      }
    }

    // === 2. 选取旧词 ===
    if (needOld > 0) {
      const oldQuery = `SELECT * FROM vocabulary WHERE studentId = ? AND status = 'old' ORDER BY lastReviewedAt ASC`;
      const candidates = db.prepare(oldQuery).all(studentId) as Vocabulary[];
      for (const w of candidates) {
        if (selectedIds.has(w.id)) continue;
        if (w.lastReviewedAt) {
          const daysSince = Math.floor((new Date(localToday).getTime() - new Date(w.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSince < 3) continue;
        }
        selectedOld.push(w);
        selectedIds.add(w.id);
        if (selectedOld.length >= needOld) break;
      }
    }
    if (selectedOld.length < needOld) {
      const deficit = needOld - selectedOld.length;
      const fillQuery = `SELECT * FROM vocabulary WHERE studentId = ? AND status = 'review' ORDER BY lastErrorDate ASC`;
      const fillCandidates = db.prepare(fillQuery).all(studentId) as Vocabulary[];
      for (const w of fillCandidates) {
        if (selectedIds.has(w.id)) continue;
        selectedOld.push(w);
        selectedIds.add(w.id);
        if (selectedOld.length >= needOld) break;
      }
    }

    // === 3. 选取新词 ===
    if (needNewCap > 0) {
      const newQuery = `SELECT * FROM vocabulary WHERE studentId = ? AND status = 'new' ORDER BY addedAt ASC`;
      const candidates = db.prepare(newQuery).all(studentId) as Vocabulary[];
      for (const w of candidates) {
        if (selectedIds.has(w.id)) continue;
        selectedNew.push(w);
        selectedIds.add(w.id);
        if (selectedNew.length >= needNewCap) break;
      }
    }
    if (selectedNew.length < needNewCap) {
      const deficit = needNewCap - selectedNew.length;
      const fillQuery = `SELECT * FROM vocabulary WHERE studentId = ? AND status IN ('old', 'review') ORDER BY lastReviewedAt ASC`;
      const fillCandidates = db.prepare(fillQuery).all(studentId) as Vocabulary[];
      for (const w of fillCandidates) {
        if (selectedIds.has(w.id)) continue;
        selectedNew.push(w);
        selectedIds.add(w.id);
        if (selectedNew.length >= needNewCap) break;
      }
    }

    // === 4. 选取已掌握抽检 ===
    if (needMastered > 0) {
      const masteredQuery = `SELECT * FROM vocabulary WHERE studentId = ? AND status = 'mastered' ORDER BY becomeMasteredAt ASC`;
      const candidates = db.prepare(masteredQuery).all(studentId) as Vocabulary[];
      for (const w of candidates) {
        if (selectedIds.has(w.id)) continue;
        selectedMastered.push(w);
        selectedIds.add(w.id);
        if (selectedMastered.length >= needMastered) break;
      }
    }
    if (selectedMastered.length < needMastered) {
      const deficit = needMastered - selectedMastered.length;
      const fillQuery = `SELECT * FROM vocabulary WHERE studentId = ? AND status IN ('old', 'review') ORDER BY lastReviewedAt ASC`;
      const fillCandidates = db.prepare(fillQuery).all(studentId) as Vocabulary[];
      for (const w of fillCandidates) {
        if (selectedIds.has(w.id)) continue;
        selectedMastered.push(w);
        selectedIds.add(w.id);
        if (selectedMastered.length >= needMastered) break;
      }
    }

    // === 更新 lastAppearedDate ===
    const updateAppear = db.prepare('UPDATE vocabulary SET lastAppearedDate = ?, updatedAt = ? WHERE id = ?');
    const nowStr = new Date().toISOString();
    for (const w of [...selectedReview, ...selectedOld, ...selectedNew, ...selectedMastered]) {
      updateAppear.run(localToday, nowStr, w.id);
    }

    // === 构建最终列表 ===
    const allSelected = [...selectedReview, ...selectedOld, ...selectedNew, ...selectedMastered].sort(() => Math.random() - 0.5);
    const finalNewWords = selectedNew.filter(w => allSelected.includes(w));
    const finalReviewedWords = allSelected.filter((w: any) => !finalNewWords.includes(w));

    const taskId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    db.prepare('DELETE FROM daily_tasks WHERE date = ? AND studentId = ?').run(localToday, studentId);

    const totalCount = allSelected.length;
    db.prepare(`
      INSERT INTO daily_tasks (id, date, studentId, completed, markedErrorWords, newWords, reviewedWords, totalCount)
      VALUES (?, ?, ?, 0, '[]', ?, ?, ?)
    `).run(taskId, localToday, studentId, JSON.stringify(finalNewWords), JSON.stringify(finalReviewedWords), totalCount);

    res.json({
      id: taskId, date: localToday, studentId,
      newWords: finalNewWords, reviewedWords: finalReviewedWords,
      totalCount, completed: false, markedErrorWords: []
    });
  } catch (error) {
    console.error('生成任务失败:', error);
    res.status(500).json({ error: '生成任务失败' });
  }
});

router.post('/daily-task/complete', (req, res) => {
  try {
    const { taskId, errorWordIds, studentId } = req.body;
    const localToday = getLocalToday();
    const errorIdsSet = new Set(errorWordIds || []);

    const task = db.prepare('SELECT * FROM daily_tasks WHERE id = ?').get(taskId) as any;
    if (!task) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }

    let allWordIds: string[] = [];
    try {
      if (task.newWords) {
        const newWords = JSON.parse(task.newWords);
        allWordIds = allWordIds.concat(newWords.map((w: any) => w.id));
      }
      if (task.reviewedWords) {
        const reviewedWords = JSON.parse(task.reviewedWords);
        allWordIds = allWordIds.concat(reviewedWords.map((w: any) => w.id));
      }
    } catch (e) {
      console.error('解析单词数据失败:', e);
    }

    const correctWordIds = allWordIds.filter(id => !errorIdsSet.has(id));

    db.prepare(`
      UPDATE daily_tasks
      SET completed = 1, markedErrorWords = ?
      WHERE id = ?
    `).run(JSON.stringify(errorWordIds), taskId);

    // 答错处理：所有答错的单词转入需复习，连续正确次数清零
    const updateError = db.transaction((ids: string[]) => {
      for (const id of ids) {
        db.prepare(`
          UPDATE vocabulary
          SET status = 'review', consecutiveCorrectCount = 0, errorCount = errorCount + 1,
              lastErrorDate = ?, lastReviewedAt = ?, updatedAt = ?
          WHERE id = ?
        `).run(localToday, localToday, localToday, id);
      }
    });

    // 答对处理
    const updateCorrect = db.transaction((ids: string[]) => {
      for (const id of ids) {
        const vocab = db.prepare('SELECT * FROM vocabulary WHERE id = ?').get(id) as any;
        if (!vocab) continue;

        if (vocab.status === 'new') {
          // 首次默写完成 → 转为旧词
          db.prepare(`
            UPDATE vocabulary
            SET status = 'old', consecutiveCorrectCount = 1, correctCount = correctCount + 1,
                lastReviewedAt = ?, updatedAt = ?
            WHERE id = ?
          `).run(localToday, localToday, id);
        } else if (vocab.status === 'old') {
          // 旧词答对 → 保持旧词，连续正确次数+1
          db.prepare(`
            UPDATE vocabulary
            SET consecutiveCorrectCount = consecutiveCorrectCount + 1, correctCount = correctCount + 1,
                lastReviewedAt = ?, updatedAt = ?
            WHERE id = ?
          `).run(localToday, localToday, id);
        } else if (vocab.status === 'review') {
          const newConsecutive = (vocab.consecutiveCorrectCount || 0) + 1;
          if (newConsecutive >= 3) {
            // 连续3次正确 → 转为已掌握
            db.prepare(`
              UPDATE vocabulary
              SET status = 'mastered', consecutiveCorrectCount = ?, correctCount = correctCount + 1,
                  becomeMasteredAt = ?, lastReviewedAt = ?, updatedAt = ?
              WHERE id = ?
            `).run(newConsecutive, localToday, localToday, localToday, id);
          } else {
            // 仍不足3次 → 保持需复习
            db.prepare(`
              UPDATE vocabulary
              SET consecutiveCorrectCount = ?, correctCount = correctCount + 1,
                  lastReviewedAt = ?, updatedAt = ?
              WHERE id = ?
            `).run(newConsecutive, localToday, localToday, id);
          }
        } else if (vocab.status === 'mastered') {
          // 已掌握抽检答对 → 保持已掌握
          db.prepare(`
            UPDATE vocabulary
            SET correctCount = correctCount + 1, lastReviewedAt = ?, updatedAt = ?
            WHERE id = ?
          `).run(localToday, localToday, id);
        }
      }
    });

    if (errorWordIds && errorWordIds.length > 0) {
      updateError(errorWordIds);
    }

    if (correctWordIds.length > 0) {
      updateCorrect(correctWordIds);
    }

    const updateFields: string[] = ['lastStudyDate = ?'];
    const params: any[] = [localToday];

    if (studentId) {
      updateFields.push('currentStudentId = ?');
      params.push(studentId);
    }
    updateFields.push('updatedAt = ?');
    params.push(localToday);
    params.push(1);

    db.prepare(`UPDATE settings SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);

    res.json({ message: '任务完成' });
  } catch (error) {
    console.error('完成任务失败:', error);
    res.status(500).json({ error: '完成任务失败' });
  }
});

router.get('/daily-task/history', (req, res) => {
  try {
    const studentId = req.query.studentId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;

    const tasks = db.prepare(`
      SELECT * FROM daily_tasks 
      WHERE studentId = ?
      AND completed = 1
      ORDER BY date DESC
      LIMIT ?
    `).all(studentId, limit) as any[];

    const history = tasks.map(task => {
      let totalCount = 0;
      let correctCount = 0;
      let errorCount = 0;
      let newWords: any[] = [];
      let reviewedWords: any[] = [];
      let markedErrorWords: string[] = [];
      
      try {
        newWords = task.newWords ? JSON.parse(task.newWords) : [];
        reviewedWords = task.reviewedWords ? JSON.parse(task.reviewedWords) : [];
        totalCount = newWords.length + reviewedWords.length;
        
        markedErrorWords = task.markedErrorWords ? JSON.parse(task.markedErrorWords) : [];
        errorCount = markedErrorWords.length;
        correctCount = totalCount - errorCount;
      } catch (e) {
        // 如果解析失败，使用默认值
      }

      return {
        id: task.id,
        date: task.date,
        totalCount,
        correctCount,
        errorCount,
        newWords,
        reviewedWords,
        markedErrorWords
      };
    });

    res.json(history);
  } catch (error) {
    console.error('获取历史记录失败:', error);
    res.status(500).json({ error: '获取历史记录失败' });
  }
});

router.get('/statistics', (req, res) => {
  try {
    const studentId = req.query.studentId as string;

    const counts: Record<string, number> = { new: 0, old: 0, review: 0, mastered: 0 };

    const total = db.prepare('SELECT COUNT(*) as count FROM vocabulary WHERE studentId = ?')
      .get(studentId) as { count: number };

    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM vocabulary
      WHERE studentId = ?
      GROUP BY status
    `).all(studentId) as { status: string; count: number }[];

    for (const row of byStatus) {
      counts[row.status] = row.count;
    }

    const totalCorrect = db.prepare(`
      SELECT SUM(correctCount) as total FROM vocabulary WHERE studentId = ?
    `).get(studentId) as { total: number };

    const totalError = db.prepare(`
      SELECT SUM(errorCount) as total FROM vocabulary WHERE studentId = ?
    `).get(studentId) as { total: number };

    const completedDays = db.prepare(`
      SELECT COUNT(DISTINCT date) as count FROM daily_tasks WHERE completed = 1 AND studentId = ?
    `).get(studentId) as { count: number };

    res.json({
      total: total.count,
      new: counts.new,
      old: counts.old,
      review: counts.review,
      mastered: counts.mastered,
      // 兼容旧前端字段名
      reviewed: counts.old,
      error: counts.review,
      totalCorrect: totalCorrect?.total || 0,
      totalError: totalError?.total || 0,
      completedDays: completedDays?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计失败' });
  }
});

router.get('/export', (req, res) => {
  try {
    const students = db.prepare('SELECT * FROM students').all();
    const vocabulary = db.prepare('SELECT * FROM vocabulary').all();
    const dailyTasks = db.prepare('SELECT * FROM daily_tasks').all();
    const settings = db.prepare('SELECT * FROM settings').all();

    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      students,
      vocabulary,
      dailyTasks,
      settings
    };

    res.json(exportData);
  } catch (error) {
    console.error('导出数据失败:', error);
    res.status(500).json({ error: '导出数据失败' });
  }
});

router.post('/import', (req, res) => {
  try {
    const data = req.body;
    
    if (!data || !data.students) {
      res.status(400).json({ error: '无效的导入数据' });
      return;
    }

    db.prepare('BEGIN').run();

    try {
      if (data.students && Array.isArray(data.students)) {
        const insertStudent = db.prepare(`
          INSERT OR REPLACE INTO students (id, name, dailyTaskCount, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        for (const student of data.students) {
          insertStudent.run(
            student.id,
            student.name,
            student.dailyTaskCount || 30,
            student.createdAt || new Date().toISOString(),
            student.updatedAt || new Date().toISOString()
          );
        }
      }

      if (data.vocabulary && Array.isArray(data.vocabulary)) {
        const insertVocabulary = db.prepare(`
          INSERT OR REPLACE INTO vocabulary (id, word, meaning, studentId, type, status, correctCount, errorCount, addedAt, lastReviewedAt, isCustom, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const vocab of data.vocabulary) {
          insertVocabulary.run(
            vocab.id,
            vocab.word,
            vocab.meaning,
            vocab.studentId,
            vocab.type || 'word',
            vocab.status || 'new',
            vocab.correctCount || 0,
            vocab.errorCount || 0,
            vocab.addedAt || new Date().toISOString(),
            vocab.lastReviewedAt,
            vocab.isCustom || 0,
            vocab.createdAt || new Date().toISOString(),
            vocab.updatedAt || new Date().toISOString()
          );
        }
      }

      if (data.dailyTasks && Array.isArray(data.dailyTasks)) {
        const insertDailyTask = db.prepare(`
          INSERT OR REPLACE INTO daily_tasks (id, date, studentId, completed, markedErrorWords, newWords, reviewedWords, correctCount, errorCount, totalCount, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const task of data.dailyTasks) {
          insertDailyTask.run(
            task.id,
            task.date,
            task.studentId,
            task.completed || 0,
            task.markedErrorWords,
            task.newWords,
            task.reviewedWords,
            task.correctCount || 0,
            task.errorCount || 0,
            task.totalCount || 0,
            task.createdAt || new Date().toISOString()
          );
        }
      }

      if (data.settings && Array.isArray(data.settings)) {
        const insertSettings = db.prepare(`
          INSERT OR REPLACE INTO settings (id, currentStudentId, lastStudyDate, dailyTaskCount, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        for (const setting of data.settings) {
          insertSettings.run(
            setting.id || 1,
            setting.currentStudentId,
            setting.lastStudyDate,
            setting.dailyTaskCount || 30,
            setting.createdAt || new Date().toISOString(),
            setting.updatedAt || new Date().toISOString()
          );
        }
      }

      db.prepare('COMMIT').run();
      res.json({ message: '数据导入成功' });
    } catch (error) {
      db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('导入数据失败:', error);
    res.status(500).json({ error: '导入数据失败' });
  }
});

export default router;
