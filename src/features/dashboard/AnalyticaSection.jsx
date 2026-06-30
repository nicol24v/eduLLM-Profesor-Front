import React from 'react';
import { Skeleton } from '@mui/material';
import { useAnalitica } from './hooks/useAnalitica';
import EvolucionGrupalChart from './EvolucionGrupalChart';
import RankingLoeiChart from './RankingLoeiChart';

const LOEI_LEGEND = [
  { nivel: 'SAR', label: 'Supera (9–10)', color: '#16a34a' },
  { nivel: 'DAR', label: 'Domina (8–8.99)', color: '#84cc16' },
  { nivel: 'AAR', label: 'Alcanza (7–7.99)', color: '#2563eb' },
  { nivel: 'PAAR', label: 'Próximo (5–6.99)', color: '#f59e0b' },
  { nivel: 'NAAR', label: 'No alcanza (<5)', color: '#dc2626' },
];

const ChartCard = ({ title, subtitle, gradient, children }) => (
  <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${gradient} flex-shrink-0`} />
      <div>
        <p className="text-sm font-bold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
    <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
    <div className="h-48 bg-gray-100 rounded-xl" />
  </div>
);

export default function AnalyticaSection() {
  const { data, isLoading, isError } = useAnalitica();

  const evolucion = data?.evolucion ?? [];
  const ranking = data?.ranking ?? [];
  const isEmpty = !isLoading && !isError && evolucion.length === 0 && ranking.length === 0;

  return (
    <div className="mt-8">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">Análisis del período activo</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Escala LOEI · Nota mínima aprobatoria 7.00
        </p>
      </div>

      {isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          Error al cargar análisis. Verifica la conexión con el servidor.
        </div>
      )}

      {isEmpty && (
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center text-slate-500 text-sm">
          Aún no hay partidas finalizadas en el período activo.
        </div>
      )}

      {!isEmpty && (
        <>
          <div className="flex flex-wrap gap-3 mb-5">
            {LOEI_LEGEND.map((l) => (
              <div key={l.nivel} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-xs text-slate-600">{l.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ChartCard
              title="Evolución del grupo"
              subtitle="Promedio LOEI por partida finalizada"
              gradient="from-blue-500 to-blue-600"
            >
              {isLoading ? <ChartSkeleton /> : <EvolucionGrupalChart data={evolucion} />}
            </ChartCard>

            <ChartCard
              title="Ranking estudiantil"
              subtitle="Nota LOEI promedio por estudiante"
              gradient="from-emerald-500 to-emerald-600"
            >
              {isLoading ? <ChartSkeleton /> : <RankingLoeiChart data={ranking} />}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
