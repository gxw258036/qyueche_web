import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Vocabulary } from '@/types';

export const generatePDF = async (words: Vocabulary[], showAnswers: boolean) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const lineHeight = 10;
  const wordsPerColumn = 20;
  const columnWidth = (pageWidth - margin * 3) / 2;

  const processPage = (startIndex: number) => {
    let yPosition = margin + 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('英语默写练习', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(new Date().toLocaleDateString('zh-CN'), pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(12);
    const column1Words = words.slice(startIndex, startIndex + wordsPerColumn);
    const column2Words = words.slice(startIndex + wordsPerColumn, startIndex + wordsPerColumn * 2);

    column1Words.forEach((word, index) => {
      const actualIndex = startIndex + index;
      const currentY = yPosition + index * (lineHeight + 8);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${actualIndex + 1}. ${word.meaning}`, margin, currentY);
      
      doc.setFont('helvetica', 'normal');
      doc.setLineWidth(0.4);
      doc.line(margin, currentY + 6, margin + columnWidth, currentY + 6);
      
      if (showAnswers) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(word.word, margin, currentY + 4);
        doc.setTextColor(0, 0, 0);
      }
    });

    const rightColumnX = margin + columnWidth + margin;
    column2Words.forEach((word, index) => {
      const actualIndex = startIndex + wordsPerColumn + index;
      const currentY = yPosition + index * (lineHeight + 8);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${actualIndex + 1}. ${word.meaning}`, rightColumnX, currentY);
      
      doc.setFont('helvetica', 'normal');
      doc.setLineWidth(0.4);
      doc.line(rightColumnX, currentY + 6, rightColumnX + columnWidth, currentY + 6);
      
      if (showAnswers) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(word.word, rightColumnX, currentY + 4);
        doc.setTextColor(0, 0, 0);
      }
    });
  };

  for (let i = 0; i < words.length; i += wordsPerColumn * 2) {
    if (i > 0) {
      doc.addPage();
    }
    processPage(i);
  }

  doc.save('english-vocabulary-practice.pdf');
};

export const printPaper = async (words: Vocabulary[], showAnswers: boolean) => {
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

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>英语默写练习</title>
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
          .date {
            color: #6b7280;
            font-size: 11px;
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
            <div class="title">英语默写练习</div>
            <div class="date">${new Date().toLocaleDateString('zh-CN')}</div>
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
