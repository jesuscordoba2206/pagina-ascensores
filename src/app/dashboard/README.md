# Dashboard de Fichas Técnicas - Guía de Uso

## 📋 Descripción General

Interfaz responsiva y premium para la gestión de fichas técnicas de ascensores en J_web. Implementa lógica de roles (Cliente/Empresa) con control de acceso simulado y datos mock para desarrollo.

## 🎯 Características Implementadas

### 1. **Control de Roles Temporal (DEV)**
- **Ubicación**: Top-right del header
- **Botones**: Cliente | Empresa
- **Función**: Cambiar entre vistas para testing
- **Duración**: Temporal durante desarrollo, será reemplazado por autenticación real

### 2. **Datos Simulados (Mock Data)**
Estructura completa con 4 categorías:

#### General (Información del Edificio)
- Nombre del Edificio
- Dirección
- Código/ID Interno
- Fecha de Instalación
- Último Mantenimiento Preventivo

#### Sistema de Tracción (⚙️)
- Cantidad de Máquinas
- Marca del Motor (Otis)
- Potencia (50 HP / 37.3 kW)
- Voltaje (220V Trifásico)
- Tipo de Tracción (MR)
- Tipo de Freno

#### Cables y Rendimiento (📊)
- Cantidad de Cables de Tracción (8)
- Calibre de Cables (16 mm)
- Número de Paradas (28)
- Velocidad Nominal (4.0 m/s)

#### Cabina y Seguridad (🛡️)
- Peso Máximo (2500 kg / 5512 lbs)
- Capacidad de Personas (20)
- Marca de Control Eléctrico (Otis)
- Operador de Puerta (Otis OP32)
- Limitador de Velocidad (SG-4000)
- Tipo de Sensor (Infrarrojo Dual-banda)

### 3. **Lógica de Roles**

#### 👤 Vista Cliente
- ✓ Solo lectura de ficha técnica
- ✓ Todos los campos deshabilitados
- ✓ Sin botones de edición/eliminación
- ✓ Información clara y accesible

#### 🏢 Vista Empresa
- ✓ Interfaz completa con opciones
- ✓ Botones: Registrar, Editar, Guardar, Eliminar
- ✓ Campos editables (preparados)
- ✓ Control total de datos

### 4. **Diseño y Responsividad**

**Estética**
- Fondo gradiente dark premium: `from-zinc-950 via-zinc-900 to-black`
- Tarjetas semi-transparentes: `bg-zinc-900/40 backdrop-blur-md`
- Bordes sutiles en zinc-800

**Tipografía Jerárquica**
- Títulos de sección: `text-2xl font-bold text-white`
- Parámetros técnicos: `text-xs font-semibold text-zinc-400 uppercase`
- Valores: `text-lg font-medium text-white`

**Grid Responsivo**
```
Mobile:  1 columna
Tablet:  2 columnas (md:grid-cols-2)
Desktop: 3 columnas (lg:grid-cols-3)
Gap:     6 unidades (gap-6)
```

## 📁 Estructura de Archivos

```
src/
├── app/
│   └── dashboard/
│       └── page.js              # Componente principal (ESTE ARCHIVO)
├── components/
│   └── TechnicalCard.js         # Componente reutilizable de tarjeta
└── data/
    └── mockElevatorData.js      # Datos simulados
```

## 🚀 Próximos Pasos (No Implementados)

1. **Conexión a Base de Datos**
   - Reemplazar mockElevatorData con datos reales de Prisma
   - Integrar API endpoints

2. **Funcionalidad de Edición**
   - Convertir campos a inputs editables
   - Implementar validación de formularios
   - Guardar cambios a la BD

3. **Autenticación Real**
   - Reemplazar rol temporal con autenticación JWT
   - Validar permisos en backend
   - Gestionar sesiones de usuario

4. **Más Funcionalidades**
   - Filtrado y búsqueda de ascensores
   - Historial de cambios
   - Reportes técnicos
   - Integración con métricas

## 🎨 Personalización de Datos

Para cambiar los datos simulados, edita `src/data/mockElevatorData.js`:

```javascript
export const mockElevatorData = {
  general: {
    buildingName: "Tu Edificio",
    // ... más parámetros
  }
}
```

## 🔧 Testing de Roles

1. Haz clic en el botón **"👤 Cliente"** o **"🏢 Empresa"** en la esquina superior derecha
2. Observa cómo cambia la interfaz:
   - **Cliente**: Sin botones de acción
   - **Empresa**: Con botones de Registrar, Editar, Eliminar

## 📱 Compatibilidad

✓ iPhone (vertical y horizontal)
✓ Tablet (iPad, etc.)
✓ Desktop (Mac, Windows, Linux)
✓ Navegadores modernos (Chrome, Safari, Firefox, Edge)

## 💡 Notas de Desarrollo

- El estado `isEditing` está preparado para futura funcionalidad
- El botón "Guardar Cambios" tiene un console.log para testing
- Los íconos usan emojis por simplicidad (pueden ser reemplazados por SVG)
- Usa Tailwind CSS v3+ (verifica tu config)

---

**Última actualización**: 2024
**Versión**: 0.1.0 (MVP Frontend)
