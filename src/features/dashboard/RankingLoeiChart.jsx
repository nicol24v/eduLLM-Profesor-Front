import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const LOEI_COLORS = {
  SAR: '#16a34a',
  DAR: '#84cc16',
  AAR: '#2563eb',
  PAAR: '#f59e0b',
  NAAR: '#dc2626',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="font-semibold text-slate-700 mb-1 truncate max-w-[160px]">{d.nombre}</p>
      <p style={{ color: LOEI_COLORS[d.nivel_loei] }}>
        Nota: <span className="font-bold">{d.nota_promedio.toFixed(2)}</span> — {d.nivel_loei}
      </p>
      <p className="text-slate-500">Partidas: {d.partidas_jugadas}</p>
    </div>
  );
};

export default function RankingLoeiChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-slate-400">
        Sin datos de ranking aún
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 36)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis
          type="category"
          dataKey="nombre"
          width={110}
          tick={{ fontSize: 11, fill: '#64748b' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={7} stroke="#f59e0b" strokeDasharray="4 2" />
        <Bar dataKey="nota_promedio" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={LOEI_COLORS[entry.nivel_loei] ?? '#94a3b8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
