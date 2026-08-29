import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import type { BlogPostWithRelations } from '@/types';
import { formatDateShort, calculateReadingTime } from '@/lib/utils';

interface BlogCardProps {
  post: BlogPostWithRelations;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const readingTime = calculateReadingTime(post.content);
  const postUrl = `/blog/${post.slug}`;

  if (featured) {
    return (
      <article className="card-hover overflow-hidden group flex flex-col md:flex-row">
        {post.featured_image && (
          <Link to={postUrl} className="md:w-1/2 overflow-hidden bg-navy-100">
            <img
              src={post.featured_image}
              alt={post.title}
              loading="lazy"
              className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
        )}
        <div className={`p-6 md:p-8 flex flex-col justify-center ${post.featured_image ? 'md:w-1/2' : 'w-full'}`}>
          {post.category && (
            <Link
              to={`/blog/category/${post.category.slug}`}
              className="badge-gold mb-3 self-start hover:bg-gold-200 transition-colors"
            >
              {post.category.name}
            </Link>
          )}
          <h3 className="text-xl md:text-2xl font-serif font-semibold text-navy-900 mb-3 group-hover:text-navy-700 transition-colors">
            <Link to={postUrl}>{post.title}</Link>
          </h3>
          <p className="text-navy-600 text-sm md:text-base mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 text-xs text-navy-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDateShort(post.published_at || post.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {readingTime} min read
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card-hover overflow-hidden group flex flex-col h-full">
      {post.featured_image && (
        <Link to={postUrl} className="overflow-hidden bg-navy-100 block">
          <img
            src={post.featured_image}
            alt={post.title}
            loading="lazy"
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      )}
      <div className="p-5 flex flex-col flex-1">
        {post.category && (
          <Link
            to={`/blog/category/${post.category.slug}`}
            className="badge-navy mb-3 self-start text-xs hover:bg-navy-200 transition-colors"
          >
            {post.category.name}
          </Link>
        )}
        <h3 className="text-lg font-serif font-semibold text-navy-900 mb-2 group-hover:text-navy-700 transition-colors">
          <Link to={postUrl}>{post.title}</Link>
        </h3>
        <p className="text-sm text-navy-600 mb-4 line-clamp-2 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-navy-400 mt-auto">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            {formatDateShort(post.published_at || post.created_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            {readingTime} min
          </span>
        </div>
      </div>
    </article>
  );
}
