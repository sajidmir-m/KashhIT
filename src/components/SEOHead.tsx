import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

/**
 * SEO Head Component for dynamic meta tags
 * Updates document head with SEO-optimized meta tags based on current route
 */
export const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  ogImage = '/logo.png',
  canonical 
}: SEOHeadProps) => {
  const location = useLocation();
  const baseUrl = 'https://www.kasshit.in';
  const currentUrl = `${baseUrl}${location.pathname}`;
  const finalTitle = title || 'Kasshit - Fast Grocery Delivery | Quick Commerce India';
  const finalDescription = description || 'Get fresh groceries, daily essentials, and household products delivered in minutes. India\'s trusted quick commerce platform.';
  const finalKeywords = keywords || 'quick commerce, grocery delivery, online grocery, fast delivery, daily essentials, household products, fresh groceries, India';

  useEffect(() => {
    // Update title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('author', 'Kasshit');

    // Open Graph tags
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:image', `${baseUrl}${ogImage}`, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:site_name', 'Kasshit', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', `${baseUrl}${ogImage}`);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical || currentUrl);

  }, [finalTitle, finalDescription, finalKeywords, ogImage, canonical, currentUrl]);

  return null;
};

