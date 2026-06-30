import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-blue-600">
        Nota promedio: <span className="font-bold">{payload[0].value.toFixed(2)}</span>
      </p>
      <p className="text-slate-500">Participantes: {payload[0].payload.total_participantes}</p>
    </div>
  );
};

export default function EvolucionGrupalChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-slate-400">
        Sin datos de evolución aún
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    fechaLabel: d.fecha.slice(5).replace('-', '/'),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="fechaLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={7}
          stroke="#f59e0b"
          strokeDasharray="4 2"
          label={{ value: 'Mín. 7.0', position: 'insideTopLeft', fontSize: 10, fill: '#f59e0b' }}
        />
        <Line
          type="monotone"
          dataKey="promedio_nota"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 4, fill: '#2563eb' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
