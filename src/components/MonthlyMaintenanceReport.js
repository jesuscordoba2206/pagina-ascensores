'use client';

import Image from 'next/image';
import { REPORT_COMPANY_CONFIG } from '@/lib/reportConfig';
import SignatureField from '@/components/SignatureField';

function Checkbox({ checked, onChange, readOnly = false }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={readOnly ? undefined : onChange}
      readOnly={readOnly}
      className="h-4 w-4 rounded border-zinc-400 text-cyan-500"
    />
  );
}

function SectionChecklist({ title, items, onToggle, readOnly = false }) {
  const columns = [items.filter((_, index) => index % 3 === 0), items.filter((_, index) => index % 3 === 1), items.filter((_, index) => index % 3 === 2)];

  return (
    <section className="rounded-2xl border border-zinc-300 bg-white p-4 text-black">
      <h3 className="mb-3 border-b border-zinc-300 pb-2 text-sm font-bold uppercase tracking-[0.18em]">{title}</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-2">
            {column.map((item) => {
              const originalIndex = items.findIndex((entry) => entry.label === item.label);
              return (
                <label key={`${title}-${item.label}`} className="flex items-start gap-2 text-[11px] leading-4">
                  <Checkbox checked={item.checked} onChange={() => onToggle(originalIndex)} readOnly={readOnly} />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MonthlyMaintenanceReport({ draft, onChange, readOnly = false }) {
  const updateField = (field, value) => onChange?.({ ...draft, [field]: value });
  const updateService = (field, value) => onChange?.({ ...draft, tipoServicio: { ...draft.tipoServicio, [field]: value } });
  const updateSection = (section, index) => {
    const nextItems = draft.secciones[section].map((item, itemIndex) => itemIndex === index ? { ...item, checked: !item.checked } : item);
    onChange?.({ ...draft, secciones: { ...draft.secciones, [section]: nextItems } });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 bg-white p-4 text-black md:p-6">
      <div className="rounded-2xl border border-zinc-300 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <Image src={REPORT_COMPANY_CONFIG.logoUrl} alt="Logo empresa" width={120} height={72} preload style={{ width: '120px', height: 'auto' }} />
            <div className="text-xs leading-5">
              <p className="text-sm font-bold uppercase">{REPORT_COMPANY_CONFIG.nombreEmpresa}</p>
              <p>{REPORT_COMPANY_CONFIG.email}</p>
              <p>{REPORT_COMPANY_CONFIG.telefonos}</p>
              <p>NIT: {REPORT_COMPANY_CONFIG.nit}</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <h1 className="text-lg font-extrabold uppercase leading-tight">Reporte mensual de mantenimiento preventivo.</h1>
            {draft.mes ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-600">Mes: {draft.mes}</p> : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-300 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['Cliente', 'cliente'],
            ['Dirección', 'direccion'],
            ['Fecha', 'fecha'],
            ['Ciudad', 'ciudad'],
            ['Equipo código', 'equipoCodigo'],
          ].map(([label, key]) => (
            <label key={key} className="block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-700">
              {label}
              <input
                type={key === 'fecha' ? 'date' : 'text'}
                value={draft[key] ?? ''}
                onChange={(event) => updateField(key, event.target.value)}
                readOnly={readOnly}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal tracking-normal text-black"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-700">Equipo</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox checked={Boolean(draft.equipoAscensor)} onChange={() => updateField('equipoAscensor', !draft.equipoAscensor)} readOnly={readOnly} /> Ascensor
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={Boolean(draft.equipoEscaleraPuerta)} onChange={() => updateField('equipoEscaleraPuerta', !draft.equipoEscaleraPuerta)} readOnly={readOnly} /> Escalera/Puerta
              </label>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-700">Tipo de servicio</p>
            <div className="mt-2 flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox checked={draft.tipoServicio.preventivo} onChange={() => updateService('preventivo', !draft.tipoServicio.preventivo)} readOnly={readOnly} /> Mantenimiento Preventivo
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={draft.tipoServicio.correctivo} onChange={() => updateService('correctivo', !draft.tipoServicio.correctivo)} readOnly={readOnly} /> Correctivo
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={draft.tipoServicio.inspeccion} onChange={() => updateService('inspeccion', !draft.tipoServicio.inspeccion)} readOnly={readOnly} /> Visita Inspección
              </label>
            </div>
          </div>
        </div>
      </div>

      <SectionChecklist title="Sección ascensor" items={draft.secciones.ascensor} onToggle={(index) => updateSection('ascensor', index)} readOnly={readOnly} />
      <SectionChecklist title="Sección escalera eléctrica" items={draft.secciones.escalera} onToggle={(index) => updateSection('escalera', index)} readOnly={readOnly} />
      <SectionChecklist title="Sección puerta eléctrica" items={draft.secciones.puerta} onToggle={(index) => updateSection('puerta', index)} readOnly={readOnly} />

      <div className="rounded-2xl border border-zinc-300 p-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-700">
          Observaciones
          <textarea
            rows={5}
            value={draft.observaciones}
            onChange={(event) => updateField('observaciones', event.target.value)}
            readOnly={readOnly}
            className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal tracking-normal text-black"
          />
        </label>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <SignatureField
            label={`Firma ${REPORT_COMPANY_CONFIG.nombreEmpresa}`}
            value={draft.firmaEmpresa}
            onChange={(value) => updateField('firmaEmpresa', value)}
            saveType="empresa"
            readOnly={readOnly}
          />
          <SignatureField
            label="Firma Cliente"
            value={draft.firmaCliente}
            onChange={(value) => updateField('firmaCliente', value)}
            saveType="cliente"
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
}
