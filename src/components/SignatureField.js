'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import SignaturePad from 'signature_pad';
import { listSignatures, saveSignature, deleteSignature } from '@/lib/signatureStore';

const MAX_FILE_SIZE = 500 * 1024;

function resizeSignatureImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const maxWidth = 800;
      const maxHeight = 300;
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error('No se pudo leer la imagen de firma.'));
    image.src = dataUrl;
  });
}

export default function SignatureField({ label, value, onChange, saveType = '', readOnly = false }) {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const fileInputRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [isReady, setIsReady] = useState(false);
  const [savedSignatures, setSavedSignatures] = useState(() => (typeof window !== 'undefined' && saveType ? listSignatures(saveType) : []));
  const [galleryOpen, setGalleryOpen] = useState(false);

  const refreshSaved = () => {
    if (typeof window !== 'undefined' && saveType) {
      setSavedSignatures(listSignatures(saveType));
    }
  };

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || readOnly) return undefined;

    const signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(17, 24, 39)',
      minWidth: 0.8,
      maxWidth: 2.2,
    });
    signaturePadRef.current = signaturePad;

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const previousSignature = signaturePad.isEmpty() ? '' : signaturePad.toDataURL('image/png');
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = 150 * ratio;
      canvas.getContext('2d').scale(ratio, ratio);
      signaturePad.clear();
      if (previousSignature) signaturePad.fromDataURL(previousSignature);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    signaturePad.addEventListener('endStroke', () => onChangeRef.current(signaturePad.toDataURL('image/png')));
    setIsReady(true);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      signaturePad.off();
      signaturePadRef.current = null;
      setIsReady(false);
    };
  }, [readOnly]);

  useEffect(() => {
    const signaturePad = signaturePadRef.current;
    if (!signaturePad || !isReady) return;

    signaturePad.clear();
    if (value) signaturePad.fromDataURL(value);
  }, [value, isReady]);

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    onChange('');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Selecciona una imagen PNG o JPG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('La imagen de firma debe pesar máximo 500 KB.');
      return;
    }

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
        reader.readAsDataURL(file);
      });
      onChange(await resizeSignatureImage(dataUrl));
    } catch (err) {
      alert(`No se pudo cargar la firma: ${err.message}`);
    }
  };

  const handleSaveSignature = () => {
    if (!value) {
      alert('Primero dibuja o sube una firma.');
      return;
    }
    const name = window.prompt('Nombre para esta firma (ej. cliente / edificio):', '');
    if (name === null) return; // cancelado
    if (!name.trim()) {
      alert('El nombre no puede estar vacío.');
      return;
    }
    saveSignature(saveType, name.trim(), value);
    refreshSaved();
    alert('Firma guardada correctamente.');
  };

  const handleDeleteSignature = (id) => {
    if (!window.confirm('¿Eliminar esta firma guardada?')) return;
    deleteSignature(id);
    refreshSaved();
  };

  const handleSelectSaved = (dataUrl) => {
    onChange(dataUrl);
    setGalleryOpen(false);
  };

  if (readOnly) {
    return (
      <div className="pt-3 text-center">
        {value ? <Image src={value} alt={label} width={240} height={96} unoptimized className="mx-auto h-24 max-w-full object-contain" /> : <div className="h-24" />}
        <div className="border-t border-zinc-400 pt-2 text-sm font-semibold">{label}</div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-700">{label}</p>
      <canvas
        ref={canvasRef}
        className="mt-2 h-[150px] w-full touch-none rounded-xl border border-dashed border-zinc-400 bg-white"
        aria-label={`Área para ${label.toLowerCase()}`}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={clearSignature} className="rounded-lg border border-zinc-400 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100">
          Limpiar
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-500/20">
          Subir imagen
        </button>
        {saveType && (
          <button type="button" onClick={handleSaveSignature} className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20">
            💾 Guardar firma
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleImageUpload} className="hidden" />
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">Dibuja con mouse o dedo, o sube PNG/JPG de máximo 500 KB.</p>

      {saveType && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setGalleryOpen((open) => !open)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            Mis firmas guardadas ({savedSignatures.length})
          </button>
          {galleryOpen && (
            <div className="mt-2 rounded-xl border border-zinc-300 bg-white p-2">
              {savedSignatures.length === 0 ? (
                <p className="p-2 text-xs text-zinc-500">Aún no hay firmas guardadas para este campo.</p>
              ) : (
                <ul className="space-y-1">
                  {savedSignatures.map((entry) => (
                    <li key={entry.id} className="flex items-center gap-2 rounded-lg border border-zinc-200 p-1.5">
                      <button type="button" onClick={() => handleSelectSaved(entry.dataUrl)} className="flex flex-1 items-center gap-2 text-left">
                        <Image src={entry.dataUrl} alt={entry.label} width={60} height={36} unoptimized className="h-9 w-16 border border-zinc-200 object-contain" />
                        <span className="text-xs font-medium text-zinc-700">{entry.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSignature(entry.id)}
                        className="rounded-lg border border-rose-400/40 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        title="Eliminar firma"
                      >
                        🗑
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}