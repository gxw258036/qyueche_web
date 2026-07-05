import { Router } from 'express';
import db from './database';
import { initializeVocabulary } from './initData';

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  studentId: string;
  status: 'new' | 'old' | 'review' | 'mastered';
  correctCount: number;
  errorCount: number;
  consecutiveCorrectCount: number;
  addedAt: string;
  lastReviewedAt?: string;
  lastErrorDate?: string;
  becomeMasteredAt?: string;
  lastAppearedDate?: string;
  isCustom: number;
  createdAt?: string;
  updatedAt?: string;
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
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;

    const existing = db.prepare(`
      SELECT id FROM vocabulary WHERE LOWER(word) = LOWER(?) AND studentId = ?
    `).get(word, studentId);

    if (existing) {
      res.json({ message: '该词汇已存在，已自动跳过', skipped: true });
      return;
    }

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
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;
    let importedCount = 0;
    let skippedCount = 0;

    const existingWords = db.prepare(`
      SELECT word FROM vocabulary WHERE studentId = ?
    `).all(studentId) as { word: string }[];

    const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase().trim()));

    const insert = db.prepare(`
      INSERT INTO vocabulary (id, word, meaning, type, studentId, status, correctCount, errorCount, addedAt, isCustom)
      VALUES (?, ?, ?, ?, ?, 'new', 0, 0, ?, 1)
    `);

    const insertMany = db.transaction((items: any[]) => {
      for (const item of items) {
        const normalizedWord = item.word.toLowerCase().trim();
        if (existingWordSet.has(normalizedWord)) {
          skippedCount++;
          continue;
        }
        const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        insert.run(id, item.word, item.meaning, item.type || 'word', studentId, localToday);
        importedCount++;
        existingWordSet.add(normalizedWord);
      }
    });

    insertMany(words);

    let message = `成功导入 ${importedCount} 个词汇`;
    if (skippedCount > 0) {
      message += `，${skippedCount} 个重复词汇已自动跳过`;
    }

    res.json({ message, importedCount, skippedCount });
  } catch (error) {
    console.error('批量导入错误:', error);
    res.status(500).json({ error: '批量导入失败' });
  }
});

router.post('/vocabulary/reset-to-new', (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      res.status(400).json({ error: '请提供学生ID' });
      return;
    }

    const result = db.prepare(`
      UPDATE vocabulary
      SET status = 'new', correctCount = 0, errorCount = 0, lastReviewedAt = NULL, updatedAt = ?
      WHERE studentId = ?
    `).run(getLocalToday(), studentId);

    res.json({ message: `已更新 ${result.changes} 个词汇为"新词"`, updatedCount: result.changes });
  } catch (error) {
    console.error('重置词汇状态失败:', error);
    res.status(500).json({ error: '重置词汇状态失败' });
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
      const fillQuery = `
        SELECT * FROM vocabulary
        WHERE studentId = ? AND status = 'old'
        ORDER BY lastReviewedAt ASC
      `;
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
      const oldQuery = `
        SELECT * FROM vocabulary
        WHERE studentId = ? AND status = 'old'
        ORDER BY lastReviewedAt ASC
      `;
      const candidates = db.prepare(oldQuery).all(studentId) as Vocabulary[];
      for (const w of candidates) {
        if (selectedIds.has(w.id)) continue;
        if (w.lastReviewedAt) {
          const daysSince = Math.floor(
            (new Date(localToday).getTime() - new Date(w.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSince < 3) continue;
        }
        selectedOld.push(w);
        selectedIds.add(w.id);
        if (selectedOld.length >= needOld) break;
      }
    }
    if (selectedOld.length < needOld) {
      const deficit = needOld - selectedOld.length;
      const fillQuery = `
        SELECT * FROM vocabulary
        WHERE studentId = ? AND status = 'review'
        ORDER BY lastErrorDate ASC
      `;
      const fillCandidates = db.prepare(fillQuery).all(studentId) as Vocabulary[];
      for (const w of fillCandidates) {
        if (selectedIds.has(w.id)) continue;
        selectedOld.push(w);
        selectedIds.add(w.id);
        if (selectedOld.length >= needOld) break;
      }
    }

    // === 3. 选取新词（随机抽取） ===
    if (needNewCap > 0) {
      const newQuery = `
        SELECT * FROM vocabulary
        WHERE studentId = ? AND status = 'new'
        ORDER BY RANDOM()
      `;
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
      const fillQuery = `
        SELECT * FROM vocabulary
        WHERE studentId = ? AND status IN ('old', 'review')
        ORDER BY lastReviewedAt ASC
      `;
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
      const masteredQuery = `
        SELECT * FROM vocabulary
        WHERE studentId = ? AND status = 'mastered'
        ORDER BY becomeMasteredAt ASC
      `;
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
      const fillQuery = `
        SELECT * FROM vocabulary
        WHERE studentId = ? AND status IN ('old', 'review')
        ORDER BY lastReviewedAt ASC
      `;
      const fillCandidates = db.prepare(fillQuery).all(studentId) as Vocabulary[];
      for (const w of fillCandidates) {
        if (selectedIds.has(w.id)) continue;
        selectedMastered.push(w);
        selectedIds.add(w.id);
        if (selectedMastered.length >= needMastered) break;
      }
    }

    // === 最终兜底：若总数不足 TARGET_COUNT，从所有剩余可用词汇补足 ===
    // 场景：历史数据丢失导致所有词都是新词时，需复习/旧词/已掌握的缺口全部用新词补足
    const beforeFillCount = selectedReview.length + selectedOld.length + selectedNew.length + selectedMastered.length;
    if (beforeFillCount < TARGET_COUNT) {
      let deficit = TARGET_COUNT - beforeFillCount;

      // 第一阶段：排除今天已出现的词，按 新词>旧词>需复习>已掌握 优先级补足
      const fillQueryPhase1 = `
        SELECT * FROM vocabulary
        WHERE studentId = ?
        ORDER BY CASE status
          WHEN 'new' THEN 1
          WHEN 'old' THEN 2
          WHEN 'review' THEN 3
          WHEN 'mastered' THEN 4
        END, RANDOM()
      `;
      const allCandidates1 = db.prepare(fillQueryPhase1).all(studentId) as Vocabulary[];
      for (const w of allCandidates1) {
        if (deficit <= 0) break;
        if (selectedIds.has(w.id)) continue;
        if (w.lastAppearedDate === localToday) continue;
        if (w.status === 'new') selectedNew.push(w);
        else if (w.status === 'old') selectedOld.push(w);
        else if (w.status === 'review') selectedReview.push(w);
        else if (w.status === 'mastered') selectedMastered.push(w);
        selectedIds.add(w.id);
        deficit--;
      }

      // 第二阶段：若仍不足（词库少或今天都出现过），放宽"今天已出现"限制
      if (deficit > 0) {
        const fillQueryPhase2 = `
          SELECT * FROM vocabulary
          WHERE studentId = ?
          ORDER BY CASE status
            WHEN 'new' THEN 1
            WHEN 'old' THEN 2
            WHEN 'review' THEN 3
            WHEN 'mastered' THEN 4
          END, RANDOM()
        `;
        const allCandidates2 = db.prepare(fillQueryPhase2).all(studentId) as Vocabulary[];
        for (const w of allCandidates2) {
          if (deficit <= 0) break;
          if (selectedIds.has(w.id)) continue;
          if (w.status === 'new') selectedNew.push(w);
          else if (w.status === 'old') selectedOld.push(w);
          else if (w.status === 'review') selectedReview.push(w);
          else if (w.status === 'mastered') selectedMastered.push(w);
          selectedIds.add(w.id);
          deficit--;
        }
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
    const newErrorIdsSet = new Set<string>((errorWordIds || []).map((id: any) => String(id)));

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

    // 上次保存的错误标记（用于差量更新，支持多次修改结果）
    let prevErrorIdsSet = new Set<string>();
    try {
      const prevErrors: any[] = task.markedErrorWords ? JSON.parse(task.markedErrorWords) : [];
      prevErrorIdsSet = new Set<string>(prevErrors.map((id: any) => String(id)));
    } catch (e) {
      // 解析失败按首次处理
    }
    const isRecomplete = task.completed === 1;

    // 计算状态变化：
    // addedErrors = 本次错 - 上次错（上次对→本次错，需要执行答错处理）
    // removedErrors = 上次错 - 本次错（上次错→本次对，需要回滚答错并执行答对处理）
    // unchanged = 上次和本次都一样（不处理）
    const addedErrors = [...newErrorIdsSet].filter(id => !prevErrorIdsSet.has(id));
    const removedErrors = [...prevErrorIdsSet].filter(id => !newErrorIdsSet.has(id));

    // 更新任务标记
    db.prepare(`
      UPDATE daily_tasks
      SET completed = 1, markedErrorWords = ?
      WHERE id = ?
    `).run(JSON.stringify(errorWordIds || []), taskId);

    // 答错处理：新加入错误的单词 → 转入需复习
    // 注意：如果是首次完成，prevErrorIdsSet 为空，addedErrors 就是全部错误词
    const applyError = (id: string) => {
      const vocab = db.prepare('SELECT * FROM vocabulary WHERE id = ?').get(id) as any;
      if (!vocab) return;
      // 已在 review 状态则只累加错误次数（避免状态重复流转）
      db.prepare(`
        UPDATE vocabulary
        SET status = 'review', consecutiveCorrectCount = 0, errorCount = errorCount + 1,
            lastErrorDate = ?, lastReviewedAt = ?, updatedAt = ?
        WHERE id = ?
      `).run(localToday, localToday, localToday, id);
    };

    // 答对处理：从错误改为正确的单词 → 执行答对状态流转
    const applyCorrect = (id: string) => {
      const vocab = db.prepare('SELECT * FROM vocabulary WHERE id = ?').get(id) as any;
      if (!vocab) return;

      if (vocab.status === 'new') {
        db.prepare(`
          UPDATE vocabulary
          SET status = 'old', consecutiveCorrectCount = 1, correctCount = correctCount + 1,
              lastReviewedAt = ?, updatedAt = ?
          WHERE id = ?
        `).run(localToday, localToday, id);
      } else if (vocab.status === 'old') {
        db.prepare(`
          UPDATE vocabulary
          SET consecutiveCorrectCount = consecutiveCorrectCount + 1, correctCount = correctCount + 1,
              lastReviewedAt = ?, updatedAt = ?
          WHERE id = ?
        `).run(localToday, localToday, id);
      } else if (vocab.status === 'review') {
        const newConsecutive = (vocab.consecutiveCorrectCount || 0) + 1;
        if (newConsecutive >= 3) {
          db.prepare(`
            UPDATE vocabulary
            SET status = 'mastered', consecutiveCorrectCount = ?, correctCount = correctCount + 1,
                becomeMasteredAt = ?, lastReviewedAt = ?, updatedAt = ?
            WHERE id = ?
          `).run(newConsecutive, localToday, localToday, localToday, id);
        } else {
          db.prepare(`
            UPDATE vocabulary
            SET consecutiveCorrectCount = ?, correctCount = correctCount + 1,
                lastReviewedAt = ?, updatedAt = ?
            WHERE id = ?
          `).run(newConsecutive, localToday, localToday, id);
        }
      } else if (vocab.status === 'mastered') {
        db.prepare(`
          UPDATE vocabulary
          SET correctCount = correctCount + 1, lastReviewedAt = ?, updatedAt = ?
          WHERE id = ?
        `).run(localToday, localToday, id);
      }
    };

    const applyErrorTx = db.transaction((ids: string[]) => {
      for (const id of ids) applyError(id);
    });
    const applyCorrectTx = db.transaction((ids: string[]) => {
      for (const id of ids) applyCorrect(id);
    });

    if (isRecomplete) {
      // 修改结果模式：只处理状态变化的单词，避免重复累加统计
      if (addedErrors.length > 0) applyErrorTx(addedErrors);
      if (removedErrors.length > 0) applyCorrectTx(removedErrors);
    } else {
      // 首次完成模式：全部错误词执行答错处理，全部正确词执行答对处理
      const correctWordIds = allWordIds.filter(id => !newErrorIdsSet.has(id));
      if (errorWordIds && errorWordIds.length > 0) applyErrorTx(errorWordIds);
      if (correctWordIds.length > 0) applyCorrectTx(correctWordIds);
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

    const stats = {
      total: 0,
      new: 0,
      reviewed: 0,
      mastered: 0,
      error: 0,
    };

    const total = db.prepare('SELECT COUNT(*) as count FROM vocabulary WHERE studentId = ?')
      .get(studentId) as { count: number };
    stats.total = total.count;

    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM vocabulary
      WHERE studentId = ?
      GROUP BY status
    `).all(studentId) as { status: string; count: number }[];

    for (const row of byStatus) {
      if (row.status in stats) {
        (stats as any)[row.status] = row.count;
      } else if (row.status === 'old') {
        stats.reviewed = row.count;
      } else if (row.status === 'review') {
        stats.error = row.count;
      }
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
      ...stats,
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
    const errorCollections = db.prepare('SELECT * FROM error_collections').all();
    const grammarWeaknesses = db.prepare('SELECT * FROM grammar_weaknesses').all();
    const grammarQuestions = db.prepare('SELECT * FROM grammar_questions').all();

    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      students,
      vocabulary,
      dailyTasks,
      settings,
      errorCollections,
      grammarWeaknesses,
      grammarQuestions
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
          INSERT OR REPLACE INTO vocabulary (id, word, meaning, studentId, type, status, correctCount, errorCount, consecutiveCorrectCount, addedAt, lastReviewedAt, lastErrorDate, becomeMasteredAt, lastAppearedDate, isCustom, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // 兼容旧 status 体系：reviewed→old, error→review
        const normalizeStatus = (s: any): string => {
          if (!s) return 'new';
          if (s === 'reviewed') return 'old';
          if (s === 'error') return 'review';
          // 新体系合法值直接放行
          if (['new', 'old', 'review', 'mastered'].includes(s)) return s;
          // 未知值降级为 new，避免 CHECK 约束失败
          return 'new';
        };

        for (const vocab of data.vocabulary) {
          insertVocabulary.run(
            vocab.id,
            vocab.word,
            vocab.meaning,
            vocab.studentId,
            vocab.type || 'word',
            normalizeStatus(vocab.status),
            vocab.correctCount || 0,
            vocab.errorCount || 0,
            vocab.consecutiveCorrectCount || 0,
            vocab.addedAt || new Date().toISOString(),
            vocab.lastReviewedAt,
            vocab.lastErrorDate,
            vocab.becomeMasteredAt,
            vocab.lastAppearedDate,
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

      // 错题归集
      if (data.errorCollections && Array.isArray(data.errorCollections)) {
        const insertErrorCollection = db.prepare(`
          INSERT OR REPLACE INTO error_collections (id, studentId, title, question, answer, imageData, category, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of data.errorCollections) {
          insertErrorCollection.run(
            item.id,
            item.studentId,
            item.title,
            item.question,
            item.answer,
            item.imageData,
            item.category || 'general',
            item.createdAt || new Date().toISOString(),
            item.updatedAt || new Date().toISOString()
          );
        }
      }

      // 语法短板
      if (data.grammarWeaknesses && Array.isArray(data.grammarWeaknesses)) {
        const insertGrammarWeakness = db.prepare(`
          INSERT OR REPLACE INTO grammar_weaknesses (id, studentId, title, description, category, example, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of data.grammarWeaknesses) {
          insertGrammarWeakness.run(
            item.id,
            item.studentId,
            item.title,
            item.description,
            item.category || 'grammar',
            item.example,
            item.createdAt || new Date().toISOString(),
            item.updatedAt || new Date().toISOString()
          );
        }
      }

      // 语法题目
      if (data.grammarQuestions && Array.isArray(data.grammarQuestions)) {
        const insertGrammarQuestion = db.prepare(`
          INSERT OR REPLACE INTO grammar_questions (id, studentId, weaknessId, question, answer, type, options, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of data.grammarQuestions) {
          insertGrammarQuestion.run(
            item.id,
            item.studentId,
            item.weaknessId,
            item.question,
            item.answer,
            item.type || 'fill_blank',
            item.options,
            item.createdAt || new Date().toISOString(),
            item.updatedAt || new Date().toISOString()
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

router.get('/error-collections', (req, res) => {
  try {
    const studentId = req.query.studentId as string;
    let query = 'SELECT * FROM error_collections WHERE 1=1';
    const params: any[] = [];

    if (studentId) {
      query += ' AND studentId = ?';
      params.push(studentId);
    }
    query += ' ORDER BY createdAt DESC';

    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: '获取错题失败' });
  }
});

router.post('/error-collections', (req, res) => {
  try {
    const { studentId, title, question, answer, imageData, category } = req.body;
    const localToday = getLocalToday();
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    db.prepare(`
      INSERT INTO error_collections (id, studentId, title, question, answer, imageData, category, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, studentId, title, question || '', answer, imageData || null, category || 'general', localToday, localToday);

    res.json({ id, message: '错题添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加错题失败' });
  }
});

router.put('/error-collections/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, question, answer, imageData, category } = req.body;
    const localToday = getLocalToday();

    db.prepare(`
      UPDATE error_collections
      SET title = ?, question = ?, answer = ?, imageData = ?, category = ?, updatedAt = ?
      WHERE id = ?
    `).run(title, question || '', answer, imageData || null, category, localToday, id);

    res.json({ message: '错题更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新错题失败' });
  }
});

router.delete('/error-collections/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM error_collections WHERE id = ?').run(id);
    res.json({ message: '错题删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除错题失败' });
  }
});

router.get('/paper-practice', (req, res) => {
  try {
    const studentId = req.query.studentId as string;
    const count = parseInt(req.query.count as string) || 10;

    const errors = db.prepare(`
      SELECT * FROM error_collections
      WHERE studentId = ?
      ORDER BY RANDOM()
      LIMIT ?
    `).all(studentId, count) as any[];

    const vocabulary = db.prepare(`
      SELECT * FROM vocabulary
      WHERE studentId = ? AND status = 'error'
      ORDER BY RANDOM()
      LIMIT ?
    `).all(studentId, Math.max(0, count - errors.length)) as any[];

    res.json({
      errorCollections: errors,
      errorVocabulary: vocabulary,
      totalCount: errors.length + vocabulary.length
    });
  } catch (error) {
    res.status(500).json({ error: '生成试卷失败' });
  }
});

router.get('/grammar-weaknesses', (req, res) => {
  try {
    const studentId = req.query.studentId as string;
    let query = 'SELECT * FROM grammar_weaknesses WHERE 1=1';
    const params: any[] = [];

    if (studentId) {
      query += ' AND studentId = ?';
      params.push(studentId);
    }
    query += ' ORDER BY createdAt DESC';

    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: '获取语法短板失败' });
  }
});

router.post('/grammar-weaknesses', (req, res) => {
  try {
    const { studentId, title, description, category, example } = req.body;
    const localToday = getLocalToday();
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    db.prepare(`
      INSERT INTO grammar_weaknesses (id, studentId, title, description, category, example, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, studentId, title, description || '', category || 'grammar', example || '', localToday, localToday);

    res.json({ id, message: '语法短板添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加语法短板失败' });
  }
});

router.put('/grammar-weaknesses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, example } = req.body;
    const localToday = getLocalToday();

    db.prepare(`
      UPDATE grammar_weaknesses
      SET title = ?, description = ?, category = ?, example = ?, updatedAt = ?
      WHERE id = ?
    `).run(title, description || '', category, example || '', localToday, id);

    res.json({ message: '语法短板更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新语法短板失败' });
  }
});

router.delete('/grammar-weaknesses/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM grammar_weaknesses WHERE id = ?').run(id);
    res.json({ message: '语法短板删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除语法短板失败' });
  }
});

router.get('/grammar-questions', (req, res) => {
  try {
    const studentId = req.query.studentId as string;
    const weaknessId = req.query.weaknessId as string;
    let query = 'SELECT * FROM grammar_questions WHERE 1=1';
    const params: any[] = [];

    if (studentId) {
      query += ' AND studentId = ?';
      params.push(studentId);
    }
    if (weaknessId) {
      query += ' AND weaknessId = ?';
      params.push(weaknessId);
    }
    query += ' ORDER BY createdAt DESC';

    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: '获取语法试题失败' });
  }
});

router.post('/grammar-questions', (req, res) => {
  try {
    const { studentId, weaknessId, question, answer, type, options } = req.body;
    const localToday = getLocalToday();
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    db.prepare(`
      INSERT INTO grammar_questions (id, studentId, weaknessId, question, answer, type, options, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, studentId, weaknessId || null, question, answer, type || 'fill_blank', options || null, localToday, localToday);

    res.json({ id, message: '语法试题添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加语法试题失败' });
  }
});

router.put('/grammar-questions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, type, options } = req.body;
    const localToday = getLocalToday();

    db.prepare(`
      UPDATE grammar_questions
      SET question = ?, answer = ?, type = ?, options = ?, updatedAt = ?
      WHERE id = ?
    `).run(question, answer, type, options || null, localToday, id);

    res.json({ message: '语法试题更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新语法试题失败' });
  }
});

router.delete('/grammar-questions/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM grammar_questions WHERE id = ?').run(id);
    res.json({ message: '语法试题删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除语法试题失败' });
  }
});

router.get('/grammar-practice', (req, res) => {
  try {
    const studentId = req.query.studentId as string;
    const count = parseInt(req.query.count as string) || 10;

    const weaknesses = db.prepare(`
      SELECT * FROM grammar_weaknesses WHERE studentId = ?
    `).all(studentId) as any[];

    if (weaknesses.length === 0) {
      res.json({ questions: [], weaknesses: [], totalCount: 0 });
      return;
    }

    let questions: any[] = [];
    for (const w of weaknesses) {
      const qs = db.prepare(`
        SELECT * FROM grammar_questions WHERE weaknessId = ? ORDER BY RANDOM()
      `).all(w.id) as any[];
      questions = questions.concat(qs);
    }

    if (questions.length === 0) {
      const qs = db.prepare(`
        SELECT * FROM grammar_questions WHERE studentId = ? ORDER BY RANDOM() LIMIT ?
      `).all(studentId, count) as any[];
      questions = qs;
    }

    if (questions.length > count) {
      questions = questions.sort(() => Math.random() - 0.5).slice(0, count);
    }

    res.json({
      questions,
      weaknesses,
      totalCount: questions.length
    });
  } catch (error) {
    res.status(500).json({ error: '生成语法练习失败' });
  }
});

export default router;
