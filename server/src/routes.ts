import { Router } from 'express';
import db from './database';
import { initializeVocabulary } from './initData';

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  grade: number;
  studentId?: string;
  status: 'new' | 'reviewed' | 'mastered' | 'error';
  correctCount: number;
  errorCount: number;
  addedAt: string;
  lastReviewedAt?: string;
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
    const { name, grade } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    db.prepare(`
      INSERT INTO students (id, name, grade, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, grade, today, today);

    res.json({ id, name, grade, message: '学生添加成功' });
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
    const { name, grade } = req.body;
    const today = new Date().toISOString().split('T')[0];

    db.prepare(`
      UPDATE students SET name = ?, grade = ?, updatedAt = ? WHERE id = ?
    `).run(name, grade, today, id);

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
    const { currentGrade, currentStudentId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const updateFields: string[] = [];
    const params: any[] = [];

    if (currentGrade !== undefined) {
      updateFields.push('currentGrade = ?');
      params.push(currentGrade);
    }
    if (currentStudentId !== undefined) {
      updateFields.push('currentStudentId = ?');
      params.push(currentStudentId);
    }
    updateFields.push('updatedAt = ?');
    params.push(today);
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
    const { currentGrade, currentStudentId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const updateFields: string[] = [];
    const params: any[] = [];

    if (currentGrade !== undefined) {
      updateFields.push('currentGrade = ?');
      params.push(currentGrade);
    }
    if (currentStudentId !== undefined) {
      updateFields.push('currentStudentId = ?');
      params.push(currentStudentId);
    }
    updateFields.push('updatedAt = ?');
    params.push(today);
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
    const grade = req.query.grade as string;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const studentId = req.query.studentId as string;

    let query = 'SELECT * FROM vocabulary WHERE 1=1';
    const params: any[] = [];

    if (grade) {
      query += ' AND grade = ?';
      params.push(Number(grade));
    }

    if (studentId) {
      query += ' AND (studentId = ? OR studentId IS NULL)';
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
    const { word, meaning, grade, status, studentId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    db.prepare(`
      INSERT INTO vocabulary (id, word, meaning, grade, studentId, status, correctCount, errorCount, addedAt, isCustom)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, 1)
    `).run(id, word, meaning, grade, studentId || null, status || 'new', today);

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
    const today = new Date().toISOString().split('T')[0];
    let count = 0;

    const insert = db.prepare(`
      INSERT INTO vocabulary (id, word, meaning, grade, studentId, status, correctCount, errorCount, addedAt, isCustom)
      VALUES (?, ?, ?, ?, ?, 'reviewed', 0, 0, ?, 1)
    `);

    const insertMany = db.transaction((items: any[]) => {
      for (const item of items) {
        const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        insert.run(id, item.word, item.meaning, item.grade, studentId || null, today);
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
    const grade = req.query.grade as string;
    const studentId = req.query.studentId as string;
    const today = new Date().toISOString().split('T')[0];

    const task = db.prepare('SELECT * FROM daily_tasks WHERE date = ? AND grade = ? AND (studentId = ? OR studentId IS NULL)')
      .get(today, Number(grade), studentId || null) as any;

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
        grade: task.grade,
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

router.post('/daily-task/generate', (req, res) => {
  try {
    const { grade, studentId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const TARGET_COUNT = 30;

    const allVocabulary = db.prepare(`
      SELECT * FROM vocabulary
      WHERE grade = ? AND (studentId = ? OR studentId IS NULL)
      ORDER BY 
        CASE status 
          WHEN 'error' THEN 1 
          WHEN 'new' THEN 2 
          WHEN 'reviewed' THEN 3 
          WHEN 'mastered' THEN 4 
        END,
        RANDOM()
    `).all(Number(grade), studentId || null);

    if (allVocabulary.length === 0) {
      res.json({
        id: null,
        date: today,
        grade: Number(grade),
        studentId,
        newWords: [],
        reviewedWords: [],
        completed: false,
        markedErrorWords: [],
        message: '暂无词汇，请先添加词汇'
      });
      return;
    }

    const newWordsList: any[] = [];
    const reviewedWordsList: any[] = [];
    const usedIds = new Set<string>();

    for (const vocab of allVocabulary) {
      const v = vocab as Vocabulary;
      if (usedIds.has(v.id)) continue;
      
      if (v.status === 'new' && newWordsList.length < 10) {
        newWordsList.push(v);
        usedIds.add(v.id);
      } else if (v.status === 'error' || v.status === 'reviewed' || v.status === 'mastered') {
        reviewedWordsList.push(v);
        usedIds.add(v.id);
      } else if (newWordsList.length < TARGET_COUNT && usedIds.size < allVocabulary.length) {
        newWordsList.push(v);
        usedIds.add(v.id);
      }

      if (usedIds.size >= TARGET_COUNT) break;
    }

    let currentCount = newWordsList.length + reviewedWordsList.length;
    if (currentCount < TARGET_COUNT) {
      const remaining = db.prepare(`
        SELECT * FROM vocabulary
        WHERE grade = ? AND (studentId = ? OR studentId IS NULL)
        AND id NOT IN (${Array.from(usedIds).map(() => '?').join(',') || "''"})
        ORDER BY RANDOM()
        LIMIT ?
      `).all(Number(grade), studentId || null, ...Array.from(usedIds), TARGET_COUNT - currentCount) as Vocabulary[];
      
      for (const vocab of remaining) {
        if (vocab.status === 'new') {
          newWordsList.push(vocab);
        } else {
          reviewedWordsList.push(vocab);
        }
        currentCount++;
        if (currentCount >= TARGET_COUNT) break;
      }
    }

    const allSelected = [...newWordsList, ...reviewedWordsList].sort(() => Math.random() - 0.5);
    const finalNewWords = newWordsList.filter(w => allSelected.includes(w));
    const finalReviewedWords = reviewedWordsList.filter(w => allSelected.includes(w));

    const taskId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    db.prepare(`
      DELETE FROM daily_tasks WHERE date = ? AND grade = ? AND (studentId = ? OR studentId IS NULL)
    `).run(today, Number(grade), studentId || null);

    const totalCount = finalNewWords.length + finalReviewedWords.length;
    db.prepare(`
      INSERT INTO daily_tasks (id, date, grade, studentId, completed, markedErrorWords, newWords, reviewedWords, totalCount)
      VALUES (?, ?, ?, ?, 0, '[]', ?, ?, ?)
    `).run(taskId, today, Number(grade), studentId || null, JSON.stringify(finalNewWords), JSON.stringify(finalReviewedWords), totalCount);

    res.json({
      id: taskId,
      date: today,
      grade: Number(grade),
      studentId,
      newWords: finalNewWords,
      reviewedWords: finalReviewedWords,
      totalCount,
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
    const { taskId, errorWordIds, studentId } = req.body;
    const today = new Date().toISOString().split('T')[0];
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

    const updateError = db.transaction((ids: string[]) => {
      for (const id of ids) {
        db.prepare(`
          UPDATE vocabulary
          SET status = 'error', errorCount = errorCount + 1, correctCount = 0, lastReviewedAt = ?, updatedAt = ?
          WHERE id = ?
        `).run(today, today, id);
      }
    });

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

    if (errorWordIds && errorWordIds.length > 0) {
      updateError(errorWordIds);
    }

    if (correctWordIds.length > 0) {
      updateCorrect(correctWordIds);
    }

    const updateFields: string[] = ['lastStudyDate = ?'];
    const params: any[] = [today];

    if (studentId) {
      updateFields.push('currentStudentId = ?');
      params.push(studentId);
    }
    updateFields.push('updatedAt = ?');
    params.push(today);
    params.push(1);

    db.prepare(`UPDATE settings SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);

    res.json({ message: '任务完成' });
  } catch (error) {
    res.status(500).json({ error: '完成任务失败' });
  }
});

router.get('/daily-task/history', (req, res) => {
  try {
    const grade = req.query.grade as string;
    const studentId = req.query.studentId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;

    const tasks = db.prepare(`
      SELECT * FROM daily_tasks 
      WHERE grade = ? 
      AND (studentId = ? OR studentId IS NULL)
      AND completed = 1
      ORDER BY date DESC
      LIMIT ?
    `).all(Number(grade), studentId || null, limit) as any[];

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
        grade: task.grade,
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
    const grade = req.query.grade as string;
    const studentId = req.query.studentId as string;

    const stats = {
      total: 0,
      new: 0,
      reviewed: 0,
      mastered: 0,
      error: 0,
    };

    const total = db.prepare('SELECT COUNT(*) as count FROM vocabulary WHERE grade = ? AND (studentId = ? OR studentId IS NULL)')
      .get(Number(grade), studentId || null) as { count: number };
    stats.total = total.count;

    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM vocabulary
      WHERE grade = ? AND (studentId = ? OR studentId IS NULL)
      GROUP BY status
    `).all(Number(grade), studentId || null) as { status: string; count: number }[];

    for (const row of byStatus) {
      if (row.status in stats) {
        (stats as any)[row.status] = row.count;
      }
    }

    const totalCorrect = db.prepare(`
      SELECT SUM(correctCount) as total FROM vocabulary WHERE grade = ? AND (studentId = ? OR studentId IS NULL)
    `).get(Number(grade), studentId || null) as { total: number };

    const totalError = db.prepare(`
      SELECT SUM(errorCount) as total FROM vocabulary WHERE grade = ? AND (studentId = ? OR studentId IS NULL)
    `).get(Number(grade), studentId || null) as { total: number };

    const completedDays = db.prepare(`
      SELECT COUNT(DISTINCT date) as count FROM daily_tasks WHERE completed = 1 AND grade = ? AND (studentId = ? OR studentId IS NULL)
    `).get(Number(grade), studentId || null) as { count: number };

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

export default router;
