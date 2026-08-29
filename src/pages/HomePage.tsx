import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenText,
  Calendar,
  Clock,
  GraduationCap,
  Newspaper,
  NotebookPen,
  Sparkles,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { calculateReadingTime, formatDateShort } from '@/lib/utils';
import type { BlogPostWithRelations, Category } from '@/types';

const professionalAreas = [
  {
    title: 'Research',
    description: 'Evidence-driven work informed by public health, policy, and practice-oriented inquiry.',
    link: '/services',
    cta: 'Explore Research',
    icon: BookOpenText,
  },
  {
    title: 'Teaching',
    description: 'Academic mentoring and applied learning grounded in clarity, rigor, and evidence.',
    link: '/resources',
    cta: 'Explore Teaching',
    icon: GraduationCap,
  },
  {
    title: 'Resources',
    description: 'Useful reference material, practical guidance, and professional learning resources.',
    link: '/resources',
    cta: 'Explore Resources',
    icon: NotebookPen,
  },
  {
    title: 'Blogs',
    description: 'Essays, updates, and commentary on current issues in policy, health, and society.',
    link: '/blog',
    cta: 'Explore Blogs',
    icon: Newspaper,
  },
];

const previewPosts = [
  {
    id: 'preview-1',
    title: 'What Nepal’s tax changes mean for families and small businesses',
    slug: 'tax-changes-nepal-families-small-businesses',
    excerpt: 'A practical look at how the latest policy discussion affects filing, planning, and compliance on the ground.',
    content:
      '<p>Tax policy is not only a government issue; it shapes household decisions, business planning, and long-term financial security.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    category_id: 'preview-cat-1',
    author_id: 'preview-author',
    status: 'published',
    is_featured: true,
    published_at: '2026-08-15T00:00:00.000Z',
    created_at: '2026-08-15T00:00:00.000Z',
    updated_at: '2026-08-15T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    category: { id: 'preview-cat-1', name: 'Taxation', slug: 'taxation', description: null, created_at: '2026-08-01T00:00:00.000Z' },
    tags: [],
    author: { id: 'preview-author', full_name: 'Pawan Parajuli', professional_title: 'Chartered Accountant', bio: null, profile_image: null, email: null, phone: null, location: null, linkedin_url: null, facebook_url: null, created_at: '2026-08-01T00:00:00.000Z', updated_at: '2026-08-01T00:00:00.000Z' },
  },
  {
    id: 'preview-2',
    title: 'Why strong financial records matter before growth decisions',
    slug: 'strong-financial-records-growth-decisions',
    excerpt: 'Financial discipline is often the hidden difference between a healthy business and an unstable one.',
    content:
      '<p>Before business expansion, the strongest step is often a closer look at the records that explain what is really happening.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    category_id: 'preview-cat-2',
    author_id: 'preview-author',
    status: 'published',
    is_featured: true,
    published_at: '2026-08-10T00:00:00.000Z',
    created_at: '2026-08-10T00:00:00.000Z',
    updated_at: '2026-08-10T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    category: { id: 'preview-cat-2', name: 'Accounting', slug: 'accounting', description: null, created_at: '2026-08-01T00:00:00.000Z' },
    tags: [],
    author: { id: 'preview-author', full_name: 'Pawan Parajuli', professional_title: 'Chartered Accountant', bio: null, profile_image: null, email: null, phone: null, location: null, linkedin_url: null, facebook_url: null, created_at: '2026-08-01T00:00:00.000Z', updated_at: '2026-08-01T00:00:00.000Z' },
  },
  {
    id: 'preview-3',
    title: 'Planning for audits without the stress',
    slug: 'planning-for-audits-without-stress',
    excerpt: 'Preparedness turns audit conversations into clearer decisions and stronger documentation.',
    content:
      '<p>Audit preparation works best when the process begins long before the final review.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    category_id: 'preview-cat-3',
    author_id: 'preview-author',
    status: 'published',
    is_featured: false,
    published_at: '2026-08-09T00:00:00.000Z',
    created_at: '2026-08-09T00:00:00.000Z',
    updated_at: '2026-08-09T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    category: { id: 'preview-cat-3', name: 'Audit', slug: 'audit', description: null, created_at: '2026-08-01T00:00:00.000Z' },
    tags: [],
    author: { id: 'preview-author', full_name: 'Pawan Parajuli', professional_title: 'Chartered Accountant', bio: null, profile_image: null, email: null, phone: null, location: null, linkedin_url: null, facebook_url: null, created_at: '2026-08-01T00:00:00.000Z', updated_at: '2026-08-01T00:00:00.000Z' },
  },
  {
    id: 'preview-4',
    title: 'How new compliance rules reshape daily business decisions',
    slug: 'new-compliance-rules-business-decisions',
    excerpt: 'The most useful compliance guidance is the kind that helps people act before the deadline arrives.',
    content:
      '<p>Operational decisions stay stronger when compliance is treated as a planning tool rather than a late-stage problem.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    category_id: 'preview-cat-4',
    author_id: 'preview-author',
    status: 'published',
    is_featured: false,
    published_at: '2026-08-05T00:00:00.000Z',
    created_at: '2026-08-05T00:00:00.000Z',
    updated_at: '2026-08-05T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    category: { id: 'preview-cat-4', name: 'Compliance', slug: 'compliance', description: null, created_at: '2026-08-01T00:00:00.000Z' },
    tags: [],
    author: { id: 'preview-author', full_name: 'Pawan Parajuli', professional_title: 'Chartered Accountant', bio: null, profile_image: null, email: null, phone: null, location: null, linkedin_url: null, facebook_url: null, created_at: '2026-08-01T00:00:00.000Z', updated_at: '2026-08-01T00:00:00.000Z' },
  },
  {
    id: 'preview-5',
    title: 'Reading the balance sheet for what is really changing',
    slug: 'reading-the-balance-sheet-what-is-changing',
    excerpt: 'A close reading of the numbers can reveal operational stress before the annual report is published.',
    content:
      '<p>Balance sheets are not just reporting tools; they are stories about risk, liquidity, and operational choices.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    category_id: 'preview-cat-5',
    author_id: 'preview-author',
    status: 'published',
    is_featured: false,
    published_at: '2026-08-02T00:00:00.000Z',
    created_at: '2026-08-02T00:00:00.000Z',
    updated_at: '2026-08-02T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    category: { id: 'preview-cat-5', name: 'Finance', slug: 'finance', description: null, created_at: '2026-08-01T00:00:00.000Z' },
    tags: [],
    author: { id: 'preview-author', full_name: 'Pawan Parajuli', professional_title: 'Chartered Accountant', bio: null, profile_image: null, email: null, phone: null, location: null, linkedin_url: null, facebook_url: null, created_at: '2026-08-01T00:00:00.000Z', updated_at: '2026-08-01T00:00:00.000Z' },
  },
  {
    id: 'preview-6',
    title: 'Building a simpler policy routine for research and teaching work',
    slug: 'simpler-policy-routine-for-research-teaching',
    excerpt: 'A useful workflow is often less about complexity and more about consistency across the pieces of work.',
    content:
      '<p>When systems become clearer, it is easier to protect quality while still moving work forward.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    category_id: 'preview-cat-6',
    author_id: 'preview-author',
    status: 'published',
    is_featured: false,
    published_at: '2026-07-29T00:00:00.000Z',
    created_at: '2026-07-29T00:00:00.000Z',
    updated_at: '2026-07-29T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    category: { id: 'preview-cat-6', name: 'Teaching', slug: 'teaching', description: null, created_at: '2026-08-01T00:00:00.000Z' },
    tags: [],
    author: { id: 'preview-author', full_name: 'Pawan Parajuli', professional_title: 'Chartered Accountant', bio: null, profile_image: null, email: null, phone: null, location: null, linkedin_url: null, facebook_url: null, created_at: '2026-08-01T00:00:00.000Z', updated_at: '2026-08-01T00:00:00.000Z' },
  },
  {
    id: 'preview-7',
    title: 'Why better documentation can reduce compliance stress',
    slug: 'better-documentation-reduce-compliance-stress',
    excerpt: 'Good records do not just support reporting; they create calmer decisions under pressure.',
    content:
      '<p>Organized records reduce the friction of compliance checks, audits, and follow-up conversations.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=80',
    category_id: 'preview-cat-7',
    author_id: 'preview-author',
    status: 'published',
    is_featured: false,
    published_at: '2026-07-24T00:00:00.000Z',
    created_at: '2026-07-24T00:00:00.000Z',
    updated_at: '2026-07-24T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    category: { id: 'preview-cat-7', name: 'Research', slug: 'research', description: null, created_at: '2026-08-01T00:00:00.000Z' },
    tags: [],
    author: { id: 'preview-author', full_name: 'Pawan Parajuli', professional_title: 'Chartered Accountant', bio: null, profile_image: null, email: null, phone: null, location: null, linkedin_url: null, facebook_url: null, created_at: '2026-08-01T00:00:00.000Z', updated_at: '2026-08-01T00:00:00.000Z' },
  },
  {
    id: 'preview-8',
    title: 'Three habits that make financial planning feel simpler',
    slug: 'three-habits-making-financial-planning-simpler',
    excerpt: 'Planning becomes less daunting when the routine is clear, consistent, and grounded in real numbers.',
    content:
      '<p>Strong planning does not begin with complexity; it begins with a small set of repeatable habits.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    category_id: 'preview-cat-8',
    author_id: 'preview-author',
    status: 'published',
    is_featured: false,
    published_at: '2026-07-18T00:00:00.000Z',
    created_at: '2026-07-18T00:00:00.000Z',
    updated_at: '2026-07-18T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    category: { id: 'preview-cat-8', name: 'Policy', slug: 'policy', description: null, created_at: '2026-08-01T00:00:00.000Z' },
    tags: [],
    author: { id: 'preview-author', full_name: 'Pawan Parajuli', professional_title: 'Chartered Accountant', bio: null, profile_image: null, email: null, phone: null, location: null, linkedin_url: null, facebook_url: null, created_at: '2026-08-01T00:00:00.000Z', updated_at: '2026-08-01T00:00:00.000Z' },
  },
] as BlogPostWithRelations[];

export function HomePage() {
  const { profile } = useProfile();
  const [posts, setPosts] = useState<BlogPostWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [{ data: postData }, { data: catData }] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('*, category:categories(*), tags:blog_post_tags(tag:tags(*)), author:profiles(*)')
          .eq('status', 'published')
          .order('is_featured', { ascending: false })
          .order('published_at', { ascending: false })
          .limit(12),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (postData) {
        const formatted = postData.map((p: Record<string, unknown>) => ({
          ...p,
          tags: (p.tags as { tag: Category }[] | undefined)?.map((t) => t.tag) ?? [],
        })) as unknown as BlogPostWithRelations[];
        setPosts(formatted);
      }
      if (catData) setCategories(catData);
    }

    fetchData();
  }, []);

  const displayPosts = posts.length > 0 ? posts : previewPosts;

  const popularPosts = useMemo(() => {
    let allPosts = displayPosts;
    
    // If using real posts, fill gaps with preview posts to ensure images show
    if (posts.length > 0) {
      const postsWithImages = posts.filter(p => p.featured_image);
      if (postsWithImages.length < 3) {
        allPosts = [...postsWithImages, ...previewPosts].slice(0, 6);
      }
    }
    
    const featured = allPosts.filter((post) => post.is_featured);
    return (featured.length > 0 ? featured : allPosts).slice(0, 4);
  }, [displayPosts, posts]);

  const recentPosts = useMemo(() => displayPosts.slice(0, 6), [displayPosts]);

  const secondaryFeaturedPosts = useMemo(() => {
    let allPosts = displayPosts;
    
    if (posts.length > 0) {
      const postsWithImages = posts.filter(p => p.featured_image);
      if (postsWithImages.length < 4) {
        allPosts = [...postsWithImages, ...previewPosts].slice(0, 8);
      }
    }
    
    const nonFeatured = allPosts.filter((post) => !post.is_featured);
    return (nonFeatured.length > 0 ? nonFeatured : allPosts).slice(0, 4);
  }, [displayPosts, posts]);

  const fullName = profile?.full_name || 'Pawan Parajuli';

  return (
    <>
      <SEO
        title="Home"
        description="Professional writing, analysis, and resources on accounting, taxation, compliance, and business guidance in Nepal."
      />

      <section className="bg-navy-50 pb-12 pt-8">
        <div className="container-wide">
          <div className="grid gap-6 xl:grid-cols-3">
            {popularPosts.length > 0 ? (
              popularPosts.slice(0, 3).map((post, index) => {
                const readingTime = calculateReadingTime(post.content);
                const isHighlight = index === 0 || index === 1;

                return (
                  <article
                    key={post.id}
                    className={`group overflow-hidden rounded-[2rem] border border-navy-200 bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg ${
                      isHighlight ? 'xl:col-span-1' : 'xl:col-span-1'
                    }`}
                  >
                    <div className="block overflow-hidden bg-gradient-to-br from-navy-200 to-navy-300">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className={`${index === 0 ? 'h-[300px] md:h-[420px]' : 'h-[260px] md:h-[320px]'} w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]`}
                        />
                      ) : (
                        <div className={`${index === 0 ? 'h-[300px] md:h-[420px]' : 'h-[260px] md:h-[320px]'} w-full flex items-center justify-center bg-gradient-to-br from-navy-200 to-navy-400`}>
                          <Newspaper size={48} className="text-navy-600 opacity-40" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 px-5 pt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-navy-500">
                      {post.category && (
                        <>
                          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-navy-700" />
                          <Link to={`/blog/category/${post.category.slug}`} className="hover:text-navy-700">
                            {post.category.name}
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="px-5 pb-5 pt-3">
                      <h3 className={`${index === 0 ? 'text-[2.2rem] md:text-[2.7rem]' : 'text-[2rem] md:text-[2.3rem]'} font-serif font-bold leading-[0.96] tracking-[-0.04em] text-navy-900`}>
                        <Link to={`/blog/${post.slug}`} className="hover:text-navy-700">
                          {post.title}
                        </Link>
                      </h3>

                      {post.excerpt && <p className="mt-4 text-base leading-7 text-navy-600">{post.excerpt}</p>}

                      <div className="mt-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.12em] text-navy-500">
                        <span>By {post.author?.full_name || fullName}</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={12} />
                          {readingTime} min read
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-[2rem] border border-navy-200 bg-white p-5 animate-pulse">
                  <div className="mb-4 h-64 rounded-[1.5rem] bg-navy-100" />
                  <div className="mb-3 h-4 w-24 rounded bg-navy-100" />
                  <div className="mb-2 h-8 rounded bg-navy-100" />
                  <div className="h-8 w-3/4 rounded bg-navy-100" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section bg-white border-t border-navy-100">
        <div className="container-wide">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <p className="eyebrow">Latest writing</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-serif font-bold text-navy-900">Most Recent Posts</h2>
            </div>
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-navy-700 hover:text-navy-900">
              View All Posts
              <ArrowRight size={16} />
            </Link>
          </div>

          {categories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              <Link
                to="/blog"
                className="inline-flex items-center rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 hover:border-navy-300 hover:bg-navy-50"
              >
                All
              </Link>
              {categories.slice(0, 10).map((category) => (
                <Link
                  key={category.id}
                  to={`/blog/category/${category.slug}`}
                  className="inline-flex items-center rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 hover:border-navy-300 hover:bg-navy-50"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {recentPosts.map((post, index) => {
              const readingTime = calculateReadingTime(post.content);
              const authorName = post.author?.full_name || 'Pawan Parajuli';
              const isLarge = index === 0;

              return (
                <article
                  key={post.id}
                  className={`group overflow-hidden rounded-2xl border border-navy-200 bg-white transition-all hover:border-navy-300 hover:shadow-soft ${
                    isLarge ? 'md:col-span-2' : ''
                  }`}
                >
                  <div className={`flex flex-col ${isLarge ? 'md:flex-row' : ''}`}>
                    {post.featured_image && (
                      <Link
                        to={`/blog/${post.slug}`}
                        className={`block overflow-hidden bg-navy-100 ${isLarge ? 'md:w-2/5' : 'w-full'}`}
                      >
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className={`${isLarge ? 'h-64 md:h-full' : 'h-52'} w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]`}
                        />
                      </Link>
                    )}

                    <div className={`flex-1 p-5 md:p-6 ${!post.featured_image ? 'w-full' : ''}`}>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-navy-500">
                        {post.category && (
                          <Link
                            to={`/blog/category/${post.category.slug}`}
                            className="inline-flex rounded-full bg-navy-100 px-2.5 py-1 font-semibold uppercase tracking-wider text-navy-700"
                          >
                            {post.category.name}
                          </Link>
                        )}
                        <span>{formatDateShort(post.published_at || post.created_at)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} /> {readingTime} min read
                        </span>
                      </div>

                      <h3 className={`${isLarge ? 'mt-4 text-3xl' : 'mt-4 text-2xl'} font-serif font-semibold text-navy-900 leading-tight`}>
                        <Link to={`/blog/${post.slug}`} className="hover:text-navy-700">
                          {post.title}
                        </Link>
                      </h3>

                      {post.excerpt && (
                        <p className="mt-3 max-w-2xl text-base leading-7 text-navy-600">{post.excerpt}</p>
                      )}

                      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-navy-500">
                        <span>By {authorName}</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={12} />
                          {formatDateShort(post.published_at || post.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section bg-navy-50 border-t border-navy-100">
        <div className="container-wide">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <p className="eyebrow">Featured Reading</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-serif font-bold text-navy-900">Popular Posts</h2>
            </div>
            <div className="flex items-center gap-2 text-gold-700">
              <Sparkles size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Selected</span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {secondaryFeaturedPosts.map((post) => {
              const readingTime = calculateReadingTime(post.content);
              return (
                <article key={post.id} className="rounded-2xl border border-navy-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-soft">
                  {post.category && (
                    <Link to={`/blog/category/${post.category.slug}`} className="inline-flex rounded-full bg-navy-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy-700">
                      {post.category.name}
                    </Link>
                  )}
                  <h3 className="mt-4 text-xl font-serif font-semibold text-navy-900 leading-snug">
                    <Link to={`/blog/${post.slug}`} className="hover:text-navy-700">
                      {post.title}
                    </Link>
                  </h3>
                  {post.excerpt && <p className="mt-3 text-sm leading-6 text-navy-600">{post.excerpt}</p>}
                  <div className="mt-5 flex items-center justify-between text-[11px] text-navy-500">
                    <span>{formatDateShort(post.published_at || post.created_at)}</span>
                    <span>{readingTime} min</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-wide">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {professionalAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.title} className="rounded-2xl border border-navy-200 bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-navy-300 hover:shadow-soft-lg">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-800 text-gold-400">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-navy-900">{area.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-navy-600">{area.description}</p>
                  <Link to={area.link} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-navy-800 hover:text-navy-600">
                    {area.cta}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-sm pb-20">
        <div className="container-narrow">
          <div className="rounded-3xl border border-navy-200 bg-navy-900 px-6 py-10 text-center shadow-soft md:px-10 md:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Stay connected</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-serif font-bold text-white">Follow new writing and updates</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-navy-200">
              Stay informed on new publications, research updates, and practical insights from my work.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/contact" className="btn-accent btn-lg">
                Get in Touch
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
