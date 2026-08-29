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
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Code,
  AlertCircle,
  Lightbulb,
  Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
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

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const insertHTML = (html: string) => {
    document.execCommand('insertHTML', false, html);
    editorRef.current?.focus();
    updateContent();
  };

  const handleHeading = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    updateContent();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
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

    const postData: Record<string, unknown> = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content || null,
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

  const toolbarButtons = [
    { icon: Bold, action: () => execCommand('bold'), title: 'Bold' },
    { icon: Italic, action: () => execCommand('italic'), title: 'Italic' },
    { icon: LinkIcon, action: insertLink, title: 'Insert Link' },
    { icon: List, action: () => execCommand('insertUnorderedList'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => execCommand('insertOrderedList'), title: 'Numbered List' },
    { icon: Heading2, action: () => handleHeading('h2'), title: 'Heading 2' },
    { icon: Heading3, action: () => handleHeading('h3'), title: 'Heading 3' },
    { icon: Quote, action: () => handleHeading('blockquote'), title: 'Quote' },
    { icon: TableIcon, action: insertTable, title: 'Insert Table' },
    { icon: ImageIcon, action: () => contentFileInputRef.current?.click(), title: 'Insert Image' },
    { icon: Code, action: insertCodeBlock, title: 'Code Block' },
    { icon: Lightbulb, action: insertCallout, title: 'Callout Box' },
    { icon: AlertCircle, action: insertImportantNote, title: 'Important Note' },
  ];

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
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-3 border-b border-navy-100 bg-navy-50">
              {toolbarButtons.map((btn, i) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={i}
                    onClick={btn.action}
                    title={btn.title}
                    className="p-2 rounded-lg text-navy-600 hover:bg-white hover:text-navy-900 transition-colors"
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>

            {/* Editor area */}
            <div
              ref={editorRef}
              contentEditable
              onInput={updateContent}
              className="prose-content min-h-[400px] p-6 focus:outline-none"
              data-placeholder="Start writing your article..."
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
