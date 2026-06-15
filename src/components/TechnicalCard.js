/**
 * Componente de Tarjeta Técnica Reutilizable
 * Muestra parámetros técnicos con título y valor
 */
export default function TechnicalCard({ 
  title, 
  value, 
  unit = "", 
  icon = null,
  isEditable = false,
  onEdit = null
}) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && <span className="text-zinc-500">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-medium text-white">
          {value}
        </span>
        {unit && <span className="text-sm text-zinc-500">{unit}</span>}
      </div>
      {isEditable && (
        <button
          onClick={onEdit}
          className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-semibold uppercase tracking-wider transition-colors"
        >
          Editar
        </button>
      )}
    </div>
  );
}
