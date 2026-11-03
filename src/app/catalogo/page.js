import { buildPageMetadata } from '@/lib/seo';
import CatalogoViewerClient from './CatalogoViewerClient';

export const metadata = buildPageMetadata({
  title: 'Catalogo ITV',
  description:
    'Consulte el catalogo de Elevators ITV con visualizacion completa del PDF y opcion de descarga.',
  path: '/catalogo',
  keywords: ['catalogo ascensores', 'catalogo Elevators ITV', 'PDF catalogo'],
  noIndex: true,
});

export default function CatalogoPage() {
  return <CatalogoViewerClient />;
}
