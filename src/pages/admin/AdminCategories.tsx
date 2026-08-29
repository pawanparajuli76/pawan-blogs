import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, AlertCircle, X, FolderTree } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import type { Category } from '@/types';

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!slugEdited) {
      setFormData((f) => ({ ...f, slug: slugify(f.name) }));
    }
  }, [formData.name, slugEdited]);

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '' });
    setEditingId(null);
    setSlugEdited(false);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    setError(null);

    if (editingId) {
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
        })
        .eq('id', editingId);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('categories')
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    resetForm();
    fetchCategories();
  };

  const handleEdit = (cat: Category) => {
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setEditingId(cat.id);
    setSlugEdited(true);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('categories').delete().eq('id', deleteId);
    if (error) {
      setError('Failed to delete category. It may be in use by blog posts.');
      return;
    }
    setCategories(categories.filter((c) => c.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900 mb-1">Categories</h1>
          <p className="text-sm text-navy-500">Manage blog post categories</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary btn-sm"
        >
          <Plus size={16} />
          New Category
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400">
            <X size={16} />
          </button>
        </div>
      )}

      {showForm && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-semibold text-navy-900">
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>
            <button onClick={resetForm} className="text-navy-400 hover:text-navy-700">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="label-field">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => { setFormData({ ...formData, slug: e.target.value }); setSlugEdited(true); }}
                  className="input-field"
                  placeholder="category-slug"
                />
              </div>
            </div>
            <div>
              <label className="label-field">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="input-field resize-none"
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary btn-sm">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary btn-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-navy-400">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderTree className="mx-auto text-navy-300 mb-4" size={40} />
          <p className="text-navy-500">No categories yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card p-5 group">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-serif font-semibold text-navy-900">{cat.name}</h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-1.5 rounded-lg text-navy-400 hover:bg-navy-100 hover:text-navy-700"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="p-1.5 rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-navy-400 mb-2">/{cat.slug}</p>
              {cat.description && (
                <p className="text-sm text-navy-600">{cat.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-semibold text-navy-900">Delete Category?</h3>
                <p className="text-sm text-navy-600 mt-1">
                  Blog posts in this category will have their category cleared.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary btn-sm">Cancel</button>
              <button onClick={handleDelete} className="btn btn-sm bg-red-600 text-white hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
