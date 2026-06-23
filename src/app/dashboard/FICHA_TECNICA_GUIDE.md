# Referencia de la API de Ficha Técnica

## Base de Datos

Modelo `FichaTecnica` en Prisma, vinculado 1:1 con `Equipment`.

## Endpoints

### GET /api/ficha-tecnica?equipmentId={id}

Obtiene la ficha técnica de un equipo.

**Query Parameters:**
- `equipmentId` (string, required): ID del equipo

**Response (200):**
```json
{
  "id": "...",
  "equipmentId": "...",
  "equipment": {
    "id": "...",
    "internalCode": "ASC-001",
    "type": "Ascensor"
  },
  "codigoEquipo": "ASC-001",
  "marcaOriginal": "Schindler",
  "modelo": "3300",
  "anoInstalacion": 2015,
  "paisOrigen": "Suiza",
  "numParadas": 10,
  "tipoTraccion": "Con cuarto de máquinas",
  "marcaMotor": "Schindler",
  "potenciaKW": 7.5,
  "voltajeAlimentacion": "380/220V 3F",
  "marcaControlElectrico": "Schindler",
  "tipoTecnologia": "VVVF",
  "numCablesTraccion": 8,
  "diametroCable": 16.0,
  "longitudAproximada": 45.0,
  "capacidadKilos": 1000,
  "capacidadPersonas": 13,
  "anchoCabina": 1100,
  "altoCabina": 2200,
  "profundidadCabina": 1200,
  "acabadoCabina": "Acero Inoxidable 304",
  "tipoPiso": "Acero Antideslizante",
  "tipoBotoneraCOP": "LED RGB con Braille",
  "tipoAperturaPuerta": "Central",
  "anchoPasoPuerta": 900,
  "marcaOperador": "Schindler",
  "sistemaSeguridadPuerta": "Cortina Infrarroja",
  "marcaLimitador": "Schindler",
  "velocidadDisparo": 1.2,
  "tipoParacaidas": "Centralizador de fricción",
  "tipoAmortiguadores": "Hidráulicos",
  "tipoPesacargas": "Electrónico",
  "createdAt": "2026-06-22T22:00:00Z",
  "updatedAt": "2026-06-22T22:00:00Z"
}
```

**Error (404):**
```json
{ "error": "Ficha técnica no encontrada" }
```

---

### POST /api/ficha-tecnica

Crear una nueva ficha técnica para un equipo.

**Auth:** Requiere rol `EMPRESA`

**Body (JSON):**
```json
{
  "equipmentId": "...",
  "codigoEquipo": "ASC-001",
  "marcaOriginal": "Schindler",
  "modelo": "3300",
  "anoInstalacion": 2015,
  "paisOrigen": "Suiza",
  "numParadas": 10,
  "tipoTraccion": "Con cuarto de máquinas",
  "marcaMotor": "Schindler",
  "potenciaKW": 7.5,
  "voltajeAlimentacion": "380/220V 3F",
  "marcaControlElectrico": "Schindler",
  "tipoTecnologia": "VVVF",
  "numCablesTraccion": 8,
  "diametroCable": 16.0,
  "longitudAproximada": 45.0,
  "capacidadKilos": 1000,
  "capacidadPersonas": 13,
  "anchoCabina": 1100,
  "altoCabina": 2200,
  "profundidadCabina": 1200,
  "acabadoCabina": "Acero Inoxidable 304",
  "tipoPiso": "Acero Antideslizante",
  "tipoBotoneraCOP": "LED RGB con Braille",
  "tipoAperturaPuerta": "Central",
  "anchoPasoPuerta": 900,
  "marcaOperador": "Schindler",
  "sistemaSeguridadPuerta": "Cortina Infrarroja",
  "marcaLimitador": "Schindler",
  "velocidadDisparo": 1.2,
  "tipoParacaidas": "Centralizador de fricción",
  "tipoAmortiguadores": "Hidráulicos",
  "tipoPesacargas": "Electrónico"
}
```

**Response (201):** Retorna el objeto ficha técnica creado con metadatos de auditoría.

**Error (400):**
```json
{ "error": "Missing equipmentId" }
```

**Error (404):**
```json
{ "error": "Equipment not found" }
```

---

### PUT /api/ficha-tecnica

Actualizar una ficha técnica existente.

**Auth:** Requiere rol `EMPRESA`

**Body (JSON):**
```json
{
  "equipmentId": "...",
  "potenciaKW": 8.0,
  "anoInstalacion": 2020,
  ...otros campos a actualizar
}
```

**Response (200):** Retorna la ficha técnica actualizada.

**Error (404):**
```json
{ "error": "Ficha técnica no encontrada" }
```

---

## Validación de Tipos

### Campos Integer (validación automática)
- `anoInstalacion`
- `numParadas`
- `numCablesTraccion`
- `capacidadKilos`
- `capacidadPersonas`
- `anchoPasoPuerta`

### Campos Float (validación automática)
- `potenciaKW`
- `diametroCable`
- `longitudAproximada`
- `anchoCabina`
- `altoCabina`
- `profundidadCabina`
- `velocidadDisparo`

### Campos String
Todos los demás campos se tratan como texto. Pueden ser `null`.

---

## Estructura para el Frontend

### Objeto de mapeo de inputs del formulario

```javascript
const formFieldsMap = {
  // Información General
  "Código de Equipo": "codigoEquipo",
  "Marca Original": "marcaOriginal",
  "Modelo": "modelo",
  "Año de Instalación": "anoInstalacion", // type: number
  "País de Origen": "paisOrigen",
  "Número de Paradas": "numParadas", // type: number

  // Sistema de Fuerza / Motor
  "Tipo de Tracción": "tipoTraccion",
  "Marca del Motor": "marcaMotor",
  "Potencia (kW)": "potenciaKW", // type: number
  "Voltaje de Alimentación": "voltajeAlimentacion",
  "Marca Control Eléctrico": "marcaControlElectrico",
  "Tipo de Tecnología": "tipoTecnologia",

  // Cables y Suspensión
  "Número de Cables de Tracción": "numCablesTraccion", // type: number
  "Diámetro de Cable (mm)": "diametroCable", // type: number
  "Longitud Aproximada (m)": "longitudAproximada", // type: number

  // Cabina y Capacidades
  "Capacidad (kilos)": "capacidadKilos", // type: number
  "Capacidad (personas)": "capacidadPersonas", // type: number
  "Ancho de Cabina (mm)": "anchoCabina", // type: number
  "Alto de Cabina (mm)": "altoCabina", // type: number
  "Profundidad de Cabina (mm)": "profundidadCabina", // type: number
  "Acabado de Cabina": "acabadoCabina",
  "Tipo de Piso": "tipoPiso",
  "Tipo de Botonera COP": "tipoBotoneraCOP",

  // Accesos y Puertas
  "Tipo de Apertura de Puerta": "tipoAperturaPuerta",
  "Ancho de Paso de Puerta (mm)": "anchoPasoPuerta", // type: number
  "Marca del Operador": "marcaOperador",
  "Sistema de Seguridad de Puerta": "sistemaSeguridadPuerta",

  // Componentes Críticos de Seguridad
  "Marca del Limitador": "marcaLimitador",
  "Velocidad de Disparo (m/s)": "velocidadDisparo", // type: number
  "Tipo de Paracaídas": "tipoParacaidas",
  "Tipo de Amortiguadores": "tipoAmortiguadores",
  "Tipo de Pesacargas": "tipoPesacargas"
};
```

---

## Ejemplo de integración en el Dashboard

### Crear ficha técnica
```javascript
async function crearFichaTecnica(equipmentId, formData) {
  const response = await fetch('/api/ficha-tecnica', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ equipmentId, ...formData })
  });
  return response.json();
}
```

### Obtener ficha técnica
```javascript
async function obtenerFichaTecnica(equipmentId) {
  const response = await fetch(`/api/ficha-tecnica?equipmentId=${equipmentId}`);
  return response.json();
}
```

### Actualizar ficha técnica
```javascript
async function actualizarFichaTecnica(equipmentId, updateData) {
  const response = await fetch('/api/ficha-tecnica', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ equipmentId, ...updateData })
  });
  return response.json();
}
```

---

## Estructura para visualización elegante en cliente

```javascript
const sections = [
  {
    title: "Información General",
    fields: ["codigoEquipo", "marcaOriginal", "modelo", "anoInstalacion", "paisOrigen", "numParadas"]
  },
  {
    title: "Sistema de Fuerza",
    fields: ["tipoTraccion", "marcaMotor", "potenciaKW", "voltajeAlimentacion", "marcaControlElectrico", "tipoTecnologia"]
  },
  {
    title: "Cables y Suspensión",
    fields: ["numCablesTraccion", "diametroCable", "longitudAproximada"]
  },
  {
    title: "Cabina",
    fields: ["capacidadKilos", "capacidadPersonas", "anchoCabina", "altoCabina", "profundidadCabina", "acabadoCabina", "tipoPiso", "tipoBotoneraCOP"]
  },
  {
    title: "Puertas y Accesos",
    fields: ["tipoAperturaPuerta", "anchoPasoPuerta", "marcaOperador", "sistemaSeguridadPuerta"]
  },
  {
    title: "Componentes de Seguridad",
    fields: ["marcaLimitador", "velocidadDisparo", "tipoParacaidas", "tipoAmortiguadores", "tipoPesacargas"]
  }
];
```
