import fs from 'fs';
import path from 'path';
import { requireEnterpriseRole } from '@/lib/auth';

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function sanitizeCategory(category) {
  const normalized = String(category || 'reports').trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

  if (!normalized || normalized.includes('..') || normalized.startsWith('/')) {
    return null;
  }

  if (!/^[a-zA-Z0-9/_-]+$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get('file');
  const category = sanitizeCategory(formData.get('category'));

  if (!file || !(file instanceof File)) {
    return new Response(JSON.stringify({ error: 'Missing file upload' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!category) {
    return new Response(JSON.stringify({ error: 'Invalid category' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const filename = sanitizeFileName(file.name || `upload-${Date.now()}`);
  const uploadsPath = path.join(process.cwd(), 'public', 'uploads', category);
  await fs.promises.mkdir(uploadsPath, { recursive: true });
  const filePath = path.join(uploadsPath, filename);

  const arrayBuffer = await file.arrayBuffer();
  await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer));

  const url = `/uploads/${category}/${encodeURIComponent(filename)}`;
  return new Response(JSON.stringify({ url }), { status: 201, headers: { 'Content-Type': 'application/json' } });
}
