import { Router } from 'express';
import db from './database.js';
import { initializeVocabulary } from './initData.js';

const router = Router();

router.get('/init', (req, res) => {
  initializeVocabulary();
  res.json({ message: '数据初始化完成' });
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
    const { currentGrade } = req.body;
    const today = new Date().toISOString().split('T')[0];
    db.prepare('UPDATE settings SET currentGrade = ?, updatedAt = ? WHERE id = 1')
      .run(currentGrade, today);
    res.json({ message: '设置更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新设置失败' });
  }
});

router.get('/vocabulary', (req, res) => {
  try {
    const { grade, status, search } = req.query;
    let query = 'SELECT * FROM vocabulary WHERE 1=1';
    const params: any[] = [];
    
    if (grade) {
      query += ' AND grade = ?';
      params.push(Number(grade));
    }
    
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (word LIKE ? OR meaning LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
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
    const { word, meaning, grade, status } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    db.prepare(`
      INSERT INTO vocabulary (id, word, meaning, grade, status, correctCount, errorCount, addedAt, isCustom)
      VALUES (?, ?, ?, ?, ?, 0, 0, ?, 1)
    `).run(id, word, meaning, grade, status || 'new', today);
    
    res.json({ id, message: '词汇添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加词汇失败' });
  }
});

router.put('/vocabulary/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { word, meaning, grade, status } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    db.prepare(`
      UPDATE vocabulary 
      SET word = ?, meaning = ?, grade = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `).run(word, meaning, grade, status, today, id);
    
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

router.post('/vocabulary/bulk', (req, res) => {
  try {
    const { words } = req.body;
    const today = new Date().toISOString().split('T')[0];
    let count = 0;
    
    const insert = db.prepare(`
      INSERT INTO vocabulary (id, word, meaning, grade, status, correctCount, errorCount, addedAt, isCustom)
      VALUES (?, ?, ?, ?, 'new', 0, 0, ?, 1)
    `);
    
    const insertMany = db.transaction((items: any[]) => {
      for (const item of items) {
        const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        insert.run(id, item.word, item.meaning, item.grade, today);
        count++;
      }
    });
    
    insertMany(words);
    res.json({ message: `成功导入 ${count} 个词汇` });
  } catch (error) {
    res.status(500).json({ error: '批量导入失败' });
  }
});

router.get('/daily-task', (req, res) => {
  try {
    const { grade } = req.query;
    const today = new Date().toISOString().split('T')[0];
    
    const task = db.prepare('SELECT * FROM daily_tasks WHERE date = ? AND grade = ?')
      .get(today, Number(grade));
    
    if (task) {
      const vocabIds = (task as any).markedErrorWords 
        ? JSON.parse((task as any).markedErrorWords) 
        : [];
      
      const newWords = db.prepare(`
        SELECT * FROM vocabulary WHERE id IN (
          SELECT id FROM vocabulary WHERE grade = ? AND status = 'new' LIMIT 10
        )
      `).all(Number(grade));
      
      const reviewedWords = db.prepare(`
        SELECT * FROM vocabulary WHERE id IN (
          SELECT id FROM vocabulary WHERE grade = ? AND status IN ('reviewed', 'mastered', 'error') LIMIT 20
        )
      `).all(Number(grade));
      
      res.json({
        ...task,
        newWords,
        reviewedWords,
        markedErrorWords: vocabIds
      });
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ error: '获取任务失败' });
  }
});

router.post('/daily-task/generate', (req, res) => {
  try {
    const { grade } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const config: Record<number, { total: number; newCount: number; reviewCount: number }> = {
      2: { total: 30, newCount: 10, reviewCount: 20 },
      3: { total: 30, newCount: 10, reviewCount: 20 },
      4: { total: 30, newCount: 10, reviewCount: 20 },
      5: { total: 40, newCount: 15, reviewCount: 25 },
      6: { total: 40, newCount: 15, reviewCount: 25 },
    };
    
    const cfg = config[Number(grade)] || config[4];
    
    const newWords = db.prepare(`
      SELECT * FROM vocabulary 
      WHERE grade = ? AND status = 'new' 
      ORDER BY RANDOM() 
      LIMIT ?
    `).all(Number(grade), cfg.newCount);
    
    const errorWords = db.prepare(`
      SELECT * FROM vocabulary 
      WHERE grade = ? AND status = 'error' 
      ORDER BY RANDOM()
    `).all(Number(grade));
    
    const reviewedWords = db.prepare(`
      SELECT * FROM vocabulary 
      WHERE grade = ? AND status IN ('reviewed', 'mastered') 
      ORDER BY RANDOM() 
      LIMIT ?
    `).all(Number(grade), cfg.reviewCount);
    
    const reviewPool = [...errorWords, ...reviewedWords];
    let selectedReview = reviewPool.slice(0, cfg.reviewCount);
    
    if (selectedReview.length < cfg.reviewCount) {
      const extra = db.prepare(`
        SELECT * FROM vocabulary 
        WHERE grade = ? AND status NOT IN ('new')
        AND id NOT IN (${selectedReview.map(() => '?').join(',') || "''"})
        ORDER BY RANDOM() 
        LIMIT ?
      `).all(Number(grade), ...selectedReview.map((w: any) => w.id), cfg.reviewCount - selectedReview.length);
      selectedReview = [...selectedReview, ...extra];
    }
    
    const allWords = [...newWords, ...selectedReview].sort(() => Math.random() - 0.5);
    const newWordsResult = allWords.slice(0, cfg.newCount);
    const reviewedWordsResult = allWords.slice(cfg.newCount);
    
    const taskId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    db.prepare(`
      DELETE FROM daily_tasks WHERE date = ? AND grade = ?
    `).run(today, Number(grade));
    
    db.prepare(`
      INSERT INTO daily_tasks (id, date, grade, completed, markedErrorWords)
      VALUES (?, ?, ?, 0, '[]')
    `).run(taskId, today, Number(grade));
    
    res.json({
      id: taskId,
      date: today,
      grade: Number(grade),
      newWords: newWordsResult,
      reviewedWords: reviewedWordsResult,
      completed: false,
      markedErrorWords: []
    });
  } catch (error) {
    console.error('生成任务失败:', error);
    res.status(500).json({ error: '生成任务失败' });
  }
});

router.post('/daily-task/complete', (req, res) => {
  try {
    const { taskId, errorWordIds } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    db.prepare(`
      UPDATE daily_tasks 
      SET completed = 1, markedErrorWords = ?
      WHERE id = ?
    `).run(JSON.stringify(errorWordIds), taskId);
    
    const updateVocab = db.prepare(`
      UPDATE vocabulary 
      SET status = ?, errorCount = errorCount + 1, lastReviewedAt = ?, updatedAt = ?
      WHERE id = ?
    `);
    
    const updateCorrect = db.transaction((ids: string[]) => {
      for (const id of ids) {
        const vocab = db.prepare('SELECT * FROM vocabulary WHERE id = ?').get(id) as any;
        if (vocab) {
          if (vocab.correctCount >= 3) {
            db.prepare(`
              UPDATE vocabulary 
              SET status = 'mastered', correctCount = correctCount + 1, lastReviewedAt = ?, updatedAt = ?
              WHERE id = ?
            `).run(today, today, id);
          } else if (vocab.status === 'new') {
            db.prepare(`
              UPDATE vocabulary 
              SET status = 'reviewed', correctCount = correctCount + 1, lastReviewedAt = ?, updatedAt = ?
              WHERE id = ?
            `).run(today, today, id);
          } else {
            db.prepare(`
              UPDATE vocabulary 
              SET correctCount = correctCount + 1, lastReviewedAt = ?, updatedAt = ?
              WHERE id = ?
            `).run(today, today, id);
          }
        }
      }
    });
    
    updateCorrect(errorWordIds || []);
    
    db.prepare(`
      UPDATE settings SET lastStudyDate = ?, updatedAt = ? WHERE id = 1
    `).run(today, today);
    
    res.json({ message: '任务完成' });
  } catch (error) {
    res.status(500).json({ error: '完成任务失败' });
  }
});

router.get('/statistics', (req, res) => {
  try {
    const { grade } = req.query;
    
    const stats = {
      total: 0,
      new: 0,
      reviewed: 0,
      mastered: 0,
      error: 0,
    };
    
    const total = db.prepare('SELECT COUNT(*) as count FROM vocabulary WHERE grade = ?')
      .get(Number(grade)) as { count: number };
    stats.total = total.count;
    
    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM vocabulary 
      WHERE grade = ? 
      GROUP BY status
    `).all(Number(grade)) as { status: string; count: number }[];
    
    for (const row of byStatus) {
      if (row.status in stats) {
        (stats as any)[row.status] = row.count;
      }
    }
    
    const totalCorrect = db.prepare(`
      SELECT SUM(correctCount) as total FROM vocabulary WHERE grade = ?
    `).get(Number(grade)) as { total: number };
    
    const totalError = db.prepare(`
      SELECT SUM(errorCount) as total FROM vocabulary WHERE grade = ?
    `).get(Number(grade)) as { total: number };
    
    const completedDays = db.prepare(`
      SELECT COUNT(DISTINCT date) as count FROM daily_tasks WHERE completed = 1
    `).get() as { count: number };
    
    res.json({
      ...stats,
      totalCorrect: totalCorrect?.total || 0,
      totalError: totalError?.total || 0,
      completedDays: completedDays.count
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计失败' });
  }
});

export default router;
