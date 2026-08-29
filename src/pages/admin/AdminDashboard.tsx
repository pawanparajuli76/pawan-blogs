import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Edit3,
  FolderTree,
  Mail,
  TrendingUp,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDateShort } from '@/lib/utils';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalMessages: number;
  newMessages: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0,
    totalMessages: 0,
    newMessages: 0,
  });
  const [recentMessages, setRecentMessages] = useState<{ id: string; name: string; subject: string | null; created_at: string; status: string }[]>([]);
  const [recentPosts, setRecentPosts] = useState<{ id: string; title: string; status: string; updated_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [posts, published, drafts, categories, messages] = await Promise.all([
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
      ]);

      const { count: newMsgCount } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      setStats({
        totalPosts: posts.count || 0,
        publishedPosts: published.count || 0,
        draftPosts: drafts.count || 0,
        totalCategories: categories.count || 0,
        totalMessages: messages.count || 0,
        newMessages: newMsgCount || 0,
      });

      // Fetch recent messages and posts
      const { data: msgs } = await supabase
        .from('contact_messages')
        .select('id, name, subject, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: postsData } = await supabase
        .from('blog_posts')
        .select('id, title, status, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (msgs) setRecentMessages(msgs);
      if (postsData) setRecentPosts(postsData);
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'navy', link: '/admin/posts' },
    { label: 'Published', value: stats.publishedPosts, icon: CheckCircle2, color: 'teal', link: '/admin/posts' },
    { label: 'Drafts', value: stats.draftPosts, icon: Edit3, color: 'gold', link: '/admin/posts' },
    { label: 'Categories', value: stats.totalCategories, icon: FolderTree, color: 'navy', link: '/admin/categories' },
    { label: 'Messages', value: stats.totalMessages, icon: Mail, color: 'navy', link: '/admin/messages' },
    { label: 'New Messages', value: stats.newMessages, icon: TrendingUp, color: 'gold', link: '/admin/messages' },
  ];

  const colorMap: Record<string, string> = {
    navy: 'bg-navy-800 text-gold-400',
    teal: 'bg-teal-600 text-white',
    gold: 'bg-gold-500 text-navy-900',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-2">Dashboard</h1>
        <p className="text-sm text-navy-500">Welcome back. Here's an overview of your website.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="card-hover p-5 group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
                <Icon size={20} />
              </div>
              <div className="text-2xl font-serif font-bold text-navy-900">
                {loading ? '—' : stat.value}
              </div>
              <div className="text-xs text-navy-500 mt-1">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-semibold text-navy-900">Recent Posts</h2>
            <Link to="/admin/posts" className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-navy-400 py-8 text-center">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between py-2 border-b border-navy-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-800 truncate">{post.title}</div>
                    <div className="text-xs text-navy-400 flex items-center gap-1.5 mt-0.5">
                      <Clock size={12} />
                      {formatDateShort(post.updated_at)}
                    </div>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ml-3 ${
                    post.status === 'published' ? 'bg-teal-100 text-teal-700' : 'bg-gold-100 text-gold-800'
                  }`}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-semibold text-navy-900">Recent Messages</h2>
            <Link to="/admin/messages" className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-navy-400 py-8 text-center">No messages yet</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between py-2 border-b border-navy-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-800">{msg.name}</div>
                    <div className="text-xs text-navy-400 truncate">{msg.subject || 'No subject'}</div>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ml-3 ${
                    msg.status === 'new' ? 'bg-gold-100 text-gold-800' :
                    msg.status === 'read' ? 'bg-navy-100 text-navy-600' :
                    'bg-teal-100 text-teal-700'
                  }`}>
                    {msg.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
