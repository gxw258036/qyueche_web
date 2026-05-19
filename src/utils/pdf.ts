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

  const wordsPerColumn = 20;
  
  const generateColumnHTML = (columnWords: Vocabulary[], startIndex: number) => {
    return columnWords.map((word, index) => {
      const actualIndex = startIndex + index;
      return `
        <div style="margin-bottom: 12px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
            ${actualIndex + 1}. ${word.meaning}
          </div>
          <div style="height: 24px; border-bottom: 1px solid #9ca3af; ${
            showAnswers ? 'color: #6b7280; font-style: italic; font-size: 12px;' : ''
          }">
            ${showAnswers ? word.word : ''}
          </div>
        </div>
      `;
    }).join('');
  };

  const pages: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerColumn * 2) {
    const column1Words = words.slice(i, i + wordsPerColumn);
    const column2Words = words.slice(i + wordsPerColumn, i + wordsPerColumn * 2);
    
    pages.push(`
      <div class="page">
        <div class="header">
          <div class="title">英语默写练习</div>
          <div class="date">${new Date().toLocaleDateString('zh-CN')}</div>
        </div>
        <div class="columns">
          <div class="column">${generateColumnHTML(column1Words, i)}</div>
          <div class="column">${generateColumnHTML(column2Words, i + wordsPerColumn)}</div>
        </div>
      </div>
    `);
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>英语默写练习</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
          }
          .page {
            page-break-after: always;
            padding: 10px;
          }
          .page:last-child {
            page-break-after: avoid;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .date {
            color: #6b7280;
            font-size: 12px;
          }
          .columns {
            display: flex;
            gap: 20px;
          }
          .column {
            flex: 1;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        ${pages.join('')}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};
