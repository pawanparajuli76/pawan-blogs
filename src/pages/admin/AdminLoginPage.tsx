import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';

export function AdminLoginPage() {
  const { signIn, session, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate('/admin');
    }
  }, [session, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setSubmitting(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <>
      <SEO title="Admin Login" />
      <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-navy-300 hover:text-gold-400 text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Website
          </Link>

          <div className="bg-white rounded-2xl shadow-soft-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center text-gold-400 font-serif text-xl font-bold">
                PP
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-navy-900">Admin Login</h1>
                <p className="text-xs text-navy-500">Pawan Parajuli, Chartered Accountant</p>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-gold-200 bg-gold-50 p-3 text-sm text-navy-700">
              <p className="font-semibold text-navy-900 mb-1">Demo admin login</p>
              <p>Email: <span className="font-medium">admin@example.com</span></p>
              <p>Password: <span className="font-medium">Admin123!</span></p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="label-field">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" size={18} />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12"
                    placeholder="admin@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label-field">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" size={18} />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
