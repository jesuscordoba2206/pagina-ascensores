const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pagina-ascensores.vercel.app';

export const seoConfig = {
  siteName: 'Elevators ITV',
  siteUrl: rawSiteUrl.replace(/\/$/, ''),
  defaultTitle: 'Elevators ITV | Ingenieria en Transporte Vertical en Colombia',
  defaultDescription:
    'Expertos en ascensores y escaleras electricas en Colombia. Instalacion, mantenimiento preventivo, modernizacion y soporte tecnico 24/7 para transporte vertical.',
  defaultKeywords: [
    'ascensores Colombia',
    'escaleras electricas Colombia',
    'transporte vertical',
    'mantenimiento de ascensores',
    'instalacion de ascensores',
    'modernizacion de ascensores',
    'certificacion NTC 5926',
    'servicio tecnico ascensores',
  ],
  defaultOgImage: '/logo-v2.png',
  company: {
    name: 'Elevators ITV',
    legalName: 'Elevators Ingenieria en Transporte Vertical',
    email: 'elevatorscompanyantioquia@gmail.com',
    phone: '+57 310 575 1970',
    alternatePhone: '+57 320 205 1034',
    addressRegion: 'Antioquia',
    addressCountry: 'CO',
    areaServed: 'Colombia',
  },
};

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, seoConfig.siteUrl).toString();
}

export function buildPageMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  noIndex = false,
}) {
  const mergedKeywords = Array.from(new Set([...seoConfig.defaultKeywords, ...keywords]));

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: path,
      languages: {
        'es-CO': path,
        es: path,
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: seoConfig.siteName,
      locale: 'es_CO',
      type: 'website',
      images: [
        {
          url: seoConfig.defaultOgImage,
          width: 1200,
          height: 630,
          alt: `${seoConfig.siteName} - Transporte vertical en Colombia`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [seoConfig.defaultOgImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
        },
  };
}

export function getLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': absoluteUrl('/#localbusiness'),
    name: seoConfig.company.name,
    legalName: seoConfig.company.legalName,
    description: seoConfig.defaultDescription,
    email: seoConfig.company.email,
    telephone: seoConfig.company.phone,
    areaServed: seoConfig.company.areaServed,
    address: {
      '@type': 'PostalAddress',
      addressRegion: seoConfig.company.addressRegion,
      addressCountry: seoConfig.company.addressCountry,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: seoConfig.company.phone,
        contactType: 'customer service',
        areaServed: 'CO',
        availableLanguage: ['es'],
      },
      {
        '@type': 'ContactPoint',
        telephone: seoConfig.company.alternatePhone,
        contactType: 'customer service',
        areaServed: 'CO',
        availableLanguage: ['es'],
      },
    ],
    serviceType: [
      'Mantenimiento de ascensores',
      'Instalacion de ascensores',
      'Modernizacion de ascensores',
      'Mantenimiento de escaleras electricas',
    ],
  };
}

export function getBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
