import JSZip from 'jszip';

interface StyleProps {
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: string;
  backgroundColor?: string;
}

interface NumberingLevel {
  numFmt: string;
  lvlText: string;
  start: number;
}

/**
 * Converts a Microsoft Word (.docx) document ArrayBuffer into clean,
 * high-fidelity HTML preserving text colors, fonts, headings, bold/italic,
 * lists, tables, and exact numbering sequences.
 */
export async function convertDocxToHtml(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(arrayBuffer);

  const documentXmlText = await zip.file('word/document.xml')?.async('text');
  if (!documentXmlText) {
    throw new Error('Invalid Word document: missing word/document.xml');
  }

  const stylesXmlText = (await zip.file('word/styles.xml')?.async('text')) || '';
  const numberingXmlText = (await zip.file('word/numbering.xml')?.async('text')) || '';
  const relsXmlText = (await zip.file('word/_rels/document.xml.rels')?.async('text')) || '';

  const parser = new DOMParser();
  const docXml = parser.parseFromString(documentXmlText, 'text/xml');
  const stylesXml = stylesXmlText ? parser.parseFromString(stylesXmlText, 'text/xml') : null;
  const numberingXml = numberingXmlText ? parser.parseFromString(numberingXmlText, 'text/xml') : null;
  const relsXml = relsXmlText ? parser.parseFromString(relsXmlText, 'text/xml') : null;

  // 1. Parse Relationships (hyperlinks)
  const relsMap = new Map<string, string>();
  if (relsXml) {
    const rels = relsXml.querySelectorAll('Relationship');
    rels.forEach((rel) => {
      const id = rel.getAttribute('Id');
      const target = rel.getAttribute('Target');
      if (id && target) {
        relsMap.set(id, target);
      }
    });
  }

  // 2. Parse Styles
  const stylePropsMap = new Map<string, StyleProps>();
  if (stylesXml) {
    const styleElements = stylesXml.querySelectorAll('style');
    styleElements.forEach((s) => {
      const styleId = s.getAttribute('w:styleId');
      if (styleId) {
        const props = parseRunProperties(s.querySelector('rPr'));
        const pPr = s.querySelector('pPr');
        if (pPr) {
          const jc = pPr.querySelector('jc')?.getAttribute('w:val');
          if (jc) props.textAlign = mapAlignment(jc);
        }
        stylePropsMap.set(styleId, props);
      }
    });
  }

  // 3. Parse Numbering
  const numIdToAbstractMap = new Map<string, string>();
  const abstractNumMap = new Map<string, Map<number, NumberingLevel>>();
  if (numberingXml) {
    const nums = numberingXml.querySelectorAll('num');
    nums.forEach((num) => {
      const numId = num.getAttribute('w:numId');
      const abstractId = num.querySelector('abstractNumId')?.getAttribute('w:val');
      if (numId && abstractId) {
        numIdToAbstractMap.set(numId, abstractId);
      }
    });

    const abstractNums = numberingXml.querySelectorAll('abstractNum');
    abstractNums.forEach((abs) => {
      const absId = abs.getAttribute('w:abstractNumId');
      if (absId) {
        const levels = new Map<number, NumberingLevel>();
        const lvls = abs.querySelectorAll('lvl');
        lvls.forEach((lvl) => {
          const ilvl = parseInt(lvl.getAttribute('w:ilvl') || '0', 10);
          const numFmt = lvl.querySelector('numFmt')?.getAttribute('w:val') || 'decimal';
          const lvlText = lvl.querySelector('lvlText')?.getAttribute('w:val') || '%1.';
          const start = parseInt(lvl.querySelector('start')?.getAttribute('w:val') || '1', 10);
          levels.set(ilvl, { numFmt, lvlText, start });
        });
        abstractNumMap.set(absId, levels);
      }
    });
  }

  // Numbering counters state: `${numId}-${ilvl}` -> current count
  const numberingCounters = new Map<string, number>();

  function getNextNumber(numId: string, ilvl: number): string | null {
    const abstractId = numIdToAbstractMap.get(numId);
    if (!abstractId) return null;
    const levels = abstractNumMap.get(abstractId);
    if (!levels) return null;
    const levelDef = levels.get(ilvl);
    if (!levelDef) return null;

    if (levelDef.numFmt === 'bullet') {
      return null; // Bullet list
    }

    const key = `${numId}-${ilvl}`;
    const current = (numberingCounters.get(key) ?? levelDef.start - 1) + 1;
    numberingCounters.set(key, current);

    let numStr = String(current);
    if (levelDef.numFmt === 'lowerLetter') {
      numStr = String.fromCharCode(96 + current);
    } else if (levelDef.numFmt === 'upperLetter') {
      numStr = String.fromCharCode(64 + current);
    } else if (levelDef.numFmt === 'lowerRoman') {
      numStr = toRoman(current).toLowerCase();
    } else if (levelDef.numFmt === 'upperRoman') {
      numStr = toRoman(current);
    }

    return levelDef.lvlText.replace(/%[0-9]/g, numStr);
  }

  // 4. Convert Document Body to HTML
  const body = docXml.querySelector('body');
  if (!body) return '';

  let html = '';
  let inList: 'ul' | 'ol' | null = null;

  const children = Array.from(body.childNodes);
  for (const node of children) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as Element;
    const localName = el.localName || el.nodeName.replace(/^w:/, '');

    if (localName === 'p') {
      const pResult = processParagraph(el, stylePropsMap, relsMap, getNextNumber);
      if (pResult.isListItem) {
        const listType = pResult.listType || 'ul';
        if (inList !== listType) {
          if (inList) html += `</${inList}>`;
          html += `<${listType}>`;
          inList = listType;
        }
        html += `<li>${pResult.content}</li>`;
      } else {
        if (inList) {
          html += `</${inList}>`;
          inList = null;
        }
        html += pResult.html;
      }
    } else if (localName === 'tbl') {
      if (inList) {
        html += `</${inList}>`;
        inList = null;
      }
      html += processTable(el, stylePropsMap, relsMap);
    }
  }

  if (inList) {
    html += `</${inList}>`;
  }

  return html.trim();
}

function processParagraph(
  p: Element,
  stylePropsMap: Map<string, StyleProps>,
  relsMap: Map<string, string>,
  getNextNumber: (numId: string, ilvl: number) => string | null
): { html: string; isListItem: boolean; listType?: 'ul' | 'ol'; content?: string } {
  const pPr = p.querySelector('pPr');
  const styleId = pPr?.querySelector('pStyle')?.getAttribute('w:val') || '';
  const inheritStyle = stylePropsMap.get(styleId) || {};

  // Check heading type
  let tagName = 'p';
  const lowerStyleId = styleId.toLowerCase();
  if (lowerStyleId.includes('heading1') || lowerStyleId === 'heading 1' || lowerStyleId === 'title') {
    tagName = 'h2';
  } else if (lowerStyleId.includes('heading2') || lowerStyleId === 'heading 2' || lowerStyleId === 'subtitle') {
    tagName = 'h3';
  } else if (lowerStyleId.includes('heading3') || lowerStyleId === 'heading 3') {
    tagName = 'h4';
  } else if (lowerStyleId.includes('heading4') || lowerStyleId === 'heading 4') {
    tagName = 'h4';
  } else if (lowerStyleId.includes('quote')) {
    tagName = 'blockquote';
  }

  // Check numbering
  const numPr = pPr?.querySelector('numPr');
  let isListItem = false;
  let listType: 'ul' | 'ol' = 'ul';
  let numberPrefix = '';

  if (numPr) {
    const numId = numPr.querySelector('numId')?.getAttribute('w:val');
    const ilvl = parseInt(numPr.querySelector('ilvl')?.getAttribute('w:val') || '0', 10);
    if (numId) {
      const numFormatted = getNextNumber(numId, ilvl);
      if (numFormatted) {
        if (tagName.startsWith('h')) {
          // If heading with numbering: keep as literal heading text!
          numberPrefix = `${numFormatted} `;
        } else {
          isListItem = true;
          listType = 'ol';
        }
      } else {
        if (!tagName.startsWith('h')) {
          isListItem = true;
          listType = 'ul';
        }
      }
    }
  }

  // Paragraph alignment & styles
  const pStyles: string[] = [];
  const jc = pPr?.querySelector('jc')?.getAttribute('w:val');
  const textAlign = (jc && mapAlignment(jc)) || inheritStyle.textAlign;
  if (textAlign && textAlign !== 'left') {
    pStyles.push(`text-align: ${textAlign}`);
  }

  const pColor = pPr?.querySelector('rPr')?.querySelector('color')?.getAttribute('w:val') || inheritStyle.color;
  if (pColor && pColor !== 'auto') {
    pStyles.push(`color: #${pColor}`);
  }

  const styleAttr = pStyles.length > 0 ? ` style="${pStyles.join('; ')}"` : '';

  // Process runs
  const content = processRunsAndHyperlinks(p, inheritStyle, relsMap);
  const fullContent = numberPrefix ? `${numberPrefix}${content}` : content;

  if (!fullContent.trim()) {
    return { html: '', isListItem: false };
  }

  if (isListItem) {
    return { html: '', isListItem: true, listType, content: fullContent };
  }

  return { html: `<${tagName}${styleAttr}>${fullContent}</${tagName}>`, isListItem: false };
}

function processRunsAndHyperlinks(
  container: Element,
  inheritStyle: StyleProps,
  relsMap: Map<string, string>
): string {
  let result = '';

  const children = Array.from(container.childNodes);
  for (const node of children) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as Element;
    const localName = el.localName || el.nodeName.replace(/^w:/, '');

    if (localName === 'r') {
      result += processRun(el, inheritStyle);
    } else if (localName === 'hyperlink') {
      const rId = el.getAttribute('r:id');
      const href = (rId && relsMap.get(rId)) || '#';
      const linkContent = processRunsAndHyperlinks(el, inheritStyle, relsMap);
      result += `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${linkContent}</a>`;
    }
  }

  return result;
}

function processRun(r: Element, inheritStyle: StyleProps): string {
  const rPr = r.querySelector('rPr');
  const props = parseRunProperties(rPr, inheritStyle);

  let text = '';
  const children = Array.from(r.childNodes);
  for (const child of children) {
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as Element;
    const localName = el.localName || el.nodeName.replace(/^w:/, '');

    if (localName === 't') {
      text += escapeHtml(el.textContent || '');
    } else if (localName === 'br') {
      text += '<br />';
    } else if (localName === 'tab') {
      text += '&nbsp;&nbsp;&nbsp;&nbsp;';
    }
  }

  if (!text) return '';

  const styles: string[] = [];
  if (props.color && props.color !== 'auto') {
    styles.push(`color: #${props.color}`);
  }
  if (props.fontFamily) {
    styles.push(`font-family: '${props.fontFamily}', sans-serif`);
  }
  if (props.fontSize) {
    styles.push(`font-size: ${props.fontSize}`);
  }
  if (props.backgroundColor) {
    styles.push(`background-color: ${props.backgroundColor}`);
  }

  let wrapped = text;
  if (props.isBold) {
    wrapped = `<strong>${wrapped}</strong>`;
  }
  if (props.isItalic) {
    wrapped = `<em>${wrapped}</em>`;
  }
  if (props.isUnderline) {
    wrapped = `<u>${wrapped}</u>`;
  }

  if (styles.length > 0) {
    wrapped = `<span style="${styles.join('; ')}">${wrapped}</span>`;
  }

  return wrapped;
}

function processTable(
  tbl: Element,
  stylePropsMap: Map<string, StyleProps>,
  relsMap: Map<string, string>
): string {
  let html = '<table style="border-collapse: collapse; width: 100%;">';
  const rows = Array.from(tbl.querySelectorAll('tr'));
  let inHeader = false;

  rows.forEach((tr, i) => {
    const isHeader = tr.querySelector('tblHeader') !== null || i === 0;
    if (isHeader && !inHeader && i === 0) {
      html += '<thead>';
      inHeader = true;
    } else if (!isHeader && inHeader) {
      html += '</thead><tbody>';
      inHeader = false;
    }

    html += '<tr>';
    const cells = Array.from(tr.querySelectorAll('tc'));
    cells.forEach((tc) => {
      const cellTag = inHeader ? 'th' : 'td';
      const tcPr = tc.querySelector('tcPr');
      const shd = tcPr?.querySelector('shd')?.getAttribute('w:fill');
      const cellStyles: string[] = ['padding: 6px 10px; border: 1px solid #CBD5E1;'];
      if (shd && shd !== 'auto' && shd !== 'none') {
        cellStyles.push(`background-color: #${shd};`);
      }

      const paragraphs = Array.from(tc.querySelectorAll('p'));
      const cellContent = paragraphs
        .map((p) => processRunsAndHyperlinks(p, {}, relsMap))
        .filter((t) => t.trim().length > 0)
        .join('<br />');

      html += `<${cellTag} style="${cellStyles.join(' ')}">${cellContent || '&nbsp;'}</${cellTag}>`;
    });
    html += '</tr>';
  });

  if (inHeader) {
    html += '</thead>';
  } else {
    html += '</tbody>';
  }
  html += '</table>';
  return html;
}

function parseRunProperties(rPr: Element | null, inherit: StyleProps = {}): StyleProps {
  if (!rPr) return { ...inherit };

  const color = rPr.querySelector('color')?.getAttribute('w:val') || inherit.color;
  const fontFamily = rPr.querySelector('rFonts')?.getAttribute('w:ascii') || inherit.fontFamily;
  const sz = rPr.querySelector('sz')?.getAttribute('w:val');
  const fontSize = sz ? `${parseInt(sz, 10) / 2}pt` : inherit.fontSize;

  const isBold = rPr.querySelector('b') !== null || inherit.isBold;
  const isItalic = rPr.querySelector('i') !== null || inherit.isItalic;
  const isUnderline = rPr.querySelector('u') !== null || inherit.isUnderline;

  let backgroundColor = inherit.backgroundColor;
  const highlight = rPr.querySelector('highlight')?.getAttribute('w:val');
  if (highlight && highlight !== 'none') {
    backgroundColor = highlight;
  }
  const shd = rPr.querySelector('shd')?.getAttribute('w:fill');
  if (shd && shd !== 'auto' && shd !== 'none') {
    backgroundColor = `#${shd}`;
  }

  return { color, fontFamily, fontSize, isBold, isItalic, isUnderline, backgroundColor };
}

function mapAlignment(jc: string): string {
  switch (jc.toLowerCase()) {
    case 'center':
      return 'center';
    case 'right':
      return 'right';
    case 'both':
      return 'justify';
    default:
      return 'left';
  }
}

function toRoman(num: number): string {
  const map: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let res = '';
  for (const [v, s] of map) {
    while (num >= v) {
      res += s;
      num -= v;
    }
  }
  return res;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
