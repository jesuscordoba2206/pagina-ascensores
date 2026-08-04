/** @type {import('next').NextConfig} */
const nextConfig = {
  // '@aws-sdk/client-s3' y '@smithy/node-http-handler' deben quedar fuera del
  // bundling de Next.js: al empaquetarlos, el manejo interno de TLS/HTTP del
  // SDK se rompe y produce "EPROTO ... ssl alert handshake failure" al subir
  // archivos a Cloudflare R2.
  serverExternalPackages: [
    'pdfkit',
    'fontkit',
    '@aws-sdk/client-s3',
    '@smithy/node-http-handler',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
};

export default nextConfig;
