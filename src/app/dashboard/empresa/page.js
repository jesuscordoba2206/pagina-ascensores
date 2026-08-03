"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DashboardNavbar from '@/components/DashboardNavbar';
import FichaTecnicaForm from '@/components/FichaTecnicaForm';
import FichaTecnicaViewer from '@/components/FichaTecnicaViewer';

const REPORT_MONTHS = [
  { key: 'enero', label: 'Enero' },
  { key: 'febrero', label: 'Febrero' },
  { key: 'marzo', label: 'Marzo' },
  { key: 'abril', label: 'Abril' },
  { key: 'mayo', label: 'Mayo' },
  { key: 'junio', label: 'Junio' },
  { key: 'julio', label: 'Julio' },
  { key: 'agosto', label: 'Agosto' },
  { key: 'septiembre', label: 'Septiembre' },
  { key: 'octubre', label: 'Octubre' },
  { key: 'noviembre', label: 'Noviembre' },
  { key: 'diciembre', label: 'Diciembre' },
];

function createEmptyMonthlyReportFiles() {
  return REPORT_MONTHS.reduce((acc, month) => {
    acc[month.key] = null;
    return acc;
  }, {});
}

function getMonthlyReportCount(reportUrls) {
  if (!Array.isArray(reportUrls)) return 0;
  return REPORT_MONTHS.reduce((count, _, index) => {
    const url = reportUrls[index];
    return typeof url === 'string' && url.trim() !== '' ? count + 1 : count;
  }, 0);
}

function InputField({ label, value, onChange, placeholder = '', type = 'text', required = false }) {
  return (
    <label className="block text-sm text-zinc-300">
      <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-3xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
      />
    </label>
  );
}

const emptyEquipment = {
  internalCode: '',
  type: 'Ascensor',
  motorBrand: '',
  controlBrand: '',
  cableType: '',
  cableGauge: '',
  maxWeight: '',
  capacity: '',
};

const emptyClientEquipmentDraft = {
  internalCode: '',
  type: '',
  motorBrand: '',
  controlBrand: '',
  cableType: '',
  cableGauge: '',
  maxWeight: '',
  capacity: '',
};

const emptyPortfolioForm = {
  title: '',
  description: '',
  imageFile: null,
  removeImage: false,
};

export default function Page() {
  const router = useRouter();
  const [sessionRole, setSessionRole] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedEquipments, setSelectedEquipments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({ name: '', email: '', password: '', building: '' });
  const [newClientEquipmentForm, setNewClientEquipmentForm] = useState({ ...emptyClientEquipmentDraft });

  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [newEquipmentForm, setNewEquipmentForm] = useState({ ...emptyEquipment });

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedEquipmentForReport, setSelectedEquipmentForReport] = useState(null);
  const [reportFilesByMonth, setReportFilesByMonth] = useState(createEmptyMonthlyReportFiles);
  const [isUploadingReport, setIsUploadingReport] = useState(false);

  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ ...emptyPortfolioForm });
  const [portfolioPreview, setPortfolioPreview] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const [showFichaTecnicaModal, setShowFichaTecnicaModal] = useState(false);
  const [selectedEquipmentForFicha, setSelectedEquipmentForFicha] = useState(null);
  const [currentFichaTecnica, setCurrentFichaTecnica] = useState(null);
  const [expandedFichaEquipmentId, setExpandedFichaEquipmentId] = useState(null);
  const [loadedFichas, setLoadedFichas] = useState({});

  const [projects, setProjects] = useState([]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return [client.name, client.email, client.building].filter(Boolean).some((value) => value.toLowerCase().includes(query));
    });
  }, [clients, search]);

  const loadClients = useCallback(async () => {
    try {
      const res = await fetch('/api/cliente');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !selectedClientId) {
        setSelectedClientId(data[0].id);
        setSelectedClient(data[0]);
        setSelectedEquipments(data[0].equipments || []);
      } else if (Array.isArray(data) && selectedClientId) {
        const selected = data.find((client) => client.id === selectedClientId);
        if (selected) {
          setSelectedClient(selected);
          setSelectedEquipments(selected.equipments || []);
        }
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  }, [selectedClientId]);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  }, []);

  useEffect(() => {
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => {
        if (data?.role === 'EMPRESA') {
          setSessionRole('EMPRESA');
          loadClients();
          loadProjects();
        } else {
          router.replace('/login');
        }
      })
      .catch(() => {
        router.replace('/login');
      })
      .finally(() => setLoading(false));
  }, [router, loadClients, loadProjects]);

  async function handleAddClient() {
    if (!newClientForm.name || !newClientForm.email || !newClientForm.password) {
      alert('Por favor completa nombre, email y contraseña');
      return;
    }

    const hasEquipmentDraft = Object.values(newClientEquipmentForm).some((value) => String(value ?? '').trim() !== '');
    if (hasEquipmentDraft && (!newClientEquipmentForm.internalCode || !newClientEquipmentForm.type)) {
      alert('Si agregas un equipo inicial, el código interno y el tipo son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const equipments = hasEquipmentDraft
        ? [{
            internalCode: newClientEquipmentForm.internalCode,
            type: newClientEquipmentForm.type,
            motorBrand: newClientEquipmentForm.motorBrand,
            controlBrand: newClientEquipmentForm.controlBrand,
            cableType: newClientEquipmentForm.cableType,
            cableGauge: newClientEquipmentForm.cableGauge,
            maxWeight: newClientEquipmentForm.maxWeight,
            capacity: newClientEquipmentForm.capacity,
          }]
        : [];

      const res = await fetch('/api/register-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newClientForm,
          equipments,
        }),
      });
      if (res.ok) {
        await loadClients();
        setShowAddClientModal(false);
        setNewClientForm({ name: '', email: '', password: '', building: '' });
        setNewClientEquipmentForm({ ...emptyClientEquipmentDraft });
        alert('✅ Cliente registrado correctamente en MongoDB Atlas.');
      } else {
        let errorMsg = `Error HTTP ${res.status}`;
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || JSON.stringify(errorData);
        } catch {
          errorMsg = await res.text();
        }
        console.error('[handleAddClient] API error:', errorMsg);
        alert(`❌ Error al registrar cliente:\n${errorMsg}`);
      }
    } catch (err) {
      console.error('[handleAddClient] Network/unexpected error:', err);
      alert(`❌ Error de red o inesperado:\n${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddEquipment() {
    if (!selectedClient) return;
    if (!newEquipmentForm.internalCode) {
      alert('El código interno es requerido');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedClient.id,
          internalCode: newEquipmentForm.internalCode,
          type: newEquipmentForm.type,
          motorBrand: newEquipmentForm.motorBrand,
          controlBrand: newEquipmentForm.controlBrand,
          cableType: newEquipmentForm.cableType,
          cableGauge: newEquipmentForm.cableGauge,
          maxWeight: newEquipmentForm.maxWeight || null,
          capacity: newEquipmentForm.capacity || null,
        }),
      });
      if (res.ok) {
        await loadClients();
        setShowAddEquipmentModal(false);
        setNewEquipmentForm({ ...emptyEquipment });
        alert('✅ Equipo guardado correctamente en MongoDB Atlas.');
      } else {
        let errorMsg = `Error HTTP ${res.status}`;
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || JSON.stringify(errorData);
        } catch {
          errorMsg = await res.text();
        }
        console.error('[handleAddEquipment] API error:', errorMsg);
        alert(`❌ Error al guardar equipo:\n${errorMsg}`);
      }
    } catch (err) {
      console.error('[handleAddEquipment] Network/unexpected error:', err);
      alert(`❌ Error de red o inesperado:\n${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadReport() {
    if (!selectedEquipmentForReport) return;

    const monthsToUpload = REPORT_MONTHS.filter((month) => reportFilesByMonth[month.key] instanceof File);
    if (monthsToUpload.length === 0) {
      alert('Selecciona al menos un archivo PDF para subir.');
      return;
    }

    setIsUploadingReport(true);

    const readSafeErrorMessage = async (response, fallbackMessage) => {
      try {
        const payload = await response.clone().json();
        return payload?.error || JSON.stringify(payload);
      } catch {
        return fallbackMessage;
      }
    };

    try {
      for (const month of monthsToUpload) {
        const originalFile = reportFilesByMonth[month.key];
        const pdfFile = originalFile.type === 'application/pdf'
          ? originalFile
          : new File([originalFile], originalFile.name, { type: 'application/pdf' });

        const formData = new FormData();
        formData.append('file', pdfFile, pdfFile.name);
        formData.append('category', `reports/${selectedClient.id}`);
        formData.append('equipmentId', selectedEquipmentForReport.id);
        formData.append('month', month.key);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorMsg = await readSafeErrorMessage(uploadResponse, `Error HTTP ${uploadResponse.status}`);
          console.error(`[handleUploadReport] Upload API error (${month.label}):`, errorMsg);
          alert(`❌ No se pudo subir el PDF de ${month.label}:\n${errorMsg}`);
          return;
        }
      }

      await loadClients();
      setShowReportModal(false);
      setReportFilesByMonth(createEmptyMonthlyReportFiles());
      alert('✅ Reportes PDF mensuales subidos y guardados correctamente en MongoDB Atlas.');
    } catch (err) {
      console.error('[handleUploadReport] Unexpected error:', err);
      alert(`❌ Error subiendo el reporte:\n${err.message}`);
    } finally {
      setIsUploadingReport(false);
    }
  }

  function handlePortfolioImageChange(file) {
    if (portfolioPreview) URL.revokeObjectURL(portfolioPreview);
    setPortfolioPreview(file ? URL.createObjectURL(file) : null);
    setPortfolioForm((prev) => ({ ...prev, imageFile: file, removeImage: false }));
  }

  function clearPortfolioImage() {
    if (portfolioForm.imageFile) {
      if (portfolioPreview) URL.revokeObjectURL(portfolioPreview);
      setPortfolioPreview(editingProject ? editingProject.imageUrl || null : null);
      setPortfolioForm((prev) => ({ ...prev, imageFile: null, removeImage: false }));
    } else if (editingProject) {
      setPortfolioForm((prev) => ({ ...prev, removeImage: true }));
    }
  }

  function openCreateProjectModal() {
    setEditingProject(null);
    setPortfolioForm({ ...emptyPortfolioForm });
    setPortfolioPreview(null);
    setShowPortfolioModal(true);
  }

  function openEditProjectModal(project) {
    setEditingProject(project);
    setPortfolioForm({
      title: project.title || '',
      description: project.description || '',
      imageFile: null,
      removeImage: false,
    });
    setPortfolioPreview(project.imageUrl || null);
    setShowPortfolioModal(true);
  }

  async function handleUploadPortfolio() {
    const isEdit = Boolean(editingProject);

    if (!isEdit && !portfolioForm.imageFile) {
      alert('Selecciona una imagen para el proyecto');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', portfolioForm.title.trim());
      formData.append('description', portfolioForm.description.trim());
      if (portfolioForm.imageFile) {
        formData.append('image', portfolioForm.imageFile, portfolioForm.imageFile.name);
      }
      if (isEdit) {
        formData.append('id', editingProject.id);
        formData.append('removeImage', portfolioForm.removeImage ? 'true' : 'false');
      }

      const res = await fetch('/api/projects', {
        method: isEdit ? 'PUT' : 'POST',
        body: formData,
      });

      if (res.ok) {
        await loadProjects();
        setShowPortfolioModal(false);
        setEditingProject(null);
        setPortfolioForm({ ...emptyPortfolioForm });
        setPortfolioPreview(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Error guardando proyecto');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteReport(equipmentId, monthKey) {
    if (!window.confirm('¿Eliminar este reporte PDF?\nEsta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`/api/report?equipmentId=${equipmentId}&month=${monthKey}`, { method: 'DELETE' });
      if (res.ok) {
        await loadClients();
        alert('✅ Reporte eliminado correctamente.');
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || `Error HTTP ${res.status}`);
      }
    } catch (err) {
      alert('Error eliminando reporte: ' + err.message);
    }
  }

  async function handleDeleteProject(project) {
    if (!window.confirm('¿Eliminar permanentemente este proyecto?\nEsta acción no se puede deshacer.')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/project?id=${project.id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadProjects();
        alert('✅ Proyecto eliminado correctamente.');
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || `Error HTTP ${res.status}`);
      }
    } catch (err) {
      alert('Error eliminando proyecto: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function loadFichaTecnica(equipmentId) {
    try {
      const res = await fetch(`/api/ficha-tecnica?equipmentId=${equipmentId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentFichaTecnica(data);
      } else {
        setCurrentFichaTecnica(null);
      }
    } catch (err) {
      console.error('Error loading ficha técnica:', err);
      setCurrentFichaTecnica(null);
    }
  }

  async function handleOpenFichaTecnicaModal(equipment) {
    setSelectedEquipmentForFicha(equipment);
    await loadFichaTecnica(equipment.id);
    setShowFichaTecnicaModal(true);
  }

  async function toggleFichaExpand(equipmentId) {
    if (expandedFichaEquipmentId === equipmentId) {
      setExpandedFichaEquipmentId(null);
    } else {
      setExpandedFichaEquipmentId(equipmentId);
      if (!loadedFichas[equipmentId]) {
        try {
          const res = await fetch(`/api/ficha-tecnica?equipmentId=${equipmentId}`);
          if (res.ok) {
            const data = await res.json();
            setLoadedFichas((prev) => ({ ...prev, [equipmentId]: data }));
          }
        } catch (err) {
          console.error('Error loading ficha técnica:', err);
        }
      }
    }
  }

  function handleFichaTecnicaSaved() {
    setShowFichaTecnicaModal(false);
    setSelectedEquipmentForFicha(null);
    setCurrentFichaTecnica(null);
    setLoadedFichas({});
    loadClients();
  }

  async function handleDeleteClient(clientId, clientName) {
    if (!window.confirm(`¿Eliminar permanentemente al cliente "${clientName}" y todos sus equipos?\nEsta acción no se puede deshacer.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cliente?id=${clientId}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedClientId(null);
        setSelectedClient(null);
        setSelectedEquipments([]);
        await loadClients();
        alert('✅ Cliente eliminado correctamente.');
      } else {
        let errorMsg = `Error HTTP ${res.status}`;
        try { const d = await res.json(); errorMsg = d.error || JSON.stringify(d); } catch { errorMsg = await res.text(); }
        console.error('[handleDeleteClient] API error:', errorMsg);
        alert(`❌ Error al eliminar cliente:\n${errorMsg}`);
      }
    } catch (err) {
      console.error('[handleDeleteClient] Network error:', err);
      alert(`❌ Error de red:\n${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateClient() {
    if (!selectedClient) return;
    setSaving(true);
    try {
      await fetch('/api/cliente', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedClient.id,
          name: selectedClient.name,
          email: selectedClient.email,
          building: selectedClient.building,
        }),
      });
      await loadClients();
    } catch (err) {
      alert('Error updating client: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateEquipment(index) {
    if (!selectedEquipments[index]) return;
    setSaving(true);
    try {
      await fetch('/api/equipment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedEquipments[index]),
      });
      await loadClients();
    } catch (err) {
      alert('Error updating equipment: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_36%),linear-gradient(180deg,#09090b_0%,#000_100%)] text-white flex items-center justify-center">
        <p className="text-zinc-400">Cargando...</p>
      </div>
    );
  }

  if (sessionRole !== 'EMPRESA') {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_36%),linear-gradient(180deg,#09090b_0%,#000_100%)] text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <DashboardNavbar />
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/70 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Acceso restringido</p>
            <h1 className="mt-6 text-3xl font-semibold">Panel de Empresa</h1>
            <p className="mt-4 text-zinc-300">Solo usuarios EMPRESA pueden acceder.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_36%),linear-gradient(180deg,#09090b_0%,#000_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DashboardNavbar />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold">Clientes</h2>
              <div className="flex items-center gap-2">
                {selectedClient && (
                  <button
                    onClick={() => handleDeleteClient(selectedClient.id, selectedClient.name)}
                    disabled={saving}
                    className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-40"
                    title="Eliminar cliente seleccionado"
                  >
                    🗑
                  </button>
                )}
                <button
                  onClick={() => setShowAddClientModal(true)}
                  className="rounded-full bg-cyan-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-cyan-400"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-3xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-2">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setSelectedClient(client);
                    setSelectedEquipments(client.equipments || []);
                  }}
                  className={`w-full rounded-[1.5rem] border px-4 py-3 text-left text-sm transition ${
                    selectedClientId === client.id
                      ? 'border-cyan-400 bg-cyan-500/15'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-600'
                  }`}
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-xs text-zinc-400">{client.email}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {selectedClient ? (
              <>
                <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-semibold">{selectedClient.name}</h2>
                    <button
                      onClick={handleUpdateClient}
                      disabled={saving}
                      className="rounded-3xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar cliente'}
                    </button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <InputField
                      label="Nombre"
                      value={selectedClient.name}
                      onChange={(value) => setSelectedClient({ ...selectedClient, name: value })}
                    />
                    <InputField
                      label="Email"
                      value={selectedClient.email}
                      onChange={(value) => setSelectedClient({ ...selectedClient, email: value })}
                    />
                    <InputField
                      label="Edificio"
                      value={selectedClient.building}
                      onChange={(value) => setSelectedClient({ ...selectedClient, building: value })}
                    />
                  </div>
                </section>

                <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl font-semibold">Equipos ({selectedEquipments.length})</h3>
                    <button
                      onClick={() => setShowAddEquipmentModal(true)}
                      className="rounded-3xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400"
                    >
                      Agregar equipo
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedEquipments.map((equipment, idx) => (
                      <div key={equipment.id || idx} className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/60 p-4">
                        <p className="text-sm font-semibold mb-3">{equipment.internalCode || 'Equipo sin código'}</p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-3">
                          <InputField
                            label="Código interno"
                            value={equipment.internalCode}
                            onChange={(value) => {
                              const next = [...selectedEquipments];
                              next[idx] = { ...next[idx], internalCode: value };
                              setSelectedEquipments(next);
                            }}
                          />
                          <InputField
                            label="Tipo"
                            value={equipment.type}
                            onChange={(value) => {
                              const next = [...selectedEquipments];
                              next[idx] = { ...next[idx], type: value };
                              setSelectedEquipments(next);
                            }}
                          />
                          <InputField
                            label="Marca motor"
                            value={equipment.motorBrand}
                            onChange={(value) => {
                              const next = [...selectedEquipments];
                              next[idx] = { ...next[idx], motorBrand: value };
                              setSelectedEquipments(next);
                            }}
                          />
                          <InputField
                            label="Control eléctrico"
                            value={equipment.controlBrand}
                            onChange={(value) => {
                              const next = [...selectedEquipments];
                              next[idx] = { ...next[idx], controlBrand: value };
                              setSelectedEquipments(next);
                            }}
                          />
                          <InputField
                            label="Tipo de cable"
                            value={equipment.cableType}
                            onChange={(value) => {
                              const next = [...selectedEquipments];
                              next[idx] = { ...next[idx], cableType: value };
                              setSelectedEquipments(next);
                            }}
                          />
                          <InputField
                            label="Calibre"
                            value={equipment.cableGauge}
                            onChange={(value) => {
                              const next = [...selectedEquipments];
                              next[idx] = { ...next[idx], cableGauge: value };
                              setSelectedEquipments(next);
                            }}
                          />
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          <button
                            onClick={() => handleUpdateEquipment(idx)}
                            className="rounded-3xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => toggleFichaExpand(equipment.id)}
                            className="rounded-3xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-500"
                          >
                            {expandedFichaEquipmentId === equipment.id ? '▼' : '▶'} Ficha Técnica
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEquipmentForReport(equipment);
                              setReportFilesByMonth(createEmptyMonthlyReportFiles());
                              setShowReportModal(true);
                            }}
                            className="rounded-3xl bg-blue-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-blue-400"
                          >
                            Reportes ({getMonthlyReportCount(equipment.reportUrls)}/12)
                          </button>
                        </div>

                        {expandedFichaEquipmentId === equipment.id && (
                          <div className="mt-6 pt-6 border-t border-zinc-700">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-cyan-400">Especificaciones Técnicas</h4>
                                <button
                                  onClick={() => handleOpenFichaTecnicaModal(equipment)}
                                  className="rounded-2xl bg-cyan-600/20 border border-cyan-500 px-3 py-1 text-xs font-semibold text-cyan-400 hover:bg-cyan-600/30"
                                >
                                  ✎ Editar
                                </button>
                              </div>
                              <FichaTecnicaViewer fichaTecnica={loadedFichas[equipment.id]} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-8 text-center">
                <p className="text-zinc-400">Selecciona un cliente para comenzar</p>
              </div>
            )}

            <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold">Portafolio ({projects.length})</h3>
                <button
                  onClick={openCreateProjectModal}
                  className="rounded-3xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400"
                >
                  Agregar proyecto
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div key={project.id} className="relative overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950/60">
                    <div className="relative h-52 overflow-hidden bg-zinc-900">
                      {project.imageUrl && (
                        <Image src={project.imageUrl} alt="Imagen del proyecto" fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      )}
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        onClick={() => openEditProjectModal(project)}
                        disabled={saving}
                        title="Editar proyecto"
                        className="rounded-full border border-zinc-700 bg-zinc-900/80 px-2.5 py-1 text-xs font-semibold text-zinc-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-40 backdrop-blur"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        disabled={saving}
                        title="Eliminar proyecto"
                        className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-40 backdrop-blur"
                      >
                        ×
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="truncate text-sm font-semibold text-white">{project.title || 'Proyecto sin titulo'}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                        {project.description || 'Sin descripcion'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] border border-zinc-700/70 bg-zinc-950/65 p-6 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => {
                setShowAddClientModal(false);
                setNewClientEquipmentForm({ ...emptyClientEquipmentDraft });
              }}
              className="absolute top-4 right-4 bg-transparent text-zinc-400 transition-colors hover:text-zinc-200"
              title="Cerrar"
              aria-label="Cerrar modal"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
            <h3 className="text-2xl font-semibold mb-6">Agregar cliente</h3>
            <div className="space-y-4">
              <InputField
                label="Nombre"
                value={newClientForm.name}
                onChange={(value) => setNewClientForm({ ...newClientForm, name: value })}
                required
              />
              <InputField
                label="Email"
                type="email"
                value={newClientForm.email}
                onChange={(value) => setNewClientForm({ ...newClientForm, email: value })}
                required
              />
              <InputField
                label="Contraseña"
                type="password"
                value={newClientForm.password}
                onChange={(value) => setNewClientForm({ ...newClientForm, password: value })}
                required
              />
              <InputField
                label="Edificio"
                value={newClientForm.building}
                onChange={(value) => setNewClientForm({ ...newClientForm, building: value })}
              />
              <div className="rounded-[1.5rem] border border-zinc-700/70 bg-transparent p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Equipo inicial opcional</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Código interno"
                    value={newClientEquipmentForm.internalCode}
                    onChange={(value) => setNewClientEquipmentForm({ ...newClientEquipmentForm, internalCode: value })}
                  />
                  <InputField
                    label="Tipo"
                    value={newClientEquipmentForm.type}
                    onChange={(value) => setNewClientEquipmentForm({ ...newClientEquipmentForm, type: value })}
                  />
                  <InputField
                    label="Marca motor"
                    value={newClientEquipmentForm.motorBrand}
                    onChange={(value) => setNewClientEquipmentForm({ ...newClientEquipmentForm, motorBrand: value })}
                  />
                  <InputField
                    label="Control eléctrico"
                    value={newClientEquipmentForm.controlBrand}
                    onChange={(value) => setNewClientEquipmentForm({ ...newClientEquipmentForm, controlBrand: value })}
                  />
                  <InputField
                    label="Tipo de cable"
                    value={newClientEquipmentForm.cableType}
                    onChange={(value) => setNewClientEquipmentForm({ ...newClientEquipmentForm, cableType: value })}
                  />
                  <InputField
                    label="Calibre"
                    value={newClientEquipmentForm.cableGauge}
                    onChange={(value) => setNewClientEquipmentForm({ ...newClientEquipmentForm, cableGauge: value })}
                  />
                  <InputField
                    label="Peso máximo"
                    type="number"
                    value={newClientEquipmentForm.maxWeight}
                    onChange={(value) => setNewClientEquipmentForm({ ...newClientEquipmentForm, maxWeight: value })}
                  />
                  <InputField
                    label="Capacidad"
                    type="number"
                    value={newClientEquipmentForm.capacity}
                    onChange={(value) => setNewClientEquipmentForm({ ...newClientEquipmentForm, capacity: value })}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowAddClientModal(false);
                  setNewClientEquipmentForm({ ...emptyClientEquipmentDraft });
                }}
                className="flex-1 rounded-3xl border border-zinc-700 px-4 py-2 text-sm font-semibold hover:border-zinc-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddClient}
                disabled={saving}
                className="flex-1 rounded-3xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {saving ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddEquipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-zinc-800 bg-zinc-950/95 p-6">
            <h3 className="text-2xl font-semibold mb-6">Agregar equipo</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Código interno"
                value={newEquipmentForm.internalCode}
                onChange={(value) => setNewEquipmentForm({ ...newEquipmentForm, internalCode: value })}
                required
              />
              <InputField
                label="Tipo"
                value={newEquipmentForm.type}
                onChange={(value) => setNewEquipmentForm({ ...newEquipmentForm, type: value })}
              />
              <InputField
                label="Marca motor"
                value={newEquipmentForm.motorBrand}
                onChange={(value) => setNewEquipmentForm({ ...newEquipmentForm, motorBrand: value })}
              />
              <InputField
                label="Control eléctrico"
                value={newEquipmentForm.controlBrand}
                onChange={(value) => setNewEquipmentForm({ ...newEquipmentForm, controlBrand: value })}
              />
              <InputField
                label="Tipo de cable"
                value={newEquipmentForm.cableType}
                onChange={(value) => setNewEquipmentForm({ ...newEquipmentForm, cableType: value })}
              />
              <InputField
                label="Calibre"
                value={newEquipmentForm.cableGauge}
                onChange={(value) => setNewEquipmentForm({ ...newEquipmentForm, cableGauge: value })}
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddEquipmentModal(false)}
                className="flex-1 rounded-3xl border border-zinc-700 px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddEquipment}
                disabled={saving}
                className="flex-1 rounded-3xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {saving ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-zinc-800 bg-zinc-950/95 p-6">
            <h3 className="text-2xl font-semibold mb-6">Subir reportes PDF por mes</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REPORT_MONTHS.map((month, index) => {
                const existingUrl = selectedEquipmentForReport?.reportUrls?.[index];
                const hasExistingFile = typeof existingUrl === 'string' && existingUrl.trim() !== '';

                return (
                  <label
                    key={month.key}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-zinc-100">{month.label}</span>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        hasExistingFile
                          ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                          : 'border border-zinc-700 bg-zinc-900 text-zinc-500'
                      }`}>
                        {hasExistingFile ? 'Cargado' : 'Vacío'}
                      </span>
                    </div>

                    {hasExistingFile && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteReport(selectedEquipmentForReport.id, month.key)}
                          className="flex-1 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/25"
                          title="Eliminar reporte"
                        >
                          🗑 Eliminar
                        </button>
                        <span className="flex-1 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300">
                          ✎ Reemplazar
                        </span>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setReportFilesByMonth((prev) => ({ ...prev, [month.key]: file }));
                      }}
                      className="mt-3 w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-white"
                    />

                    {reportFilesByMonth[month.key] && (
                      <p className="mt-2 truncate text-xs text-cyan-300">
                        Nuevo: {reportFilesByMonth[month.key].name}
                      </p>
                    )}
                  </label>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-zinc-400">
              Cada archivo se guarda asociado a su mes. Si subes uno nuevo para el mismo mes, reemplaza el anterior.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportFilesByMonth(createEmptyMonthlyReportFiles());
                }}
                className="flex-1 rounded-3xl border border-zinc-700 px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadReport}
                disabled={isUploadingReport}
                className="flex-1 rounded-3xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {isUploadingReport ? 'Subiendo...' : 'Subir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] border border-zinc-800 bg-zinc-950/95 p-6">
            <h3 className="text-2xl font-semibold mb-6">{editingProject ? 'Editar proyecto' : 'Agregar proyecto'}</h3>
            <div className="space-y-4">
              <InputField
                label="Titulo"
                value={portfolioForm.title}
                onChange={(value) => setPortfolioForm((prev) => ({ ...prev, title: value }))}
                placeholder="Ej. Ascensor panoramico torre norte"
                required
              />

              <label className="block text-sm text-zinc-300">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Descripcion</span>
                <textarea
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe brevemente el proyecto"
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                />
              </label>

              <label className="block">
                <span className="text-sm text-zinc-300">Imagen del proyecto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePortfolioImageChange(e.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-3xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-white"
                />
              </label>

              {portfolioForm.imageFile ? (
                <div className="relative mt-3 h-44">
                  <Image
                    src={portfolioPreview}
                    alt="Vista previa del proyecto"
                    fill
                    className="rounded-3xl border border-zinc-800 object-cover"
                  />
                  <button
                    onClick={clearPortfolioImage}
                    title="Quitar imagen"
                    aria-label="Quitar imagen"
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700/60 bg-black/60 text-lg leading-none text-zinc-200 backdrop-blur transition hover:border-rose-500/60 hover:bg-rose-500/20 hover:text-white"
                  >
                    ×
                  </button>
                  <span className="absolute bottom-3 left-3 max-w-[70%] truncate rounded-full bg-black/60 px-3 py-1 text-xs text-zinc-200 backdrop-blur">
                    {portfolioForm.imageFile?.name}
                  </span>
                </div>
              ) : editingProject ? (
                portfolioForm.removeImage ? (
                  <p className="mt-3 text-xs text-rose-400">Se eliminará la imagen actual al guardar.</p>
                ) : (
                  <div className="relative mt-3 h-44">
                    {portfolioPreview && (
                      <Image
                        src={portfolioPreview}
                        alt="Imagen actual del proyecto"
                        fill
                        className="rounded-3xl border border-zinc-800 object-cover"
                      />
                    )}
                    <button
                      onClick={clearPortfolioImage}
                      title="Eliminar imagen actual"
                      aria-label="Eliminar imagen actual"
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700/60 bg-black/60 text-lg leading-none text-zinc-200 backdrop-blur transition hover:border-rose-500/60 hover:bg-rose-500/20 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                )
              ) : (
                <p className="mt-3 text-xs text-zinc-500">No se ha seleccionado ninguna imagen.</p>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowPortfolioModal(false);
                  setEditingProject(null);
                  if (portfolioPreview && portfolioForm.imageFile) URL.revokeObjectURL(portfolioPreview);
                  setPortfolioPreview(null);
                  setPortfolioForm({ ...emptyPortfolioForm });
                }}
                className="flex-1 rounded-3xl border border-zinc-700 px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadPortfolio}
                disabled={saving || (!editingProject && !portfolioForm.imageFile)}
                className="flex-1 rounded-3xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : editingProject ? 'Guardar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFichaTecnicaModal && selectedEquipmentForFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 overflow-hidden">
          <div className="w-full max-w-3xl rounded-[2rem] border border-zinc-800 bg-zinc-950/95 max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-zinc-950/95 border-b border-zinc-800 flex items-center justify-between p-6 z-10">
              <h3 className="text-2xl font-semibold text-white">
                Ficha Técnica - {selectedEquipmentForFicha.internalCode}
              </h3>
              <button
                onClick={() => {
                  setShowFichaTecnicaModal(false);
                  setSelectedEquipmentForFicha(null);
                  setCurrentFichaTecnica(null);
                }}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors duration-200 text-2xl leading-none"
                title="Cerrar (Esc)"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <FichaTecnicaForm
                key={`${selectedEquipmentForFicha.id}-${currentFichaTecnica?.id || 'new'}`}
                equipmentId={selectedEquipmentForFicha.id}
                initialData={currentFichaTecnica}
                onSuccess={handleFichaTecnicaSaved}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
