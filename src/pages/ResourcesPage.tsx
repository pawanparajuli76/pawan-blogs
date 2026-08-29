import { useState, useEffect } from 'react';
import { Download, FileText, FolderOpen, ExternalLink } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHeader } from '@/components/PageHeader';
import { supabase } from '@/lib/supabase';
import type { Resource } from '@/types';
import { formatDateShort } from '@/lib/utils';

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      const { data } = await supabase
        .from('resources')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (data) setResources(data);
      setLoading(false);
    }
    fetchResources();
  }, []);

  const categories = Array.from(new Set(resources.map((r) => r.category).filter(Boolean))) as string[];
  const filtered = activeFilter ? resources.filter((r) => r.category === activeFilter) : resources;

  const resourceIcons = ['Tax Guides', 'Templates', 'Checklists', 'Government Forms', 'Reference Documents', 'Calculators'];

  return (
    <>
      <SEO
        title="Resources"
        description="Download useful professional resources including tax guides, templates, checklists, government forms, and reference documents for Nepal."
      />

      <PageHeader
        eyebrow="Professional Materials"
        title="Resources"
        subtitle="A collection of useful professional resources including tax guides, templates, checklists, and reference documents."
      />

      <section className="section bg-navy-50">
        <div className="container-wide">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button
                onClick={() => setActiveFilter(null)}
                className={`badge cursor-pointer transition-colors ${
                  !activeFilter ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 border border-navy-200 hover:bg-navy-100'
                }`}
              >
                All Resources
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`badge cursor-pointer transition-colors ${
                    activeFilter === cat ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 border border-navy-200 hover:bg-navy-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="bg-navy-100 w-12 h-12 rounded-xl mb-4" />
                  <div className="bg-navy-100 h-5 w-3/4 rounded mb-3" />
                  <div className="bg-navy-100 h-3 w-full rounded mb-2" />
                  <div className="bg-navy-100 h-3 w-2/3 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen className="mx-auto text-navy-300 mb-4" size={48} />
              <h3 className="text-xl font-serif font-semibold text-navy-900 mb-2">
                No resources available yet
              </h3>
              <p className="text-navy-500 max-w-md mx-auto">
                Professional resources including tax guides, templates, checklists, and reference
                documents will be added here soon. Please check back later.
              </p>

              {/* Preview of planned resource types */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-10">
                {resourceIcons.map((type) => (
                  <div
                    key={type}
                    className="card p-5 text-center opacity-60"
                  >
                    <FileText className="mx-auto text-navy-400 mb-2" size={24} />
                    <span className="text-xs text-navy-500 font-medium">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((resource) => (
                <div key={resource.id} className="card-hover p-6 flex flex-col">
                  <div className="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="text-gold-400" size={22} />
                  </div>
                  {resource.category && (
                    <span className="badge-navy mb-3 self-start text-xs">{resource.category}</span>
                  )}
                  <h3 className="text-lg font-serif font-semibold text-navy-900 mb-2">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="text-sm text-navy-600 mb-4 flex-1">{resource.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-navy-50">
                    <span className="text-xs text-navy-400">{formatDateShort(resource.created_at)}</span>
                    {resource.file_url ? (
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-teal-700 font-medium hover:text-teal-800 transition-colors"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-navy-400">
                        <ExternalLink size={16} />
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
