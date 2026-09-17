import { useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Facebook, Send, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHeader } from '@/components/PageHeader';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';

export function ContactPage() {
  const { profile } = useProfile();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      subject: formData.subject || null,
      message: formData.message,
    });

    if (insertError) {
      setError('Something went wrong. Please try again or email me directly.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with Pawan Parajuli, Chartered Accountant, for professional assistance with taxation, accounting, audit, and business advisory in Nepal."
      />

      <PageHeader
        eyebrow="Get in Touch"
        title="Contact Me"
        subtitle="Have a question or need professional assistance? Send me a message and I'll get back to you."
      />

      <section className="section bg-white">
        <div className="container-narrow">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-navy-900 mb-4 sm:mb-6">
                Contact Information
              </h2>
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-navy-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-gold-400" size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-navy-400 uppercase tracking-wider mb-0.5 sm:mb-1">Email</div>
                    <a
                      href={`mailto:${profile?.email || 'pawanparajuli33@gmail.com'}`}
                      className="text-xs sm:text-sm text-navy-800 font-medium hover:text-teal-700 transition-colors break-all"
                    >
                      {profile?.email || 'pawanparajuli33@gmail.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-navy-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-gold-400" size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-navy-400 uppercase tracking-wider mb-0.5 sm:mb-1">Phone</div>
                    <a
                      href={`tel:+977${profile?.phone || '9846796501'}`}
                      className="text-xs sm:text-sm text-navy-800 font-medium hover:text-teal-700 transition-colors"
                    >
                      {profile?.phone || '+977 9846796501'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-navy-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-gold-400" size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-navy-400 uppercase tracking-wider mb-0.5 sm:mb-1">Location</div>
                    <div className="text-xs sm:text-sm text-navy-800 font-medium">
                      {profile?.location || 'Nepal'}
                    </div>
                  </div>
                </div>

                {(profile?.linkedin_url || profile?.facebook_url) && (
                  <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                    {profile?.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="w-9 h-9 sm:w-10 sm:h-10 bg-navy-50 rounded-lg flex items-center justify-center text-navy-700 hover:bg-navy-800 hover:text-gold-400 transition-all"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                    {profile?.facebook_url && (
                      <a
                        href={profile.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                        className="w-9 h-9 sm:w-10 sm:h-10 bg-navy-50 rounded-lg flex items-center justify-center text-navy-700 hover:bg-navy-800 hover:text-gold-400 transition-all"
                      >
                        <Facebook size={18} />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="mt-6 sm:mt-8 p-3.5 sm:p-4 bg-navy-50 rounded-xl border border-navy-100">
                <div className="flex items-start gap-2.5">
                  <Info className="text-navy-500 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-navy-600 leading-relaxed">
                    Submitting this form does not automatically create a professional/client
                    engagement. A formal engagement may require separate discussion and agreement
                    on terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card p-5 sm:p-7 md:p-8">
                {submitted ? (
                  <div className="text-center py-10 sm:py-12">
                    <CheckCircle2 className="mx-auto text-teal-600 mb-3 sm:mb-4" size={44} />
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-navy-900 mb-2 sm:mb-3">
                      Message Sent!
                    </h3>
                    <p className="text-navy-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
                      Thank you for reaching out. I'll get back to you as soon as possible.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-secondary btn-sm"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-navy-900 mb-4 sm:mb-6">
                      Send a Message
                    </h2>

                    {error && (
                      <div className="flex items-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 bg-red-50 border border-red-200 rounded-lg mb-5 sm:mb-6">
                        <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                        <p className="text-xs sm:text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                          <label htmlFor="name" className="label-field">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="label-field">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                          <label htmlFor="phone" className="label-field">Phone</label>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Your phone number"
                          />
                        </div>
                        <div>
                          <label htmlFor="subject" className="label-field">Subject</label>
                          <input
                            id="subject"
                            name="subject"
                            type="text"
                            value={formData.subject}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="What is this about?"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="label-field">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          className="input-field resize-none"
                          placeholder="Tell me how I can help you..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                        <Send size={16} />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
