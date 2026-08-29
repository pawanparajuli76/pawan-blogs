import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  BookOpen,
  ShieldCheck,
  Briefcase,
  FileText,
  Building2,
  Receipt,
  ClipboardCheck,
  ArrowRight,
  TrendingUp,
  Calendar,
  Clock,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BlogCard } from '@/components/BlogCard';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import type { BlogPostWithRelations, Category } from '@/types';

const expertiseAreas = [
  {
    icon: Calculator,
    title: 'Taxation',
    desc: 'Income tax planning, tax returns, and tax compliance for individuals and businesses.',
  },
  {
    icon: BookOpen,
    title: 'Accounting',
    desc: 'Bookkeeping, financial records, and accounting system setup and maintenance.',
  },
  {
    icon: ShieldCheck,
    title: 'Audit & Assurance',
    desc: 'Statutory audits, internal audits, and assurance services for organizations.',
  },
  {
    icon: Briefcase,
    title: 'Business Advisory',
    desc: 'Strategic business advice, financial planning, and growth consulting services.',
  },
  {
    icon: FileText,
    title: 'Financial Reporting',
    desc: 'NFRS-compliant financial statements and reporting for companies and entities.',
  },
  {
    icon: Building2,
    title: 'Company Compliance',
    desc: 'Regulatory filings, company secretarial work, and statutory compliance services.',
  },
  {
    icon: Receipt,
    title: 'PAN & VAT',
    desc: 'PAN and VAT registration, returns, and compliance with IRD requirements.',
  },
  {
    icon: ClipboardCheck,
    title: 'Business Registration',
    desc: 'Company and firm registration, licensing, and statutory setup in Nepal.',
  },
];

const featuredTopics = [
  { name: 'Income Tax', slug: 'taxation', icon: TrendingUp },
  { name: 'VAT', slug: 'pan-and-vat', icon: Receipt },
  { name: 'PAN', slug: 'pan-and-vat', icon: FileText },
  { name: 'Business Registration', slug: 'compliance', icon: Building2 },
  { name: 'Audit', slug: 'audit', icon: ShieldCheck },
  { name: 'Financial Reporting', slug: 'financial-reporting', icon: FileText },
  { name: 'Small Business', slug: 'business', icon: Briefcase },
  { name: 'IRD Updates', slug: 'government-updates', icon: Calendar },
  { name: 'Finance Act / Budget', slug: 'government-updates', icon: TrendingUp },
];

export function HomePage() {
  const { profile } = useProfile();
  const [posts, setPosts] = useState<BlogPostWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [{ data: postData }, { data: catData }] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('*, category:categories(*), tags:blog_post_tags(tag:tags(*))')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(6),
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

  const featuredPosts = posts.filter((p) => p.is_featured).slice(0, 1);
  const latestPosts = posts.slice(0, 6);

  return (
    <>
      <SEO />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-400 rounded-full blur-3xl" />
        </div>

        <div className="container-wide relative py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-up">
              <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-4">
                Chartered Accountant | Nepal
              </p>
              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
                Tax, Accounting &amp; Business Insights
              </h1>
              <p className="text-navy-200 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                Helping individuals, businesses and entrepreneurs understand taxation,
                accounting, compliance and financial matters in Nepal.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/blog" className="btn-accent btn-lg">
                  Read My Articles
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/contact"
                  className="btn btn-lg border border-navy-400 text-white hover:bg-navy-700 hover:border-navy-300 focus:ring-navy-400"
                >
                  Contact Me
                </Link>
              </div>
            </div>

            {/* Portrait */}
            <div className="flex justify-center lg:justify-end animate-fade-in">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-gold-400/20 to-teal-400/20 rounded-2xl blur-2xl" />
                <div className="relative w-72 h-96 md:w-80 md:h-[28rem] rounded-2xl overflow-hidden shadow-soft-xl border-4 border-white/10">
                  <img
                    src="https://images.pexels.com/photos/15200105/pexels-photo-15200105.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Pawan Parajuli, Chartered Accountant"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-soft-lg p-4 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="text-gold-600" size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-navy-500 font-medium">Trusted Professional</div>
                      <div className="text-sm text-navy-900 font-semibold">CA Services</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Introduction */}
      <section className="section bg-white">
        <div className="container-narrow">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
            <div className="md:col-span-1">
              <p className="eyebrow mb-3">About Me</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 mb-2">
                Professional Introduction
              </h2>
            </div>
            <div className="md:col-span-2">
              <p className="text-lg text-navy-700 leading-relaxed mb-6">
                {profile?.bio ||
                  'I am a Chartered Accountant with professional experience in accounting, taxation, auditing, financial reporting and business advisory. Through this platform, I share practical insights and updates to help individuals and businesses better understand Nepal\'s financial and regulatory environment.'}
              </p>
              <Link to="/about" className="btn-secondary">
                Learn More About Me
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Areas of Expertise */}
      <section className="section bg-navy-50">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow mb-3">What I Do</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 mb-4">
              Areas of Expertise
            </h2>
            <p className="text-navy-600 text-lg">
              Comprehensive professional services covering all aspects of accounting,
              taxation, and business compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {expertiseAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div
                  key={area.title}
                  className="card-hover p-6 group"
                >
                  <div className="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold-500 transition-colors duration-300">
                    <Icon className="text-gold-400 group-hover:text-navy-900 transition-colors duration-300" size={22} />
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-navy-900 mb-2">
                    {area.title}
                  </h3>
                  <p className="text-sm text-navy-600 leading-relaxed">
                    {area.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {latestPosts.length > 0 && (
        <section className="section bg-white">
          <div className="container-wide">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <p className="eyebrow mb-3">Recent Writing</p>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900">
                  Latest Articles
                </h2>
              </div>
              <Link to="/blog" className="btn-secondary">
                View All Articles
                <ArrowRight size={16} />
              </Link>
            </div>

            {featuredPosts.length > 0 && (
              <div className="mb-8">
                <BlogCard post={featuredPosts[0]} featured />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredPosts.length > 0 ? latestPosts.slice(1, 6) : latestPosts).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Topics */}
      <section className="section bg-navy-900 text-white">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-3">
              Explore by Topic
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Featured Topics
            </h2>
            <p className="text-navy-300 text-lg">
              Browse popular content categories relevant to Nepalese taxation and business.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {featuredTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Link
                  key={topic.name}
                  to={`/blog/category/${topic.slug}`}
                  className="group flex items-center gap-4 p-5 bg-navy-800 rounded-xl hover:bg-navy-700 border border-navy-700 hover:border-gold-400/50 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center group-hover:bg-gold-500 transition-colors flex-shrink-0">
                    <Icon className="text-gold-400 group-hover:text-navy-900 transition-colors" size={20} />
                  </div>
                  <span className="text-sm font-medium text-navy-100 group-hover:text-white transition-colors">
                    {topic.name}
                  </span>
                  <ArrowRight size={16} className="ml-auto text-navy-400 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-10">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/blog/category/${cat.slug}`}
                  className="badge bg-navy-800 text-navy-200 hover:bg-navy-700 hover:text-gold-400 border border-navy-700 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-white">
        <div className="container-narrow">
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-10 md:p-16 text-center shadow-soft-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-white text-3xl md:text-4xl font-serif font-bold mb-4">
                Need Professional Assistance?
              </h2>
              <p className="text-navy-200 text-lg mb-8 max-w-2xl mx-auto">
                Whether you need help with tax compliance, accounting, audit, or business
                advisory, I'm here to help you navigate Nepal's financial landscape.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="btn-accent btn-lg">
                  Get in Touch
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/services"
                  className="btn btn-lg border border-navy-400 text-white hover:bg-navy-700"
                >
                  View Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
