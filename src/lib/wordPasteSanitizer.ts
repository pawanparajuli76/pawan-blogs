/**
 * Microsoft Word & Rich-Text Paste Sanitizer
 * 
 * Preserves Word formatting, fonts, font sizes, text colors, background colors,
 * text alignment, spans, and styles while cleaning up XML tags (<o:p>, <w:...>, <v:...>),
 * Office comments, and broken local file links.
 */

/**
 * Checks if the HTML string originates from Microsoft Word or Office.
 */
export function isWordHtml(html: string): boolean {
  if (!html) return false;
  return (
    html.includes('urn:schemas-microsoft-com:office') ||
    html.includes('xmlns:w="urn:schemas-microsoft-com:office:word"') ||
    html.includes('xmlns:o="urn:schemas-microsoft-com:office:office"') ||
    html.includes('class="Mso') ||
    html.includes("class='Mso") ||
    /mso-[a-zA-Z-]/i.test(html) ||
    /<!--\[if gte mso/i.test(html) ||
    /<w:worddocument/i.test(html) ||
    /<o:p/i.test(html)
  );
}

/**
 * Normalizes plain text with line breaks into semantic HTML paragraphs.
 */
export function cleanPlainText(text: string): string {
  if (!text) return '';
  const paragraphs = text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) return '';

  return paragraphs
    .map((p) => {
      const lines = p.split(/\r?\n/).map((l) => escapeHtml(l.trim())).join('<br />');
      return `<p>${lines}</p>`;
    })
    .join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes and cleans Microsoft Word or general rich-text HTML while
 * fully preserving Word styles, fonts, font sizes, colors, and formatting.
 */
export function cleanWordHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let html = rawHtml;

  // 1. Strip XML declarations, doctype, html, head, style, meta, link tags
  html = html.replace(/<\?xml[^>]*\?>/gi, '');
  html = html.replace(/<!DOCTYPE[^>]*>/gi, '');
  html = html.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<meta[^>]*>/gi, '');
  html = html.replace(/<link[^>]*>/gi, '');
  html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');

  // 2. Preserve bullet and number markers from Word supportLists comments before stripping comments
  html = html.replace(/<!--\[if\s*!supportLists[^>]*>([\s\S]*?)<!\[endif\]-->/gi, (_match, p1) => {
    const textMarker = p1.replace(/<[^>]*>/g, '').trim();
    return textMarker ? `<span class="word-list-marker">${textMarker} </span>` : '';
  });

  // Strip remaining Word conditional comments (e.g. <!--[if gte mso 9]>...<![endif]-->)
  html = html.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '');
  // Strip normal HTML comments
  html = html.replace(/<!--[\s\S]*?-->/gi, '');

  // 3. Strip Office/Word XML namespaces & tags (<o:p>, <w:WordDocument>, <v:shape>, etc.)
  html = html.replace(/<o:p[\s\S]*?>[\s\S]*?<\/o:p>/gi, '');
  html = html.replace(/<\/?o:p[^>]*>/gi, '');
  html = html.replace(/<\/?w:[^>]*>/gi, '');
  html = html.replace(/<\/?v:[^>]*>/gi, '');
  html = html.replace(/<\/?m:[^>]*>/gi, '');
  html = html.replace(/<\/?xml[^>]*>/gi, '');

  // 4. Parse into DOM tree for structured semantic transformation
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
  const body = doc.body;

  if (!body) return '';

  // Unwrap wrapper divs (e.g. div.WordSection1) so blocks are properly structured
  unwrapStructuralDivs(body);

  // Group consecutive MsoListParagraph or bullet/numbered paragraphs into proper <ul> / <ol>
  reconstructLists(body);

  // Process DOM elements recursively while keeping styles and formatting intact
  processNode(body);

  // Final cleanup pass for empty nodes and tags
  cleanupDomTree(body);

  // Format output
  let result = body.innerHTML;

  // Clean whitespace inside heading and block tags
  result = result.replace(/<(h[2-4]|p|blockquote|li)>\s*([\s\S]*?)\s*<\/\1>/gi, '<$1>$2</$1>');
  // Remove completely empty paragraphs
  result = result.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
  // Clean excessive sequential line breaks
  result = result.replace(/(<br\s*\/?>\s*){3,}/gi, '<br /><br />');

  return result.trim();
}

/**
 * Unwraps non-semantic wrapper divs (like WordSection1) while retaining their children.
 */
function unwrapStructuralDivs(root: HTMLElement) {
  const divs = Array.from(root.querySelectorAll('div, section, article'));
  for (const div of divs) {
    const className = div.className || '';
    if (!className.includes('callout') && !className.includes('important-note') && !div.getAttribute('style')) {
      unwrapElement(div);
    }
  }
}

/**
 * Reconstructs lists from Word pseudo-list paragraphs (<p class="MsoListParagraph"> or bullet markers).
 */
function reconstructLists(container: HTMLElement) {
  const nestedContainers = [container, ...Array.from(container.querySelectorAll('blockquote, div'))];

  for (const parent of nestedContainers) {
    const children = Array.from(parent.children);
    let currentList: HTMLElement | null = null;
    let currentListType: 'ul' | 'ol' | null = null;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const tagName = child.tagName.toLowerCase();
      const className = child.className || '';
      const style = child.getAttribute('style') || '';
      const text = child.textContent?.trim() || '';

      const isMsoList = /MsoListParagraph/i.test(className) || /mso-list:/i.test(style);
      const bulletMatch = text.match(/^([•·\u2022\u00b7\u25cf\u25aa\u2013\u2014\-*]|\(?[0-9a-zA-Z]+[\.\)])\s+/);

      if (tagName === 'ul' || tagName === 'ol') {
        normalizeListItems(child);
        currentList = null;
        currentListType = null;
        continue;
      }

      if (isMsoList || (tagName === 'p' && bulletMatch)) {
        const isOrdered = /^[0-9]+[\.\)]|^\([0-9]+\)/.test(text) || (bulletMatch && /^[0-9]+[\.\)]/.test(bulletMatch[1]));
        const listType: 'ul' | 'ol' = isOrdered ? 'ol' : 'ul';

        if (!currentList || currentListType !== listType) {
          currentList = child.ownerDocument.createElement(listType);
          currentListType = listType;
          child.parentNode?.insertBefore(currentList, child);
        }

        // Create <li>
        const li = child.ownerDocument.createElement('li');
        // Preserve any inline styles on the list item
        if (style) {
          li.setAttribute('style', style);
        }
        li.innerHTML = child.innerHTML;
        stripLeadingBulletMarker(li);

        currentList.appendChild(li);
        child.remove();
      } else {
        currentList = null;
        currentListType = null;
      }
    }
  }
}

/**
 * Normalizes <li> elements inside standard <ul> and <ol> tags.
 */
function normalizeListItems(listEl: HTMLElement) {
  const items = Array.from(listEl.querySelectorAll('li'));
  for (const li of items) {
    if (li.children.length === 1 && li.firstElementChild?.tagName.toLowerCase() === 'p') {
      const p = li.firstElementChild as HTMLElement;
      const pStyle = p.getAttribute('style');
      if (pStyle && !li.getAttribute('style')) {
        li.setAttribute('style', pStyle);
      }
      li.innerHTML = p.innerHTML;
    }
    stripLeadingBulletMarker(li);
  }
}

/**
 * Strips leading bullet markers like "• ", "1. ", "· " from list items.
 */
function stripLeadingBulletMarker(li: HTMLElement) {
  const markers = li.querySelectorAll('.word-list-marker');
  markers.forEach((m) => m.remove());

  const firstChild = li.firstChild;
  if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
    const text = firstChild.textContent || '';
    const cleaned = text.replace(/^([•·\u2022\u00b7\u25cf\u25aa\u2013\u2014\-*]|\(?[0-9a-zA-Z]+[\.\)])\s*/, '');
    firstChild.textContent = cleaned.trimStart();
  } else if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE) {
    const el = firstChild as HTMLElement;
    const text = el.textContent || '';
    if (/^[•·\u2022\u00b7\u25cf\u25aa\u2013\u2014\-*]|\(?[0-9a-zA-Z]+[\.\)]/.test(text.trim())) {
      const cleaned = text.replace(/^([•·\u2022\u00b7\u25cf\u25aa\u2013\u2014\-*]|\(?[0-9a-zA-Z]+[\.\)])\s*/, '');
      if (!cleaned.trim()) {
        el.remove();
      } else {
        el.textContent = cleaned.trimStart();
      }
    }
  }
}

/**
 * Recursively processes DOM nodes while preserving fonts, styles, colors, and formatting.
 */
function processNode(node: Node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as HTMLElement;
  const tagName = el.tagName.toLowerCase();

  // Process children first
  const children = Array.from(el.childNodes);
  for (const child of children) {
    processNode(child);
  }

  // 1. Heading mapping (preserves styles/fonts/colors on headings)
  const className = el.className || '';
  const isMsoTitle = /MsoTitle|MsoSubtitle/i.test(className);
  const isMsoH1 = /MsoHeading1/i.test(className);
  const isMsoH2 = /MsoHeading2/i.test(className);
  const isMsoH3 = /MsoHeading3/i.test(className);
  const isMsoH4 = /MsoHeading4|MsoHeading5|MsoHeading6/i.test(className);

  if (isMsoTitle || isMsoH1 || tagName === 'h1') {
    replaceTagName(el, 'h2');
    return;
  } else if (isMsoH2) {
    replaceTagName(el, 'h3');
    return;
  } else if (isMsoH3 || isMsoH4 || tagName === 'h5' || tagName === 'h6') {
    replaceTagName(el, 'h4');
    return;
  }

  // 2. Blockquote detection
  if (/MsoQuote|Quote/i.test(className)) {
    replaceTagName(el, 'blockquote');
    return;
  }

  // 3. Table cell paragraph unwrap
  if (tagName === 'th' || tagName === 'td') {
    if (el.children.length === 1 && el.firstElementChild?.tagName.toLowerCase() === 'p') {
      const p = el.firstElementChild as HTMLElement;
      const pStyle = p.getAttribute('style');
      if (pStyle && !el.getAttribute('style')) {
        el.setAttribute('style', pStyle);
      }
      el.innerHTML = p.innerHTML;
    }
    return;
  }

  // 4. Link normalization
  if (tagName === 'a') {
    const href = el.getAttribute('href');
    const name = el.getAttribute('name');

    if (!href && name) {
      unwrapElement(el);
      return;
    }

    if (href && !href.startsWith('file://')) {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    } else {
      unwrapElement(el);
      return;
    }
    return;
  }

  // 5. Image normalization
  if (tagName === 'img') {
    const src = el.getAttribute('src');
    if (!src || src.startsWith('file://')) {
      el.remove();
      return;
    }
    return;
  }
}

/**
 * Final cleanup pass for the DOM tree (keeping styles, colors, fonts, and formatting).
 */
function cleanupDomTree(root: HTMLElement) {
  const allowedElements = new Set([
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'code', 'pre', 'span', 'font',
    'ul', 'ol', 'li',
    'blockquote',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img', 'br', 'hr',
    'div'
  ]);

  const allElements = Array.from(root.querySelectorAll('*'));

  for (let i = allElements.length - 1; i >= 0; i--) {
    const el = allElements[i] as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    // If tag is completely disallowed or internal, unwrap it
    if (!allowedElements.has(tagName)) {
      unwrapElement(el);
      continue;
    }

    // Clean Word-specific Mso classes, but keep all styles (colors, fonts, sizes, etc.)
    if (el.className) {
      const cleanedClasses = el.className
        .split(/\s+/)
        .filter((c) => !c.startsWith('Mso') && !c.startsWith('xl') && c !== 'GramE' && c !== 'SpellE')
        .join(' ');
      if (cleanedClasses) {
        el.className = cleanedClasses;
      } else {
        el.removeAttribute('class');
      }
    }

    // Remove empty inline elements without style or attributes
    if (
      ['strong', 'em', 'span', 'code', 'del', 'a', 'p', 'h2', 'h3', 'h4', 'blockquote', 'li'].includes(tagName) &&
      !el.textContent?.trim() &&
      el.children.length === 0 &&
      !el.getAttribute('style')
    ) {
      el.remove();
    }
  }
}

/**
 * Replaces a DOM element's tag name while preserving attributes and children.
 */
function replaceTagName(el: HTMLElement, newTag: string): HTMLElement {
  const newEl = el.ownerDocument.createElement(newTag);
  // Copy all attributes (including styles, colors, fonts)
  for (const attr of Array.from(el.attributes)) {
    newEl.setAttribute(attr.name, attr.value);
  }
  while (el.firstChild) {
    newEl.appendChild(el.firstChild);
  }
  el.parentNode?.replaceChild(newEl, el);
  return newEl;
}

/**
 * Unwraps an element, moving all its child nodes to its parent, then removing the element.
 */
function unwrapElement(el: HTMLElement) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
}

/**
 * Main paste event handler utility.
 * Sanitizes clipboard content and returns HTML with preserved Word styles & colors.
 */
export function sanitizeWordPaste(clipboardData: DataTransfer): { html: string; wasWord: boolean } {
  const rawHtml = clipboardData.getData('text/html');
  const text = clipboardData.getData('text/plain');

  const wasWord = isWordHtml(rawHtml);

  if (rawHtml && rawHtml.trim().length > 0) {
    return {
      html: cleanWordHtml(rawHtml),
      wasWord,
    };
  } else if (text && text.trim().length > 0) {
    return {
      html: cleanPlainText(text),
      wasWord: false,
    };
  }

  return { html: '', wasWord: false };
}
