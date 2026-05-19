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
  const margin = 20;
  const lineHeight = 12;
  let yPosition = margin + 20;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('英语默写练习', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(new Date().toLocaleDateString('zh-CN'), pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Words
  doc.setFontSize(14);
  words.forEach((word, index) => {
    if (yPosition > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = margin + 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${word.meaning}`, margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    
    if (showAnswers) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(word.word, margin, yPosition - 2);
      doc.setTextColor(0, 0, 0);
    }
    
    yPosition += lineHeight + 5;
  });

  doc.save('english-vocabulary-practice.pdf');
};

export const printPaper = async (words: Vocabulary[], showAnswers: boolean) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const wordsHTML = words
    .map(
      (word, index) => `
      <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">
          ${index + 1}. ${word.meaning}
        </div>
        <div style="height: 30px; border-bottom: 2px solid #9ca3af; ${
          showAnswers ? 'color: #6b7280; font-style: italic;' : ''
        }">
          ${showAnswers ? word.word : ''}
        </div>
      </div>
    `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>英语默写练习</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .date {
            color: #6b7280;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">英语默写练习</div>
          <div class="date">${new Date().toLocaleDateString('zh-CN')}</div>
        </div>
        ${wordsHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};
