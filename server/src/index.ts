import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import db from './database';
import { initializeVocabulary } from './initData';
import router from './routes';

const app = express();
// 固定使用 3000 端口（端口已在服务器上做过映射，不要切换其他端口）
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
    console.error(`\n❌ 端口 ${PORT} 已被占用，请先停止旧进程再启动`);
    console.error(`   可执行: lsof -i:${PORT} 查看占用进程，然后 kill <PID>`);
    process.exit(1);
  }
  console.error('服务器启动失败:', err);
  process.exit(1);
});

// 优雅退出：关闭前执行 wal_checkpoint(TRUNCATE)，防止 WAL 数据丢失
function gracefulShutdown(signal: string) {
  console.log(`\n收到 ${signal} 信号，正在关闭服务器...`);
  server.close(() => {
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
      console.log('✓ WAL 已 checkpoint，数据已持久化');
    } catch (e) {
      console.error('⚠ WAL checkpoint 失败:', e);
    }
    db.close();
    console.log('✓ 服务器已关闭');
    process.exit(0);
  });
  // 5秒后强制退出
  setTimeout(() => {
    console.error('⚠ 关闭超时，强制退出');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
