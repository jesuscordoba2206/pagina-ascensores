import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import { getLocalBusinessJsonLd, seoConfig } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const localBusinessJsonLd = getLocalBusinessJsonLd();

export const metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: "%s | Elevators ITV",
  },
  description: seoConfig.defaultDescription,
  keywords: seoConfig.defaultKeywords,
  applicationName: "Elevators ITV",
  authors: [{ name: "Elevators ITV" }],
  creator: "Elevators ITV",
  publisher: "Elevators ITV",
  alternates: {
    canonical: "/",
    languages: {
      "es-CO": "/",
      es: "/",
    },
  },
  openGraph: {
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: "/",
    siteName: seoConfig.siteName,
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: seoConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: "Elevators ITV - Servicios de transporte vertical en Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [seoConfig.defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd id="localbusiness-jsonld" data={localBusinessJsonLd} />
        <div className="pt-24 md:pt-28 w-full">{children}</div>
      </body>
    </html>
  );
}
