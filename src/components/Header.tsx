import React, { useState } from 'react';
import {
  Fuel,
  Zap,
  TrendingUp,
  Settings,
  Download,
  PlusCircle,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  DollarSign,
  Cloud
} from 'lucide-react';
import { AppConfig, CompraGasoil, RegistroPlanta } from '../types';
import { GlobalKPIs } from '../utils/calculations';
import { formatBs, formatHoras, formatLitros, formatUSD } from '../utils/formatters';

interface HeaderProps {
  activeTab: 'dashboard' | 'compras' | 'planta' | 'graficos' | 'reportes' | 'vercel';
  setActiveTab: (tab: 'dashboard' | 'compras' | 'planta' | 'graficos' | 'reportes' | 'vercel') => void;
  kpis: GlobalKPIs;
  config: AppConfig;
  onOpenNewCompra: () => void;
  onOpenNewRegistroPlanta: () => void;
  onOpenConfig: () => void;
  onExportExcel: () => void;
  onUpdateTasaBCV: (newTasa: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  kpis,
  config,
  onOpenNewCompra,
  onOpenNewRegistroPlanta,
  onOpenConfig,
  onExportExcel,
  onUpdateTasaBCV,
}) => {
  const [editingTasa, setEditingTasa] = useState(false);
  const [tempTasa, setTempTasa] = useState(config.tasaBCVActual.toString());

  const handleSaveTasa = () => {
    const val = parseFloat(tempTasa);
    if (!isNaN(val) && val > 0) {
      onUpdateTasaBCV(val);
    }
    setEditingTasa(false);
  };

  const isLowFuel = kpis.ultimoNivelTanquePlanta <= config.alertaNivelBajoLitros;
  const isMaintenanceClose = kpis.horasHastaMantenimiento <= 20;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 shadow-xl sticky top-0 z-30">
      {/* Top Banner with Industrial Branding & Live Vital Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & System Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
              <Fuel className="w-6 h-6 text-slate-950" />
              <Zap className="w-3.5 h-3.5 text-yellow-300 absolute -top-1 -right-1 drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  Control Gasoil & Planta
                </h1>
                <span className="text-[10px] font-semibold tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  {config.potenciaKVA} kVA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-sm">
                {config.nombreEmpresa} • {config.modeloPlanta.split('(')[0]}
              </p>
            </div>
          </div>

          {/* Quick Vital Status Pill Badges */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Tasa BCV Editor Pill */}
            <div className="flex items-center bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 transition text-xs shadow-sm">
              <span className="text-slate-400 font-medium mr-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Tasa BCV:
              </span>
              {editingTasa ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    value={tempTasa}
                    onChange={(e) => setTempTasa(e.target.value)}
                    className="w-20 px-1 py-0.5 text-xs bg-slate-900 border border-amber-500 rounded text-white focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTasa()}
                  />
                  <button
                    onClick={handleSaveTasa}
                    className="px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded font-bold text-[10px] hover:bg-amber-400"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempTasa(config.tasaBCVActual.toString());
                    setEditingTasa(true);
                  }}
                  title="Haga clic para actualizar la tasa oficial BCV"
                  className="font-mono font-bold text-emerald-300 hover:text-emerald-200 underline decoration-dotted underline-offset-2"
                >
                  {formatBs(config.tasaBCVActual)}/USD
                </button>
              )}
            </div>

            {/* Tanque Diario Planta */}
            <div
              className={`flex items-center border rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-sm ${
                isLowFuel
                  ? 'bg-red-950/60 border-red-500/50 text-red-200 animate-pulse'
                  : 'bg-slate-800/90 border-slate-700 text-slate-200'
              }`}
              title={`Nivel actual del tanque diario de la planta (${kpis.ultimoNivelTanquePlanta} L de ${config.capacidadTanquePlanta} L)`}
            >
              {isLowFuel ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mr-1.5 shrink-0" />
              ) : (
                <Fuel className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
              )}
              <span>Tanque Planta:</span>
              <span className="font-mono font-bold ml-1 text-white">
                {kpis.ultimoNivelTanquePlanta} L
              </span>
              <span className="text-[10px] text-slate-400 ml-1">
                ({Math.round((kpis.ultimoNivelTanquePlanta / config.capacidadTanquePlanta) * 100)}%)
              </span>
            </div>

            {/* Horómetro Actual */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs shadow-sm">
              <Clock className="w-3.5 h-3.5 text-sky-400 mr-1.5" />
              <span className="text-slate-400">Horómetro:</span>
              <span className="font-mono font-bold ml-1 text-white">
                {kpis.horometroActual.toFixed(1)} h
              </span>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex items-center gap-1.5 ml-auto md:ml-0">
              <button
                onClick={onOpenNewCompra}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-md shadow-amber-500/20 active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nueva Compra</span>
                <span className="sm:hidden">+Compra</span>
              </button>

              <button
                onClick={onOpenNewRegistroPlanta}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition shadow-md shadow-sky-600/20 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reg. Planta</span>
                <span className="sm:hidden">+Planta</span>
              </button>

              <button
                onClick={onExportExcel}
                title="Exportar base completa a Excel (.xlsx)"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Excel</span>
              </button>

              <button
                onClick={onOpenConfig}
                title="Ajustes de Tanque y Sistema"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-1.5 no-scrollbar text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Dashboard General
          </button>

          <button
            onClick={() => setActiveTab('compras')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'compras'
                ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Fuel className="w-4 h-4" />
            Compras de Gasoil
            <span className="px-1.5 py-0.2 text-[10px] bg-slate-800 rounded-full text-slate-300 border border-slate-700">
              {kpis.comprasRegistradas}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('planta')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'planta'
                ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            Bitácora Planta Eléctrica
            <span className="px-1.5 py-0.2 text-[10px] bg-slate-800 rounded-full text-slate-300 border border-slate-700">
              {kpis.diasConRegistro} d
            </span>
          </button>

          <button
            onClick={() => setActiveTab('graficos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'graficos'
                ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Gráficos Comparativos
          </button>

          <button
            onClick={() => setActiveTab('reportes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'reportes'
                ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Reportes Mensuales Detallados
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'vercel'
                ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
                : 'text-emerald-400/80 hover:text-emerald-300 hover:bg-slate-800/60'
            }`}
          >
            <Cloud className="w-4 h-4 text-emerald-400" />
            🚀 Google Sheets & Vercel
          </button>
        </nav>
      </div>
    </header>
  );
};
