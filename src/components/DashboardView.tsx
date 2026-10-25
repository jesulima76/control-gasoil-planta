import React from 'react';
import {
  TrendingUp,
  Fuel,
  DollarSign,
  Clock,
  Zap,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { AppConfig, CompraGasoil, RegistroPlanta } from '../types';
import { GlobalKPIs, MonthlySummary } from '../utils/calculations';
import {
  formatBs,
  formatConsumoRatio,
  formatHoras,
  formatLitros,
  formatNumber,
  formatUSD
} from '../utils/formatters';
import { FuelTankGauge } from './FuelTankGauge';

interface DashboardViewProps {
  kpis: GlobalKPIs;
  config: AppConfig;
  monthly: MonthlySummary[];
  compras: CompraGasoil[];
  registrosPlanta: RegistroPlanta[];
  onNavigateTab: (tab: 'compras' | 'planta' | 'graficos' | 'reportes') => void;
  onOpenNewCompra: () => void;
  onOpenNewRegistroPlanta: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  config,
  monthly,
  compras,
  registrosPlanta,
  onNavigateTab,
  onOpenNewCompra,
  onOpenNewRegistroPlanta,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Excel Dashboard Exact Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              <span>Cuadro de Mando Operacional</span>
              <span>•</span>
              <span className="text-slate-400">Generación y Combustible</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              DASHBOARD | CONTROL DE COMPRAS DE GASOIL Y PLANTA ELÉCTRICA
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Indicadores consolidados en tiempo real calculados a partir de las hojas{' '}
              <button
                onClick={() => onNavigateTab('compras')}
                className="text-amber-400 hover:underline font-semibold"
              >
                “COMPRA GASOIL”
              </button>{' '}
              y{' '}
              <button
                onClick={() => onNavigateTab('planta')}
                className="text-sky-400 hover:underline font-semibold"
              >
                “PLANTA ELÉCTRICA”
              </button>
              .
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('reportes')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              Ver Reportes Mensuales
            </button>
            <button
              onClick={() => onNavigateTab('graficos')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md shadow-amber-500/10 flex items-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4" />
              Gráficos Comparativos
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: 4 Main Strategic KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* COMPRAS REGISTRADAS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Compras Registradas</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {kpis.comprasRegistradas}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>Total operaciones</span>
            <button
              onClick={() => onNavigateTab('compras')}
              className="text-amber-400 hover:underline flex items-center gap-0.5 text-[11px] font-semibold"
            >
              Ver compras <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* LITROS COMPRADOS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Litros Comprados</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-400 font-mono">
            {formatLitros(kpis.litrosComprados)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>Volumen suministrado</span>
            <span className="text-[11px] font-mono text-slate-300">
              Gasoil / Diesel
            </span>
          </div>
        </div>

        {/* INVERSIÓN TOTAL (USD) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Inversión Total (USD)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {formatUSD(kpis.inversionTotalUSD)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>Moneda extranjera</span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              {kpis.litrosComprados > 0 ? (kpis.inversionTotalUSD / kpis.litrosComprados).toFixed(3) : 0} $/L
            </span>
          </div>
        </div>

        {/* INVERSIÓN TOTAL (BS.) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Inversión Total (Bs.)</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono truncate" title={formatBs(kpis.inversionTotalBs)}>
            {formatBs(kpis.inversionTotalBs)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>Moneda nacional</span>
            <span className="text-[11px] font-mono text-slate-300">
              Tasa ponderada
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Efficiency & Operational Metrics (Matching the exact second block of user Excel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PRECIO PROMEDIO (USD/L) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
            Precio Promedio (USD/L)
          </span>
          <div className="text-2xl font-black font-mono text-white">
            {formatUSD(kpis.precioPromedioUSD)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Costo medio por litro adquirido en divisas
          </p>
        </div>

        {/* PRECIO PROMEDIO (BS./L) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
            Precio Promedio (BS./L)
          </span>
          <div className="text-2xl font-black font-mono text-white truncate">
            {formatBs(kpis.precioPromedioBs)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Costo medio por litro en Bolívares
          </p>
        </div>

        {/* HORAS DE PLANTA REGISTRADAS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
            Horas de Planta Registradas
          </span>
          <div className="text-2xl font-black font-mono text-amber-400">
            {formatHoras(kpis.horasPlantaRegistradas)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tiempo total de respaldo eléctrico brindado
          </p>
        </div>

        {/* CONSUMO REGISTRADO */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
            Consumo Registrado
          </span>
          <div className="text-2xl font-black font-mono text-sky-400">
            {formatLitros(kpis.consumoRegistrado)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Litros surtidos y consumidos por la planta
          </p>
        </div>
      </div>

      {/* Visual Fuel Tank Status & Autonomy Gauge */}
      <FuelTankGauge kpis={kpis} config={config} />

      {/* Row 3: Split Section: EVOLUCIÓN MENSUAL DE COMPRAS vs OPERACIÓN DE LA PLANTA ELÉCTRICA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side (7 Cols): EVOLUCIÓN MENSUAL DE COMPRAS Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Evolución Mensual de Compras
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('compras')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              Gestionar Compras <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Mes</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Litros Comprados</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total USD</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total Bs.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {monthly.map((m) => (
                  <tr key={m.monthKey} className="hover:bg-slate-850 transition">
                    <td className="py-3 px-3 font-sans font-medium text-slate-200">
                      <span className="capitalize">{m.shortLabel}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-blue-300 font-bold">
                      {formatLitros(m.litrosComprados)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      {formatUSD(m.totalUSDComprado)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {formatBs(m.totalBsComprado)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-700 bg-slate-950 font-mono font-bold text-xs">
                  <td className="py-3 px-3 text-slate-300 font-sans uppercase">
                    Total
                  </td>
                  <td className="py-3 px-3 text-right text-blue-400">
                    {formatLitros(kpis.litrosComprados)}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400">
                    {formatUSD(kpis.inversionTotalUSD)}
                  </td>
                  <td className="py-3 px-3 text-right text-indigo-300">
                    {formatBs(kpis.inversionTotalBs)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>3 meses consolidados en el ejercicio 2026</span>
            <button
              onClick={onOpenNewCompra}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg font-semibold transition"
            >
              + Añadir Compra al Registro
            </button>
          </div>
        </div>

        {/* Right Side (5 Cols): OPERACIÓN DE LA PLANTA ELÉCTRICA Table */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Operación de la Planta Eléctrica
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('planta')}
              className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
            >
              Ver Bitácora <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {/* Días con registro */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Días con registro:</span>
              <span className="font-mono font-bold text-white text-sm bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                {kpis.diasConRegistro}
              </span>
            </div>

            {/* Litros surtidos */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Litros surtidos:</span>
              <span className="font-mono font-bold text-sky-400 text-sm">
                {formatLitros(kpis.consumoRegistrado)}
              </span>
            </div>

            {/* Consumo promedio (L/h) */}
            <div className="py-3 flex items-center justify-between bg-amber-500/5 px-2 rounded-lg">
              <div>
                <span className="text-white font-bold block">Consumo promedio (L/h):</span>
                <span className="text-[11px] text-slate-400">Rendimiento medio motor</span>
              </div>
              <span className="font-mono font-black text-amber-400 text-base">
                {formatConsumoRatio(kpis.consumoPromedioLPorHora)}
              </span>
            </div>

            {/* Último nivel de tanque (L) */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Último nivel de tanque (L):</span>
              <span className="font-mono font-bold text-white text-sm">
                {formatLitros(kpis.ultimoNivelTanquePlanta)}
              </span>
            </div>

            {/* Tasa BCV más reciente */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Tasa BCV más reciente:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {formatBs(config.tasaBCVActual)}/USD
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Horómetro actual: {kpis.horometroActual.toFixed(1)} h</span>
            <button
              onClick={onOpenNewRegistroPlanta}
              className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg font-semibold transition"
            >
              + Registrar Horas/Surtido
            </button>
          </div>
        </div>

      </div>

      {/* Quick Summary of Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Últimas Compras */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-amber-400" />
              Últimos Despachos de Combustible
            </span>
            <button
              onClick={() => onNavigateTab('compras')}
              className="text-amber-400 hover:underline"
            >
              Ver todas ({compras.length})
            </button>
          </div>
          <div className="space-y-2">
            {compras.slice(-3).reverse().map((c) => (
              <div
                key={c.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{c.proveedor}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {c.numeroFactura}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {c.fecha} • {c.tanqueDestino}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-400 block">
                    {formatLitros(c.litros)}
                  </span>
                  <span className="font-mono text-emerald-400 text-[11px]">
                    {formatUSD(c.totalUSD)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos Encendidos de Planta */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-400" />
              Últimas Operaciones del Generador
            </span>
            <button
              onClick={() => onNavigateTab('planta')}
              className="text-sky-400 hover:underline"
            >
              Ver bitácora ({registrosPlanta.length})
            </button>
          </div>
          <div className="space-y-2">
            {registrosPlanta.slice(-3).reverse().map((r) => (
              <div
                key={r.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{r.fecha}</span>
                    <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-1.5 py-0.5 rounded">
                      {r.motivo}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    Horómetro: {r.horometroInicial.toFixed(1)}h → {r.horometroFinal.toFixed(1)}h ({r.horasOperacion.toFixed(1)}h)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sky-400 block">
                    {formatLitros(r.litrosSurtidos)}
                  </span>
                  <span className="font-mono text-amber-400 text-[11px]">
                    {r.consumoPorHora.toFixed(2)} L/h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
