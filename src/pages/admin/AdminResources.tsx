import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit3, Trash2, AlertCircle, X, Upload, Download, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Resource } from '@/types';
import { formatDateShort } from '@/lib/utils';

export function AdminResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', file_url: '', status: 'published' });
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResources = useCallback(async () => {
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
    if (data) setResources(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const resetForm = () => {
    setFormData({ title: '', description: '', category: '', file_url: '', status: 'published' });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('resources').upload(fileName, file);

    if (uploadError) {
      setError('Failed to upload file: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('resources').getPublicUrl(fileName);
    setFormData((f) => ({ ...f, file_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setError(null);

    if (editingId) {
      const { error: updateError } = await supabase
        .from('resources')
        .update({
          title: formData.title,
          description: formData.description || null,
          category: formData.category || null,
          file_url: formData.file_url || null,
          status: formData.status,
        })
        .eq('id', editingId);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('resources')
        .insert({
          title: formData.title,
          description: formData.description || null,
          category: formData.category || null,
          file_url: formData.file_url || null,
          status: formData.status,
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    resetForm();
    fetchResources();
  };

  const handleEdit = (res: Resource) => {
    setFormData({
      title: res.title,
      description: res.description || '',
      category: res.category || '',
      file_url: res.file_url || '',
      status: res.status,
    });
    setEditingId(res.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('resources').delete().eq('id', deleteId);
    if (error) {
      setError('Failed to delete resource');
      return;
    }
    setResources(resources.filter((r) => r.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900 mb-1">Resources</h1>
          <p className="text-sm text-navy-500">Manage downloadable resources</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary btn-sm">
          <Plus size={16} />
          New Resource
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
              {editingId ? 'Edit Resource' : 'New Resource'}
            </h2>
            <button onClick={resetForm} className="text-navy-400 hover:text-navy-700">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Resource title"
              />
            </div>
            <div>
              <label className="label-field">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="input-field resize-none"
                placeholder="Brief description"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Tax Guides, Templates"
                />
              </div>
              <div>
                <label className="label-field">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label-field">File</label>
              {formData.file_url ? (
                <div className="flex items-center gap-3 p-3 bg-navy-50 rounded-lg">
                  <FileText size={20} className="text-teal-600" />
                  <span className="text-sm text-navy-700 flex-1 truncate">File uploaded</span>
                  <a href={formData.file_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800">
                    <Download size={16} />
                  </a>
                  <button onClick={() => setFormData({ ...formData, file_url: '' })} className="text-red-400 hover:text-red-600">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full p-4 border-2 border-dashed border-navy-200 rounded-lg flex items-center justify-center gap-2 text-navy-400 hover:border-navy-400 hover:text-navy-600 transition-colors"
                >
                  <Upload size={20} />
                  <span className="text-sm">{uploading ? 'Uploading...' : 'Upload file'}</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
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
        <div className="card p-8 text-center text-navy-400">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="mx-auto text-navy-300 mb-4" size={40} />
          <p className="text-navy-500">No resources yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
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
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-navy-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-navy-900">{res.title}</div>
                      {res.description && <div className="text-xs text-navy-400 truncate max-w-xs">{res.description}</div>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {res.category ? <span className="badge-navy text-xs">{res.category}</span> : <span className="text-xs text-navy-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${res.status === 'published' ? 'bg-teal-100 text-teal-700' : 'bg-gold-100 text-gold-800'}`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-navy-500">{formatDateShort(res.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(res)} className="p-2 rounded-lg text-navy-400 hover:bg-navy-100 hover:text-navy-700 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteId(res.id)} className="p-2 rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <h3 className="text-lg font-serif font-semibold text-navy-900">Delete Resource?</h3>
                <p className="text-sm text-navy-600 mt-1">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary btn-sm">Cancel</button>
              <button onClick={handleDelete} className="btn btn-sm bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
