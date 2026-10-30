"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Download, FileText, Globe, Search, Trash2, Upload, Users, X } from 'lucide-react';

const SCOPE_GLOBAL = 'GLOBAL';
const SCOPE_SPECIFIC = 'SPECIFIC';

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Sin dato';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return '';
  }
}

function normalizeClientList(clients) {
  if (!Array.isArray(clients)) return [];
  return clients
    .filter((client) => client?.id)
    .map((client) => ({
      id: client.id,
      name: client.name || 'Cliente sin nombre',
      email: client.email || '',
    }));
}

export default function IvtPdfAdminPanel({ clients = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [files, setFiles] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [fileSettings, setFileSettings] = useState({});
  const [uploadClientQuery, setUploadClientQuery] = useState('');
  const [manageClientQueries, setManageClientQueries] = useState({});

  const closeTimerRef = useRef(null);
  const clientOptions = useMemo(() => normalizeClientList(clients), [clients]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event) {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  async function loadFiles() {
    setLoadingFiles(true);
    setError('');
    try {
      const response = await fetch('/api/itv-pdf');
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || `Error HTTP ${response.status}`);
      }

      const nextFiles = Array.isArray(payload?.files) ? payload.files : [];
      setFiles(nextFiles);
      setFileSettings(
        nextFiles.reduce((acc, file) => {
          acc[file.id] = {
            scope: file.scope === SCOPE_SPECIFIC ? SCOPE_SPECIFIC : SCOPE_GLOBAL,
            allowedUserIds: Array.isArray(file.allowedUserIds) ? file.allowedUserIds : [],
          };
          return acc;
        }, {})
      );
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los archivos ITV.');
    } finally {
      setLoadingFiles(false);
    }
  }

  function handleOpenModal() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setIsOpen(true);
    setIsModalVisible(false);
    setActiveTab('upload');
    void loadFiles();
    requestAnimationFrame(() => setIsModalVisible(true));
  }

  function handleCloseModal() {
    setIsModalVisible(false);
    setUploadClientQuery('');
    setManageClientQueries({});

    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 180);
  }

  function handleSelectFiles(event) {
    const selected = Array.from(event.target.files || []).filter((file) =>
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    if (selected.length === 0) {
      event.target.value = '';
      return;
    }

    setDrafts((prev) => [
      ...prev,
      ...selected.map((file) => ({
        localId: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        scope: SCOPE_GLOBAL,
        allowedUserIds: [],
      })),
    ]);

    event.target.value = '';
  }

  function updateDraft(localId, patch) {
    setDrafts((prev) => prev.map((draft) => (draft.localId === localId ? { ...draft, ...patch } : draft)));
  }

  function removeDraft(localId) {
    setDrafts((prev) => prev.filter((draft) => draft.localId !== localId));
  }

  function toggleUserId(targetIds, userId) {
    if (targetIds.includes(userId)) {
      return targetIds.filter((currentId) => currentId !== userId);
    }
    return [...targetIds, userId];
  }

  async function handleUploadDrafts() {
    if (drafts.length === 0) {
      alert('Selecciona uno o más archivos PDF antes de subir.');
      return;
    }

    for (const draft of drafts) {
      if (draft.scope === SCOPE_SPECIFIC && draft.allowedUserIds.length === 0) {
        alert(`El archivo "${draft.file.name}" requiere al menos un cliente en alcance específico.`);
        return;
      }
    }

    setIsUploading(true);
    try {
      for (const draft of drafts) {
        const formData = new FormData();
        formData.append('file', draft.file, draft.file.name);
        formData.append('scope', draft.scope);
        formData.append('allowedUserIds', JSON.stringify(draft.allowedUserIds));

        const response = await fetch('/api/itv-pdf', {
          method: 'POST',
          body: formData,
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || `Error HTTP ${response.status}`);
        }
      }

      setDrafts([]);
      await loadFiles();
      setActiveTab('manage');
      alert('✅ Archivos PDF ITV subidos correctamente.');
    } catch (err) {
      alert(`❌ No se pudieron subir los archivos:
${err.message}`);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleUpdateScope(fileId) {
    const settings = fileSettings[fileId];
    if (!settings) return;

    if (settings.scope === SCOPE_SPECIFIC && settings.allowedUserIds.length === 0) {
      alert('Selecciona al menos un cliente para alcance específico.');
      return;
    }

    setUpdatingId(fileId);
    try {
      const response = await fetch('/api/itv-pdf', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: fileId,
          scope: settings.scope,
          allowedUserIds: settings.allowedUserIds,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || `Error HTTP ${response.status}`);
      }

      await loadFiles();
    } catch (err) {
      alert(`❌ No se pudo actualizar el alcance:
${err.message}`);
    } finally {
      setUpdatingId('');
    }
  }

  async function handleDeleteFile(fileId, fileName) {
    if (!window.confirm(`¿Eliminar "${fileName}"?
Esta acción no se puede deshacer.`)) return;

    setDeletingId(fileId);
    try {
      const response = await fetch(`/api/itv-pdf?id=${encodeURIComponent(fileId)}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || `Error HTTP ${response.status}`);
      }

      await loadFiles();
    } catch (err) {
      alert(`❌ No se pudo eliminar el archivo:
${err.message}`);
    } finally {
      setDeletingId('');
    }
  }

  function renderClientCheckboxes({ selectedUserIds, onToggle, query, onQueryChange, queryPlaceholder }) {
    if (clientOptions.length === 0) {
      return (
        <p className="rounded-xl border border-dashed border-zinc-800 px-3 py-4 text-center text-xs text-zinc-500">
          No hay clientes registrados para asignar.
        </p>
      );
    }

    const normalizedQuery = String(query || '').trim().toLowerCase();
    const filteredClients = normalizedQuery
      ? clientOptions.filter((client) =>
        [client.name, client.email].some((value) => String(value || '').toLowerCase().includes(normalizedQuery))
      )
      : clientOptions;

    return (
      <div className="mt-2 space-y-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={queryPlaceholder || 'Buscar cliente por nombre o email'}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-2 pr-3 pl-8 text-xs text-zinc-100 outline-none transition focus:border-cyan-500/60"
          />
        </label>

        <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/60 p-2">
          {filteredClients.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-4 text-center text-xs text-zinc-500">
              No hay coincidencias para esa búsqueda.
            </p>
          ) : (
            filteredClients.map((client) => {
              const checked = selectedUserIds.includes(client.id);
              return (
                <label
                  key={client.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition ${
                    checked
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(client.id)}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 accent-cyan-400"
                  />
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                      checked
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                        : 'border-zinc-700 bg-zinc-900 text-transparent'
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-zinc-100">{client.name}</span>
                    <span className="block truncate text-[10px] text-zinc-400">{client.email}</span>
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
      >
        <FileText className="h-4 w-4" />
        Archivos PDF ITV
      </button>

      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm transition-opacity duration-200 ${isModalVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute inset-0" onClick={handleCloseModal} aria-hidden="true" />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Gestión de Archivos PDF ITV"
            className={`relative z-10 w-full max-w-5xl rounded-[2rem] border border-zinc-700/70 bg-zinc-950/95 shadow-2xl transition-all duration-200 ${isModalVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.98] opacity-0'}`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-6 py-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-400">Gestión Empresa</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Archivos PDF ITV</h3>
                <p className="mt-1 text-xs text-zinc-400">Sube, asigna alcance, descarga y elimina archivos en un solo lugar.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full border border-zinc-700 p-2 text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200"
                title="Cerrar"
                aria-label="Cerrar ventana de Archivos PDF ITV"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[78vh] overflow-y-auto p-6">
              <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/45 p-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    activeTab === 'upload'
                      ? 'bg-cyan-500 text-zinc-950'
                      : 'border border-zinc-700 bg-zinc-950/70 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100'
                  }`}
                >
                  Subir archivos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('manage')}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    activeTab === 'manage'
                      ? 'bg-cyan-500 text-zinc-950'
                      : 'border border-zinc-700 bg-zinc-950/70 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100'
                  }`}
                >
                  Gestionar existentes
                </button>
              </div>

              {activeTab === 'upload' && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Subida múltiple</p>
                  <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-cyan-500/40 hover:text-cyan-200">
                    <Upload className="h-4 w-4" />
                    Seleccionar PDFs
                    <input type="file" accept="application/pdf" multiple onChange={handleSelectFiles} className="hidden" />
                  </label>

                  {drafts.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {drafts.map((draft) => (
                        <div key={draft.localId} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-zinc-100" title={draft.file.name}>{draft.file.name}</p>
                              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">{formatBytes(draft.file.size)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDraft(draft.localId)}
                              className="rounded-xl border border-zinc-700 p-1.5 text-zinc-400 transition hover:border-rose-500/50 hover:text-rose-300"
                              title="Quitar"
                              aria-label={`Quitar ${draft.file.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-3 space-y-2">
                            <label className="block text-[11px] uppercase tracking-[0.16em] text-zinc-500">Alcance</label>
                            <select
                              value={draft.scope}
                              onChange={(event) =>
                                updateDraft(draft.localId, {
                                  scope: event.target.value,
                                  allowedUserIds: event.target.value === SCOPE_SPECIFIC ? draft.allowedUserIds : [],
                                })
                              }
                              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                            >
                              <option value={SCOPE_GLOBAL}>Global (todos los clientes)</option>
                              <option value={SCOPE_SPECIFIC}>Específico (clientes seleccionados)</option>
                            </select>

                            {draft.scope === SCOPE_SPECIFIC && (
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Clientes autorizados</p>
                                {renderClientCheckboxes({
                                  selectedUserIds: draft.allowedUserIds,
                                  query: uploadClientQuery,
                                  onQueryChange: setUploadClientQuery,
                                  queryPlaceholder: 'Buscar cliente para asignación',
                                  onToggle: (userId) => {
                                    updateDraft(draft.localId, {
                                      allowedUserIds: toggleUserId(draft.allowedUserIds, userId),
                                    });
                                  },
                                })}
                                <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                                  {draft.allowedUserIds.length} cliente(s) seleccionado(s)
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleUploadDrafts}
                        disabled={isUploading}
                        className="w-full rounded-2xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:opacity-50"
                      >
                        {isUploading ? 'Subiendo...' : 'Subir archivos PDF ITV'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'manage' && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Archivos existentes</p>
                    <button
                      type="button"
                      onClick={loadFiles}
                      disabled={loadingFiles}
                      className="rounded-xl border border-zinc-700 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200 disabled:opacity-50"
                    >
                      Recargar
                    </button>
                  </div>

                  {error && <p className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}

                  {loadingFiles ? (
                    <p className="rounded-xl border border-dashed border-zinc-800 px-3 py-5 text-center text-xs text-zinc-500">Cargando...</p>
                  ) : files.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-zinc-800 px-3 py-5 text-center text-xs text-zinc-500">Aún no hay archivos PDF ITV.</p>
                  ) : (
                    <div className="space-y-3">
                      {files.map((file) => {
                        const settings = fileSettings[file.id] || {
                          scope: file.scope || SCOPE_GLOBAL,
                          allowedUserIds: file.allowedUserIds || [],
                        };

                        return (
                          <div key={file.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-zinc-100" title={file.fileName}>{file.fileName}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                                  {formatDate(file.createdAt)} · {formatBytes(file.size)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={`/api/itv-pdf/download?id=${encodeURIComponent(file.id)}`}
                                  download
                                  className="rounded-xl border border-zinc-700 p-2 text-zinc-400 transition hover:border-cyan-500/50 hover:text-cyan-300"
                                  title="Descargar"
                                  aria-label={`Descargar ${file.fileName}`}
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFile(file.id, file.fileName)}
                                  disabled={deletingId === file.id}
                                  className="rounded-xl border border-zinc-700 p-2 text-zinc-400 transition hover:border-rose-500/50 hover:text-rose-300 disabled:opacity-50"
                                  title="Eliminar"
                                  aria-label={`Eliminar ${file.fileName}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-3">
                              <label className="block text-[11px] uppercase tracking-[0.16em] text-zinc-500">Alcance del archivo</label>
                              <select
                                value={settings.scope}
                                onChange={(event) => {
                                  const nextScope = event.target.value;
                                  setFileSettings((prev) => ({
                                    ...prev,
                                    [file.id]: {
                                      ...settings,
                                      scope: nextScope,
                                      allowedUserIds: nextScope === SCOPE_SPECIFIC ? settings.allowedUserIds : [],
                                    },
                                  }));
                                }}
                                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                              >
                                <option value={SCOPE_GLOBAL}>Global</option>
                                <option value={SCOPE_SPECIFIC}>Específico</option>
                              </select>
                            </div>

                            {settings.scope === SCOPE_SPECIFIC && (
                              <div className="mt-2">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Clientes autorizados</p>
                                {renderClientCheckboxes({
                                  selectedUserIds: settings.allowedUserIds,
                                  query: manageClientQueries[file.id] || '',
                                  onQueryChange: (value) => {
                                    setManageClientQueries((prev) => ({ ...prev, [file.id]: value }));
                                  },
                                  queryPlaceholder: 'Buscar cliente para este archivo',
                                  onToggle: (userId) => {
                                    setFileSettings((prev) => ({
                                      ...prev,
                                      [file.id]: {
                                        ...(prev[file.id] || settings),
                                        allowedUserIds: toggleUserId(prev[file.id]?.allowedUserIds || [], userId),
                                      },
                                    }));
                                  },
                                })}
                              </div>
                            )}

                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                                {settings.scope === SCOPE_GLOBAL ? <Globe className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                                {settings.scope === SCOPE_GLOBAL ? 'Global' : `${settings.allowedUserIds.length} cliente(s)`}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateScope(file.id)}
                                disabled={updatingId === file.id}
                                className="rounded-xl bg-cyan-500 px-3 py-1.5 text-[11px] font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:opacity-50"
                              >
                                {updatingId === file.id ? 'Guardando...' : 'Guardar alcance'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
