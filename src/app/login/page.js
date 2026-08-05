import LoginPageClient from '@/components/LoginPageClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Acceso Clientes | Portal de Gestion Elevators ITV',
  description:
    'Acceso privado para clientes y empresas de Elevators ITV. Consulta reportes tecnicos, fichas y estados de mantenimiento de transporte vertical.',
  path: '/login',
  noIndex: true,
  keywords: ['acceso clientes ascensores', 'portal de gestion transporte vertical'],
});

export default function LoginPage() {
  return <LoginPageClient />;
}
