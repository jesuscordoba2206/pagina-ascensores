export const MONTH_KEYS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function normalizeMonthKey(value) {
  if (!value || typeof value !== 'string') return null;

  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getMonthIndex(value) {
  return MONTH_KEYS.indexOf(normalizeMonthKey(value));
}

export function buildPublicUrl(key) {
  const base = process.env.R2_PUBLIC_URL;
  if (base) {
    return `${base.replace(/\/$/, '')}/${key}`;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET_NAME;
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
}

export function extractR2KeyFromUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const base = process.env.R2_PUBLIC_URL;
    if (base) {
      const prefix = base.replace(/\/$/, '') + '/';
      if (url.startsWith(prefix)) {
        return decodeURIComponent(url.slice(prefix.length));
      }
    }

    const parsed = new URL(url);
    const bucket = process.env.R2_BUCKET_NAME || '';
    const bucketPrefix = `/${bucket}/`;
    if (parsed.pathname.startsWith(bucketPrefix)) {
      return decodeURIComponent(parsed.pathname.slice(bucketPrefix.length));
    }

    const pathname = parsed.pathname.replace(/^\//, '');
    return pathname ? decodeURIComponent(pathname) : null;
  } catch {
    return null;
  }
}

export function getFileNameFromKey(key) {
  if (!key || typeof key !== 'string') return 'reporte.pdf';
  const clean = key.split('/').pop() || 'reporte.pdf';
  const withoutTimestamp = clean.replace(/^\d{10,}-/, '');
  return withoutTimestamp || clean;
}

export function sanitizeFileName(fileName) {
  const fallback = 'reporte.pdf';
  if (!fileName || typeof fileName !== 'string') return fallback;

  const cleaned = fileName
    .replace(/[\\/:*?"<>|\r\n]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || fallback;
}

export function buildContentDisposition(fileName) {
  const safe = sanitizeFileName(fileName).replace(/"/g, "'");
  const asciiFallback = safe
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '_');
  const encoded = encodeURIComponent(safe);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

export function getMonthOrder(report) {
  const index = getMonthIndex(report?.month);
  return index === -1 ? MONTH_KEYS.length : index;
}

export function sortReportFiles(reportFiles) {
  if (!Array.isArray(reportFiles)) return [];

  return [...reportFiles].sort((a, b) => {
    const monthDiff = getMonthOrder(a) - getMonthOrder(b);
    if (monthDiff !== 0) return monthDiff;
    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  });
}
