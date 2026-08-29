import { Link } from 'react-router-dom';
import { Home, FileQuestion } from 'lucide-react';
import { SEO } from '@/components/SEO';

export function NotFoundPage() {
  return (
    <>
      <SEO title="Page Not Found" />
      <div className="min-h-[60vh] flex items-center justify-center bg-navy-50">
        <div className="text-center px-6">
          <FileQuestion className="mx-auto text-navy-300 mb-6" size={64} />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-navy-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-navy-600 text-lg mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn-primary btn-lg">
            <Home size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
