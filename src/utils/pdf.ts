import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Vocabulary } from '@/types';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const getPaperTitle = (paperType: 'daily' | 'error' | 'custom') => {
  const titles = {
    daily: '今日默写任务',
    error: '错题专项练习',
    custom: '自定义默写练习',
  };
  return titles[paperType];
};

const createPrintTemplate = (
  words: Vocabulary[],
  showAnswers: boolean,
  title: string
): string => {
  const columns = 2;
  const wordsPerColumn = Math.ceil(words.length / columns);
  
  const columnsHTML = [];
  for (let col = 0; col < columns; col++) {
    const start = col * wordsPerColumn;
    const end = Math.min(start + wordsPerColumn, words.length);
    const columnWords = words.slice(start, end);
    
    const columnHTML = columnWords
      .map((word, idx) => {
        const globalIndex = start + idx;
        return `
          <div class="word-item">
            <div class="word-number">${globalIndex + 1}.</div>
            <div class="word-content">
              <div class="word-meaning">${word.meaning}</div>
              <div class="word-line ${showAnswers ? 'show' : ''}">${showAnswers ? word.word : ''}</div>
            </div>
          </div>
        `;
      })
      .join('');
    
    columnsHTML.push(`<div class="column">${columnHTML}</div>`);
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
            width: ${A4_WIDTH_MM}mm;
            min-height: ${A4_HEIGHT_MM}mm;
            padding: 15mm;
            color: #1f2937;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
            letter-spacing: 2px;
          }
          .subtitle {
            font-size: 14px;
            color: #6b7280;
          }
          .words-container {
            display: flex;
            gap: 20px;
          }
          .column {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .word-item {
            display: flex;
            align-items: flex-start;
            padding: 8px 0;
            min-height: 32px;
          }
          .word-number {
            width: 28px;
            font-size: 13px;
            font-weight: bold;
            color: #6b7280;
            flex-shrink: 0;
          }
          .word-content {
            flex: 1;
          }
          .word-meaning {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
          }
          .word-line {
            font-size: 14px;
            color: transparent;
            border-bottom: 1.5px solid #d1d5db;
            padding-bottom: 2px;
            min-height: 20px;
          }
          .word-line.show {
            color: #374151;
          }
          .footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #9ca3af;
          }
          @media print {
            body {
              padding: 15mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">${new Date().toLocaleDateString('zh-CN')}</div>
        </div>
        <div class="words-container">
          ${columnsHTML.join('')}
        </div>
        <div class="footer">
          <span>姓名: ____________</span>
          <span>得分: ____________</span>
          <span>共 ${words.length} 题</span>
        </div>
      </body>
    </html>
  `;
};

export const generatePDF = async (
  words: Vocabulary[],
  showAnswers: boolean,
  paperType: 'daily' | 'error' | 'custom' = 'daily'
) => {
  try {
    const title = getPaperTitle(paperType);
    const htmlContent = createPrintTemplate(words, showAnswers, title);

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = `${A4_WIDTH_MM}mm`;
    tempContainer.style.background = 'white';
    document.body.appendChild(tempContainer);

    await new Promise(resolve => setTimeout(resolve, 200));

    const bodyElement = tempContainer.querySelector('body') as HTMLElement;
    const canvas = await html2canvas(bodyElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: A4_WIDTH_MM * 3.78,
      height: A4_HEIGHT_MM * 3.78,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
    pdf.save(`${title}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('PDF生成失败:', error);
    throw error;
  } finally {
    const tempContainer = document.querySelector('div[style*="-9999px"]');
    if (tempContainer) {
      document.body.removeChild(tempContainer);
    }
  }
};

export const printPaper = async (
  words: Vocabulary[],
  showAnswers: boolean,
  paperType: 'daily' | 'error' | 'custom' = 'daily'
) => {
  const title = getPaperTitle(paperType);
  const htmlContent = createPrintTemplate(words, showAnswers, title);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('无法打开打印窗口，请允许弹出窗口');
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.focus();
  
  const printHandler = () => {
    printWindow.removeEventListener('load', printHandler);
    setTimeout(() => {
      printWindow.print();
    }, 200);
  };
  
  printWindow.addEventListener('load', printHandler);
};

export const getPreviewHTML = (
  words: Vocabulary[],
  showAnswers: boolean,
  paperType: 'daily' | 'error' | 'custom' = 'daily'
) => {
  const title = getPaperTitle(paperType);
  return createPrintTemplate(words, showAnswers, title);
};
