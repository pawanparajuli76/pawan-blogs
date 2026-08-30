import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Calendar, Newspaper } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { supabase } from '@/lib/supabase';
import { calculateReadingTime, formatDateShort } from '@/lib/utils';
import type { BlogPostWithRelations, Category } from '@/types';

// Fallback preview posts ensuring rich presentation if database is empty
const fallbackPosts: BlogPostWithRelations[] = [
  {
    id: 'research-1',
    title: "Navigating Nepal's Evolving Tax Landscape: Policy Implications for Businesses and Individuals",
    slug: 'navigating-nepals-evolving-tax-landscape',
    excerpt: 'An in-depth analysis of recent fiscal policy shifts, withholding tax regulations, and practical compliance strategies for emerging enterprises.',
    content:
      '<p>Tax policy in Nepal continues to adapt to digital commerce and international standards. This research paper evaluates direct impacts on corporate compliance, capital budgeting, and individual tax planning.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    category_id: 'cat-taxation',
    author_id: 'author-pp',
    status: 'published',
    is_featured: true,
    published_at: '2026-08-20T00:00:00.000Z',
    created_at: '2026-08-20T00:00:00.000Z',
    updated_at: '2026-08-20T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    category: { id: 'cat-taxation', name: 'Taxation', slug: 'taxation', description: null, created_at: '2026-08-01T00:00:00.000Z' },
    tags: [],
    author: { id: 'author-pp', full_name: 'Pawan Parajuli', professional_title: 'Chartered Accountant', bio: null, profile_image: null, email: null, phone: null, location: null, linkedin_url: null, facebook_url: null, created_at: '2026-08-01T00:00:00.000Z', updated_at: '2026-08-01T00:00:00.000Z' },
  },
  {
    id: 'research-2',
    title: 'NFRS Implementation Challenges and Financial Reporting Integrity in Practice',
    slug: 'nfrs-implementation-challenges-financial-reporting',
    excerpt: 'Examining key challenges faced by entities when adopting Nepal Financial Reporting Standards, with practical solutions for fair valuation and disclosure.',
    content:
      '<p>The transition to NFRS requires significant technical alignment in revenue recognition, lease accounting, and impairment assessment.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    category_id: 'cat-accounting',
    author_id: 'author-pp',
    status: 'published',
    is_featured: true,
    published_at: '2026-08-16T00:00:00.000Z',
    created_at: '2026-08-16T00:00:00.000Z',
    updated_at: '2026-08-16T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    category: { id: 'cat-accounting', name: 'Accounting', slug: 'accounting', description: null, created_at: '2026-08-01T00:00:00.000Z' },
    tags: [],
    author: { id: 'author-pp', full_name: 'Pawan Parajuli', professional_title: 'Chartered Accountant', bio: null, profile_image: null, email: null, phone: null, location: null, linkedin_url: null, facebook_url: null, created_at: '2026-08-01T00:00:00.000Z', updated_at: '2026-08-01T00:00:00.000Z' },
  },
  {
    id: 'research-3',
    title: 'Audit Preparedness: Establishing Robust Internal Controls to Mitigate Risk',
    slug: 'audit-preparedness-internal-controls-risk-mitigation',
    excerpt: 'How organizations can build resilient internal control environments that streamline statutory audits and enhance stakeholder confidence.',
    content:
      '<p>Effective internal control frameworks minimize audit friction and provide management with accurate real-time operational insights.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    category_id: 'cat-audit',
    author_id: 'author-pp',
    status: 'published',
    is_featured: false,
    published_at: '2026-08-11T00:00:00.000Z',
    created_at: '2026-08-11T00:00:00.000Z',
    updated_at: '2026-08-11T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    category: { id: 'cat-audit', name: 'Audit', slug: 'audit', description: null, created_at: '2026-08-01T00:00:00.000Z' },
    tags: [],
    author: { id: 'author-pp', full_name: 'Pawan Parajuli', professional_title: 'Chartered Accountant', bio: null, profile_image: null, email: null, phone: null, location: null, linkedin_url: null, facebook_url: null, created_at: '2026-08-01T00:00:00.000Z', updated_at: '2026-08-01T00:00:00.000Z' },
  },
];

export function HomePage() {
  const [posts, setPosts] = useState<BlogPostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestPosts() {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*, category:categories(*), tags:blog_post_tags(tag:tags(*)), author:profiles(*)')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(3);

        if (!error && data && data.length > 0) {
          const formatted = data.map((p: Record<string, unknown>) => ({
            ...p,
            tags: (p.tags as { tag: Category }[] | undefined)?.map((t) => t.tag) ?? [],
          })) as unknown as BlogPostWithRelations[];
          setPosts(formatted);
        }
      } catch (err) {
        console.error('Error fetching homepage posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestPosts();
  }, []);

  // Display latest 3 published articles (or fallback if empty)
  const latestArticles = useMemo(() => {
    return posts.length > 0 ? posts.slice(0, 3) : fallbackPosts.slice(0, 3);
  }, [posts]);

  return (
    <>
      <SEO
        title="Ideas. Perspectives. Insights."
        description="A space for research, professional perspectives and thoughtful writing by Pawan Parajuli, Chartered Accountant."
      />

                                                            {/* ========================================================================= */}
      {/* 1. MINIMAL HERO AREA                                                      */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[540px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[680px] xl:min-h-[700px] flex items-start bg-neutral-950 overflow-hidden">
        {/* Full-width responsive background image with original proportions */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Home%20Hero.png"
            alt="Hero Background"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          {/* Subtle neutral dark gradient on the left for crisp text legibility without obscuring right objects */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 via-35% md:via-45% to-transparent" />
        </div>

        {/* Hero Content explicitly top-aligned in the upper-left open area (~80-90px from left, ~140-160px below header) */}
        <div className="relative z-10 w-full px-6 sm:px-12 md:px-16 lg:pl-[85px] xl:pl-[90px] lg:pr-8 pt-[100px] sm:pt-[120px] md:pt-[140px] lg:pt-[150px] pb-16 sm:pb-20">
          <div className="w-full max-w-[480px] text-left">
            {/* Heading - Natural two-line arrangement */}
            <h1 className="font-serif font-medium text-3xl sm:text-4xl md:text-[46px] lg:text-[48px] xl:text-[50px] text-white tracking-tight leading-[1.05] drop-shadow-sm">
              Ideas. Perspectives.<br />Insights.
            </h1>

            {/* Short subtle gold line below heading */}
            <div className="w-12 h-[2px] bg-gold-400/80 mt-3.5 mb-4 rounded-full" />

            {/* Supporting text */}
            <p className="font-sans font-light text-sm sm:text-[17px] md:text-[18px] text-white/90 leading-[1.55] max-w-[400px] drop-shadow-sm">
              A space for research, professional perspectives and thoughtful writing.
            </p>

            {/* Side-by-side compact CTA buttons */}
            <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-start gap-3 sm:gap-3.5">
              {/* Explore Insights Button */}
              <a
                href="#latest-insights"
                className="inline-flex items-center justify-center gap-1.5 px-4.5 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 font-medium text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-soft hover:shadow-soft-lg group"
              >
                <span>Explore Insights</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </a>

              {/* About Me Button */}
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-1.5 px-4.5 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-transparent hover:bg-gold-400/10 text-gold-400 hover:text-gold-300 border border-gold-400/70 hover:border-gold-300 font-medium text-xs sm:text-sm tracking-wide transition-all duration-200 group"
              >
                <span>About Me</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LATEST INSIGHTS (Latest 3 Real Published Posts)                        */}
      {/* ========================================================================= */}
      <section id="latest-insights" className="py-20 md:py-28 bg-white border-t border-navy-100/60">
        <div className="container-wide">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-8 mb-12 border-b border-navy-100">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950 tracking-tight">
              Latest Insights
            </h2>

            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-navy-800 hover:text-gold-600 transition-colors group self-start sm:self-auto"
            >
              <span>View all</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Clean 3-Column Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {latestArticles.map((article) => {
              const readTime = calculateReadingTime(article.content);
              const categoryName = article.category?.name || 'Insight';
              const categorySlug = article.category?.slug || 'taxation';
              const postDate = formatDateShort(article.published_at || article.created_at);

              return (
                <article
                  key={article.id}
                  className="group flex flex-col bg-white rounded-2xl border border-navy-200/70 overflow-hidden shadow-soft transition-all duration-300 hover:border-navy-300 hover:shadow-soft-lg hover:-translate-y-1"
                >
                  {/* Article Thumbnail */}
                  <Link
                    to={`/blog/${article.slug}`}
                    className="block relative aspect-[16/10] overflow-hidden bg-navy-100"
                  >
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-navy-100 text-navy-400">
                        <Newspaper size={36} />
                      </div>
                    )}
                  </Link>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 flex flex-col flex-1">
                    {/* Category */}
                    <div className="mb-3">
                      <Link
                        to={`/blog/category/${categorySlug}`}
                        className="inline-block text-xs font-semibold uppercase tracking-wider text-gold-700 bg-gold-50/90 border border-gold-200/60 px-3 py-1 rounded-md hover:bg-gold-100 transition-colors"
                      >
                        {categoryName}
                      </Link>
                    </div>

                    {/* Article Title */}
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-950 leading-snug mb-3 group-hover:text-navy-700 transition-colors">
                      <Link to={`/blog/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-navy-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Metadata Footer: Date & Reading Time */}
                    <div className="mt-auto pt-4 border-t border-navy-100 flex items-center justify-between text-xs text-navy-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-navy-400" />
                        {postDate}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-navy-400" />
                        {readTime} min read
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Bottom Link for Mobile */}
          <div className="mt-10 text-center sm:hidden">
            <Link
              to="/blog"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy-950 text-white font-medium text-sm w-full shadow-soft"
            >
              <span>View all</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
