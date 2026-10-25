import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Fuel,
  Zap,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Clock,
  DollarSign
} from 'lucide-react';
import { AppConfig, CompraGasoil, RegistroPlanta } from '../types';
import { MonthlySummary } from '../utils/calculations';
import {
  formatBs,
  formatConsumoRatio,
  formatHoras,
  formatLitros,
  formatMonthYear,
  formatUSD
} from '../utils/formatters';

interface ReportesViewProps {
  monthly: MonthlySummary[];
  compras: CompraGasoil[];
  registrosPlanta: RegistroPlanta[];
  config: AppConfig;
  onExportExcel: () => void;
}

export const ReportesView: React.FC<ReportesViewProps> = ({
  monthly,
  compras,
  registrosPlanta,
  config,
  onExportExcel,
}) => {
  // Default to the latest month available
  const availableMonths = useMemo(() => {
    return monthly.map((m) => m.monthKey).reverse();
  }, [monthly]);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    availableMonths[0] || '2026-10'
  );

  // Month data
  const currentMonthData = useMemo(() => {
    return monthly.find((m) => m.monthKey === selectedMonthKey) || monthly[0];
  }, [monthly, selectedMonthKey]);

  // Purchases in this month
  const monthCompras = useMemo(() => {
    return compras.filter((c) => c.fecha.startsWith(selectedMonthKey));
  }, [compras, selectedMonthKey]);

  // Plant runs in this month
  const monthRegs = useMemo(() => {
    return registrosPlanta
      .filter((r) => r.fecha.startsWith(selectedMonthKey))
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horometroInicial - b.horometroInicial);
  }, [registrosPlanta, selectedMonthKey]);

  // Horometer range
  const horometroRange = useMemo(() => {
    if (monthRegs.length === 0) return { start: 0, end: 0 };
    return {
      start: monthRegs[0].horometroInicial,
      end: monthRegs[monthRegs.length - 1].horometroFinal,
    };
  }, [monthRegs]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter and Actions Bar (Hidden when printing) */}
      <div className="no-print bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Reportes Mensuales Detallados de Combustible y Generación
          </h2>
          <p className="text-xs text-slate-400">
            Generador de informe técnico-financiero mensual con balance de combustible y bitácora
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {availableMonths.map((mKey) => (
                <option key={mKey} value={mKey} className="bg-slate-900 text-white">
                  {formatMonthYear(mKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition border border-slate-700 active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Imprimir / Guardar PDF
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-700/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Descargar Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-slate-900 border border-slate-800 print:bg-white print:text-black print:border-none print:shadow-none rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Document Official Header */}
        <div className="border-b-2 border-slate-800 print:border-gray-800 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black">
                  INFORME TÉCNICO MENSUAL DE OPERACIONES
                </span>
                <span className="text-slate-600 print:text-gray-400">•</span>
                <span className="text-xs text-slate-400 print:text-gray-600 font-mono">
                  REF: GASOIL-{selectedMonthKey}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white print:text-black tracking-tight">
                {config.nombreEmpresa}
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
                Planta Eléctrica de Respaldo: <strong className="text-slate-200 print:text-black">{config.modeloPlanta}</strong> ({config.potenciaKVA} kVA)
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 print:text-gray-700 space-y-0.5 font-mono">
              <div>
                <strong className="text-slate-200 print:text-black font-sans">Período Auditado:</strong>{' '}
                <span className="text-amber-400 print:text-black font-bold">
                  {formatMonthYear(selectedMonthKey)}
                </span>
              </div>
              <div>
                <strong className="text-slate-200 print:text-black font-sans">Fecha de Emisión:</strong>{' '}
                {new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div>
                <strong className="text-slate-200 print:text-black font-sans">Tasa BCV del Período:</strong>{' '}
                {formatBs(config.tasaBCVActual)}/USD
              </div>
            </div>
          </div>
        </div>

        {/* 1. Executive Summary Table / KPI Grid for Selected Month */}
        <div>
          <h3 className="text-sm font-bold text-slate-300 print:text-black uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400 print:text-black" />
            1. Resumen Ejecutivo del Mes ({formatMonthYear(selectedMonthKey)})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Litros Comprados */}
            <div className="bg-slate-950/70 print:bg-gray-100 border border-slate-800 print:border-gray-300 p-3.5 rounded-xl">
              <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block mb-1">
                Litros Comprados
              </span>
              <span className="text-xl font-black font-mono text-blue-400 print:text-black block">
                {formatLitros(currentMonthData?.litrosComprados || 0)}
              </span>
              <span className="text-[10px] text-slate-500 print:text-gray-600">
                {monthCompras.length} despachos
              </span>
            </div>

            {/* Litros Consumidos */}
            <div className="bg-slate-950/70 print:bg-gray-100 border border-slate-800 print:border-gray-300 p-3.5 rounded-xl">
              <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block mb-1">
                Litros Consumidos
              </span>
              <span className="text-xl font-black font-mono text-amber-400 print:text-black block">
                {formatLitros(currentMonthData?.litrosConsumidos || 0)}
              </span>
              <span className="text-[10px] text-slate-500 print:text-gray-600">
                Por la planta eléctrica
              </span>
            </div>

            {/* Horas Generador */}
            <div className="bg-slate-950/70 print:bg-gray-100 border border-slate-800 print:border-gray-300 p-3.5 rounded-xl">
              <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block mb-1">
                Horas de Operación
              </span>
              <span className="text-xl font-black font-mono text-white print:text-black block">
                {formatHoras(currentMonthData?.horasOperacion || 0)}
              </span>
              <span className="text-[10px] text-slate-500 print:text-gray-600">
                {currentMonthData?.diasConRegistro || 0} días con servicio
              </span>
            </div>

            {/* Consumo Específico L/h */}
            <div className="bg-slate-950/70 print:bg-gray-100 border border-slate-800 print:border-gray-300 p-3.5 rounded-xl">
              <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block mb-1">
                Consumo Medio L/h
              </span>
              <span className="text-xl font-black font-mono text-emerald-400 print:text-black block">
                {formatConsumoRatio(currentMonthData?.consumoPromedioLPorHora || 0)}
              </span>
              <span className="text-[10px] text-slate-500 print:text-gray-600">
                Eficiencia promedio
              </span>
            </div>
          </div>
        </div>

        {/* 2. Fuel Balance Reconciliation & Financial Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid">
          {/* Balance Físico de Combustible */}
          <div className="bg-slate-950/50 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-300 print:text-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-amber-400 print:text-black" />
              Balance Físico de Gasoil en el Mes
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-700 font-sans">Entradas (+ Compras):</span>
                <span className="font-bold text-blue-400 print:text-black">
                  +{formatLitros(currentMonthData?.litrosComprados || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-700 font-sans">Salidas (- Consumo Planta):</span>
                <span className="font-bold text-amber-400 print:text-black">
                  -{formatLitros(currentMonthData?.litrosConsumidos || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 font-bold">
                <span className="text-slate-200 print:text-black font-sans">Balance Neto del Mes:</span>
                <span className={`text-sm ${
                  (currentMonthData?.balanceNetoLitros || 0) >= 0 ? 'text-emerald-400 print:text-black' : 'text-red-400 print:text-black'
                }`}>
                  {(currentMonthData?.balanceNetoLitros || 0) >= 0 ? '+' : ''}
                  {formatLitros(currentMonthData?.balanceNetoLitros || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1 pt-2 border-t border-slate-800 print:border-gray-200 text-[11px] text-slate-400 print:text-gray-600">
                <span className="font-sans">Rango de Horómetro:</span>
                <span>{horometroRange.start.toFixed(1)} h → {horometroRange.end.toFixed(1)} h</span>
              </div>
            </div>
          </div>

          {/* Desglose Financiero */}
          <div className="bg-slate-950/50 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-300 print:text-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400 print:text-black" />
              Desglose Financiero y Costo Operativo
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-700 font-sans">Inversión Compras USD:</span>
                <span className="font-bold text-emerald-400 print:text-black">
                  {formatUSD(currentMonthData?.totalUSDComprado || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-700 font-sans">Inversión Compras Bs.:</span>
                <span className="text-indigo-300 print:text-black">
                  {formatBs(currentMonthData?.totalBsComprado || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-700 font-sans">Precio Promedio Unitario:</span>
                <span className="text-slate-200 print:text-black">
                  ${(currentMonthData?.precioPromedioUSD || 0).toFixed(3)} / Litro
                </span>
              </div>
              <div className="flex justify-between py-1.5 font-bold">
                <span className="text-slate-200 print:text-black font-sans">Costo Estimado por Hora:</span>
                <span className="text-sm text-amber-400 print:text-black">
                  ${(currentMonthData?.costoPorHoraUSD || 0).toFixed(2)} USD / hora
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Detailed Table of Generator Operating Sessions in Month */}
        <div className="print-break-inside-avoid">
          <h3 className="text-sm font-bold text-slate-300 print:text-black uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400 print:text-black" />
            2. Detalle de Operaciones de Planta ({monthRegs.length} registros)
          </h3>

          <div className="overflow-x-auto border border-slate-800 print:border-gray-400 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-gray-900 border-b border-slate-800 print:border-gray-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2 px-3">Fecha</th>
                  <th className="py-2 px-3">Horario</th>
                  <th className="py-2 px-3 text-right">Horóm. Inicial</th>
                  <th className="py-2 px-3 text-right">Horóm. Final</th>
                  <th className="py-2 px-3 text-right">Horas</th>
                  <th className="py-2 px-3 text-right">Litros</th>
                  <th className="py-2 px-3 text-right">L/h</th>
                  <th className="py-2 px-3">Motivo</th>
                  <th className="py-2 px-3">Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300 font-mono text-[11px]">
                {monthRegs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-4 text-center text-slate-500 font-sans">
                      No hay registros de operación para este mes.
                    </td>
                  </tr>
                ) : (
                  monthRegs.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-850/50 print:hover:bg-transparent">
                      <td className="py-2 px-3 font-sans text-slate-200 print:text-black whitespace-nowrap">
                        {r.fecha}
                      </td>
                      <td className="py-2 px-3 text-slate-400 print:text-gray-700 whitespace-nowrap">
                        {r.horaInicio || 'N/A'} - {r.horaFin || 'N/A'}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400 print:text-gray-700">
                        {r.horometroInicial.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300 print:text-black font-bold">
                        {r.horometroFinal.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-amber-400 print:text-black">
                        {r.horasOperacion.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-sky-400 print:text-black">
                        {r.litrosSurtidos}
                      </td>
                      <td className="py-2 px-3 text-right text-emerald-400 print:text-black font-semibold">
                        {r.consumoPorHora.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-300 print:text-black whitespace-nowrap text-[10px]">
                        {r.motivo}
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-400 print:text-gray-800 whitespace-nowrap text-[10px]">
                        {r.operador}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-950 print:bg-gray-100 border-t-2 border-slate-700 print:border-gray-500 font-mono font-bold text-xs">
                <tr>
                  <td colSpan={4} className="py-2.5 px-3 font-sans uppercase text-slate-300 print:text-black">
                    Totales Operativos del Mes:
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-400 print:text-black">
                    {formatHoras(currentMonthData?.horasOperacion || 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-sky-400 print:text-black">
                    {formatLitros(currentMonthData?.litrosConsumidos || 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 print:text-black">
                    {formatConsumoRatio(currentMonthData?.consumoPromedioLPorHora || 0)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 4. Detailed Table of Fuel Purchases in Month */}
        <div className="print-break-inside-avoid">
          <h3 className="text-sm font-bold text-slate-300 print:text-black uppercase tracking-wider mb-3 flex items-center gap-2">
            <Fuel className="w-4 h-4 text-amber-400 print:text-black" />
            3. Detalle de Compras y Suministros de Gasoil ({monthCompras.length} despachos)
          </h3>

          <div className="overflow-x-auto border border-slate-800 print:border-gray-400 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-gray-900 border-b border-slate-800 print:border-gray-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2 px-3">Fecha</th>
                  <th className="py-2 px-3">Proveedor</th>
                  <th className="py-2 px-3">Factura</th>
                  <th className="py-2 px-3 text-right">Litros</th>
                  <th className="py-2 px-3 text-right">Precio USD/L</th>
                  <th className="py-2 px-3 text-right">Total USD</th>
                  <th className="py-2 px-3 text-right">Tasa BCV</th>
                  <th className="py-2 px-3 text-right">Total Bs.</th>
                  <th className="py-2 px-3">Tanque Destino</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300 font-mono text-[11px]">
                {monthCompras.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-4 text-center text-slate-500 font-sans">
                      No se registraron compras de combustible en este mes.
                    </td>
                  </tr>
                ) : (
                  monthCompras.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 px-3 font-sans text-slate-200 print:text-black whitespace-nowrap">
                        {c.fecha}
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-300 print:text-black">
                        {c.proveedor}
                      </td>
                      <td className="py-2 px-3 text-slate-400 print:text-gray-700 whitespace-nowrap">
                        {c.numeroFactura}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-blue-400 print:text-black">
                        {formatLitros(c.litros)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300 print:text-black">
                        ${c.precioUnitarioUSD.toFixed(3)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400 print:text-black">
                        {formatUSD(c.totalUSD)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400 print:text-gray-700 text-[10px]">
                        {c.tasaBCV.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-indigo-300 print:text-black">
                        {formatBs(c.totalBs)}
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-400 print:text-gray-800 text-[10px]">
                        {c.tanqueDestino.replace('Tanque Principal (Nodriza)', 'Nodriza')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-950 print:bg-gray-100 border-t-2 border-slate-700 print:border-gray-500 font-mono font-bold text-xs">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3 font-sans uppercase text-slate-300 print:text-black">
                    Total Comprado en el Mes:
                  </td>
                  <td className="py-2.5 px-3 text-right text-blue-400 print:text-black">
                    {formatLitros(currentMonthData?.litrosComprados || 0)}
                  </td>
                  <td />
                  <td className="py-2.5 px-3 text-right text-emerald-400 print:text-black">
                    {formatUSD(currentMonthData?.totalUSDComprado || 0)}
                  </td>
                  <td />
                  <td className="py-2.5 px-3 text-right text-indigo-300 print:text-black">
                    {formatBs(currentMonthData?.totalBsComprado || 0)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 5. Formal Audit Sign-Off Box (Official Report Signatures) */}
        <div className="pt-8 border-t-2 border-slate-800 print:border-gray-800 print-break-inside-avoid">
          <div className="grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-8">
              <div className="h-10 border-b border-dashed border-slate-700 print:border-gray-500" />
              <div>
                <span className="font-bold text-slate-200 print:text-black block">
                  Operador de Planta
                </span>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">
                  Responsable de Bitácora
                </span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="h-10 border-b border-dashed border-slate-700 print:border-gray-500" />
              <div>
                <span className="font-bold text-slate-200 print:text-black block">
                  Supervisor de Mantenimiento
                </span>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">
                  Verificación de Horómetros y Rendimiento
                </span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="h-10 border-b border-dashed border-slate-700 print:border-gray-500" />
              <div>
                <span className="font-bold text-slate-200 print:text-black block">
                  Gerencia de Operaciones
                </span>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">
                  Aprobación de Compras y Balance
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
