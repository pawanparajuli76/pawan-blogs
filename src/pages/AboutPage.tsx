import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import aboutIcanPhoto from '@/assets/about-ican.jpg';

export function AboutPage() {
  return (
    <>
      <SEO
        title="About"
        description="Learn about Pawan Parajuli. Accounting and finance professional with more than seven years of experience, sharing research, analysis, and insights on accounting, taxation, and auditing."
      />

      {/* ========================================================================= */}
      {/* SINGLE CLEAN ABOUT ME SECTION (Biography + ICAN Photo + Two Gold Buttons) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 md:py-28 bg-white min-h-[calc(100vh-20rem)]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* LEFT COLUMN: About Me Content & Buttons */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="mb-6">
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-navy-950 tracking-tight">
                  About Me
                </h1>
              </div>

              {/* 4 Paragraphs of Introduction */}
              <div className="prose-content text-navy-800 leading-relaxed space-y-5 text-base sm:text-lg">
                <p>
                  I am an accounting and finance professional with more than seven years of experience across accounting, taxation, auditing, financial reporting, and regulatory compliance. I qualified as a Chartered Accountant from the Institute of Chartered Accountants of Nepal (ICAN) in June 2025.
                </p>

                <p>
                  Throughout my professional journey, I have developed practical experience in financial reporting, taxation, audit and the application of IFRS/NFRS. I have also worked closely with international firms, particularly in accounting and payroll management, providing me with valuable exposure to diverse business environments and international working practices.
                </p>

                <p>
                  Beyond professional practice, I have a strong interest in research, analysis and knowledge sharing. I believe that professional knowledge becomes more valuable when it is examined critically, communicated clearly and shared with a wider audience.
                </p>

                <p>
                  This website has therefore been created primarily as a platform to share my research, professional analysis and evidence-informed perspectives on accounting, taxation, auditing, financial reporting and related economic and professional issues.
                </p>
              </div>

              {/* Two Matching Subtle Gold Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-10 pt-8 border-t border-navy-100">
                <Link
                  to="/blog"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gold-500 text-navy-950 font-semibold text-sm shadow-soft hover:bg-gold-400 hover:shadow-soft-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400"
                >
                  <span>Explore Research & Insights</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gold-500 text-navy-950 font-semibold text-sm shadow-soft hover:bg-gold-400 hover:shadow-soft-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400"
                >
                  <span>Get in Touch</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: ICAN Professional Photograph */}
            <div className="lg:col-span-5 flex justify-center lg:sticky lg:top-28">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-soft-lg border border-navy-200/80 bg-navy-950">
                <img
                  src={aboutIcanPhoto}
                  alt="Pawan Parajuli in front of ICAN"
                  className="w-full h-auto object-cover rounded-3xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
