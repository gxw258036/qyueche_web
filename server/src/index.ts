import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from './database.js';
import { initializeVocabulary } from './initData.js';
import router from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', router);

const distPath = path.join(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
  
  console.log('✓ 前端文件已集成');
} else {
  console.warn('⚠ 未找到前端构建文件，请先运行 npm run build');
}

initializeVocabulary();

app.listen(PORT, () => {
  console.log(`\n🚀 小学英语默写工具服务器已启动`);
  console.log(`   访问地址: http://localhost:${PORT}`);
  console.log(`   API接口: http://localhost:${PORT}/api`);
  console.log(`   数据库: ./data/vocabulary.db\n`);
});
