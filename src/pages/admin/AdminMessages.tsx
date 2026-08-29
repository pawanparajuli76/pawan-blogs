import { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2, AlertCircle, X, Search, Phone, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ContactMessage } from '@/types';
import { formatDate } from '@/lib/utils';

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('contact_messages').select('*').order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,subject.ilike.%${search.trim()}%`);
    }

    const { data } = await query;
    if (data) setMessages(data);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const updateMessageStatus = async (id: string, status: 'new' | 'read' | 'replied') => {
    await supabase.from('contact_messages').update({ status }).eq('id', id);
    setMessages(messages.map((m) => (m.id === id ? { ...m, status } : m)));
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, status });
    }
  };

  const handleView = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'new') {
      updateMessageStatus(msg.id, 'read');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('contact_messages').delete().eq('id', deleteId);
    setMessages(messages.filter((m) => m.id !== deleteId));
    if (selectedMessage?.id === deleteId) setSelectedMessage(null);
    setDeleteId(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-1">Messages</h1>
        <p className="text-sm text-navy-500">Contact form submissions</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field md:w-44"
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-navy-400">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="card p-12 text-center">
          <Mail className="mx-auto text-navy-300 mb-4" size={40} />
          <p className="text-navy-500">No messages found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-navy-50 border-b border-navy-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider hidden md:table-cell">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`hover:bg-navy-50/50 transition-colors cursor-pointer ${msg.status === 'new' ? 'bg-gold-50/30' : ''}`}
                    onClick={() => handleView(msg)}
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-navy-900">{msg.name}</div>
                      <div className="text-xs text-navy-400">{msg.email}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-navy-600">{msg.subject || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${
                        msg.status === 'new' ? 'bg-gold-100 text-gold-800' :
                        msg.status === 'read' ? 'bg-navy-100 text-navy-600' :
                        'bg-teal-100 text-teal-700'
                      }`}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-navy-500">{formatDate(msg.created_at)}</span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDeleteId(msg.id)}
                          className="p-2 rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
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

      {/* Message detail modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold text-navy-900">Message</h2>
              <button onClick={() => setSelectedMessage(null)} className="text-navy-400 hover:text-navy-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <div className="text-xs text-navy-400 uppercase tracking-wider mb-1">From</div>
                <div className="text-sm font-medium text-navy-900">{selectedMessage.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-navy-400" />
                <a href={`mailto:${selectedMessage.email}`} className="text-sm text-teal-700 hover:text-teal-800">
                  {selectedMessage.email}
                </a>
              </div>
              {selectedMessage.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-navy-400" />
                  <a href={`tel:${selectedMessage.phone}`} className="text-sm text-teal-700 hover:text-teal-800">
                    {selectedMessage.phone}
                  </a>
                </div>
              )}
              {selectedMessage.subject && (
                <div>
                  <div className="text-xs text-navy-400 uppercase tracking-wider mb-1">Subject</div>
                  <div className="text-sm text-navy-700">{selectedMessage.subject}</div>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-navy-400">
                <Calendar size={14} />
                {formatDate(selectedMessage.created_at)}
              </div>
            </div>

            <div className="bg-navy-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-navy-700 whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>

            <div className="flex items-center justify-between">
              <select
                value={selectedMessage.status}
                onChange={(e) => updateMessageStatus(selectedMessage.id, e.target.value as 'new' | 'read' | 'replied')}
                className="input-field w-36"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your message'}`}
                className="btn-primary btn-sm"
              >
                Reply
              </a>
            </div>
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
                <h3 className="text-lg font-serif font-semibold text-navy-900">Delete Message?</h3>
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
