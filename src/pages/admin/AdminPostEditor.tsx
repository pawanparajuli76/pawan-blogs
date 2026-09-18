import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Save,
  Eye,
  Send,
  ArrowLeft,
  Upload,
  X,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Link as LinkIcon,
  Unlink as UnlinkIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Heading4,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Code,
  AlertCircle,
  Lightbulb,
  Star,
  Undo,
  Redo,
  Eraser,
  Sparkles,
  Check,
  Type,
  FileText,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent as IndentIcon,
  Outdent as OutdentIcon,
  Highlighter,
  Baseline,
  ChevronDown,
} from 'lucide-react';
import mammoth from 'mammoth';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import { sanitizeWordPaste, cleanWordHtml } from '@/lib/wordPasteSanitizer';
import { convertDocxToHtml } from '@/lib/docxConverter';
import type { Category, Tag } from '@/types';

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_id: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
}

const emptyForm: PostFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image: '',
  category_id: '',
  status: 'draft',
  is_featured: false,
  seo_title: '',
  seo_description: '',
};

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  ul: boolean;
  ol: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
  fontFamily: string;
  fontSize: string;
  foreColor: string;
  hiliteColor: string;
  block: 'p' | 'h2' | 'h3' | 'h4' | 'blockquote' | null;
}

const FONT_FAMILIES = [
  { label: 'Font Family', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', 'Lucida Sans Unicode', sans-serif" },
  { label: 'Garamond', value: "Garamond, 'Baskerville', serif" },
];

const FONT_SIZES = [
  { label: 'Font Size', value: '' },
  { label: 'Small', value: '13px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '22px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
  { label: '36', value: '36px' },
  { label: '40', value: '40px' },
  { label: '48', value: '48px' },
];

const TEXT_COLORS = [
  { name: 'Theme Navy', color: '#0f172a' },
  { name: 'Black', color: '#000000' },
  { name: 'Dark Grey', color: '#475569' },
  { name: 'Red', color: '#dc2626' },
  { name: 'Blue', color: '#2563eb' },
  { name: 'Green', color: '#16a34a' },
  { name: 'Muted Gold', color: '#d97706' },
  { name: 'Teal', color: '#0f766e' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None / Clear', color: 'transparent' },
  { name: 'Yellow', color: '#fef08a' },
  { name: 'Light Green', color: '#bbf7d0' },
  { name: 'Light Blue', color: '#bfdbfe' },
  { name: 'Light Red', color: '#fecaca' },
  { name: 'Light Orange', color: '#fed7aa' },
  { name: 'Light Purple', color: '#e9d5ff' },
];

export function AdminPostEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentFileInputRef = useRef<HTMLInputElement>(null);
  const docxFileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const textColorPickerRef = useRef<HTMLDivElement>(null);
  const highlightPickerRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<PostFormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [importingDocx, setImportingDocx] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [customTextColor, setCustomTextColor] = useState('#0f172a');
  const [customHighlightColor, setCustomHighlightColor] = useState('#fef08a');

  const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    ul: false,
    ol: false,
    align: 'left',
    fontFamily: '',
    fontSize: '',
    foreColor: '#0f172a',
    hiliteColor: '',
    block: 'p',
  });

  // Close color pickers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (textColorPickerRef.current && !textColorPickerRef.current.contains(e.target as Node)) {
        setShowTextColorPicker(false);
      }
      if (highlightPickerRef.current && !highlightPickerRef.current.contains(e.target as Node)) {
        setShowHighlightPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const [{ data: cats }, { data: tags }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('tags').select('*').order('name'),
      ]);
      if (cats) setCategories(cats);
      if (tags) setAllTags(tags);

      if (isEditing && id) {
        const { data: post } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (post) {
          setForm({
            title: post.title || '',
            slug: post.slug || '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            featured_image: post.featured_image || '',
            category_id: post.category_id || '',
            status: post.status || 'draft',
            is_featured: post.is_featured || false,
            seo_title: post.seo_title || '',
            seo_description: post.seo_description || '',
          });
          setSlugEdited(true);

          // Fetch existing tags
          const { data: postTags } = await supabase
            .from('blog_post_tags')
            .select('tag_id')
            .eq('post_id', id);

          if (postTags) {
            setSelectedTags(postTags.map((pt: { tag_id: string }) => pt.tag_id));
          }
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [id, isEditing]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, slugEdited]);

  // Set editor content when loading
  useEffect(() => {
    if (editorRef.current && form.content && !loading) {
      if (editorRef.current.innerHTML !== form.content) {
        editorRef.current.innerHTML = form.content;
      }
    }
  }, [form.content, loading]);

  const updateContent = useCallback(() => {
    if (editorRef.current) {
      setForm((f) => ({ ...f, content: editorRef.current!.innerHTML }));
    }
  }, []);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  }, []);

  const restoreSelection = useCallback((): boolean => {
    if (!savedRangeRef.current) return false;
    const sel = window.getSelection();
    if (!sel) return false;
    sel.removeAllRanges();
    sel.addRange(savedRangeRef.current);
    return true;
  }, []);

  // Update active formatting states based on current selection
  const checkActiveFormats = useCallback(() => {
    if (!editorRef.current) return;

    try {
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      const strike = document.queryCommandState('strikeThrough');
      const ul = document.queryCommandState('insertUnorderedList');
      const ol = document.queryCommandState('insertOrderedList');

      let align: 'left' | 'center' | 'right' | 'justify' = 'left';
      if (document.queryCommandState('justifyCenter')) align = 'center';
      else if (document.queryCommandState('justifyRight')) align = 'right';
      else if (document.queryCommandState('justifyFull')) align = 'justify';

      let block: 'p' | 'h2' | 'h3' | 'h4' | 'blockquote' | null = 'p';
      let fontFamily = '';
      let fontSize = '';
      let foreColor = '#0f172a';
      let hiliteColor = '';

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentNode;
        }

        while (node && node !== editorRef.current) {
          const el = node as HTMLElement;
          const tag = el.tagName?.toLowerCase();

          if (tag === 'h2') {
            block = 'h2';
          } else if (tag === 'h3') {
            block = 'h3';
          } else if (tag === 'h4') {
            block = 'h4';
          } else if (tag === 'blockquote') {
            block = 'blockquote';
          }

          if (!fontFamily && el.style?.fontFamily) {
            fontFamily = el.style.fontFamily;
          }
          if (!fontSize && el.style?.fontSize) {
            fontSize = el.style.fontSize;
          }
          if (el.style?.color) {
            foreColor = el.style.color;
          }
          if (el.style?.backgroundColor) {
            hiliteColor = el.style.backgroundColor;
          }

          node = node.parentNode;
        }
      }

      setActiveFormats({
        bold,
        italic,
        underline,
        strike,
        ul,
        ol,
        align,
        fontFamily,
        fontSize,
        foreColor,
        hiliteColor,
        block,
      });
    } catch {
      // Ignore queryCommandState failures
    }
  }, []);

  const execCommand = (command: string, value?: string) => {
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    saveSelection();
    updateContent();
    checkActiveFormats();
  };

  const insertHTML = (html: string) => {
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('insertHTML', false, html);
    editorRef.current?.focus();
    saveSelection();
    updateContent();
    checkActiveFormats();
  };

  const handleHeading = (tag: 'p' | 'h2' | 'h3' | 'h4' | 'blockquote') => {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    saveSelection();
    updateContent();
    checkActiveFormats();
  };

  const handleFontFamily = (fontFamilyVal: string) => {
    restoreSelection();
    editorRef.current?.focus();
    if (fontFamilyVal) {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontName', false, fontFamilyVal);
    }
    saveSelection();
    updateContent();
    checkActiveFormats();
  };

  const handleFontSize = (sizeVal: string) => {
    if (!sizeVal) return;
    restoreSelection();
    editorRef.current?.focus();

    let targetPx = sizeVal;
    if (sizeVal === 'small') targetPx = '13px';
    else if (sizeVal === 'normal') targetPx = '16px';
    else if (sizeVal === 'large') targetPx = '22px';
    else if (!sizeVal.endsWith('px') && !sizeVal.endsWith('rem') && !sizeVal.endsWith('em')) {
      targetPx = `${sizeVal}px`;
    }

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (range.collapsed) {
      const span = document.createElement('span');
      span.style.fontSize = targetPx;
      span.innerHTML = '&#8203;';
      range.insertNode(span);
      const newRange = document.createRange();
      newRange.setStart(span.firstChild || span, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontSize', false, '7');
      if (editorRef.current) {
        const elements = editorRef.current.querySelectorAll(
          'font[size="7"], span[style*="xxx-large"], span[style*="-webkit-xxx-large"]'
        );
        elements.forEach((el) => {
          (el as HTMLElement).style.fontSize = targetPx;
          (el as HTMLElement).removeAttribute('size');
        });
      }
    }

    saveSelection();
    updateContent();
    checkActiveFormats();
  };

  const handleTextColor = (color: string) => {
    if (!color) return;
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, color);
    saveSelection();
    updateContent();
    checkActiveFormats();
    setShowTextColorPicker(false);
  };

  const handleHighlightColor = (color: string) => {
    if (!color) return;
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand('styleWithCSS', false, 'true');
    if (color === 'transparent' || color === 'none') {
      document.execCommand('hiliteColor', false, 'transparent');
      document.execCommand('backColor', false, 'transparent');
    } else {
      try {
        if (!document.execCommand('hiliteColor', false, color)) {
          document.execCommand('backColor', false, color);
        }
      } catch {
        document.execCommand('backColor', false, color);
      }
    }
    saveSelection();
    updateContent();
    checkActiveFormats();
    setShowHighlightPicker(false);
  };

  const handleClearFormatting = () => {
    document.execCommand('removeFormat', false);
    document.execCommand('formatBlock', false, 'p');
    editorRef.current?.focus();
    saveSelection();
    updateContent();
    checkActiveFormats();
    setToastMessage('Formatting cleared');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCleanAllWordFormatting = () => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    if (!currentHtml || currentHtml.trim() === '') return;

    const cleaned = cleanWordHtml(currentHtml);
    editorRef.current.innerHTML = cleaned;
    updateContent();
    checkActiveFormats();
    setToastMessage('Article content cleaned & sanitized according to website styles');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle client-side Word document (.docx) import
  const handleDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    if (!file.name.toLowerCase().endsWith('.docx')) {
      setError('Please select a valid Microsoft Word (.docx) document.');
      return;
    }

    setImportingDocx(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();

      let rawHtml = '';
      try {
        // High-fidelity OpenXML converter: Preserves exact text colors, heading numbering (e.g. 1. IPO Reform, 2. Strengthening...), fonts, bold/italic, tables & spacing
        rawHtml = await convertDocxToHtml(arrayBuffer);
      } catch (docxErr) {
        console.warn('OpenXML parser fallback to Mammoth:', docxErr);
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Heading 1'] => h2:fresh",
              "p[style-name='Heading 2'] => h3:fresh",
              "p[style-name='Heading 3'] => h4:fresh",
              "p[style-name='Heading 4'] => h4:fresh",
              "p[style-name='Title'] => h2:fresh",
              "p[style-name='Subtitle'] => h3:fresh",
              "p[style-name='Quote'] => blockquote:fresh",
              "p[style-name='Intense Quote'] => blockquote:fresh",
            ],
          }
        );
        rawHtml = result.value || '';
      }

      // Clean unsafe Office markup while preserving all formatting, colors, and styles
      const cleanHtml = cleanWordHtml(rawHtml);

      if (editorRef.current) {
        editorRef.current.innerHTML = cleanHtml;
      }
      setForm((f) => ({ ...f, content: cleanHtml }));
      checkActiveFormats();

      setToastMessage(`Imported "${file.name}" successfully with full Word colors, formatting and numbered headings preserved!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to import Word document: ${message}`);
    } finally {
      setImportingDocx(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const { html, wasWord } = sanitizeWordPaste(e.clipboardData);
    if (!html) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node: ChildNode | null;
      let lastNode: ChildNode | null = null;
      while ((node = tempDiv.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      if (lastNode) {
        const newRange = document.createRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else if (editorRef.current) {
      editorRef.current.innerHTML += html;
    }

    updateContent();
    checkActiveFormats();

    if (wasWord) {
      setToastMessage('Microsoft Word content sanitized & formatting cleaned');
    } else {
      setToastMessage('Pasted content formatted cleanly');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const insertLink = () => {
    const url = prompt('Enter URL (e.g. https://example.com):');
    if (url) {
      const formattedUrl = /^https?:\/\//i.test(url) || url.startsWith('/') || url.startsWith('#') || url.startsWith('mailto:')
        ? url
        : `https://${url}`;
      execCommand('createLink', formattedUrl);
    }
  };

  const insertTable = () => {
    const rows = 3;
    const cols = 3;
    let html = '<table><thead><tr>';
    for (let c = 0; c < cols; c++) {
      html += `<th>Header ${c + 1}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td>&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p></p>';
    insertHTML(html);
  };

  const insertCallout = () => {
    insertHTML(
      '<div class="callout"><p class="callout-title">Note</p><p>Add your note text here.</p></div><p></p>'
    );
  };

  const insertImportantNote = () => {
    insertHTML(
      '<div class="important-note"><p><strong>Important:</strong> Add your important note here.</p></div><p></p>'
    );
  };

  const insertCodeBlock = () => {
    insertHTML('<pre><code>// Add your code here</code></pre><p></p>');
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) {
      setError('Failed to upload image: ' + uploadError.message);
      setUploadingImage(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    setForm((f) => ({ ...f, featured_image: urlData.publicUrl }));
    setUploadingImage(false);
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file);

    if (uploadError) {
      setError('Failed to upload image: ' + uploadError.message);
      setUploadingImage(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    insertHTML(`<img src="${urlData.publicUrl}" alt="" /><p></p>`);
    setUploadingImage(false);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const savePost = async (publish: boolean) => {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.slug.trim()) {
      setError('Slug is required');
      return;
    }

    setSaving(true);
    setError(null);

    const status = publish ? 'published' : 'draft';
    const publishedAt = publish && !form.status.includes('published')
      ? new Date().toISOString()
      : isEditing
        ? undefined
        : publish ? new Date().toISOString() : null;

    // Clean content one final time before saving to ensure clean markup
    const cleanedContent = form.content ? cleanWordHtml(form.content) : null;

    const postData: Record<string, unknown> = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: cleanedContent,
      featured_image: form.featured_image || null,
      category_id: form.category_id || null,
      status,
      is_featured: form.is_featured,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
    };

    if (publishedAt !== undefined) {
      postData.published_at = publishedAt;
    }

    let postId = id;

    if (isEditing && id) {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id);

      if (updateError) {
        setError('Failed to update post: ' + updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .maybeSingle();

      postData.author_id = profile?.id || null;

      const { data: newPost, error: insertError } = await supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single();

      if (insertError) {
        setError('Failed to create post: ' + insertError.message);
        setSaving(false);
        return;
      }
      postId = newPost.id;
    }

    // Update tags - delete existing then insert new
    if (postId) {
      await supabase.from('blog_post_tags').delete().eq('post_id', postId);

      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map((tagId) => ({
          post_id: postId,
          tag_id: tagId,
        }));
        await supabase.from('blog_post_tags').insert(tagInserts);
      }
    }

    setSaving(false);
    navigate('/admin/posts');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-navy-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/posts"
            className="p-2 rounded-lg text-navy-500 hover:bg-navy-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-navy-900">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h1>
            <p className="text-sm text-navy-500">
              {form.status === 'published' ? 'Published' : 'Draft'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => savePost(false)}
            disabled={saving}
            className="btn-secondary btn-sm"
          >
            <Save size={16} />
            Save Draft
          </button>
          {form.status === 'published' && isEditing ? (
            <button
              onClick={() => savePost(true)}
              disabled={saving}
              className="btn-primary btn-sm"
            >
              <Save size={16} />
              Update
            </button>
          ) : (
            <button
              onClick={() => savePost(true)}
              disabled={saving}
              className="btn-primary btn-sm"
            >
              <Send size={16} />
              Publish
            </button>
          )}
          {form.slug && form.status === 'published' && (
            <Link
              to={`/blog/${form.slug}`}
              target="_blank"
              className="btn-secondary btn-sm"
            >
              <Eye size={16} />
              Preview
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {toastMessage && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-teal-900 text-white rounded-lg shadow-soft-lg mb-6 transition-all animate-fadeIn">
          <Check size={18} className="text-teal-300 flex-shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="card p-5">
            <label className="label-field">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field text-lg font-serif font-semibold"
              placeholder="Enter article title..."
            />
          </div>

          {/* Slug */}
          <div className="card p-5">
            <label className="label-field">URL Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-navy-400">/blog/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setForm({ ...form, slug: e.target.value });
                  setSlugEdited(true);
                }}
                className="input-field"
                placeholder="article-slug"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="card p-5">
            <label className="label-field">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={3}
              className="input-field resize-none"
              placeholder="Short summary of the article..."
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            {/* Header above editor with single Word Import button */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <label className="label-field mb-0 font-medium text-navy-800">Article Content</label>
              <button
                type="button"
                onClick={() => docxFileInputRef.current?.click()}
                disabled={importingDocx}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-navy-300 hover:border-navy-500 text-navy-800 hover:text-navy-950 hover:bg-navy-50 shadow-2xs transition-all duration-150 disabled:opacity-50"
              >
                {importingDocx ? (
                  <Loader2 size={15} className="animate-spin text-navy-700" />
                ) : (
                  <FileText size={15} className="text-teal-700" />
                )}
                <span>{importingDocx ? 'Converting Document...' : 'Import Word Document (.docx)'}</span>
              </button>
            </div>

            <div className="card relative overflow-visible border border-navy-200">
              {/* Sticky Rich Text Toolbar (Pinned below admin layout header at top-16) */}
              <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md rounded-t-xl border-b border-navy-200 shadow-2xs">
                <div className="flex flex-wrap items-center gap-1 p-2">
                  {/* Group 1: Undo / Redo */}
                  <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('undo');
                      }}
                      title="Undo (Ctrl+Z)"
                      className="p-1.5 rounded-md text-navy-600 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                    >
                      <Undo size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('redo');
                      }}
                      title="Redo (Ctrl+Y)"
                      className="p-1.5 rounded-md text-navy-600 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                    >
                      <Redo size={15} />
                    </button>
                  </div>

                  {/* Group 2: Headings & Block Hierarchy */}
                  <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleHeading('p');
                      }}
                      title="Paragraph (Normal Text)"
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                        activeFormats.block === 'p'
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <Type size={14} />
                      <span>Para</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleHeading('h2');
                      }}
                      title="Heading 2 (Main Section)"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.block === 'h2'
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <Heading2 size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleHeading('h3');
                      }}
                      title="Heading 3 (Sub Section)"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.block === 'h3'
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <Heading3 size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleHeading('h4');
                      }}
                      title="Heading 4 (Minor Section)"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.block === 'h4'
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <Heading4 size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleHeading('blockquote');
                      }}
                      title="Blockquote"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.block === 'blockquote'
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <Quote size={15} />
                    </button>
                  </div>

                  {/* Group 3: Font Family Dropdown */}
                  <div className="flex items-center pr-1.5 border-r border-navy-200">
                    <select
                      value={activeFormats.fontFamily || ''}
                      onFocus={saveSelection}
                      onChange={(e) => handleFontFamily(e.target.value)}
                      title="Font Family"
                      className="text-xs h-7.5 bg-white border border-navy-200 rounded-md px-2 py-0 text-navy-800 focus:outline-none focus:ring-1 focus:ring-navy-400 max-w-[110px] sm:max-w-[130px] truncate"
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f.label} value={f.value} style={{ fontFamily: f.value || 'inherit' }}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Group 4: Font Size Dropdown */}
                  <div className="flex items-center pr-1.5 border-r border-navy-200">
                    <select
                      value={activeFormats.fontSize || ''}
                      onFocus={saveSelection}
                      onChange={(e) => handleFontSize(e.target.value)}
                      title="Font Size"
                      className="text-xs h-7.5 bg-white border border-navy-200 rounded-md px-1.5 py-0 text-navy-800 focus:outline-none focus:ring-1 focus:ring-navy-400 max-w-[85px] sm:max-w-[95px] truncate"
                    >
                      {FONT_SIZES.map((s) => (
                        <option key={s.label} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Group 5: Inline Styles (Bold, Italic, Underline, Strike) */}
                  <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('bold');
                      }}
                      title="Bold (Ctrl+B)"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.bold
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <Bold size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('italic');
                      }}
                      title="Italic (Ctrl+I)"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.italic
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <Italic size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('underline');
                      }}
                      title="Underline (Ctrl+U)"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.underline
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <UnderlineIcon size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('strikeThrough');
                      }}
                      title="Strikethrough"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.strike
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <StrikeIcon size={15} />
                    </button>
                  </div>

                  {/* Group 6: Text Color & Highlight Color */}
                  <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                    {/* Text Color Picker */}
                    <div className="relative" ref={textColorPickerRef}>
                      <button
                        type="button"
                        onClick={() => {
                          saveSelection();
                          setShowTextColorPicker((prev) => !prev);
                          setShowHighlightPicker(false);
                        }}
                        title="Text Color"
                        className="flex items-center gap-0.5 p-1.5 rounded-md text-navy-700 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                      >
                        <Baseline size={15} />
                        <span
                          className="w-3 h-1 rounded-sm block -mt-0.5"
                          style={{ backgroundColor: activeFormats.foreColor || '#0f172a' }}
                        />
                        <ChevronDown size={10} className="text-navy-400" />
                      </button>

                      {showTextColorPicker && (
                        <div className="absolute top-full left-0 mt-1.5 p-2.5 bg-white rounded-lg shadow-soft-lg border border-navy-200 z-30 w-48 animate-fadeIn">
                          <div className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider mb-2">
                            Text Color
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                            {TEXT_COLORS.map((item) => (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => handleTextColor(item.color)}
                                title={item.name}
                                className="w-7 h-7 rounded-md border border-navy-200 flex items-center justify-center transition-transform hover:scale-110"
                                style={{ backgroundColor: item.color }}
                              />
                            ))}
                          </div>
                          <div className="pt-2 border-t border-navy-100 flex items-center justify-between gap-2">
                            <span className="text-xs text-navy-600">Custom:</span>
                            <input
                              type="color"
                              value={customTextColor}
                              onChange={(e) => {
                                setCustomTextColor(e.target.value);
                                handleTextColor(e.target.value);
                              }}
                              className="w-7 h-7 p-0 rounded border border-navy-300 cursor-pointer bg-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Highlight Color Picker */}
                    <div className="relative" ref={highlightPickerRef}>
                      <button
                        type="button"
                        onClick={() => {
                          saveSelection();
                          setShowHighlightPicker((prev) => !prev);
                          setShowTextColorPicker(false);
                        }}
                        title="Highlight Color"
                        className="flex items-center gap-0.5 p-1.5 rounded-md text-navy-700 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                      >
                        <Highlighter size={15} />
                        <span
                          className="w-3 h-1 rounded-sm block -mt-0.5"
                          style={{ backgroundColor: activeFormats.hiliteColor || '#fef08a' }}
                        />
                        <ChevronDown size={10} className="text-navy-400" />
                      </button>

                      {showHighlightPicker && (
                        <div className="absolute top-full left-0 mt-1.5 p-2.5 bg-white rounded-lg shadow-soft-lg border border-navy-200 z-30 w-48 animate-fadeIn">
                          <div className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider mb-2">
                            Highlight
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                            {HIGHLIGHT_COLORS.map((item) => (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => handleHighlightColor(item.color)}
                                title={item.name}
                                className="w-7 h-7 rounded-md border border-navy-200 flex items-center justify-center text-[10px] font-medium transition-transform hover:scale-110"
                                style={{ backgroundColor: item.color }}
                              >
                                {item.color === 'transparent' ? '✕' : ''}
                              </button>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-navy-100 flex items-center justify-between gap-2">
                            <span className="text-xs text-navy-600">Custom:</span>
                            <input
                              type="color"
                              value={customHighlightColor}
                              onChange={(e) => {
                                setCustomHighlightColor(e.target.value);
                                handleHighlightColor(e.target.value);
                              }}
                              className="w-7 h-7 p-0 rounded border border-navy-300 cursor-pointer bg-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Group 7: Alignment */}
                  <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('justifyLeft');
                      }}
                      title="Align Left"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.align === 'left'
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <AlignLeft size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('justifyCenter');
                      }}
                      title="Align Center"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.align === 'center'
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <AlignCenter size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('justifyRight');
                      }}
                      title="Align Right"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.align === 'right'
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <AlignRight size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('justifyFull');
                      }}
                      title="Justify"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.align === 'justify'
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <AlignJustify size={15} />
                    </button>
                  </div>

                  {/* Group 8: Indent / Outdent & Lists */}
                  <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('outdent');
                      }}
                      title="Decrease Indent"
                      className="p-1.5 rounded-md text-navy-700 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                    >
                      <OutdentIcon size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('indent');
                      }}
                      title="Increase Indent"
                      className="p-1.5 rounded-md text-navy-700 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                    >
                      <IndentIcon size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('insertUnorderedList');
                      }}
                      title="Bulleted List"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.ul
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <List size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('insertOrderedList');
                      }}
                      title="Numbered List"
                      className={`p-1.5 rounded-md transition-colors ${
                        activeFormats.ol
                          ? 'bg-navy-800 text-white shadow-xs'
                          : 'text-navy-700 hover:bg-navy-100 hover:text-navy-900'
                      }`}
                    >
                      <ListOrdered size={15} />
                    </button>
                  </div>

                  {/* Group 9: Inserts (Link, Unlink, Table, Image, Code Block) */}
                  <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertLink();
                      }}
                      title="Insert / Edit Link"
                      className="p-1.5 rounded-md text-navy-700 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                    >
                      <LinkIcon size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('unlink');
                      }}
                      title="Remove Link"
                      className="p-1.5 rounded-md text-navy-700 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                    >
                      <UnlinkIcon size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertTable();
                      }}
                      title="Insert Table"
                      className="p-1.5 rounded-md text-navy-700 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                    >
                      <TableIcon size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        contentFileInputRef.current?.click();
                      }}
                      title="Insert Image"
                      className="p-1.5 rounded-md text-navy-700 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                    >
                      <ImageIcon size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertCodeBlock();
                      }}
                      title="Code Block"
                      className="p-1.5 rounded-md text-navy-700 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                    >
                      <Code size={15} />
                    </button>
                  </div>

                  {/* Group 10: Callouts & Clear Formatting */}
                  <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertCallout();
                      }}
                      title="Callout Box (Teal)"
                      className="p-1.5 rounded-md text-teal-700 hover:bg-teal-50 transition-colors"
                    >
                      <Lightbulb size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertImportantNote();
                      }}
                      title="Important Note Box (Gold)"
                      className="p-1.5 rounded-md text-gold-700 hover:bg-gold-50 transition-colors"
                    >
                      <AlertCircle size={15} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleClearFormatting();
                      }}
                      title="Clear Formatting"
                      className="p-1.5 rounded-md text-navy-700 hover:bg-navy-100 hover:text-navy-900 transition-colors"
                    >
                      <Eraser size={15} />
                    </button>
                  </div>

                  {/* Group 11: Clean Word Markup Quick Action */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={handleCleanAllWordFormatting}
                      title="Sanitize & normalize all Word formatting in the article"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-navy-700 bg-navy-50 border border-navy-200 rounded-md hover:bg-navy-100 hover:text-navy-950 transition-colors shadow-2xs"
                    >
                      <Sparkles size={13} className="text-gold-500" />
                      <span className="hidden sm:inline">Clean Word Markup</span>
                    </button>
                  </div>
                </div>

                {/* Sub-bar / Tip indicator */}
                <div className="px-3.5 py-1 bg-navy-50/60 border-t border-navy-100 flex items-center justify-between text-[11px] text-navy-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span>Rich Text Editor with Word (.docx) &amp; Google Docs paste support</span>
                  </span>
                  <span className="text-navy-400 hidden md:inline">Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Z supported</span>
                </div>
              </div>

              {/* Editor Content Area */}
              <div
                ref={editorRef}
                contentEditable
                onInput={updateContent}
                onPaste={handlePaste}
                onKeyUp={() => {
                  saveSelection();
                  checkActiveFormats();
                }}
                onMouseUp={() => {
                  saveSelection();
                  checkActiveFormats();
                }}
                className="prose-content min-h-[460px] p-6 focus:outline-none"
                data-placeholder="Start writing, import a Word .docx document, or paste from Word..."
                style={{ ['--tw-prose-body' as string]: 'initial' }}
              />

              {importingDocx && (
                <div className="px-6 py-3 bg-teal-50 border-t border-teal-200 text-sm text-teal-900 flex items-center gap-2 font-medium">
                  <Loader2 size={16} className="animate-spin text-teal-700" />
                  <span>Extracting and converting Word document content...</span>
                </div>
              )}

              {uploadingImage && (
                <div className="px-6 py-3 bg-gold-50 border-t border-gold-200 text-sm text-gold-800">
                  Uploading image...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status & Featured */}
          <div className="card p-5">
            <label className="label-field">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
              className="input-field"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <div className="flex items-center gap-3 mt-4 p-3 bg-navy-50 rounded-lg">
              <button
                onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                className={`p-2 rounded-lg transition-colors ${
                  form.is_featured ? 'text-gold-500 bg-gold-50' : 'text-navy-400'
                }`}
              >
                <Star size={18} className={form.is_featured ? 'fill-current' : ''} />
              </button>
              <div>
                <div className="text-sm font-medium text-navy-900">Featured Article</div>
                <div className="text-xs text-navy-500">Display on homepage</div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="card p-5">
            <label className="label-field">Featured Image</label>
            {form.featured_image ? (
              <div className="relative group">
                <img
                  src={form.featured_image}
                  alt="Featured"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={() => setForm({ ...form, featured_image: '' })}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-soft opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} className="text-red-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full h-40 border-2 border-dashed border-navy-200 rounded-lg flex flex-col items-center justify-center gap-2 text-navy-400 hover:border-navy-400 hover:text-navy-600 transition-colors"
              >
                <Upload size={24} />
                <span className="text-sm">{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFeaturedImageUpload}
              className="hidden"
            />
          </div>

          {/* Category */}
          <div className="card p-5">
            <label className="label-field">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="input-field"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="card p-5">
            <label className="label-field">Tags</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`badge cursor-pointer transition-colors text-xs ${
                    selectedTags.includes(tag.id)
                      ? 'bg-navy-800 text-white'
                      : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-navy-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="label-field">SEO Title</label>
                <input
                  type="text"
                  value={form.seo_title}
                  onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                  className="input-field"
                  placeholder="Custom SEO title..."
                />
              </div>
              <div>
                <label className="label-field">SEO Description</label>
                <textarea
                  value={form.seo_description}
                  onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Meta description for search engines..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={contentFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleContentImageUpload}
        className="hidden"
      />

      <input
        ref={docxFileInputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleDocxImport}
        className="hidden"
      />
    </div>
  );
}
