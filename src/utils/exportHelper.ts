/**
 * Converts raw markdown / plain text institutional documents into
 * beautifully formatted, justified HTML with real tables, bold headings,
 * and signature alignments for Word (.doc) and PDF Print exports.
 */
export function formatInstitutionalDocumentToHtml(rawText: string, hasCustomHeader = false): string {
  if (!rawText) return '';

  const lines = rawText.split('\n');
  const htmlParts: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  const flushTable = () => {
    if (tableRows.length === 0) return;
    let tableHtml = '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 650px; margin: 12px 0; font-family: Cambria, Georgia, serif; font-size: 10pt; border: 1px solid #333333;">';
    
    const hasHeader = tableRows.length >= 2 && tableRows[1].includes('---');
    const headerRow = hasHeader ? tableRows[0] : null;
    const startIdx = hasHeader ? 2 : 0;

    if (headerRow) {
      const thCells = headerRow
        .split('|')
        .filter((c, idx, arr) => idx !== 0 && idx !== arr.length - 1)
        .map(c => `<th style="border: 1px solid #333333; padding: 6px 8px; background-color: #f1f5f9; font-weight: bold; text-align: left; color: #0f172a;">${c.trim()}</th>`)
        .join('');
      tableHtml += `<thead><tr>${thCells}</tr></thead><tbody>`;
    } else {
      tableHtml += '<tbody>';
    }

    for (let i = startIdx; i < tableRows.length; i++) {
      const row = tableRows[i];
      if (row.trim().startsWith('|---') || row.trim().includes('---')) continue;
      const tdCells = row
        .split('|')
        .filter((c, idx, arr) => idx !== 0 && idx !== arr.length - 1)
        .map(c => `<td style="border: 1px solid #333333; padding: 5px 8px; vertical-align: top; text-align: justify; color: #1e293b;">${c.trim()}</td>`)
        .join('');
      if (tdCells) {
        const bg = (i % 2 === 0) ? 'background-color: #ffffff;' : 'background-color: #f8fafc;';
        tableHtml += `<tr style="${bg}">${tdCells}</tr>`;
      }
    }

    tableHtml += '</tbody></table>';
    htmlParts.push(tableHtml);
    tableRows = [];
    inTable = false;
  };

  const flushList = () => {
    if (inList) {
      htmlParts.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
    }
  };

  let skippedHeaderLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 0. Remove redundant duplicate header lines at the very top of document text
    if (skippedHeaderLines < 5 && i < 6) {
      const upper = trimmed.toUpperCase();
      if (
        upper === 'JSS MAHAVIDYAPEETHA' || 
        upper.includes('JSS POLYTECHNIC, MYSURU') || 
        upper.includes('JSS POLYTECHNIC') || 
        upper === 'INSTITUTIONAL GOVERNANCE DELIVERABLE' ||
        upper === 'JSS MAHAVIDYAPEETHA, MYSURU'
      ) {
        skippedHeaderLines++;
        continue;
      }
    }

    // 1. Table Row Detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // 2. Empty or stray character line
    if (!trimmed || trimmed === '|' || trimmed === '/') {
      flushList();
      continue;
    }

    // 3. Ref and Date line split
    if ((trimmed.startsWith('Ref:') || trimmed.startsWith('Ref :') || trimmed.startsWith('Ref. No')) && (trimmed.includes('Date:') || trimmed.includes('Date :') || trimmed.includes('Dated:'))) {
      flushList();
      const parts = trimmed.split(/Date\s*:/i);
      const refPart = parts[0]?.trim() || '';
      const datePart = parts[1] ? `Date: ${parts[1].trim()}` : '';
      htmlParts.push(`
        <table style="width: 100%; max-width: 650px; border: none; border-collapse: collapse; margin: 8px 0 14px 0; font-family: Cambria, Georgia, serif; font-size: 10.5pt; font-weight: bold;">
          <tr>
            <td style="border: none; padding: 0; text-align: left; color: #0f172a;">${refPart}</td>
            <td style="border: none; padding: 0; text-align: right; color: #0f172a;">${datePart}</td>
          </tr>
        </table>
      `);
      continue;
    }

    // 4. Horizontal Rule
    if (trimmed === '---' || trimmed === '===' || trimmed === '___' || trimmed.startsWith('======') || trimmed.startsWith('------')) {
      flushList();
      htmlParts.push('<hr style="border: none; border-top: 1px solid #94a3b8; margin: 12px 0;" />');
      continue;
    }

    // 5. Document Type Titles (CIRCULAR, OFFICE ORDER, NOTICE, MEMORANDUM, MINUTES OF MEETING)
    const upperTitle = trimmed.toUpperCase();
    if (
      upperTitle === 'CIRCULAR' || 
      upperTitle === 'OFFICE ORDER' || 
      upperTitle === 'NOTICE' || 
      upperTitle === 'OFFICE MEMORANDUM' || 
      upperTitle.startsWith('MINUTES OF') ||
      upperTitle.startsWith('REPORT ON')
    ) {
      flushList();
      htmlParts.push(`<h2 style="font-size: 13pt; font-weight: bold; margin: 12px 0 8px 0; color: #003366; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; text-decoration: underline;">${trimmed}</h2>`);
      continue;
    }

    // 6. Headings
    if (trimmed.startsWith('# ')) {
      flushList();
      htmlParts.push(`<h1 style="font-size: 14pt; font-weight: bold; margin: 14px 0 6px 0; color: #003366; text-align: center; text-transform: uppercase;">${trimmed.slice(2)}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      htmlParts.push(`<h2 style="font-size: 12pt; font-weight: bold; margin: 10px 0 4px 0; color: #0f172a; text-transform: uppercase;">${trimmed.slice(3)}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      htmlParts.push(`<h3 style="font-size: 11pt; font-weight: bold; margin: 8px 0 3px 0; color: #1e293b;">${trimmed.slice(4)}</h3>`);
      continue;
    }

    // 7. Signatory Block Detection (Sd/- or right-aligned names)
    if (trimmed.startsWith('Sd/-') || trimmed.startsWith('(Dr.') || (trimmed.startsWith('Principal') && !trimmed.includes(':')) || trimmed.startsWith('Competent Authority') || trimmed.includes('Head of Department')) {
      flushList();
      htmlParts.push(`<div style="text-align: right; margin: 6px 0 2px auto; max-width: 280px; font-weight: bold; line-height: 1.35; color: #0f172a; font-size: 10.5pt;">${trimmed}</div>`);
      continue;
    }

    // 8. Copy to: section
    if (trimmed.startsWith('Copy to:') || trimmed.startsWith('Copy To:') || trimmed.startsWith('Distribution:')) {
      flushList();
      htmlParts.push(`<div style="margin-top: 14px; font-weight: bold; color: #0f172a; font-size: 10pt;">${trimmed}</div>`);
      continue;
    }

    // 9. Bullet Lists
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList || listType !== 'ul') {
        flushList();
        htmlParts.push('<ul style="margin: 6px 0 8px 18px; padding-left: 6px;">');
        inList = true;
        listType = 'ul';
      }
      const itemText = trimmed.replace(/^([•\-\*]\s*)/, '');
      htmlParts.push(`<li style="text-align: justify; text-justify: inter-word; line-height: 1.45; margin-bottom: 3px; font-size: 10.5pt; color: #1e293b;">${itemText}</li>`);
      continue;
    }

    // 10. Numbered Lists
    const numMatch = trimmed.match(/^(\d+[\.\)]\s+)(.+)/);
    if (numMatch) {
      if (!inList || listType !== 'ol') {
        flushList();
        htmlParts.push('<ol style="margin: 6px 0 8px 18px; padding-left: 6px;">');
        inList = true;
        listType = 'ol';
      }
      htmlParts.push(`<li style="text-align: justify; text-justify: inter-word; line-height: 1.45; margin-bottom: 3px; font-size: 10.5pt; color: #1e293b;">${numMatch[2]}</li>`);
      continue;
    }

    // 11. Regular Paragraph (with Full Justification & Compact A4 Line Height)
    flushList();
    htmlParts.push(`<p style="text-align: justify; text-justify: inter-word; font-family: Cambria, Georgia, 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.48; margin: 0 0 7px 0; color: #111111;">${trimmed}</p>`);
  }

  flushTable();
  flushList();

  return htmlParts.join('\n');
}

/** Letterhead banners uploaded in the AI Prompt Studio, shared by every export. */
export const HEADER_IMAGE_STORAGE_KEY = 'jsspm_header_img_banner';
export const FOOTER_IMAGE_STORAGE_KEY = 'jsspm_footer_img_banner';

export function getStoredBanners(): { headerImage: string | null; footerImage: string | null } {
  try {
    return {
      headerImage: localStorage.getItem(HEADER_IMAGE_STORAGE_KEY),
      footerImage: localStorage.getItem(FOOTER_IMAGE_STORAGE_KEY)
    };
  } catch {
    return { headerImage: null, footerImage: null };
  }
}

/**
 * Print / Save as PDF on A4 with the institutional header and footer banners.
 * Shared by the AI Prompt Studio and the Drafting Kit so both print identically.
 */
export function printInstitutionalDocument(
  content: string,
  title = 'Institutional Document',
  headerImage?: string | null,
  footerImage?: string | null
) {
  const formattedHtml = formatInstitutionalDocumentToHtml(content, !!headerImage);
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    window.print();
    return;
  }

  const headerSection = headerImage
    ? `<div style="text-align:center; margin-bottom:10px; width:100%;"><img src="${headerImage}" style="width:100%; max-width:180mm; height:auto; max-height:110px; object-fit:contain; display:block; margin:0 auto;" /></div>`
    : `
      <div class="header-bar" style="text-align:center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 14px;">
        <h1 style="margin:0; font-size:14pt; font-weight:bold; text-transform:uppercase;">JSS MAHAVIDYAPEETHA</h1>
        <h2 style="margin:3px 0 0 0; font-size:11.5pt; font-weight:normal; color:#333;">JSS POLYTECHNIC, MYSURU - 570 006</h2>
      </div>
    `;

  const footerSection = footerImage
    ? `<div style="text-align:center; margin-top:16px; border-top:1px solid #ccc; padding-top:6px; width:100%;"><img src="${footerImage}" style="width:100%; max-width:180mm; height:auto; max-height:75px; object-fit:contain; display:block; margin:0 auto;" /></div>`
    : '';

  printWindow.document.write(`
    <html>
    <head>
      <title>${title} - JSS Polytechnic, Mysuru</title>
      <style>
        @page {
          size: A4;
          margin: 12mm 15mm;
        }
        body {
          font-family: Cambria, Georgia, "Times New Roman", serif;
          font-size: 10.5pt;
          line-height: 1.45;
          color: #111;
          margin: 0;
          max-width: 180mm;
          margin-left: auto;
          margin-right: auto;
          text-align: justify;
          text-justify: inter-word;
        }
        p {
          text-align: justify;
          text-justify: inter-word;
          margin-bottom: 6px;
          line-height: 1.45;
        }
        table {
          width: 100%;
          max-width: 180mm;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 10pt;
          border: 1px solid #333;
        }
        th, td {
          border: 1px solid #333;
          padding: 5px 7px;
          text-align: justify;
          vertical-align: top;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        ul, ol {
          margin: 6px 0 8px 18px;
        }
        li {
          text-align: justify;
          text-justify: inter-word;
          margin-bottom: 3px;
        }
      </style>
    </head>
    <body>
      ${headerSection}
      <div style="text-align: justify; text-justify: inter-word; width: 100%; max-width: 180mm;">
        ${formattedHtml}
      </div>
      ${footerSection}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
}

export function exportToWordFile(
  filename: string, 
  content: string, 
  title = 'Institutional Document',
  headerImage?: string | null,
  footerImage?: string | null
) {
  const headerHtml = headerImage 
    ? `<div style="text-align:center; margin-bottom:12px; width:100%; max-width:650px; margin-left:auto; margin-right:auto;"><img src="${headerImage}" width="650" style="width:100%; max-width:650px; height:auto; max-height:115px; object-fit:contain; display:block; margin:0 auto;" /></div>`
    : `
      <div style="text-align:center; border-bottom: 2px solid #003366; padding-bottom: 6px; margin-bottom: 16px; width:100%; max-width:650px; margin-left:auto; margin-right:auto;">
        <h1 style="margin:0; font-size:15pt; color:#003366; font-weight:bold; text-transform:uppercase; font-family: Cambria, Georgia, serif;">JSS MAHAVIDYAPEETHA</h1>
        <h2 style="margin:3px 0 0 0; font-size:12pt; color:#222; font-weight:normal; font-family: Cambria, Georgia, serif;">JSS POLYTECHNIC, MYSURU - 570 006</h2>
      </div>
    `;

  const footerHtml = footerImage
    ? `<div style="text-align:center; margin-top:18px; border-top:1px solid #ccc; padding-top:8px; width:100%; max-width:650px; margin-left:auto; margin-right:auto;"><img src="${footerImage}" width="650" style="width:100%; max-width:650px; height:auto; max-height:80px; object-fit:contain; display:block; margin:0 auto;" /></div>`
    : '';

  const formattedBodyHtml = formatInstitutionalDocumentToHtml(content, !!headerImage);

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        @page Section1 {
          size: 210mm 297mm;
          margin: 15mm 15mm 15mm 15mm;
          mso-header-margin: 10mm;
          mso-footer-margin: 10mm;
        }
        div.Section1 {
          page: Section1;
          max-width: 650px;
          margin: 0 auto;
        }
        body { 
          font-family: Cambria, Georgia, "Times New Roman", serif; 
          font-size: 10.5pt; 
          line-height: 1.48; 
          color: #111111; 
          text-align: justify; 
          text-justify: inter-word; 
        }
        p { 
          text-align: justify; 
          text-justify: inter-word; 
          margin-bottom: 7px; 
          line-height: 1.48; 
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          max-width: 650px;
          margin-top: 10px; 
          margin-bottom: 10px; 
          border: 1px solid #333333; 
        }
        th, td { 
          border: 1px solid #333333; 
          padding: 5px 8px; 
          text-align: justify; 
          vertical-align: top; 
        }
        th { 
          background-color: #f1f5f9; 
          font-weight: bold; 
        }
        ul, ol { 
          margin: 6px 0 8px 18px; 
        }
        li { 
          text-align: justify; 
          text-justify: inter-word; 
          margin-bottom: 3px; 
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        ${headerHtml}
        <div style="text-align: justify; text-justify: inter-word; width: 100%; max-width: 650px;">
          ${formattedBodyHtml}
        </div>
        ${footerHtml}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const exportToWordDoc = exportToWordFile;

export function exportToJsonFile(filename: string, data: unknown) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
