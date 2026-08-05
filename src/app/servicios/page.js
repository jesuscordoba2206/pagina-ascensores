import JsonLd from '@/components/JsonLd';
import ServiciosPageClient from '@/components/ServiciosPageClient';
import { buildPageMetadata, getBreadcrumbJsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Servicios de Ascensores y Escaleras Electricas en Colombia',
  description:
    'Mantenimiento preventivo, instalacion, modernizacion y soporte tecnico 24/7 para ascensores y escaleras electricas en Colombia. Cumplimiento NTC y estandares ONAC.',
  path: '/servicios',
  keywords: [
    'servicios de ascensores',
    'servicios de escaleras electricas',
    'mantenimiento preventivo ascensores Colombia',
    'instalacion de escaleras electricas',
    'soporte tecnico 24/7 ascensores',
  ],
});

const breadcrumbJsonLd = getBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Servicios', path: '/servicios' },
]);

export default function ServiciosPage() {
  return (
    <>
      <JsonLd id="breadcrumbs-servicios-jsonld" data={breadcrumbJsonLd} />
      <ServiciosPageClient />
    </>
  );
}
