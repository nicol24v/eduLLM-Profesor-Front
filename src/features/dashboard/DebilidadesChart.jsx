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

function getBarColor(tasa) {
  if (tasa >= 70) return '#dc2626';
  if (tasa >= 50) return '#f59e0b';
  return '#2563eb';
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-xs max-w-[240px]">
      <p className="font-semibold text-slate-700 mb-1 break-words">{d.pregunta}</p>
      <p className="text-slate-500 mb-0.5">Quiz: {d.quiz}</p>
      <p style={{ color: getBarColor(d.tasa_error) }}>
        Tasa de error: <span className="font-bold">{d.tasa_error}%</span>
      </p>
      <p className="text-slate-400">{d.total_respuestas} respuestas totales</p>
    </div>
  );
};

export default function DebilidadesChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-slate-400">
        Sin datos de respuestas aún
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    preguntaLabel: d.pregunta.length > 45 ? `${d.pregunta.slice(0, 45)}…` : d.pregunta,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 42)}>
      <BarChart
        layout="vertical"
        data={formatted}
        margin={{ top: 8, right: 48, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
        />
        <YAxis
          type="category"
          dataKey="preguntaLabel"
          width={200}
          tick={{ fontSize: 10, fill: '#64748b' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={50} stroke="#f59e0b" strokeDasharray="4 2" />
        <Bar dataKey="tasa_error" radius={[0, 4, 4, 0]}>
          {formatted.map((entry, i) => (
            <Cell key={i} fill={getBarColor(entry.tasa_error)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
