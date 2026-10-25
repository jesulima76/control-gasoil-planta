import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  Fuel,
  Zap,
  Calendar,
  DollarSign
} from 'lucide-react';
import { AppConfig, CompraGasoil, RegistroPlanta } from '../types';
import { MonthlySummary } from '../utils/calculations';
import { formatBs, formatConsumoRatio, formatHoras, formatLitros, formatUSD } from '../utils/formatters';

interface GraficosViewProps {
  monthly: MonthlySummary[];
  compras: CompraGasoil[];
  registrosPlanta: RegistroPlanta[];
  config: AppConfig;
}

const COLORS = ['#f59e0b', '#0284c7', '#10b981', '#ec4899', '#8b5cf6'];

export const GraficosView: React.FC<GraficosViewProps> = ({
  monthly,
  compras,
  registrosPlanta,
  config,
}) => {
  const [activeChartGroup, setActiveChartGroup] = useState<'all' | 'combustible' | 'financiero' | 'operacional'>('all');

  // Prepare data for Motivos Pie Chart
  const motivosCount: { [motivo: string]: number } = {};
  registrosPlanta.forEach((r) => {
    motivosCount[r.motivo] = (motivosCount[r.motivo] || 0) + (r.horasOperacion || 0);
  });

  const pieData = Object.keys(motivosCount).map((motivo) => ({
    name: motivo,
    value: Number(motivosCount[motivo].toFixed(1)),
  }));

  // Prepare chart dataset
  const chartData = monthly.map((m) => ({
    name: m.shortLabel,
    fullName: m.label,
    comprados: m.litrosComprados,
    consumidos: m.litrosConsumidos,
    balance: m.balanceNetoLitros,
    horas: Number(m.horasOperacion.toFixed(1)),
    ratioLh: Number(m.consumoPromedioLPorHora.toFixed(2)),
    totalUSD: m.totalUSDComprado,
    totalBs: m.totalBsComprado,
    costoPorHoraUSD: Number(m.costoPorHoraUSD.toFixed(2)),
    dias: m.diasConRegistro,
  }));

  const globalBenchmarkRatio = 7.76;

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Informes Gráficos de Consumo Comparativo & Eficiencia
          </h2>
          <p className="text-xs text-slate-400">
            Análisis visual de volúmenes de gasoil comprados vs consumidos, rendimiento por hora y costos
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveChartGroup('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeChartGroup === 'all'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos los Gráficos
          </button>
          <button
            onClick={() => setActiveChartGroup('combustible')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeChartGroup === 'combustible'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Litros & Balance
          </button>
          <button
            onClick={() => setActiveChartGroup('financiero')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeChartGroup === 'financiero'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inversión & Costo/Hora
          </button>
          <button
            onClick={() => setActiveChartGroup('operacional')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeChartGroup === 'operacional'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Horas & Operación
          </button>
        </div>
      </div>

      {/* Grid of Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Compras vs Consumo Mensual (Bar Chart) */}
        {(activeChartGroup === 'all' || activeChartGroup === 'combustible') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-amber-400" />
                  Comparativo Mensual: Compras vs Consumo (Litros)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Volumen de gasoil ingresado al almacén vs quemado por la planta
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val} L`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    formatter={(value: any, name: any) => [
                      `${formatLitros(Number(value))}`,
                      name === 'comprados' ? 'Litros Comprados' : 'Litros Consumidos',
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                    formatter={(value) => (value === 'comprados' ? 'Litros Comprados' : 'Litros Consumidos Planta')}
                  />
                  <Bar dataKey="comprados" fill="#3b82f6" name="comprados" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="consumidos" fill="#f59e0b" name="consumidos" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. Eficiencia de Planta (Consumo Promedio L/h por Mes) */}
        {(activeChartGroup === 'all' || activeChartGroup === 'combustible' || activeChartGroup === 'operacional') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Eficiencia Operativa: Consumo Específico (L/h)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Línea de referencia base establecida en {globalBenchmarkRatio} L/h
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" domain={[6.5, 9.0]} fontSize={11} tickFormatter={(val) => `${val} L/h`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    formatter={(value: any) => [`${value} L/h`, 'Consumo Medio']}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />
                  <ReferenceLine
                    y={globalBenchmarkRatio}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{ value: `Meta: ${globalBenchmarkRatio} L/h`, fill: '#ef4444', fontSize: 10, position: 'right' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ratioLh"
                    name="Consumo (L/h)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#10b981', stroke: '#0f172a', strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. Evolución de Inversión Financiera (USD & Bs.) */}
        {(activeChartGroup === 'all' || activeChartGroup === 'financiero') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Inversión Mensual en Combustible (USD)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Total invertido por período en compras de gasoil
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorUSD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                    formatter={(value: any) => [formatUSD(Number(value)), 'Inversión Total USD']}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="totalUSD"
                    name="Inversión Mensual USD"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorUSD)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 4. Horas Operativas de Planta por Mes */}
        {(activeChartGroup === 'all' || activeChartGroup === 'operacional') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-400" />
                  Horas de Generación Eléctrica Mensual
                </h3>
                <p className="text-[11px] text-slate-400">
                  Tiempo de servicio continuo y días de activación
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val} h`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                    formatter={(value: any) => [`${value} horas`, 'Horas de Operación']}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />
                  <Bar dataKey="horas" fill="#0284c7" name="Horas de Operación" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 5. Costo Estimado por Hora de Operación ($/h) */}
        {(activeChartGroup === 'all' || activeChartGroup === 'financiero') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  Costo de Combustible por Hora de Operación ($/h)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Gasto directo de gasoil por cada hora que la planta respalda la carga
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}/h`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                    formatter={(value: any) => [`$${value} USD/hora`, 'Costo por Hora']}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="costoPorHoraUSD"
                    name="Costo Unitario ($/h)"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 6. Distribución de Motivos de Encendido (Donut Chart) */}
        {(activeChartGroup === 'all' || activeChartGroup === 'operacional') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-purple-400" />
                  Distribución de Horas por Motivo de Encendido
                </h3>
                <p className="text-[11px] text-slate-400">
                  Porcentaje de tiempo dedicado a fallas de red, pruebas y mantenimientos
                </p>
              </div>
            </div>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                    formatter={(value: any) => [`${value} horas registradas`, 'Tiempo Total']}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px' }} />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
