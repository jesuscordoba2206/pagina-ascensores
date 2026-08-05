import { seoConfig } from '@/lib/seo';

export default function sitemap() {
  const lastModified = new Date();

  return [
    {
      url: `${seoConfig.siteUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${seoConfig.siteUrl}/servicios`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${seoConfig.siteUrl}/empresa`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
