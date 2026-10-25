import React from 'react';
import { Fuel, AlertTriangle, CheckCircle2, ShieldCheck, Gauge } from 'lucide-react';
import { AppConfig } from '../types';
import { GlobalKPIs } from '../utils/calculations';
import { formatHoras, formatLitros } from '../utils/formatters';

interface FuelTankGaugeProps {
  kpis: GlobalKPIs;
  config: AppConfig;
}

export const FuelTankGauge: React.FC<FuelTankGaugeProps> = ({ kpis, config }) => {
  const plantaTankCap = config.capacidadTanquePlanta || 250;
  const plantaLevel = kpis.ultimoNivelTanquePlanta;
  const plantaPercent = Math.min(100, Math.max(0, Math.round((plantaLevel / plantaTankCap) * 100)));

  const isCritical = plantaLevel <= config.alertaNivelBajoLitros;
  const isLow = plantaPercent < 35 && !isCritical;

  // Principal nodriza tank
  const principalCap = config.capacidadTanquePrincipal || 5000;
  const principalLevel = kpis.stockTanquePrincipalEstimado;
  const principalPercent = Math.min(100, Math.max(0, Math.round((principalLevel / principalCap) * 100)));

  // Autonomy in daily tank vs total
  const autonomiaPlantaHoras = kpis.consumoPromedioLPorHora > 0
    ? plantaLevel / kpis.consumoPromedioLPorHora
    : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Estado de Tanques de Gasoil
            </h3>
            <p className="text-xs text-slate-400">
              Monitoreo de niveles, reservas y cálculo de autonomía
            </p>
          </div>
        </div>

        {isCritical ? (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold rounded-full animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            NIVEL CRÍTICO PLANTA
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Suministro Operativo
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Tanque Diario de la Planta Eléctrica (Visual Cylinder Gauge) */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
              Tanque Diario Generador
            </span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
              isCritical
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {plantaPercent}% de {plantaTankCap} L
            </span>
          </div>

          {/* Graphical Tank Container */}
          <div className="relative w-44 h-36 flex items-center justify-center my-1">
            {/* Cylindrical Tank SVG */}
            <svg className="w-full h-full drop-shadow-md" viewBox="0 0 180 120">
              <defs>
                <linearGradient id="tankBody" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="50%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
                <linearGradient id="dieselLiquid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isCritical ? '#ef4444' : isLow ? '#f97316' : '#f59e0b'} />
                  <stop offset="100%" stopColor={isCritical ? '#991b1b' : isLow ? '#c2410c' : '#b45309'} />
                </linearGradient>
              </defs>

              {/* Tank Outline Silhouette */}
              <rect
                x="20"
                y="15"
                width="140"
                height="90"
                rx="18"
                fill="url(#tankBody)"
                stroke="#334155"
                strokeWidth="3"
              />

              {/* Level Mark Lines */}
              <line x1="25" y1="37" x2="35" y2="37" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />
              <line x1="25" y1="60" x2="38" y2="60" stroke="#64748b" strokeWidth="2" />
              <line x1="25" y1="83" x2="35" y2="83" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />

              {/* Tank Fill Rectangle Clipped */}
              <clipPath id="tankInnerClip">
                <rect x="22" y="17" width="136" height="86" rx="16" />
              </clipPath>

              {/* Liquid Level */}
              {plantaPercent > 0 && (
                <g clipPath="url(#tankInnerClip)">
                  <rect
                    x="22"
                    y={17 + (86 * (100 - plantaPercent)) / 100}
                    width="136"
                    height={(86 * plantaPercent) / 100}
                    fill="url(#dieselLiquid)"
                    opacity="0.88"
                  />
                  {/* Subtle surface shine */}
                  <line
                    x1="22"
                    y1={17 + (86 * (100 - plantaPercent)) / 100}
                    x2="158"
                    y2={17 + (86 * (100 - plantaPercent)) / 100}
                    stroke="#fef08a"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                </g>
              )}

              {/* Gauge text in middle */}
              <text
                x="90"
                y="65"
                textAnchor="middle"
                className="font-mono font-black"
                fill="#ffffff"
                fontSize="18"
                fontWeight="bold"
              >
                {plantaLevel} L
              </text>
              <text
                x="90"
                y="80"
                textAnchor="middle"
                className="font-sans"
                fill="#cbd5e1"
                fontSize="9"
              >
                Tanque Diario
              </text>
            </svg>
          </div>

          {/* Autonomy text */}
          <div className="w-full flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Autonomía solo con este tanque:</span>
            <span className="font-mono font-bold text-amber-300">
              {autonomiaPlantaHoras.toFixed(1)} h continuous
            </span>
          </div>
        </div>

        {/* Right: Resumen de Stock Nodriza & Autonomía Global */}
        <div className="space-y-3.5">
          {/* Tanque Principal Nodriza */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Tanque Principal / Nodriza (Reserva General)
              </span>
              <span className="font-mono font-bold text-sky-300">
                {formatLitros(principalLevel)}
              </span>
            </div>

            {/* Progress Bar for Nodriza */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, principalPercent))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Capacidad base: {formatLitros(principalCap)}</span>
              <span>Calculado: Compras - Surtidos</span>
            </div>
          </div>

          {/* Total Fuel Available & Full Autonomy */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block mb-0.5">
                Stock Total Disponible
              </span>
              <span className="text-lg font-black font-mono text-emerald-400 block">
                {formatLitros(kpis.stockTotalDisponible)}
              </span>
              <span className="text-[10px] text-slate-400">
                Nodriza + Tanque Planta
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block mb-0.5 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                Autonomía Total Estimada
              </span>
              <span className="text-lg font-black font-mono text-amber-400 block">
                {formatHoras(kpis.autonomiaHorasEstimadas)}
              </span>
              <span className="text-[10px] text-slate-400">
                A razón de {kpis.consumoPromedioLPorHora.toFixed(2)} L/h
              </span>
            </div>
          </div>

          {/* Maintenance Countdown bar */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300 font-semibold block">
                Próximo Mantenimiento Preventivo
              </span>
              <span className="text-[11px] text-slate-400">
                Horómetro: {kpis.horometroActual.toFixed(1)} h • Intervalo: cada {config.intervaloMantenimientoHoras} h
              </span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-mono font-bold ${
                kpis.horasHastaMantenimiento <= 20 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {kpis.horasHastaMantenimiento.toFixed(1)} h
              </span>
              <span className="text-[10px] text-slate-400 block">restantes</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
