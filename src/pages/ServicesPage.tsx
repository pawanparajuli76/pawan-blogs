import { Link } from 'react-router-dom';
import {
  Calculator,
  BookOpen,
  ShieldCheck,
  FileText,
  Building2,
  Receipt,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Info,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHeader } from '@/components/PageHeader';

const services = [
  {
    icon: Calculator,
    title: 'Taxation & Tax Compliance',
    desc: 'Comprehensive tax services including income tax planning, tax return preparation, advance tax calculations, TDS compliance, and tax clearance certificates. Assistance with IRD filings and representations.',
  },
  {
    icon: BookOpen,
    title: 'Accounting & Bookkeeping',
    desc: 'Professional accounting and bookkeeping services to maintain accurate financial records. Setup of accounting systems, periodic bookkeeping, and reconciliation services for businesses of all sizes.',
  },
  {
    icon: ShieldCheck,
    title: 'Audit & Assurance',
    desc: 'Statutory audits, internal audits, and assurance services conducted in accordance with applicable auditing standards. Independent verification to enhance credibility of financial information.',
  },
  {
    icon: FileText,
    title: 'Financial Reporting',
    desc: 'Preparation of financial statements in compliance with Nepal Financial Reporting Standards (NFRS). Including balance sheets, income statements, cash flow statements, and notes to accounts.',
  },
  {
    icon: Building2,
    title: 'Business Registration & Compliance',
    desc: 'Assistance with company registration, firm registration, and ongoing statutory compliance. Including Office of the Company Registrar (OCR) filings and annual returns.',
  },
  {
    icon: Receipt,
    title: 'PAN/VAT Advisory',
    desc: 'PAN and VAT registration, periodic return filings (D1, D2, D3), VAT compliance, and advisory on indirect tax matters. Guidance on IRD procedures and requirements.',
  },
  {
    icon: Briefcase,
    title: 'Business Advisory',
    desc: 'Strategic business advisory services including financial planning, business structuring, growth strategies, and operational improvements tailored to your organization\'s needs.',
  },
  {
    icon: TrendingUp,
    title: 'Financial Analysis',
    desc: 'Detailed financial analysis including ratio analysis, trend analysis, budgeting, forecasting, and financial modeling to support informed business decision-making.',
  },
];

export function ServicesPage() {
  return (
    <>
      <SEO
        title="Services"
        description="Professional services including taxation, accounting, audit, financial reporting, business registration, PAN/VAT advisory, and business advisory in Nepal."
      />

      <PageHeader
        eyebrow="What I Offer"
        title="Professional Services"
        subtitle="Comprehensive accounting, taxation, and advisory services designed to meet the needs of individuals and businesses in Nepal."
      />

      {/* Services Grid */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="card-hover p-5 sm:p-7 group"
                >
                  <div className="flex items-start gap-3.5 sm:gap-5">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 bg-navy-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500 transition-colors duration-300">
                      <Icon className="text-gold-400 group-hover:text-navy-900 transition-colors duration-300 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-xl font-serif font-semibold text-navy-900 mb-1.5 sm:mb-2">
                        {service.title}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-navy-600 leading-relaxed">
                        {service.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section-sm bg-navy-50">
        <div className="container-narrow">
          <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gold-200">
            <Info className="text-gold-600 flex-shrink-0 mt-0.5 sm:mt-1 w-5 h-5 sm:w-6 sm:h-6" />
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-navy-900 mb-1.5 sm:mb-2">Service Availability Disclaimer</h3>
              <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
                The availability of specific services may depend on professional engagement terms,
                applicable Nepalese laws and regulations, and the nature of the assignment. This
                page provides general information about service areas and does not constitute an
                offer to provide specific professional services. Please contact me to discuss your
                specific requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-white">
        <div className="container-narrow">
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl sm:rounded-2xl p-6 sm:p-10 md:p-14 text-center shadow-soft-lg">
            <h2 className="text-white text-2xl sm:text-3xl font-serif font-bold mb-3 sm:mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-navy-200 text-sm sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
              Contact me to discuss your professional needs and how I can assist you.
            </p>
            <Link to="/contact" className="btn-accent btn-lg w-full sm:w-auto inline-flex items-center justify-center">
              <span>Contact Me</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
