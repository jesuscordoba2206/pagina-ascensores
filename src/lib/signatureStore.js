'use client';

const STORAGE_KEY = 'elevators-signatures';

export function listSignatures(type) {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const signatures = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(signatures)) return [];
    return signatures.filter((entry) => entry && entry.type === type);
  } catch {
    return [];
  }
}

function writeAllSignatures(signatures) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(signatures));
}

function readAllSignatures() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const signatures = raw ? JSON.parse(raw) : [];
    return Array.isArray(signatures) ? signatures : [];
  } catch {
    return [];
  }
}

export function saveSignature(type, label, dataUrl) {
  const signatures = readAllSignatures();
  const id = `sig_${Date.now()}`;
  signatures.push({
    id,
    type,
    label: label || 'Firma sin nombre',
    dataUrl,
    createdAt: Date.now(),
  });
  writeAllSignatures(signatures);
  return id;
}

export function deleteSignature(id) {
  const signatures = readAllSignatures().filter((entry) => entry.id !== id);
  writeAllSignatures(signatures);
}
