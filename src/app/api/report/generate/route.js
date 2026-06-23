import PDFDocument from 'pdfkit';
import { requireEnterpriseRole } from '@/lib/auth';

export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const { title, building, date, checklist = '', clienteId } = body || {};
  if (!title || !building || !date || !clienteId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => {});

  doc.fontSize(22).fillColor('#00D0FF').text(`Reporte de mantenimiento`, { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor('#FFFFFF').text(`Edificio / Cliente: ${title}`);
  doc.text(`Fecha: ${new Date(date).toLocaleDateString('es-CL')}`);
  doc.moveDown(1);
  doc.fontSize(12).fillColor('#D1D5DB').text(`Checklist de mantenimiento`, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#E5E7EB').text(checklist || 'No se han registrado observaciones.', {
    lineGap: 5,
  });
  doc.moveDown(1.5);
  doc.fontSize(12).fillColor('#ADF7FF').text('Resumen de estado', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#E5E7EB').text('Se recomienda revisar los cables, el control eléctrico y las puertas de la cabina.');

  doc.end();

  const pdfBuffer = Buffer.concat(chunks);
  const base64 = pdfBuffer.toString('base64');
  const url = `data:application/pdf;base64,${base64}`;

  return new Response(JSON.stringify({ url }), { status: 201, headers: { 'Content-Type': 'application/json' } });
}
