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
  Link as LinkIcon,
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
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import { sanitizeWordPaste, cleanWordHtml } from '@/lib/wordPasteSanitizer';
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
  ul: boolean;
  ol: boolean;
  block: 'p' | 'h2' | 'h3' | 'h4' | 'blockquote' | null;
}

export function AdminPostEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentFileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PostFormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
    bold: false,
    italic: false,
    ul: false,
    ol: false,
    block: 'p',
  });

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

  // Update active formatting states based on current selection
  const checkActiveFormats = useCallback(() => {
    if (!editorRef.current) return;

    try {
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const ul = document.queryCommandState('insertUnorderedList');
      const ol = document.queryCommandState('insertOrderedList');

      let block: 'p' | 'h2' | 'h3' | 'h4' | 'blockquote' | null = 'p';

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentNode;
        }

        while (node && node !== editorRef.current) {
          const tag = (node as HTMLElement).tagName?.toLowerCase();
          if (tag === 'h2') {
            block = 'h2';
            break;
          } else if (tag === 'h3') {
            block = 'h3';
            break;
          } else if (tag === 'h4') {
            block = 'h4';
            break;
          } else if (tag === 'blockquote') {
            block = 'blockquote';
            break;
          } else if (tag === 'p') {
            block = 'p';
            break;
          }
          node = node.parentNode;
        }
      }

      setActiveFormats({ bold, italic, ul, ol, block });
    } catch {
      // Ignore queryCommandState failures on blur
    }
  }, []);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
    checkActiveFormats();
  };

  const insertHTML = (html: string) => {
    document.execCommand('insertHTML', false, html);
    editorRef.current?.focus();
    updateContent();
    checkActiveFormats();
  };

  const handleHeading = (tag: 'p' | 'h2' | 'h3' | 'h4' | 'blockquote') => {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    updateContent();
    checkActiveFormats();
  };

  const handleClearFormatting = () => {
    document.execCommand('removeFormat', false);
    document.execCommand('formatBlock', false, 'p');
    editorRef.current?.focus();
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

    // Clean content one final time before saving to ensure 100% clean markup
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
      // Get author_id from profiles
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
          <div className="card overflow-hidden">
            {/* Rich Text Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 border-b border-navy-100 bg-navy-50/80">
              {/* History: Undo / Redo */}
              <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                <button
                  type="button"
                  onClick={() => execCommand('undo')}
                  title="Undo (Ctrl+Z)"
                  className="p-1.5 rounded-md text-navy-600 hover:bg-white hover:text-navy-900 transition-colors"
                >
                  <Undo size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('redo')}
                  title="Redo (Ctrl+Y)"
                  className="p-1.5 rounded-md text-navy-600 hover:bg-white hover:text-navy-900 transition-colors"
                >
                  <Redo size={16} />
                </button>
              </div>

              {/* Block Formats: Paragraph, H2, H3, H4, Quote */}
              <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                <button
                  type="button"
                  onClick={() => handleHeading('p')}
                  title="Paragraph (Normal Text)"
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                    activeFormats.block === 'p'
                      ? 'bg-navy-800 text-white shadow-xs'
                      : 'text-navy-600 hover:bg-white hover:text-navy-900'
                  }`}
                >
                  <Type size={14} />
                  <span>Para</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleHeading('h2')}
                  title="Heading 2 (Main Section)"
                  className={`p-1.5 rounded-md transition-colors ${
                    activeFormats.block === 'h2'
                      ? 'bg-navy-800 text-white shadow-xs'
                      : 'text-navy-600 hover:bg-white hover:text-navy-900'
                  }`}
                >
                  <Heading2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleHeading('h3')}
                  title="Heading 3 (Sub Section)"
                  className={`p-1.5 rounded-md transition-colors ${
                    activeFormats.block === 'h3'
                      ? 'bg-navy-800 text-white shadow-xs'
                      : 'text-navy-600 hover:bg-white hover:text-navy-900'
                  }`}
                >
                  <Heading3 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleHeading('h4')}
                  title="Heading 4 (Minor Section)"
                  className={`p-1.5 rounded-md transition-colors ${
                    activeFormats.block === 'h4'
                      ? 'bg-navy-800 text-white shadow-xs'
                      : 'text-navy-600 hover:bg-white hover:text-navy-900'
                  }`}
                >
                  <Heading4 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleHeading('blockquote')}
                  title="Blockquote"
                  className={`p-1.5 rounded-md transition-colors ${
                    activeFormats.block === 'blockquote'
                      ? 'bg-navy-800 text-white shadow-xs'
                      : 'text-navy-600 hover:bg-white hover:text-navy-900'
                  }`}
                >
                  <Quote size={16} />
                </button>
              </div>

              {/* Inline Formatting: Bold, Italic, Clear Formatting */}
              <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                <button
                  type="button"
                  onClick={() => execCommand('bold')}
                  title="Bold (Ctrl+B)"
                  className={`p-1.5 rounded-md transition-colors ${
                    activeFormats.bold
                      ? 'bg-navy-800 text-white shadow-xs'
                      : 'text-navy-600 hover:bg-white hover:text-navy-900'
                  }`}
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('italic')}
                  title="Italic (Ctrl+I)"
                  className={`p-1.5 rounded-md transition-colors ${
                    activeFormats.italic
                      ? 'bg-navy-800 text-white shadow-xs'
                      : 'text-navy-600 hover:bg-white hover:text-navy-900'
                  }`}
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleClearFormatting}
                  title="Clear Formatting"
                  className="p-1.5 rounded-md text-navy-600 hover:bg-white hover:text-navy-900 transition-colors"
                >
                  <Eraser size={16} />
                </button>
              </div>

              {/* Lists: Bullet, Numbered */}
              <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                <button
                  type="button"
                  onClick={() => execCommand('insertUnorderedList')}
                  title="Bullet List"
                  className={`p-1.5 rounded-md transition-colors ${
                    activeFormats.ul
                      ? 'bg-navy-800 text-white shadow-xs'
                      : 'text-navy-600 hover:bg-white hover:text-navy-900'
                  }`}
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('insertOrderedList')}
                  title="Numbered List"
                  className={`p-1.5 rounded-md transition-colors ${
                    activeFormats.ol
                      ? 'bg-navy-800 text-white shadow-xs'
                      : 'text-navy-600 hover:bg-white hover:text-navy-900'
                  }`}
                >
                  <ListOrdered size={16} />
                </button>
              </div>

              {/* Inserts: Link, Table, Image, Code */}
              <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                <button
                  type="button"
                  onClick={insertLink}
                  title="Insert Hyperlink"
                  className="p-1.5 rounded-md text-navy-600 hover:bg-white hover:text-navy-900 transition-colors"
                >
                  <LinkIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={insertTable}
                  title="Insert Table"
                  className="p-1.5 rounded-md text-navy-600 hover:bg-white hover:text-navy-900 transition-colors"
                >
                  <TableIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => contentFileInputRef.current?.click()}
                  title="Insert Image"
                  className="p-1.5 rounded-md text-navy-600 hover:bg-white hover:text-navy-900 transition-colors"
                >
                  <ImageIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={insertCodeBlock}
                  title="Code Block"
                  className="p-1.5 rounded-md text-navy-600 hover:bg-white hover:text-navy-900 transition-colors"
                >
                  <Code size={16} />
                </button>
              </div>

              {/* Callouts */}
              <div className="flex items-center gap-0.5 pr-1.5 border-r border-navy-200">
                <button
                  type="button"
                  onClick={insertCallout}
                  title="Callout Box (Teal)"
                  className="p-1.5 rounded-md text-teal-700 hover:bg-teal-50 transition-colors"
                >
                  <Lightbulb size={16} />
                </button>
                <button
                  type="button"
                  onClick={insertImportantNote}
                  title="Important Note Box (Gold)"
                  className="p-1.5 rounded-md text-gold-700 hover:bg-gold-50 transition-colors"
                >
                  <AlertCircle size={16} />
                </button>
              </div>

              {/* Paste from Word Sanitizer Quick Action */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={handleCleanAllWordFormatting}
                  title="Sanitize & clean all Word / inline formatting in editor"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-navy-700 bg-white border border-navy-200 rounded-md hover:bg-navy-100 hover:text-navy-900 transition-colors shadow-2xs"
                >
                  <Sparkles size={13} className="text-gold-500" />
                  <span>Clean Word Markup</span>
                </button>
              </div>
            </div>

            {/* Word Paste Info Badge */}
            <div className="px-4 py-1.5 bg-navy-50/50 border-b border-navy-100 flex items-center justify-between text-[11px] text-navy-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span>Auto Word Paste Sanitizer Active (removes Word fonts, colors &amp; styles, keeps headings, lists &amp; tables)</span>
              </span>
              <span className="text-navy-400 hidden sm:inline">Tip: Copy from Word and paste directly (Ctrl+V)</span>
            </div>

            {/* Editor Content Area */}
            <div
              ref={editorRef}
              contentEditable
              onInput={updateContent}
              onPaste={handlePaste}
              onKeyUp={checkActiveFormats}
              onMouseUp={checkActiveFormats}
              className="prose-content min-h-[440px] p-6 focus:outline-none"
              data-placeholder="Start writing or paste article content from Microsoft Word..."
              style={{ ['--tw-prose-body' as string]: 'initial' }}
            />

            {uploadingImage && (
              <div className="px-6 py-3 bg-gold-50 border-t border-gold-200 text-sm text-gold-800">
                Uploading image...
              </div>
            )}
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
    </div>
  );
}
