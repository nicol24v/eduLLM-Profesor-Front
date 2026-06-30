import React from 'react';

const CELL_W = 72;
const NAME_W = 150;

function getCellBg(nota) {
  if (nota === null) return '#f1f5f9';
  if (nota >= 9) return '#bbf7d0';
  if (nota >= 8) return '#d9f99d';
  if (nota >= 7) return '#bfdbfe';
  if (nota >= 5) return '#fde68a';
  return '#fecaca';
}

function getCellColor(nota) {
  if (nota === null) return '#94a3b8';
  if (nota >= 9) return '#15803d';
  if (nota >= 8) return '#4d7c0f';
  if (nota >= 7) return '#1d4ed8';
  if (nota >= 5) return '#92400e';
  return '#991b1b';
}

export default function HeatmapChart({ data }) {
  if (!data?.filas?.length || !data?.quizzes?.length) {
    return (
      <div className="flex items-center justify-center h-[180px] text-sm text-slate-400">
        Sin datos de participación aún
      </div>
    );
  }

  const { quizzes, filas } = data;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: NAME_W + quizzes.length * CELL_W }}>
        {/* Header row */}
        <div className="flex mb-1">
          <div style={{ width: NAME_W, flexShrink: 0 }} />
          {quizzes.map((q, i) => (
            <div
              key={i}
              style={{ width: CELL_W, flexShrink: 0 }}
              className="text-center text-[10px] text-slate-500 font-medium px-1 truncate"
              title={q}
            >
              {q.length > 10 ? `${q.slice(0, 10)}…` : q}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {filas.map((fila, ri) => (
          <div key={ri} className="flex items-center mb-1">
            <div
              style={{ width: NAME_W, flexShrink: 0 }}
              className="text-xs text-slate-700 font-medium truncate pr-2"
              title={fila.estudiante}
            >
              {fila.estudiante}
            </div>
            {fila.valores.map((v, ci) => (
              <div
                key={ci}
                style={{
                  width: CELL_W - 4,
                  marginRight: 4,
                  flexShrink: 0,
                  backgroundColor: getCellBg(v),
                  color: getCellColor(v),
                }}
                className="h-7 rounded flex items-center justify-center text-[11px] font-semibold"
                title={v === null ? 'No participó' : `Nota: ${v.toFixed(2)}`}
              >
                {v === null ? '—' : v.toFixed(1)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
