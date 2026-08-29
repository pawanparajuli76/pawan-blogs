import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, AlertCircle, X, Tags as TagsIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import type { Tag } from '@/types';

export function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    const { data } = await supabase.from('tags').select('*').order('name');
    if (data) setTags(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    setError(null);
    const slug = slugify(newTag);

    const { error: insertError } = await supabase
      .from('tags')
      .insert({ name: newTag.trim(), slug });

    if (insertError) {
      if (insertError.message.includes('duplicate')) {
        setError('A tag with this name already exists');
      } else {
        setError(insertError.message);
      }
      return;
    }

    setNewTag('');
    fetchTags();
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    await supabase.from('blog_post_tags').delete().eq('tag_id', deleteId);
    const { error } = await supabase.from('tags').delete().eq('id', deleteId);

    if (error) {
      setError('Failed to delete tag');
      return;
    }

    setTags(tags.filter((t) => t.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-1">Tags</h1>
        <p className="text-sm text-navy-500">Manage blog post tags</p>
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

      {/* Add new tag */}
      <div className="card p-5 mb-6">
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="input-field"
            placeholder="Enter tag name..."
          />
          <button type="submit" className="btn-primary btn-sm whitespace-nowrap">
            <Plus size={16} />
            Add Tag
          </button>
        </form>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-navy-400">Loading tags...</div>
      ) : tags.length === 0 ? (
        <div className="card p-12 text-center">
          <TagsIcon className="mx-auto text-navy-300 mb-4" size={40} />
          <p className="text-navy-500">No tags yet</p>
        </div>
      ) : (
        <div className="card p-5">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-center gap-2 bg-navy-50 rounded-lg pl-3 pr-1.5 py-1.5"
              >
                <span className="text-sm font-medium text-navy-700">{tag.name}</span>
                <span className="text-xs text-navy-400">/{tag.slug}</span>
                <button
                  onClick={() => setDeleteId(tag.id)}
                  className="p-1 rounded text-navy-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
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
                <h3 className="text-lg font-serif font-semibold text-navy-900">Delete Tag?</h3>
                <p className="text-sm text-navy-600 mt-1">
                  This tag will be removed from all blog posts.
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
