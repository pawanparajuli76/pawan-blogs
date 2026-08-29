import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEO({ title, description, image, url }: SEOProps) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | Pawan Parajuli, Chartered Accountant`
      : 'Pawan Parajuli | Chartered Accountant';

    const desc = description || 'Tax, Accounting & Business Insights in Nepal. Helping individuals, businesses and entrepreneurs understand taxation, accounting, compliance and financial matters.';

    document.title = fullTitle;

    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('description', desc);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);

    if (image) {
      setMeta('og:image', image, 'property');
      setMeta('twitter:image', image);
    }

    if (url) {
      setMeta('og:url', url, 'property');
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', url);
      } else {
        const link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', url);
        document.head.appendChild(link);
      }
    }
  }, [title, description, image, url]);

  return null;
}
