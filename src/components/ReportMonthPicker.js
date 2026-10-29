'use client';

export default function ReportMonthPicker({ months, activeKey, onSelect, counts = {} }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {months.map((month) => {
        const count = counts[month.key] || 0;
        const isActive = activeKey === month.key;

        return (
          <button
            key={month.key}
            type="button"
            onClick={() => onSelect(month.key)}
            aria-pressed={isActive}
            className={`flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition ${
              isActive
                ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-200'
                : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <span className="truncate font-medium">{month.label}</span>
            {count > 0 ? (
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                  isActive ? 'bg-cyan-400 text-zinc-950' : 'bg-emerald-500/15 text-emerald-300'
                }`}
              >
                {count}
              </span>
            ) : (
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-cyan-300' : 'bg-zinc-700'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
