import db from './database';

const today = new Date().toISOString().split('T')[0];

interface VocabWord {
  word: string;
  meaning: string;
  grade: number;
}

const grade2Words: VocabWord[] = [
  { word: 'apple', meaning: '苹果', grade: 2 },
  { word: 'banana', meaning: '香蕉', grade: 2 },
  { word: 'book', meaning: '书', grade: 2 },
  { word: 'cat', meaning: '猫', grade: 2 },
  { word: 'dog', meaning: '狗', grade: 2 },
  { word: 'egg', meaning: '鸡蛋', grade: 2 },
  { word: 'fish', meaning: '鱼', grade: 2 },
  { word: 'girl', meaning: '女孩', grade: 2 },
  { word: 'happy', meaning: '快乐的', grade: 2 },
  { word: 'ice', meaning: '冰', grade: 2 },
  { word: 'jump', meaning: '跳', grade: 2 },
  { word: 'king', meaning: '国王', grade: 2 },
  { word: 'lion', meaning: '狮子', grade: 2 },
  { word: 'milk', meaning: '牛奶', grade: 2 },
  { word: 'nose', meaning: '鼻子', grade: 2 },
  { word: 'orange', meaning: '橙子', grade: 2 },
  { word: 'pen', meaning: '钢笔', grade: 2 },
  { word: 'queen', meaning: '女王', grade: 2 },
  { word: 'rabbit', meaning: '兔子', grade: 2 },
  { word: 'sun', meaning: '太阳', grade: 2 },
  { word: 'tree', meaning: '树', grade: 2 },
  { word: 'water', meaning: '水', grade: 2 },
  { word: 'yellow', meaning: '黄色', grade: 2 },
  { word: 'zoo', meaning: '动物园', grade: 2 },
  { word: 'big', meaning: '大的', grade: 2 },
  { word: 'small', meaning: '小的', grade: 2 },
  { word: 'red', meaning: '红色', grade: 2 },
  { word: 'blue', meaning: '蓝色', grade: 2 },
  { word: 'green', meaning: '绿色', grade: 2 },
  { word: 'one', meaning: '一', grade: 2 },
  { word: 'two', meaning: '二', grade: 2 },
  { word: 'three', meaning: '三', grade: 2 },
  { word: 'four', meaning: '四', grade: 2 },
  { word: 'five', meaning: '五', grade: 2 },
];

const grade3Words: VocabWord[] = [
  { word: 'animal', meaning: '动物', grade: 3 },
  { word: 'beautiful', meaning: '美丽的', grade: 3 },
  { word: 'classroom', meaning: '教室', grade: 3 },
  { word: 'dinner', meaning: '晚餐', grade: 3 },
  { word: 'elephant', meaning: '大象', grade: 3 },
  { word: 'family', meaning: '家庭', grade: 3 },
  { word: 'garden', meaning: '花园', grade: 3 },
  { word: 'holiday', meaning: '假期', grade: 3 },
  { word: 'interesting', meaning: '有趣的', grade: 3 },
  { word: 'kitchen', meaning: '厨房', grade: 3 },
  { word: 'library', meaning: '图书馆', grade: 3 },
  { word: 'music', meaning: '音乐', grade: 3 },
  { word: 'number', meaning: '数字', grade: 3 },
  { word: 'office', meaning: '办公室', grade: 3 },
  { word: 'picture', meaning: '图片', grade: 3 },
  { word: 'question', meaning: '问题', grade: 3 },
  { word: 'rainbow', meaning: '彩虹', grade: 3 },
  { word: 'school', meaning: '学校', grade: 3 },
  { word: 'teacher', meaning: '老师', grade: 3 },
  { word: 'umbrella', meaning: '雨伞', grade: 3 },
  { word: 'vegetable', meaning: '蔬菜', grade: 3 },
  { word: 'window', meaning: '窗户', grade: 3 },
  { word: 'zebra', meaning: '斑马', grade: 3 },
  { word: 'breakfast', meaning: '早餐', grade: 3 },
  { word: 'lunch', meaning: '午餐', grade: 3 },
  { word: 'friend', meaning: '朋友', grade: 3 },
  { word: 'play', meaning: '玩', grade: 3 },
  { word: 'read', meaning: '读', grade: 3 },
  { word: 'write', meaning: '写', grade: 3 },
  { word: 'draw', meaning: '画', grade: 3 },
  { word: 'sing', meaning: '唱', grade: 3 },
  { word: 'dance', meaning: '跳舞', grade: 3 },
  { word: 'run', meaning: '跑', grade: 3 },
];

const grade4Words: VocabWord[] = [
  { word: 'accident', meaning: '事故', grade: 4 },
  { word: 'believe', meaning: '相信', grade: 4 },
  { word: 'camera', meaning: '照相机', grade: 4 },
  { word: 'dangerous', meaning: '危险的', grade: 4 },
  { word: 'environment', meaning: '环境', grade: 4 },
  { word: 'fantastic', meaning: '极好的', grade: 4 },
  { word: 'geography', meaning: '地理', grade: 4 },
  { word: 'history', meaning: '历史', grade: 4 },
  { word: 'important', meaning: '重要的', grade: 4 },
  { word: 'journey', meaning: '旅行', grade: 4 },
  { word: 'knowledge', meaning: '知识', grade: 4 },
  { word: 'language', meaning: '语言', grade: 4 },
  { word: 'medicine', meaning: '药', grade: 4 },
  { word: 'opinion', meaning: '意见', grade: 4 },
  { word: 'practice', meaning: '练习', grade: 4 },
  { word: 'quietly', meaning: '安静地', grade: 4 },
  { word: 'remember', meaning: '记得', grade: 4 },
  { word: 'science', meaning: '科学', grade: 4 },
  { word: 'technology', meaning: '技术', grade: 4 },
  { word: 'vacation', meaning: '假期', grade: 4 },
  { word: 'wonderful', meaning: '精彩的', grade: 4 },
  { word: 'because', meaning: '因为', grade: 4 },
  { word: 'before', meaning: '在...之前', grade: 4 },
  { word: 'between', meaning: '在...之间', grade: 4 },
  { word: 'both', meaning: '两者都', grade: 4 },
  { word: 'bring', meaning: '带来', grade: 4 },
  { word: 'build', meaning: '建造', grade: 4 },
  { word: 'careful', meaning: '小心的', grade: 4 },
  { word: 'catch', meaning: '抓住', grade: 4 },
];

const grade5Words: VocabWord[] = [
  { word: 'achievement', meaning: '成就', grade: 5 },
  { word: 'benefit', meaning: '利益', grade: 5 },
  { word: 'communication', meaning: '交流', grade: 5 },
  { word: 'develop', meaning: '发展', grade: 5 },
  { word: 'education', meaning: '教育', grade: 5 },
  { word: 'experience', meaning: '经历', grade: 5 },
  { word: 'foreign', meaning: '外国的', grade: 5 },
  { word: 'government', meaning: '政府', grade: 5 },
  { word: 'improve', meaning: '提高', grade: 5 },
  { word: 'knowledgeable', meaning: '有知识的', grade: 5 },
  { word: 'literature', meaning: '文学', grade: 5 },
  { word: 'modern', meaning: '现代的', grade: 5 },
  { word: 'necessary', meaning: '必要的', grade: 5 },
  { word: 'opportunity', meaning: '机会', grade: 5 },
  { word: 'popular', meaning: '流行的', grade: 5 },
  { word: 'quality', meaning: '质量', grade: 5 },
  { word: 'research', meaning: '研究', grade: 5 },
  { word: 'society', meaning: '社会', grade: 5 },
  { word: 'traditional', meaning: '传统的', grade: 5 },
  { word: 'understand', meaning: '理解', grade: 5 },
  { word: 'valuable', meaning: '有价值的', grade: 5 },
  { word: 'wonder', meaning: '想知道', grade: 5 },
  { word: 'abroad', meaning: '在国外', grade: 5 },
  { word: 'accept', meaning: '接受', grade: 5 },
  { word: 'achieve', meaning: '实现', grade: 5 },
  { word: 'advice', meaning: '建议', grade: 5 },
  { word: 'afford', meaning: '买得起', grade: 5 },
  { word: 'although', meaning: '虽然', grade: 5 },
  { word: 'amazing', meaning: '令人惊讶的', grade: 5 },
  { word: 'ancient', meaning: '古代的', grade: 5 },
];

const grade6Words: VocabWord[] = [
  { word: 'accomplish', meaning: '完成', grade: 6 },
  { word: 'beneficial', meaning: '有益的', grade: 6 },
  { word: 'circumstance', meaning: '情况', grade: 6 },
  { word: 'determination', meaning: '决心', grade: 6 },
  { word: 'encourage', meaning: '鼓励', grade: 6 },
  { word: 'fascinating', meaning: '迷人的', grade: 6 },
  { word: 'gratitude', meaning: '感激', grade: 6 },
  { word: 'incredible', meaning: '难以置信的', grade: 6 },
  { word: 'magnificent', meaning: '宏伟的', grade: 6 },
  { word: 'negotiate', meaning: '谈判', grade: 6 },
  { word: 'obligation', meaning: '义务', grade: 6 },
  { word: 'phenomenon', meaning: '现象', grade: 6 },
  { word: 'qualification', meaning: '资格', grade: 6 },
  { word: 'recommendation', meaning: '推荐', grade: 6 },
  { word: 'significance', meaning: '意义', grade: 6 },
  { word: 'theoretical', meaning: '理论的', grade: 6 },
  { word: 'unprecedented', meaning: '前所未有的', grade: 6 },
  { word: 'willingness', meaning: '愿意', grade: 6 },
  { word: 'abundant', meaning: '丰富的', grade: 6 },
  { word: 'accelerate', meaning: '加速', grade: 6 },
  { word: 'accommodate', meaning: '容纳', grade: 6 },
  { word: 'accompany', meaning: '陪伴', grade: 6 },
  { word: 'accomplished', meaning: '有成就的', grade: 6 },
  { word: 'accurate', meaning: '准确的', grade: 6 },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function initializeVocabulary(): void {
  const count = db.prepare('SELECT COUNT(*) as count FROM vocabulary').get() as { count: number };
  
  if (count.count === 0) {
    console.log('初始化词汇数据...');
    
    const allWords = [
      ...grade2Words,
      ...grade3Words,
      ...grade4Words,
      ...grade5Words,
      ...grade6Words,
    ];
    
    const insert = db.prepare(`
      INSERT INTO vocabulary (id, word, meaning, grade, status, correctCount, errorCount, addedAt, isCustom)
      VALUES (?, ?, ?, ?, 'new', 0, 0, ?, 0)
    `);
    
    const insertMany = db.transaction((words: VocabWord[]) => {
      for (const word of words) {
        insert.run(generateId(), word.word, word.meaning, word.grade, today);
      }
    });
    
    insertMany(allWords);
    
    console.log(`已初始化 ${allWords.length} 个词汇`);
  }
}
