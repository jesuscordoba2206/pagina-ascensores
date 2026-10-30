export const EQUIPMENT_TYPE_OPTIONS = [
  { value: 'Ascensor', label: 'Ascensor' },
  { value: 'Puerta automática', label: 'Puerta automática' },
  { value: 'Escalera eléctrica', label: 'Escalera eléctrica' },
];

export const DEFAULT_EQUIPMENT_TYPE = EQUIPMENT_TYPE_OPTIONS[0].value;

const TYPE_ALIASES = new Map([
  ['ascensor', 'Ascensor'],
  ['elevador', 'Ascensor'],
  ['puerta', 'Puerta automática'],
  ['puerta automatica', 'Puerta automática'],
  ['puerta peatonal', 'Puerta automática'],
  ['escalera', 'Escalera eléctrica'],
  ['escalera electrica', 'Escalera eléctrica'],
  ['escalera mecanica', 'Escalera eléctrica'],
]);

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

export function normalizeEquipmentType(value) {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  if (TYPE_ALIASES.has(normalized)) {
    return TYPE_ALIASES.get(normalized);
  }

  const directMatch = EQUIPMENT_TYPE_OPTIONS.find((option) => normalizeText(option.value) === normalized);
  return directMatch ? directMatch.value : null;
}

export function isValidEquipmentType(value) {
  return Boolean(normalizeEquipmentType(value));
}
