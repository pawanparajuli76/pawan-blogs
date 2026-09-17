import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, FolderOpen, X } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHeader } from '@/components/PageHeader';
import { BlogCard } from '@/components/BlogCard';
import { supabase } from '@/lib/supabase';
import type { BlogPostWithRelations, Category } from '@/types';

const POSTS_PER_PAGE = 9;

export function BlogListPage() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [posts, setPosts] = useState<BlogPostWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(categorySlug || null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setActiveCategory(categorySlug || null);
    setPage(1);
  }, [categorySlug]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('blog_posts')
      .select('*, category:categories(*), tags:blog_post_tags(tag:tags(*))', { count: 'exact' })
      .eq('status', 'published');

    if (activeCategory) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', activeCategory)
        .maybeSingle();

      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    if (search.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,excerpt.ilike.%${search.trim()}%`);
    }

    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data, count } = await query
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false })
      .range(from, to);

    if (data) {
      const formatted = data.map((p: Record<string, unknown>) => ({
        ...p,
        tags: (p.tags as { tag: Category }[] | undefined)?.map((t) => t.tag) ?? [],
      })) as unknown as BlogPostWithRelations[];
      setPosts(formatted);
    }
    if (count !== null) setTotalCount(count);

    setLoading(false);
  }, [activeCategory, search, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
  const currentCategoryName = categories.find((c) => c.slug === activeCategory)?.name;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setActiveCategory(null);
    setPage(1);
  };

  return (
    <>
      <SEO
        title={currentCategoryName ? `${currentCategoryName} Articles` : 'Blog'}
        description="Articles and insights on taxation, accounting, audit, finance, and regulatory matters in Nepal."
      />

      <PageHeader
        eyebrow="Insights & Articles"
        title={currentCategoryName ? `${currentCategoryName} Articles` : 'Blog'}
        subtitle="Practical guidance and updates on taxation, accounting, compliance, and financial matters in Nepal."
      />

      {/* Search & Filters */}
      <section className="section-sm bg-white border-b border-navy-100">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" size={18} />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input-field pl-10 sm:pl-12"
                aria-label="Search articles"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 p-1"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category pills - Horizontally scrollable on mobile */}
            <div className="flex flex-nowrap sm:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              <Link
                to="/blog"
                className={`badge whitespace-nowrap cursor-pointer transition-colors py-1 px-3 ${
                  !activeCategory ? 'bg-navy-800 text-white' : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                }`}
                onClick={() => { setActiveCategory(null); setPage(1); }}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/blog/category/${cat.slug}`}
                  className={`badge whitespace-nowrap cursor-pointer transition-colors py-1 px-3 ${
                    activeCategory === cat.slug ? 'bg-navy-800 text-white' : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                  }`}
                  onClick={() => { setActiveCategory(cat.slug); setPage(1); }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {(search || activeCategory) && (
            <div className="flex items-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm text-navy-500">
              <span>
                {loading ? 'Searching...' : `${totalCount} article${totalCount !== 1 ? 's' : ''} found`}
              </span>
              <button onClick={clearFilters} className="text-teal-600 hover:text-teal-800 font-medium">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section bg-navy-50">
        <div className="container-wide">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-4 sm:p-5 animate-pulse">
                  <div className="bg-navy-100 rounded-lg h-44 sm:h-48 mb-4" />
                  <div className="bg-navy-100 h-4 w-20 rounded mb-3" />
                  <div className="bg-navy-100 h-5 w-full rounded mb-2" />
                  <div className="bg-navy-100 h-5 w-2/3 rounded mb-4" />
                  <div className="bg-navy-100 h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <FolderOpen className="mx-auto text-navy-300 mb-4" size={44} />
              <h3 className="text-lg sm:text-xl font-serif font-semibold text-navy-900 mb-2">
                No articles found
              </h3>
              <p className="text-navy-500 mb-6 text-sm sm:text-base max-w-md mx-auto">
                {search
                  ? `No articles match "${search}". Try different keywords.`
                  : activeCategory
                  ? 'No articles in this category yet. Check back soon.'
                  : 'No articles have been published yet. Check back soon.'}
              </p>
              {(search || activeCategory) && (
                <button onClick={clearFilters} className="btn-secondary btn-sm">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-12 flex-wrap">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="btn-secondary btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            pageNum === page
                              ? 'bg-navy-800 text-white'
                              : 'bg-white text-navy-700 border border-navy-200 hover:bg-navy-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum} className="text-navy-400 px-0.5 sm:px-1 text-xs">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
