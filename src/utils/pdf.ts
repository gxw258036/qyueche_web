import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Vocabulary } from '@/types';

export const generatePDF = async (words: Vocabulary[], showAnswers: boolean, studentName?: string, dateStr?: string) => {
  const wordsPerColumn = Math.ceil(words.length / 2);
  const column1Words = words.slice(0, wordsPerColumn);
  const column2Words = words.slice(wordsPerColumn);

  const generateColumnHTML = (columnWords: Vocabulary[], startIndex: number) => {
    return columnWords.map((word, index) => {
      const actualIndex = startIndex + index;
      return `
        <div style="margin-bottom: 8px;">
          <div style="font-weight: bold; font-size: 13px; margin-bottom: 2px;">
            ${actualIndex + 1}. ${word.meaning}
          </div>
          <div style="height: 20px; border-bottom: 1px solid #9ca3af; ${
            showAnswers ? 'color: #6b7280; font-style: italic; font-size: 11px;' : ''
          }">
            ${showAnswers ? word.word : ''}
          </div>
        </div>
      `;
    }).join('');
  };

  // 标题：英语默写练习_姓名_日期；无姓名时仅显示“英语默写练习”
  const titleStr = studentName
    ? `英语默写练习_${studentName}${dateStr ? `_${dateStr}` : ''}`
    : '英语默写练习';
  const fileName = studentName
    ? `英语默写练习_${studentName}${dateStr ? `_${dateStr}` : ''}.pdf`
    : 'english-vocabulary-practice.pdf';

  const container = document.createElement('div');
  container.innerHTML = `
    <div style="width: 210mm; padding: 10mm; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 6px;">${titleStr}</div>
      </div>
      <div style="display: flex; gap: 15px;">
        <div style="flex: 1;">${generateColumnHTML(column1Words, 0)}</div>
        <div style="flex: 1;">${generateColumnHTML(column2Words, wordsPerColumn)}</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = (pdfHeight - imgHeight * ratio) / 2;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
};

export const printPaper = async (words: Vocabulary[], showAnswers: boolean, studentName?: string, dateStr?: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const wordsPerColumn = Math.ceil(words.length / 2);
  
  const column1Words = words.slice(0, wordsPerColumn);
  const column2Words = words.slice(wordsPerColumn);
  
  const generateColumnHTML = (columnWords: Vocabulary[], startIndex: number) => {
    return columnWords.map((word, index) => {
      const actualIndex = startIndex + index;
      return `
        <div style="margin-bottom: 8px;">
          <div style="font-weight: bold; font-size: 13px; margin-bottom: 2px;">
            ${actualIndex + 1}. ${word.meaning}
          </div>
          <div style="height: 20px; border-bottom: 1px solid #9ca3af; ${
            showAnswers ? 'color: #6b7280; font-style: italic; font-size: 11px;' : ''
          }">
            ${showAnswers ? word.word : ''}
          </div>
        </div>
      `;
    }).join('');
  };

  // 标题：英语默写练习_姓名_日期；无姓名时仅显示“英语默写练习”
  const titleStr = studentName
    ? `英语默写练习_${studentName}${dateStr ? `_${dateStr}` : ''}`
    : '英语默写练习';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${titleStr}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
          }
          .content {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
            box-sizing: border-box;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 6px;
          }
          .columns {
            display: flex;
            gap: 15px;
          }
          .column {
            flex: 1;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .content {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="content">
          <div class="header">
            <div class="title">${titleStr}</div>
          </div>
          <div class="columns">
            <div class="column">${generateColumnHTML(column1Words, 0)}</div>
            <div class="column">${generateColumnHTML(column2Words, wordsPerColumn)}</div>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};
