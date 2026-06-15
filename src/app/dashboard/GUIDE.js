/**
 * GUÍA VISUAL - DASHBOARD DE FICHAS TÉCNICAS
 * 
 * ========================================
 * ESTRUCTURA VISUAL DE LA INTERFAZ
 * ========================================
 * 
 * VISTA GENERAL (Ambos roles ven esto):
 * 
 * ┌─────────────────────────────────────────────────────────┐
 * │  Ficha Técnica del Ascensor          [👤] [🏢] SELECTOR │
 * │  Torre Meridian - Nueva York                             │
 * ├─────────────────────────────────────────────────────────┤
 * │  Dirección: 1250 Broadway...  | Código: ASC-001         │
 * │                                | Estado: ● Operativo     │
 * └─────────────────────────────────────────────────────────┘
 * 
 * 
 * VISTA EMPRESA (Con botones de acción):
 * 
 * ┌─────────────────────────────────────────────────────────┐
 * │ [✚ Registrar] [✏️ Editar] [🗑️ Eliminar]                 │
 * └─────────────────────────────────────────────────────────┘
 * 
 * 
 * VISTA CLIENTE (Sin botones):
 * 
 * (Solo tarjetas de información, sin opciones de edición)
 * 
 * 
 * SECCIONES DE PARÁMETROS TÉCNICOS:
 * 
 * 📋 INFORMACIÓN GENERAL
 * ┌─────────────────┬─────────────────┬─────────────────┐
 * │ Nombre Edificio │ Fecha Instal... │ Últ. Manten...  │
 * │ Torre Meridian  │ 15 Mar 2019     │ 20 Nov 2024     │
 * └─────────────────┴─────────────────┴─────────────────┘
 * 
 * ⚙️ SISTEMA DE TRACCIÓN
 * ┌─────────────────┬─────────────────┬─────────────────┐
 * │ Máquinas Trac.. │ Marca Motor     │ Potencia Motor  │
 * │ 2 unidades      │ Otis            │ 50 HP (37.3kW)  │
 * ├─────────────────┼─────────────────┼─────────────────┤
 * │ Voltaje Alimen..│ Tipo Tracción   │ Tipo Freno      │
 * │ 220V Trifásico  │ MR              │ Electroimán ... │
 * └─────────────────┴─────────────────┴─────────────────┘
 * 
 * 📊 CABLES Y RENDIMIENTO
 * ┌─────────────────┬─────────────────┬─────────────────┐
 * │ Cables Tracción │ Calibre Cables  │ Número Paradas  │
 * │ 8 cables        │ 16 mm           │ 28 pisos        │
 * ├─────────────────┼─────────────────┼─────────────────┤
 * │ Velocidad Nominal
 * │ 4.0 m/s
 * └─────────────────────────────────────────────────────┘
 * 
 * 🛡️ CABINA Y SEGURIDAD
 * ┌─────────────────┬─────────────────┬─────────────────┐
 * │ Peso Máximo     │ Capacidad       │ Control Eléc... │
 * │ 2500 kg/5512... │ 20 personas     │ Otis            │
 * ├─────────────────┼─────────────────┼─────────────────┤
 * │ Operador Puerta │ Modelo Operador │ Limitador Vel.. │
 * │ Otis            │ OP32            │ SG-4000         │
 * ├─────────────────┼─────────────────┼─────────────────┤
 * │ Sensor Puerta 📡│
 * │ Infrarrojo Dual │
 * └─────────────────┴─────────────────┴─────────────────┘
 * 
 * 
 * ========================================
 * RESPONSIVIDAD POR DISPOSITIVO
 * ========================================
 * 
 * TELÉFONO (iPhone - Vertical):
 * - 1 columna de tarjetas
 - Ancho máximo de pantalla utilizado
 * - Botones apilados
 * - Texto legible con tamaño apropiado
 * 
 * TABLET (iPad):
 * - 2 columnas de tarjetas
 * - Mejor distribución visual
 * - Botones en fila
 * 
 * DESKTOP (Mac/PC):
 * - 3 columnas de tarjetas
 * - Máxima densidad visual
 * - Sidebar opcional (futura implementación)
 * 
 * 
 * ========================================
 * COLORES Y ESTILOS
 * ========================================
 * 
 * Fondo:
 * - Gradiente: zinc-950 → zinc-900 → black
 * - Oscuro y elegante (Dark Premium)
 * 
 * Tarjetas:
 * - Fondo: zinc-900/40 (40% opacidad)
 * - Backdrop: blur-md (desenfoque)
 * - Borde: zinc-800
 * - Hover: borde zinc-700
 * 
 * Texto:
 * - Títulos (parámetros): zinc-400, mayúsculas, pequeños
 * - Valores: white, fuente media
 * - Unidades: zinc-500, pequeñas
 * 
 * Botones:
 * - Acción Positiva (Registrar): green-600 → green-700
 * - Edición (Editar): blue-600 → blue-700
 * - Crítica (Eliminar): red-600 → red-700
 * - Guardar: amber-600 → amber-700
 * 
 * 
 * ========================================
 * FLUJO DE INTERACCIÓN
 * ========================================
 * 
 * 1. CAMBIAR ROL (DEV):
 *    Usuario → Click en [👤] o [🏢] → Rol cambia → UI se actualiza
 * 
 * 2. VISTA CLIENTE:
 *    - Lee la ficha técnica
 *    - Todos los campos disabled
 *    - Sin opciones de edición
 * 
 * 3. VISTA EMPRESA:
 *    a) Hacer Click en [✏️ Editar]:
 *       - Estado isEditing = true
 *       - (Próximo: Campos se convierten a inputs)
 *       - Botón cambia a [✕ Cancelar]
 *       - Aparece botón [💾 Guardar Cambios]
 * 
 *    b) Hacer Click en [💾 Guardar]:
 *       - console.log(editedData)
 *       - (Próximo: POST a /api/elevators/update)
 *       - isEditing = false
 *       - Datos se refrescan
 * 
 *    c) Hacer Click en [🗑️ Eliminar]:
 *       - (Próximo: Modal de confirmación)
 *       - (Próximo: DELETE a /api/elevators/:id)
 * 
 *    d) Hacer Click en [✚ Registrar]:
 *       - (Próximo: Abre modal/página de nuevo ascensor)
 * 
 * 
 * ========================================
 * CLASE CSS PRINCIPALES
 * ========================================
 * 
 * Grid Layout:
 * - grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
 * - gap-6 (24px entre tarjetas)
 * - max-w-7xl (máximo ancho contenedor)
 * 
 * Tarjetas:
 * - bg-zinc-900/40 backdrop-blur-md
 * - border border-zinc-800 rounded-xl
 * - p-6 (padding interior)
 * - hover:border-zinc-700
 * 
 * Tipografía:
 * - text-xs font-semibold text-zinc-400 uppercase tracking-wider
 * - text-lg font-medium text-white
 * - text-sm text-zinc-500
 * 
 * Transiciones:
 * - transition-colors duration-200 (smooth hover effects)
 * 
 * 
 * ========================================
 * DATOS SIMULADOS UBICACIÓN
 * ========================================
 * 
 * Archivo: src/data/mockElevatorData.js
 * 
 * Estructura JSON:
 * {
 *   id: "ASC-001-TOWER-NYC",
 *   general: { ... },
 *   tractionSystem: { ... },
 *   cablesAndPerformance: { ... },
 *   cabinAndSafety: { ... }
 * }
 * 
 * Para cambiar datos:
 * → Edita mockElevatorData.js
 * → Los cambios se reflejan automáticamente en la UI
 * 
 */

export const DASHBOARD_GUIDE = {
  title: "Guía Visual del Dashboard",
  version: "0.1.0",
  lastUpdate: "2024-06-13"
};
