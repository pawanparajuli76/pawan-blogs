/**
 * Microsoft Word & Rich-Text Paste Sanitizer
 * 
 * Cleans Word-specific HTML, inline fonts, sizes, colors, Mso classes, XML tags,
 * and pseudo-lists, while preserving semantic document structure (H2-H4, P, Strong, Em,
 * Lists, Blockquotes, Links, Tables, Callouts).
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
 * Sanitizes and cleans Microsoft Word or general rich-text HTML.
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
  // E.g. <!--[if !supportLists]><span style="...">1.<span><![endif]--> -> <span>1. </span>
  html = html.replace(/<!--\[if\s*!supportLists[^>]*>([\s\S]*?)<!\[endif\]-->/gi, (_match, p1) => {
    // Extract pure text / bullet symbols from within the comment
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

  // Unwrap wrapper divs (e.g. div.WordSection1, section divs) so blocks are properly structured
  unwrapStructuralDivs(body);

  // Group consecutive MsoListParagraph or bullet/numbered paragraphs into proper <ul> / <ol>
  reconstructLists(body);

  // Process DOM elements recursively
  processNode(body);

  // Final cleanup pass for empty nodes, span unwrapping, and semantic normalization
  cleanupDomTree(body);

  // Format and trim clean output
  let result = body.innerHTML;

  // Clean whitespace inside heading and block tags
  result = result.replace(/<(h[2-4]|p|blockquote|li)>\s*([\s\S]*?)\s*<\/\1>/gi, '<$1>$2</$1>');
  // Remove empty paragraphs or whitespace-only blocks
  result = result.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
  // Clean multiple sequential line breaks
  result = result.replace(/(<br\s*\/?>\s*){3,}/gi, '<br /><br />');

  return result.trim();
}

/**
 * Unwraps non-semantic wrapper divs (like WordSection1) so child block elements are directly accessible.
 */
function unwrapStructuralDivs(root: HTMLElement) {
  const divs = Array.from(root.querySelectorAll('div, section, article'));
  for (const div of divs) {
    const className = div.className || '';
    if (!className.includes('callout') && !className.includes('important-note')) {
      unwrapElement(div);
    }
  }
}

/**
 * Reconstructs lists from Word pseudo-list paragraphs (<p class="MsoListParagraph"> or bullet markers).
 */
function reconstructLists(container: HTMLElement) {
  // Also run on any nested containers (e.g. blockquotes)
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

      // Check if element is a list paragraph or starts with list bullet/number marker
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
  cleanAttributes(listEl, []);
  const items = Array.from(listEl.querySelectorAll('li'));
  for (const li of items) {
    cleanAttributes(li, []);
    if (li.children.length === 1 && li.firstElementChild?.tagName.toLowerCase() === 'p') {
      const p = li.firstElementChild;
      li.innerHTML = p.innerHTML;
    }
    stripLeadingBulletMarker(li);
  }
}

/**
 * Strips leading bullet markers like "• ", "1. ", "· " from list items.
 */
function stripLeadingBulletMarker(li: HTMLElement) {
  // Remove any word-list-marker spans first
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
 * Recursively processes DOM nodes to strip styles, attributes, and normalize tags.
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

  // 1. Heading mapping
  const className = el.className || '';
  const isMsoTitle = /MsoTitle|MsoSubtitle/i.test(className);
  const isMsoH1 = /MsoHeading1/i.test(className) || tagName === 'h1';
  const isMsoH2 = /MsoHeading2/i.test(className) || tagName === 'h2';
  const isMsoH3 = /MsoHeading3/i.test(className) || tagName === 'h3';
  const isMsoH4 = /MsoHeading4|MsoHeading5|MsoHeading6/i.test(className) || ['h4', 'h5', 'h6'].includes(tagName);

  if (isMsoTitle || isMsoH1) {
    replaceTagName(el, 'h2');
    return;
  } else if (isMsoH2) {
    replaceTagName(el, 'h3');
    return;
  } else if (isMsoH3 || isMsoH4) {
    replaceTagName(el, 'h4');
    return;
  }

  // 2. Bold / Italic conversion
  const style = el.getAttribute('style') || '';
  const isBold =
    tagName === 'b' ||
    tagName === 'strong' ||
    /font-weight\s*:\s*(bold|[7-9]00)/i.test(style);
  const isItalic =
    tagName === 'i' ||
    tagName === 'em' ||
    /font-style\s*:\s*italic/i.test(style);

  if (tagName === 'span' || tagName === 'font') {
    if (isBold && isItalic) {
      const strong = el.ownerDocument.createElement('strong');
      const em = el.ownerDocument.createElement('em');
      while (el.firstChild) {
        em.appendChild(el.firstChild);
      }
      strong.appendChild(em);
      el.parentNode?.replaceChild(strong, el);
      return;
    } else if (isBold) {
      replaceTagName(el, 'strong');
      return;
    } else if (isItalic) {
      replaceTagName(el, 'em');
      return;
    }
  }

  if (tagName === 'b') {
    replaceTagName(el, 'strong');
    return;
  }
  if (tagName === 'i') {
    replaceTagName(el, 'em');
    return;
  }

  // 3. Blockquote detection
  if (/MsoQuote|Quote/i.test(className)) {
    replaceTagName(el, 'blockquote');
    return;
  }

  // 4. Table cell normalization
  if (tagName === 'th' || tagName === 'td') {
    cleanAttributes(el, ['colspan', 'rowspan']);
    return;
  }

  // 5. Link normalization
  if (tagName === 'a') {
    const href = el.getAttribute('href');
    const name = el.getAttribute('name');

    if (!href && name) {
      unwrapElement(el);
      return;
    }

    if (href && !href.startsWith('file://')) {
      cleanAttributes(el, ['href', 'target', 'rel', 'title']);
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

  // 6. Image normalization
  if (tagName === 'img') {
    const src = el.getAttribute('src');
    if (src && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:image'))) {
      cleanAttributes(el, ['src', 'alt', 'title']);
    } else {
      el.remove();
      return;
    }
    return;
  }

  // 7. Retain custom UI components if present
  if (className.includes('callout') || className.includes('important-note')) {
    cleanAttributes(el, ['class']);
    return;
  }
}

/**
 * Cleans attributes from an element, keeping only allowed ones.
 */
function cleanAttributes(el: HTMLElement, allowedAttrs: string[]) {
  const attrs = Array.from(el.attributes);
  for (const attr of attrs) {
    if (!allowedAttrs.includes(attr.name.toLowerCase())) {
      el.removeAttribute(attr.name);
    }
  }
}

/**
 * Final cleanup pass for the DOM tree.
 */
function cleanupDomTree(root: HTMLElement) {
  const allowedElements = new Set([
    'p', 'h2', 'h3', 'h4',
    'strong', 'b', 'em', 'i', 'u', 'del', 'code', 'pre',
    'ul', 'ol', 'li',
    'blockquote',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img', 'br', 'hr',
    'div' // for callout / important-note
  ]);

  const allElements = Array.from(root.querySelectorAll('*'));

  for (let i = allElements.length - 1; i >= 0; i--) {
    const el = allElements[i] as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    // 1. If tag is not allowed, unwrap or clean it
    if (!allowedElements.has(tagName)) {
      unwrapElement(el);
      continue;
    }

    // 2. Remove all inline styles and disallowed classes
    if (tagName === 'div') {
      const className = el.className || '';
      if (!className.includes('callout') && !className.includes('important-note')) {
        unwrapElement(el);
        continue;
      }
      cleanAttributes(el, ['class']);
    } else if (tagName === 'p') {
      const className = el.className || '';
      if (className.includes('callout-title')) {
        cleanAttributes(el, ['class']);
      } else {
        cleanAttributes(el, []);
      }
    } else if (tagName === 'h2' || tagName === 'h3' || tagName === 'h4') {
      cleanAttributes(el, ['id']);
    } else if (tagName === 'strong' || tagName === 'em' || tagName === 'del' || tagName === 'code' || tagName === 'pre' || tagName === 'blockquote') {
      cleanAttributes(el, []);
    } else if (tagName === 'table') {
      cleanAttributes(el, []);
    } else if (tagName === 'tr' || tagName === 'thead' || tagName === 'tbody') {
      cleanAttributes(el, []);
    } else if (tagName === 'th' || tagName === 'td') {
      cleanAttributes(el, ['colspan', 'rowspan']);
    } else if (tagName === 'ul' || tagName === 'ol' || tagName === 'li') {
      cleanAttributes(el, []);
    }

    // Trim text content inside element
    if (['h2', 'h3', 'h4', 'p', 'th', 'td', 'blockquote'].includes(tagName)) {
      el.innerHTML = el.innerHTML.trim();
    }

    // 3. Remove completely empty inline elements
    if (
      ['strong', 'em', 'span', 'code', 'del', 'a', 'p', 'h2', 'h3', 'h4', 'blockquote', 'li'].includes(tagName) &&
      !el.textContent?.trim() &&
      el.children.length === 0
    ) {
      el.remove();
    }
  }
}

/**
 * Replaces a DOM element's tag name while preserving children.
 */
function replaceTagName(el: HTMLElement, newTag: string): HTMLElement {
  const newEl = el.ownerDocument.createElement(newTag);
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
 * Sanitizes clipboard content and returns clean HTML ready to insert into editor.
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
