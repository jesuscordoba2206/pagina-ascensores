# Checklist SEO post-dominio (cuando compres dominio propio)

## 1. Cambiar URL canónica
- Edita `src/lib/seo.js` línea 1: `rawSiteUrl` → `https://tudominio.com`
- O define variable de entorno `NEXT_PUBLIC_SITE_URL=https://tudominio.com` en Vercel / `.env.production`
- `npm run build && npm run start` (o deploy en Vercel)

## 2. Google Search Console
- Añade propiedad: **URL prefix** con `https://tudominio.com/`
- Verifica (HTML tag, DNS TXT, o Google Analytics)
- Envía sitemap: `https://tudominio.com/sitemap.xml`
- Revisa **Coverage** → excluye `/dashboard/*`, `/api/*`, `/login` (ya bloqueados en robots)

## 3. Robots.txt
- Con dominio real, quita `Disallow: /` si lo agregaste temporalmente.
- Actualmente permite todo menos `/api/`, `/dashboard/` ✅

## 4. JSON-LD LocalBusiness
- En `src/lib/seo.js` → `getLocalBusinessJsonLd()`
- Añade campos opcionales cuando los tengas:
  - `url`: `https://tudominio.com`
  - `sameAs`: array con LinkedIn, Facebook, Instagram, YouTube
  - `hasMap`: URL de Google Maps del negocio
  - `priceRange`: "$$"
  - `openingHoursSpecification`: horarios de atención

## 5. Open Graph / Twitter
- Imagen OG real: sustituye `/logo-v2.png` por `/og-image.jpg` (1200x630) en `seoConfig.defaultOgImage`
- Añade `twitter:site` / `twitter:creator` si tienes cuentas

## 6. Core Web Vitals
- Lighthouse CI en CI/CD o manual `npx lighthouse https://tudominio.com --view`
- Objetivo: LCP < 2.5s, CLS < 0.1, INP < 200ms

## 7. Indexación
- Search Console → **URL Inspection** → “Request indexing” para `/`, `/servicios`, `/empresa`
- Monitor “Indexing > Pages” semanalmente

## 8. Analytics / Tag Manager (opcional)
- GA4 + Enhanced Measurement (scrolls, video_play, file_download)
- Eventos custom: `click_servicios_ascensores`, `click_servicios_escaleras`, `login_attempt`

## 9. HTTPS / Seguridad
- HSTS en `next.config.mjs`:
  ```js
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
    ]}]
  }
  ```

## 10. Internacionalización (futuro)
- Si añades inglés: `alternates.languages` en metadata + sitemap con `xhtml:link rel="alternate" hreflang`

---

### Comandos útiles post-deploy
```bash
# Verificar robots y sitemap
curl -I https://tudominio.com/robots.txt
curl -s https://tudominio.com/sitemap.xml | xmllint --format -

# Verificar redirects 308
curl -I https://tudominio.com/servicios/ascensores
curl -I https://tudominio.com/servicios/escaleras

# Lighthouse local
npx lighthouse https://tudominio.com --output=html --output-path=./lighthouse-report.html
```