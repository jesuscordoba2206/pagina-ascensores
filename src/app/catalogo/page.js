import { buildPageMetadata } from '@/lib/seo';
import { headers } from 'next/headers';
import { createCatalogAccessToken } from '@/lib/catalogAccess';
import CatalogoViewerClient from './CatalogoViewerClient';

export const metadata = buildPageMetadata({
  title: 'Catalogo ITV',
  description:
    'Consulte el catalogo de Elevators ITV con visualizacion completa del PDF y opcion de descarga.',
  path: '/catalogo',
  keywords: ['catalogo ascensores', 'catalogo Elevators ITV', 'PDF catalogo'],
  noIndex: true,
});

export default async function CatalogoPage() {
  await headers();
  const accessToken = createCatalogAccessToken();
  return <CatalogoViewerClient accessToken={accessToken} />;
}
