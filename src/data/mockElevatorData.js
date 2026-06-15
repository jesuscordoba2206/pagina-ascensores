/**
 * Mock Data para Fichas Técnicas de Ascensores
 * Datos simulados para desarrollo y testing
 */

export const mockElevatorData = {
  id: "ASC-001-TOWER-NYC",
  general: {
    buildingName: "Torre Meridian - Nueva York",
    address: "1250 Broadway, New York, NY 10001",
    internalCode: "ASC-001",
    installationDate: "2019-03-15",
    lastMaintenanceDate: "2024-11-20"
  },
  tractionSystem: {
    machineQuantity: 2,
    motorBrand: "Otis",
    motorPower: { hp: 50, kw: 37.3 },
    powerSupply: "220V Trifásico",
    tractionType: "MR",
    brakeType: "Electroimán de Parchís"
  },
  cablesAndPerformance: {
    tractionCables: 8,
    cableGauge: "16 mm",
    stopQuantity: 28,
    nominalSpeed: 4.0
  },
  cabinAndSafety: {
    maxWeight: { kg: 2500, lbs: 5512 },
    capacity: 20,
    electricControlBrand: "Otis",
    doorOperatorBrand: "Otis",
    doorOperatorModel: "OP32",
    speedGovernorModel: "SG-4000",
    doorSensorType: "Infrarrojo Dual-banda"
  }
};

/**
 * Datos adicionales de múltiples ascensores para futura expansión
 */
export const mockElevatorsList = [
  {
    id: "ASC-001-TOWER-NYC",
    buildingName: "Torre Meridian - Nueva York",
    status: "activo",
    lastMaintenance: "2024-11-20"
  },
  {
    id: "ASC-002-CENTER-CHICAGO",
    buildingName: "Centro Financiero Chicago",
    status: "activo",
    lastMaintenance: "2024-11-15"
  },
  {
    id: "ASC-003-PLAZA-LA",
    buildingName: "Plaza Miami",
    status: "mantenimiento",
    lastMaintenance: "2024-10-30"
  }
];

export default mockElevatorData;
