import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, Eye, Star, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { BlogPost, Category } from '@/types';
import { formatDateShort } from '@/lib/utils';

export function AdminPostList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('blog_posts')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (search.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,slug.ilike.%${search.trim()}%`);
    }

    const { data } = await query;
    if (data) setPosts(data as (BlogPost & { category: Category | null })[]);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteError(null);

    // First delete tag associations
    await supabase.from('blog_post_tags').delete().eq('post_id', deleteId);

    const { error } = await supabase.from('blog_posts').delete().eq('id', deleteId);

    if (error) {
      setDeleteError('Failed to delete post. Please try again.');
      return;
    }

    setPosts(posts.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  };

  const toggleFeatured = async (post: BlogPost) => {
    await supabase
      .from('blog_posts')
      .update({ is_featured: !post.is_featured })
      .eq('id', post.id);

    setPosts(posts.map((p) =>
      p.id === post.id ? { ...p, is_featured: !p.is_featured } : p
    ));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900 mb-1">Blog Posts</h1>
          <p className="text-sm text-navy-500">Manage your blog articles</p>
        </div>
        <Link to="/admin/posts/new" className="btn-primary btn-sm">
          <Plus size={16} />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" size={18} />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field md:w-48"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-navy-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-navy-500 mb-4">No posts found</p>
            <Link to="/admin/posts/new" className="btn-primary btn-sm">
              <Plus size={16} />
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-navy-50 border-b border-navy-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {posts.map((post) => {
                  const p = post as BlogPost & { category: Category | null };
                  return (
                    <tr key={post.id} className="hover:bg-navy-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {post.is_featured && (
                            <Star size={14} className="text-gold-500 fill-gold-500 flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-navy-900">{post.title}</div>
                            <div className="text-xs text-navy-400">/{post.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {p.category ? (
                          <span className="badge-navy text-xs">{p.category.name}</span>
                        ) : (
                          <span className="text-xs text-navy-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${
                          post.status === 'published'
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-gold-100 text-gold-800'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-navy-500">
                          {formatDateShort(post.published_at || post.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleFeatured(post)}
                            className={`p-2 rounded-lg transition-colors ${
                              post.is_featured
                                ? 'text-gold-500 hover:bg-gold-50'
                                : 'text-navy-400 hover:bg-navy-100'
                            }`}
                            title={post.is_featured ? 'Unfeature' : 'Feature'}
                          >
                            <Star size={16} className={post.is_featured ? 'fill-current' : ''} />
                          </button>
                          {post.status === 'published' && (
                            <Link
                              to={`/blog/${post.slug}`}
                              target="_blank"
                              className="p-2 rounded-lg text-navy-400 hover:bg-navy-100 hover:text-navy-700 transition-colors"
                              title="View"
                            >
                              <Eye size={16} />
                            </Link>
                          )}
                          <Link
                            to={`/admin/posts/${post.id}/edit`}
                            className="p-2 rounded-lg text-navy-400 hover:bg-navy-100 hover:text-navy-700 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </Link>
                          <button
                            onClick={() => { setDeleteId(post.id); setDeleteError(null); }}
                            className="p-2 rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-semibold text-navy-900">Delete Post?</h3>
                <p className="text-sm text-navy-600 mt-1">
                  This action cannot be undone. The post and all its content will be permanently removed.
                </p>
              </div>
            </div>
            {deleteError && (
              <p className="text-sm text-red-600 mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-sm bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
