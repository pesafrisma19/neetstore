import React, { useEffect } from 'react';
import { usePublicSettings } from '../../hooks/usePublicSettings';

export const SEOHead: React.FC = () => {
  const { settings } = usePublicSettings();

  useEffect(() => {
    // 1. Title
    const defaultTitle = 'NETSTORE - Top Up Game & Voucher Instant';
    const targetTitle = settings.default_meta_title || settings.site_name || defaultTitle;
    document.title = targetTitle;

    // 2. Favicon
    if (settings.favicon_url) {
      let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'shortcut icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = settings.favicon_url;
    }

    // Helper update or create meta tag
    const updateMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.content = contentVal;
    };

    // 3. Meta Description
    const metaDesc = settings.meta_description || 'Platform Top Up Game dan Voucher Murah, Aman, dan Instant 24 Jam.';
    updateMetaTag('name', 'description', metaDesc);

    // 4. OpenGraph Metadata
    updateMetaTag('property', 'og:title', targetTitle);
    updateMetaTag('property', 'og:description', metaDesc);
    if (settings.og_image_url) {
      updateMetaTag('property', 'og:image', settings.og_image_url);
    }
  }, [settings]);

  return null;
};
