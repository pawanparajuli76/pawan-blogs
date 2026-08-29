import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  Briefcase,
  ShieldCheck,
  Target,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHeader } from '@/components/PageHeader';
import { useProfile } from '@/hooks/useProfile';

const qualifications = [
  'Chartered Accountant (CA)',
  'Professional experience in accounting and taxation',
  'Expertise in Nepalese Financial Reporting Standards (NFRS)',
  'In-depth knowledge of IRD compliance and procedures',
];

const experience = [
  {
    year: 'Present',
    title: 'Chartered Accountant',
    org: 'Independent Professional Practice',
    desc: 'Providing taxation, accounting, audit, and advisory services to individuals and businesses across Nepal.',
  },
  {
    year: 'Earlier',
    title: 'Articleship & Training',
    org: 'Professional Accounting Firms',
    desc: 'Completed rigorous articleship training covering audit, taxation, accounting, and financial reporting.',
  },
  {
    year: 'Foundation',
    title: 'CA Education',
    org: 'Institute of Chartered Accountants',
    desc: 'Completed all levels of the Chartered Accountancy program including CAP I, CAP II, and CAP III.',
  },
];

const philosophy = [
  'Integrity and transparency in every professional engagement',
  'Staying current with Nepal\'s evolving tax and regulatory framework',
  'Making complex financial concepts accessible to all',
  'Building long-term relationships based on trust and results',
];

export function AboutPage() {
  const { profile } = useProfile();

  return (
    <>
      <SEO
        title="About"
        description="Learn about Pawan Parajuli, a Chartered Accountant based in Nepal with expertise in taxation, accounting, auditing, and business advisory."
      />

      <PageHeader
        eyebrow="About Me"
        title="Professional Profile"
        subtitle="Dedicated to helping individuals and businesses navigate Nepal's financial and regulatory landscape with confidence."
      />

      {/* Professional Introduction */}
      <section className="section bg-white">
        <div className="container-narrow">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-start">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-tr from-gold-200 to-teal-200 rounded-2xl blur-xl opacity-50" />
                <img
                  src="https://images.pexels.com/photos/15200105/pexels-photo-15200105.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt={profile?.full_name || 'Pawan Parajuli'}
                  className="relative w-full rounded-2xl shadow-soft-lg object-cover aspect-[4/5]"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <p className="eyebrow mb-3">Introduction</p>
              <h2 className="text-3xl font-serif font-bold text-navy-900 mb-6">
                {profile?.full_name || 'Pawan Parajuli'}
              </h2>
              <p className="text-lg text-navy-700 leading-relaxed mb-6">
                {profile?.bio ||
                  'I am a Chartered Accountant with professional experience in accounting, taxation, auditing, financial reporting and business advisory. Through this platform, I share practical insights and updates to help individuals and businesses better understand Nepal\'s financial and regulatory environment.'}
              </p>
              {profile && (
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {profile.email && (
                    <div>
                      <div className="text-xs text-navy-400 uppercase tracking-wider mb-1">Email</div>
                      <div className="text-sm text-navy-800 font-medium">{profile.email}</div>
                    </div>
                  )}
                  {profile.phone && (
                    <div>
                      <div className="text-xs text-navy-400 uppercase tracking-wider mb-1">Phone</div>
                      <div className="text-sm text-navy-800 font-medium">{profile.phone}</div>
                    </div>
                  )}
                  {profile.location && (
                    <div>
                      <div className="text-xs text-navy-400 uppercase tracking-wider mb-1">Location</div>
                      <div className="text-sm text-navy-800 font-medium">{profile.location}</div>
                    </div>
                  )}
                  {profile.professional_title && (
                    <div>
                      <div className="text-xs text-navy-400 uppercase tracking-wider mb-1">Title</div>
                      <div className="text-sm text-navy-800 font-medium">{profile.professional_title}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Qualifications */}
      <section className="section bg-navy-50">
        <div className="container-narrow">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-gold-400" size={20} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-navy-900">Qualifications</h2>
              </div>
              <ul className="space-y-3">
                {qualifications.map((q) => (
                  <li key={q} className="flex items-start gap-3">
                    <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                    <span className="text-navy-700">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
                  <Award className="text-gold-400" size={20} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-navy-900">Memberships</h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                  <span className="text-navy-700">Institute of Chartered Accountants of Nepal (ICAN)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                  <span className="text-navy-700">Registered Tax Practitioner</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                  <span className="text-navy-700">Member of professional accounting bodies</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Career Timeline */}
      <section className="section bg-white">
        <div className="container-narrow">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
              <Briefcase className="text-gold-400" size={20} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-navy-900">Professional Experience</h2>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-navy-100 md:-translate-x-1/2" />
            {experience.map((exp, i) => (
              <div
                key={i}
                className={`relative flex md:gap-8 mb-10 last:mb-0 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-gold-500 rounded-full ring-4 ring-white md:-translate-x-1/2 mt-6" />

                <div className="md:w-1/2" />
                <div className={`pl-12 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pl-8' : 'md:pr-8 md:text-right'}`}>
                  <div className="card p-6">
                    <span className="badge-gold mb-3">{exp.year}</span>
                    <h3 className="text-lg font-serif font-semibold text-navy-900 mb-1">{exp.title}</h3>
                    <p className="text-sm text-navy-500 mb-2">{exp.org}</p>
                    <p className="text-sm text-navy-600">{exp.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy & Mission */}
      <section className="section bg-navy-50">
        <div className="container-narrow">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
                  <Target className="text-gold-400" size={20} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-navy-900">Professional Philosophy</h2>
              </div>
              <ul className="space-y-3">
                {philosophy.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <ShieldCheck className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                    <span className="text-navy-700">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
                  <Eye className="text-gold-400" size={20} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-navy-900">Mission of This Website</h2>
              </div>
              <p className="text-navy-700 leading-relaxed mb-4">
                This platform exists to bridge the gap between complex financial regulations and
                everyday understanding. Through articles, guides, and updates, I aim to make
                taxation, accounting, and compliance accessible to everyone — from small business
                owners to corporate entities.
              </p>
              <p className="text-navy-700 leading-relaxed">
                By sharing practical insights rooted in real-world experience, I hope to empower
                individuals and businesses to make informed financial decisions and stay compliant
                with Nepal's regulatory requirements.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/contact" className="btn-primary btn-lg">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
