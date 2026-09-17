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
      <section className="py-10 sm:py-16 md:py-24 bg-white min-h-[calc(100vh-20rem)]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            {/* LEFT COLUMN: About Me Content & Buttons */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Top Area: Side-by-side on mobile (Heading + Para 1 on left, Photo on right), normal flow on desktop */}
              <div className="flex flex-row items-start gap-3.5 sm:gap-6 lg:block">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 sm:mb-4 lg:mb-6">
                    <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-navy-950 tracking-tight">
                      About Me
                    </h1>
                  </div>

                  {/* Paragraph 1 */}
                  <div className="prose-content text-navy-800 leading-relaxed text-xs sm:text-base md:text-lg">
                    <p className="mb-0 lg:mb-5">
                      I am an accounting and finance professional with more than seven years of experience across accounting, taxation, auditing, financial reporting, and regulatory compliance. I qualified as a Chartered Accountant from the Institute of Chartered Accountants of Nepal (ICAN) in June 2025.
                    </p>
                  </div>
                </div>

                {/* Mobile ICAN Photo (Beside text on mobile, hidden on desktop) */}
                <div className="w-[120px] sm:w-[160px] md:w-[200px] flex-shrink-0 lg:hidden pt-1">
                  <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-soft border border-navy-200/80 bg-navy-950">
                    <img
                      src={aboutIcanPhoto}
                      alt="Pawan Parajuli in front of ICAN"
                      className="w-full h-auto object-cover rounded-xl sm:rounded-2xl"
                      loading="eager"
                    />
                  </div>
                </div>
              </div>

              {/* Remaining Paragraphs: Full-width underneath on mobile, continuous on desktop */}
              <div className="prose-content text-navy-800 leading-relaxed space-y-3.5 sm:space-y-5 text-xs sm:text-base md:text-lg mt-3.5 sm:mt-5 lg:mt-0">
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

              {/* Two Matching Subtle Gold Action Buttons - Side-by-side */}
              <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-4 mt-6 sm:mt-10 pt-5 sm:pt-8 border-t border-navy-100">
                <Link
                  to="/blog"
                  className="inline-flex items-center justify-center gap-1 sm:gap-2.5 px-3.5 sm:px-7 py-2 sm:py-3.5 rounded-lg sm:rounded-xl bg-gold-500 text-navy-950 font-semibold text-[11px] sm:text-sm shadow-soft hover:bg-gold-400 hover:shadow-soft-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 text-center whitespace-nowrap"
                >
                  <span>Explore Research & Insights</span>
                  <ArrowRight size={14} className="hidden sm:inline" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-1 sm:gap-2.5 px-3.5 sm:px-7 py-2 sm:py-3.5 rounded-lg sm:rounded-xl bg-gold-500 text-navy-950 font-semibold text-[11px] sm:text-sm shadow-soft hover:bg-gold-400 hover:shadow-soft-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 text-center whitespace-nowrap"
                >
                  <span>Get in Touch</span>
                  <ArrowRight size={14} className="hidden sm:inline" />
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: Desktop ICAN Professional Photograph (Hidden on mobile, visible on desktop) */}
            <div className="hidden lg:flex lg:col-span-5 justify-end lg:sticky lg:top-28">
              <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl overflow-hidden shadow-soft-lg border border-navy-200/80 bg-navy-950">
                <img
                  src={aboutIcanPhoto}
                  alt="Pawan Parajuli in front of ICAN"
                  className="w-full h-auto object-cover rounded-2xl sm:rounded-3xl"
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
