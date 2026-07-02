import { Vocabulary } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);
const today = new Date().toISOString().split('T')[0];

const createWord = (word: string, meaning: string) => ({
  word,
  meaning,
  type: 'word' as const,
  status: 'new' as const,
  correctCount: 0,
  errorCount: 0,
  consecutiveCorrectCount: 0,
  isCustom: 0,
});

const sampleWords: Omit<Vocabulary, 'id' | 'addedAt' | 'studentId'>[] = [
  createWord('apple', '苹果'),
  createWord('banana', '香蕉'),
  createWord('book', '书'),
  createWord('cat', '猫'),
  createWord('dog', '狗'),
  createWord('egg', '鸡蛋'),
  createWord('fish', '鱼'),
  createWord('girl', '女孩'),
  createWord('happy', '快乐的'),
  createWord('ice', '冰'),
  createWord('jump', '跳'),
  createWord('king', '国王'),
  createWord('lion', '狮子'),
  createWord('milk', '牛奶'),
  createWord('nose', '鼻子'),
  createWord('orange', '橙子'),
  createWord('pen', '钢笔'),
  createWord('queen', '女王'),
  createWord('rabbit', '兔子'),
  createWord('sun', '太阳'),
  createWord('tree', '树'),
  createWord('water', '水'),
  createWord('yellow', '黄色'),
  createWord('zoo', '动物园'),
  createWord('big', '大的'),
  createWord('small', '小的'),
  createWord('red', '红色'),
  createWord('blue', '蓝色'),
  createWord('green', '绿色'),
  createWord('one', '一'),
  createWord('two', '二'),
  createWord('three', '三'),
  createWord('four', '四'),
  createWord('five', '五'),
];

export const getInitialVocabulary = (studentId: string): Vocabulary[] => {
  return sampleWords.map(word => ({
    ...word,
    id: generateId(),
    addedAt: today,
    studentId,
  }));
};
