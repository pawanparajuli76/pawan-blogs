import { SEO } from '@/components/SEO';
import { PageHeader } from '@/components/PageHeader';

interface LegalPageProps {
  title: string;
  eyebrow: string;
  sections: { heading: string; body: string }[];
}

export function LegalPage({ title, eyebrow, sections }: LegalPageProps) {
  return (
    <>
      <SEO title={title} description={`${title} for the website of Pawan Parajuli, Chartered Accountant.`} />
      <PageHeader eyebrow={eyebrow} title={title} />
      <section className="section bg-white">
        <div className="container-prose">
          <div className="space-y-6 sm:space-y-8">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-navy-900 mb-2 sm:mb-3">
                  {section.heading}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-navy-700 leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      sections={[
        {
          heading: 'Information We Collect',
          body: 'When you use the contact form on this website, we collect the information you voluntarily provide, including your name, email address, phone number, subject, and message content. This information is used solely to respond to your inquiry and is stored securely in our database.',
        },
        {
          heading: 'How We Use Your Information',
          body: 'Your contact information is used only to respond to your messages and provide professional services if a formal engagement is established. We do not sell, rent, or share your personal information with third parties for marketing purposes.',
        },
        {
          heading: 'Data Security',
          body: 'All data is stored securely using Supabase infrastructure with row-level security policies. Access to your submitted information is restricted to authorized administrators only. We employ industry-standard security measures to protect your data.',
        },
        {
          heading: 'Cookies and Analytics',
          body: 'This website may use basic cookies for functionality and may use analytics tools to understand site usage. No personally identifiable information is shared with third-party analytics providers.',
        },
        {
          heading: 'Your Rights',
          body: 'You have the right to request access to, correction of, or deletion of your personal information. To exercise these rights, please contact us using the contact information provided on this website.',
        },
        {
          heading: 'Changes to This Policy',
          body: 'We may update this privacy policy from time to time. Any changes will be posted on this page. We encourage you to review this page periodically to stay informed about how we protect your information.',
        },
      ]}
    />
  );
}

export function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Disclaimer"
      sections={[
        {
          heading: 'General Information Only',
          body: 'The content published on this website, including all blog articles, resources, and guides, is provided for general educational and informational purposes only. It should not be considered professional tax, accounting, legal, or financial advice.',
        },
        {
          heading: 'No Professional Engagement',
          body: 'Submitting a message through the contact form or accessing content on this website does not create a professional/client engagement. A formal engagement requires separate discussion and agreement on scope, terms, and fees.',
        },
        {
          heading: 'Regulatory Changes',
          body: 'Tax laws, accounting standards, and regulatory requirements in Nepal are subject to change. While we strive to provide accurate and current information, we cannot guarantee that all content reflects the most recent regulatory updates. Readers should verify current requirements or seek professional advice.',
        },
        {
          heading: 'No Liability',
          body: 'The author and website owner shall not be liable for any losses, damages, or consequences arising from the use of information provided on this website. Any reliance you place on such information is strictly at your own risk.',
        },
        {
          heading: 'External Links',
          body: 'This website may contain links to external websites. We are not responsible for the content, accuracy, or privacy practices of these external sites. The inclusion of links does not imply endorsement.',
        },
      ]}
    />
  );
}

export function TermsOfUsePage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Use"
      sections={[
        {
          heading: 'Acceptance of Terms',
          body: 'By accessing and using this website, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this website.',
        },
        {
          heading: 'Use of Content',
          body: 'All content on this website is the intellectual property of Pawan Parajuli unless otherwise stated. You may read, share, and reference content for personal, non-commercial use. Reproduction, distribution, or commercial use of content without written permission is prohibited.',
        },
        {
          heading: 'Acceptable Use',
          body: 'You agree not to use this website for any unlawful purpose, to submit false or misleading information through the contact form, or to attempt to gain unauthorized access to any part of the website or its systems.',
        },
        {
          heading: 'Service Availability',
          body: 'This website is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted access to the website and may modify, suspend, or discontinue any part of the website at any time without notice.',
        },
        {
          heading: 'Governing Law',
          body: 'These Terms of Use are governed by the laws of Nepal. Any disputes arising from the use of this website shall be subject to the jurisdiction of the appropriate courts in Nepal.',
        },
      ]}
    />
  );
}
