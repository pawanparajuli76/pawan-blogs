import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Edit,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Linkedin,
  Twitter,
  Link2,
  Check,
  User,
  AlertCircle,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BlogCard } from '@/components/BlogCard';
import { supabase } from '@/lib/supabase';
import type { BlogPostWithRelations, BlogPost, Category } from '@/types';
import { formatDate, formatDateShort, calculateReadingTime } from '@/lib/utils';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostWithRelations | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostWithRelations[]>([]);
  const [prevPost, setPrevPost] = useState<BlogPost | null>(null);
  const [nextPost, setNextPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');

  useEffect(() => {
    if (!slug) return;

    async function fetchPost() {
      setLoading(true);
      setNotFound(false);

      const { data } = await supabase
        .from('blog_posts')
        .select('*, category:categories(*), tags:blog_post_tags(tag:tags(*)), author:profiles(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const formatted: BlogPostWithRelations = {
        ...data,
        tags: (data.tags as { tag: Category }[] | undefined)?.map((t) => t.tag) ?? [],
      };
      setPost(formatted);
      setLoading(false);

      // Fetch related posts (same category, excluding current)
      if (formatted.category_id) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select('*, category:categories(*)')
          .eq('status', 'published')
          .eq('category_id', formatted.category_id)
          .neq('id', formatted.id)
          .order('published_at', { ascending: false })
          .limit(3);

        if (related) setRelatedPosts(related as BlogPostWithRelations[]);
      }

      // Fetch prev and next posts
      const { data: prev } = await supabase
        .from('blog_posts')
        .select('id, title, slug')
        .eq('status', 'published')
        .lt('published_at', formatted.published_at || formatted.created_at)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: next } = await supabase
        .from('blog_posts')
        .select('id, title, slug')
        .eq('status', 'published')
        .gt('published_at', formatted.published_at || formatted.created_at)
        .order('published_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      setPrevPost(prev as BlogPost | null);
      setNextPost(next as BlogPost | null);
    }

    fetchPost();
  }, [slug]);

  // Extract headings from content and generate IDs
  useEffect(() => {
    if (!post?.content) return;

    const container = document.createElement('div');
    container.innerHTML = post.content;

    const headingElements = container.querySelectorAll('h2, h3, h4');
    const extracted: { id: string; text: string; level: number }[] = [];

    headingElements.forEach((el, i) => {
      const text = el.textContent || '';
      const id = `heading-${i}-${text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')}`;
      el.id = id;
      extracted.push({
        id,
        text,
        level: parseInt(el.tagName.substring(1)),
      });
    });

    setHeadings(extracted);
  }, [post?.content]);

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el && el.getBoundingClientRect().top < 120) {
          setActiveHeading(headings[i].id);
          return;
        }
      }
      if (headings.length > 0) setActiveHeading(headings[0].id);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (!post?.content) return undefined;

    const container = document.createElement('div');
    container.innerHTML = post.content;

    const headingElements = container.querySelectorAll('h2, h3, h4');
    headingElements.forEach((el, i) => {
      const text = el.textContent || '';
      const id = `heading-${i}-${text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')}`;
      el.id = id;
    });

    return { __html: container.innerHTML };
  };

  if (loading) {
    return (
      <div className="section bg-white">
        <div className="container-narrow">
          <div className="animate-pulse">
            <div className="bg-navy-100 h-8 w-32 rounded mb-6" />
            <div className="bg-navy-100 h-12 w-3/4 rounded mb-4" />
            <div className="bg-navy-100 h-4 w-1/2 rounded mb-8" />
            <div className="bg-navy-100 h-64 rounded-xl mb-8" />
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-navy-100 h-4 rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="section bg-white">
        <div className="container-narrow text-center py-20">
          <AlertCircle className="mx-auto text-navy-300 mb-4" size={48} />
          <h1 className="text-3xl font-serif font-bold text-navy-900 mb-3">Article Not Found</h1>
          <p className="text-navy-500 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog" className="btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const readingTime = calculateReadingTime(post.content);
  const currentUrl = window.location.href;

  const shareButtons = [
    {
      icon: Facebook,
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    },
    {
      icon: Linkedin,
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    },
    {
      icon: Twitter,
      label: 'Share on X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`,
    },
  ];

  return (
    <>
      <SEO
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt || ''}
        image={post.featured_image || undefined}
        url={currentUrl}
      />

      {/* Article Header */}
      <div className="bg-navy-900 text-white py-12 md:py-16">
        <div className="container-narrow">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-navy-300 hover:text-gold-400 text-sm mb-6 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Blog
          </Link>

          {post.category && (
            <Link
              to={`/blog/category/${post.category.slug}`}
              className="badge-gold mb-4 hover:bg-gold-200 transition-colors"
            >
              {post.category.name}
            </Link>
          )}

          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-navy-200 text-lg leading-relaxed max-w-3xl mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-5 text-sm text-navy-300">
            {post.author && (
              <span className="flex items-center gap-2">
                <User size={15} />
                {post.author.full_name}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Calendar size={15} />
              {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={15} />
              {readingTime} min read
            </span>
            {post.updated_at !== post.created_at && (
              <span className="text-navy-400">
                Updated {formatDateShort(post.updated_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="container-narrow -mt-8 relative z-10">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-soft-xl"
          />
        </div>
      )}

      {/* Article Body */}
      <article className="section bg-white">
        <div className="container-narrow">
          <div className="grid lg:grid-cols-4 gap-10">
            {/* Table of Contents */}
            {headings.length > 2 && (
              <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-28">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-900 mb-4">
                    Table of Contents
                  </h3>
                  <nav className="space-y-1.5">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-sm leading-snug transition-colors py-1 border-l-2 pl-3 ${
                          activeHeading === heading.id
                            ? 'text-gold-700 border-gold-500 font-medium'
                            : 'text-navy-500 border-navy-100 hover:text-navy-800 hover:border-navy-300'
                        } ${heading.level === 3 ? 'pl-6' : heading.level === 4 ? 'pl-9' : ''}`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            {/* Main Content */}
            <div className={headings.length > 2 ? 'lg:col-span-3' : 'lg:col-span-4'}>
              <div
                className="prose-content"
                dangerouslySetInnerHTML={renderContent()}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-navy-100">
                  <span className="text-sm font-medium text-navy-700 mr-2">Tags:</span>
                  {post.tags.map((tag) => (
                    <span key={tag.id} className="badge-navy">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Sharing */}
              <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-navy-100">
                <span className="text-sm font-medium text-navy-700">Share:</span>
                {shareButtons.map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <a
                      key={btn.label}
                      href={btn.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={btn.label}
                      className="w-9 h-9 bg-navy-50 rounded-lg flex items-center justify-center text-navy-600 hover:bg-navy-800 hover:text-white transition-all"
                    >
                      <Icon size={17} />
                    </a>
                  );
                })}
                <button
                  onClick={handleCopyLink}
                  aria-label="Copy link"
                  className="w-9 h-9 bg-navy-50 rounded-lg flex items-center justify-center text-navy-600 hover:bg-navy-800 hover:text-white transition-all"
                >
                  {copied ? <Check size={17} className="text-teal-500" /> : <Link2 size={17} />}
                </button>
              </div>

              {/* Disclaimer */}
              <div className="mt-10 p-6 bg-gold-50 border border-gold-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-gold-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900 mb-1">Disclaimer</h4>
                    <p className="text-sm text-navy-600 leading-relaxed">
                      The information provided in this article is for general educational and
                      informational purposes only and should not be considered professional tax,
                      accounting, legal or financial advice. Regulations may change, and readers
                      should verify current requirements or seek professional advice where
                      appropriate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Prev / Next Navigation */}
      {(prevPost || nextPost) && (
        <section className="section-sm bg-navy-50 border-t border-navy-100">
          <div className="container-narrow">
            <div className="grid md:grid-cols-2 gap-4">
              {prevPost && (
                <Link
                  to={`/blog/${prevPost.slug}`}
                  className="card-hover p-6 group"
                >
                  <span className="flex items-center gap-1.5 text-xs text-navy-400 mb-2">
                    <ChevronLeft size={14} />
                    Previous Article
                  </span>
                  <h4 className="text-base font-serif font-semibold text-navy-900 group-hover:text-navy-700 transition-colors">
                    {prevPost.title}
                  </h4>
                </Link>
              )}
              {nextPost && (
                <Link
                  to={`/blog/${nextPost.slug}`}
                  className="card-hover p-6 group md:text-right"
                >
                  <span className="flex items-center gap-1.5 text-xs text-navy-400 mb-2 md:justify-end">
                    Next Article
                    <ChevronRight size={14} />
                  </span>
                  <h4 className="text-base font-serif font-semibold text-navy-900 group-hover:text-navy-700 transition-colors">
                    {nextPost.title}
                  </h4>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="section bg-white">
          <div className="container-wide">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-900 mb-8 text-center">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <BlogCard key={rp.id} post={rp} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
