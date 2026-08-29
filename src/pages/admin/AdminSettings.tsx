import { Settings, Info, ShieldCheck, Database, Image as ImageIcon } from 'lucide-react';

export function AdminSettings() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-1">Settings</h1>
        <p className="text-sm text-navy-500">Website configuration and system information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Storage Info */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
              <Database className="text-gold-400" size={20} />
            </div>
            <h2 className="text-lg font-serif font-semibold text-navy-900">Storage Buckets</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-navy-50 rounded-lg">
              <ImageIcon size={18} className="text-navy-500" />
              <div>
                <div className="text-sm font-medium text-navy-900">blog-images</div>
                <div className="text-xs text-navy-400">Featured images for blog posts</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-navy-50 rounded-lg">
              <ImageIcon size={18} className="text-navy-500" />
              <div>
                <div className="text-sm font-medium text-navy-900">profile-images</div>
                <div className="text-xs text-navy-400">Profile photos</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-navy-50 rounded-lg">
              <ImageIcon size={18} className="text-navy-500" />
              <div>
                <div className="text-sm font-medium text-navy-900">resources</div>
                <div className="text-xs text-navy-400">Downloadable resource files</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-gold-400" size={20} />
            </div>
            <h2 className="text-lg font-serif font-semibold text-navy-900">Security</h2>
          </div>
          <div className="space-y-3 text-sm text-navy-600">
            <div className="flex items-start gap-3">
              <ShieldCheck size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
              <span>Row Level Security is enabled on all database tables</span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
              <span>Public users can only read published content</span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
              <span>Admin operations require authentication</span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
              <span>Image uploads restricted to authenticated users</span>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
              <Settings className="text-gold-400" size={20} />
            </div>
            <h2 className="text-lg font-serif font-semibold text-navy-900">System</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-500">Platform</span>
              <span className="text-navy-900 font-medium">Supabase + React</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Database</span>
              <span className="text-navy-900 font-medium">PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Storage</span>
              <span className="text-navy-900 font-medium">Supabase Storage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Auth</span>
              <span className="text-navy-900 font-medium">Supabase Auth</span>
            </div>
          </div>
        </div>

        {/* Future Features */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
              <Info className="text-gold-400" size={20} />
            </div>
            <h2 className="text-lg font-serif font-semibold text-navy-900">Planned Features</h2>
          </div>
          <div className="space-y-2 text-sm text-navy-500">
            <p>The architecture supports adding the following tools in the future:</p>
            <ul className="space-y-1.5 mt-3">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                Nepal Income Tax Calculator
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                D1 Tax Calculator
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                TDS Calculator
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                VAT Calculator
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                Salary Tax Calculator
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                Tax Deadline Calendar
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                Newsletter Subscription
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
