import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import db from './database';
import { initializeVocabulary } from './initData';
import router from './routes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', router);

const distPath = path.join(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req: express.Request, res: express.Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });

  console.log('✓ 前端文件已集成');
} else {
  console.warn('⚠ 未找到前端构建文件，请先运行 npm run build');
}

initializeVocabulary();

const server = app.listen(PORT, () => {
  console.log('\n🚀 小学英语默写工具服务器已启动');
  console.log(`   访问地址: http://localhost:${PORT}`);
  console.log(`   API接口: http://localhost:${PORT}/api`);
  console.log(`   数据库: ./data/vocabulary.db\n`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ 端口 ${PORT} 已被占用，请先停止占用该端口的进程再启动`);
    console.error(`   查找占用进程: lsof -i:${PORT}`);
    console.error(`   终止进程后重试: kill <PID>\n`);
    process.exit(1);
  } else {
    console.error('服务器启动失败:', err);
    process.exit(1);
  }
});

// 优雅退出：确保数据库正常关闭，避免 WAL 数据丢失
process.on('SIGINT', () => {
  console.log('\n收到退出信号，正在关闭...');
  try {
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.close();
    console.log('✓ 数据库已安全关闭');
  } catch (e) {
    console.error('关闭数据库时出错:', e);
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  try {
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.close();
  } catch (e) {
    console.error('关闭数据库时出错:', e);
  }
  process.exit(0);
});
