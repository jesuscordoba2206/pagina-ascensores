import PDFDocument from 'pdfkit';
import { readFile } from 'fs/promises';
import path from 'path';
import { requireEnterpriseRole } from '@/lib/auth';
import { REPORT_COMPANY_CONFIG } from '@/lib/reportConfig';

function drawCheckbox(doc, x, y, checked) {
  doc.rect(x, y, 9, 9).stroke('#111827');
  if (checked) {
    doc.moveTo(x + 1.5, y + 5).lineTo(x + 4, y + 8).lineTo(x + 8, y + 1.5).stroke('#111827');
  }
}

function drawField(doc, label, value, x, y, width) {
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827').text(`${label}:`, x, y, { width: 80 });
  doc.font('Helvetica').text(value || ' ', x + 52, y, {
    width: width - 52,
    underline: true,
  });
}

function ensureSpace(doc, neededHeight) {
  if (doc.y + neededHeight > doc.page.height - 50) {
    doc.addPage();
  }
}

function drawChecklistSection(doc, title, items) {
  ensureSpace(doc, 140);
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(title.toUpperCase(), 40, doc.y, {
    width: 515,
  });
  doc.moveDown(0.5);

  const topY = doc.y;
  const columnWidth = 170;
  const rowHeight = 12;

  items.forEach((item, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = 40 + column * columnWidth;
    const y = topY + row * rowHeight;

    drawCheckbox(doc, x, y + 2, item.checked);
    doc.font('Helvetica').fontSize(8.5).fillColor('#111827').text(item.label, x + 14, y, {
      width: columnWidth - 16,
      lineBreak: false,
    });
  });

  doc.y = topY + Math.ceil(items.length / 3) * rowHeight + 8;
}

async function loadCompanyLogoBuffer() {
  const relativePath = REPORT_COMPANY_CONFIG.logoUrl?.startsWith('/')
    ? REPORT_COMPANY_CONFIG.logoUrl.slice(1)
    : REPORT_COMPANY_CONFIG.logoUrl;

  if (!relativePath) return null;

  const logoPath = path.join(process.cwd(), 'public', relativePath);

  try {
    return await readFile(logoPath);
  } catch {
    return null;
  }
}

function imageBufferFromDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null;

  const match = dataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/);
  return match ? Buffer.from(match[2], 'base64') : null;
}

export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { clienteId, monthLabel, report } = body || {};

    if (!clienteId || !report) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const doc = new PDFDocument({ size: 'LETTER', margin: 40 });
    const chunks = [];
    const logoBuffer = await loadCompanyLogoBuffer();

    doc.on('data', (chunk) => chunks.push(chunk));

    doc.rect(40, 40, 532, 75).stroke('#111827');

    doc.rect(48, 48, 58, 58).stroke('#111827');
    if (logoBuffer) {
      doc.image(logoBuffer, 52, 52, {
        fit: [50, 50],
        align: 'center',
        valign: 'center',
      });
    } else {
      doc.font('Helvetica-Bold').fontSize(9).text('LOGO', 72, 76, { align: 'center' });
    }

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('REPORTE MENSUAL DE', 120, 46, { width: 200 });
    doc.text('MANTENIMIENTO PREVENTIVO.', 120, 58, { width: 200 });

    doc.font('Helvetica-Bold').fontSize(10).text(REPORT_COMPANY_CONFIG.nombreEmpresa, 335, 44, { width: 205, align: 'right' });
    doc.font('Helvetica').fontSize(9).text(REPORT_COMPANY_CONFIG.email, 335, 58, { width: 205, align: 'right' });
    doc.text(REPORT_COMPANY_CONFIG.telefonos, 335, 70, { width: 205, align: 'right' });
    doc.text(`NIT: ${REPORT_COMPANY_CONFIG.nit}`, 335, 82, { width: 205, align: 'right' });

    doc.y = 126;
    drawField(doc, 'Cliente', report.cliente, 40, 126, 250);
    drawField(doc, 'Dirección', report.direccion, 305, 126, 250);
    doc.y = 140;
    drawField(doc, 'Fecha', report.fecha, 40, 140, 250);
    drawField(doc, 'Ciudad', report.ciudad, 305, 140, 250);
    doc.y = 154;
    drawField(doc, 'Equipo', report.equipoCodigo, 40, 154, 250);
    drawField(doc, 'Mes', monthLabel || report.mes, 305, 154, 250);
    doc.y = 172;

    const baseY = doc.y;

    doc.font('Helvetica-Bold').fontSize(9).text('Equipo:', 40, baseY);
    drawCheckbox(doc, 92, baseY, report.equipoAscensor);
    doc.font('Helvetica').fontSize(9).text('Ascensor', 106, baseY - 1);
    drawCheckbox(doc, 176, baseY, report.equipoEscaleraPuerta);
    doc.text('Escalera/Puerta', 190, baseY - 1);

    doc.font('Helvetica-Bold').fontSize(9).text('Tipo de servicio:', 305, baseY);
    drawCheckbox(doc, 390, baseY + 3, report.tipoServicio?.preventivo);
    doc.font('Helvetica').fontSize(8.5).text('Mantenimiento Preventivo', 404, baseY + 2);
    drawCheckbox(doc, 390, baseY + 16, report.tipoServicio?.correctivo);
    doc.text('Correctivo', 404, baseY + 15);
    drawCheckbox(doc, 390, baseY + 29, report.tipoServicio?.inspeccion);
    doc.text('Visita Inspección', 404, baseY + 28);

    doc.y = baseY + 40;

    drawChecklistSection(doc, 'Sección Ascensor', report.secciones?.ascensor || []);
    drawChecklistSection(doc, 'Sección Escalera Eléctrica', report.secciones?.escalera || []);
    drawChecklistSection(doc, 'Sección Puerta Eléctrica', report.secciones?.puerta || []);

    ensureSpace(doc, 90);
    doc.font('Helvetica-Bold').fontSize(10).text('OBSERVACIONES', 40, doc.y, { width: 515 });
    doc.rect(40, doc.y + 6, 515, 46).stroke('#111827');
    doc.font('Helvetica').fontSize(9).text(report.observaciones || '', 48, doc.y + 12, { width: 500 });

    const signatureY = doc.y + 60;
    doc.moveTo(65, signatureY).lineTo(245, signatureY).stroke('#111827');
    doc.moveTo(350, signatureY).lineTo(530, signatureY).stroke('#111827');
    doc.font('Helvetica-Bold').fontSize(9).text('Firma ELEVATORS COMPANY', 78, signatureY + 6, { width: 160, align: 'center' });
    doc.text('Firma CLIENTE', 365, signatureY + 6, { width: 150, align: 'center' });

    const pdfBufferPromise = new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const companySignature = imageBufferFromDataUrl(report.firmaEmpresa);
    const clientSignature = imageBufferFromDataUrl(report.firmaCliente);

    if (companySignature) {
      doc.image(companySignature, 65, signatureY - 28, { fit: [180, 26], align: 'center', valign: 'center' });
    }
    if (clientSignature) {
      doc.image(clientSignature, 350, signatureY - 28, { fit: [180, 26], align: 'center', valign: 'center' });
    }

    doc.end();

    const pdfBuffer = await pdfBufferPromise;

    const safeClient = String(report.cliente || 'cliente').trim().toLowerCase().replace(/\s+/g, '-');
    const safeCode = String(report.equipoCodigo || 'equipo').trim().toLowerCase().replace(/\s+/g, '-');
    const safeMonth = String(monthLabel || report.mes || 'mes').trim().toLowerCase().replace(/\s+/g, '-');

    return new Response(JSON.stringify({
      fileName: `reporte-${safeClient}-${safeCode}-${safeMonth}.pdf`,
      base64: pdfBuffer.toString('base64'),
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
