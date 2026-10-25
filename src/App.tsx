/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_COMPRAS,
  INITIAL_CONFIG,
  INITIAL_REGISTROS_PLANTA,
} from './data/initialData';
import { AppConfig, CompraGasoil, RegistroPlanta } from './types';
import {
  computeGlobalKPIs,
  computeMonthlyBreakdown,
  exportToExcel,
} from './utils/calculations';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ComprasView } from './components/ComprasView';
import { PlantaView } from './components/PlantaView';
import { GraficosView } from './components/GraficosView';
import { ReportesView } from './components/ReportesView';
import { ConfiguracionModal } from './components/ConfiguracionModal';
import { VercelDeployView } from './components/VercelDeployView';

const STORAGE_KEYS = {
  COMPRAS: 'gasoil_compras_v1',
  PLANTA: 'gasoil_planta_v1',
  CONFIG: 'gasoil_config_v1',
};

export default function App() {
  // Load state from localStorage or initial seed
  const [compras, setCompras] = useState<CompraGasoil[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPRAS);
      return saved ? JSON.parse(saved) : INITIAL_COMPRAS;
    } catch {
      return INITIAL_COMPRAS;
    }
  });

  const [registrosPlanta, setRegistrosPlanta] = useState<RegistroPlanta[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLANTA);
      return saved ? JSON.parse(saved) : INITIAL_REGISTROS_PLANTA;
    } catch {
      return INITIAL_REGISTROS_PLANTA;
    }
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'compras' | 'planta' | 'graficos' | 'reportes' | 'vercel'>('dashboard');

  // Modals
  const [isCompraModalOpen, setIsCompraModalOpen] = useState(false);
  const [isPlantaModalOpen, setIsPlantaModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPRAS, JSON.stringify(compras));
    } catch (e) {
      console.error('Error saving compras:', e);
    }
  }, [compras]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLANTA, JSON.stringify(registrosPlanta));
    } catch (e) {
      console.error('Error saving registros planta:', e);
    }
  }, [registrosPlanta]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving config:', e);
    }
  }, [config]);

  // Global KPIs and Monthly Breakdown
  const kpis = useMemo(() => {
    return computeGlobalKPIs(compras, registrosPlanta, config);
  }, [compras, registrosPlanta, config]);

  const monthly = useMemo(() => {
    return computeMonthlyBreakdown(compras, registrosPlanta);
  }, [compras, registrosPlanta]);

  // Handlers for Compras
  const handleSaveCompra = (newCompra: CompraGasoil) => {
    setCompras((prev) => {
      const existsIndex = prev.findIndex((c) => c.id === newCompra.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = newCompra;
        return copy;
      }
      return [newCompra, ...prev];
    });
  };

  const handleDeleteCompra = (id: string) => {
    setCompras((prev) => prev.filter((c) => c.id !== id));
  };

  // Handlers for Planta
  const handleSaveRegistroPlanta = (newReg: RegistroPlanta) => {
    setRegistrosPlanta((prev) => {
      const existsIndex = prev.findIndex((r) => r.id === newReg.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = newReg;
        return copy;
      }
      return [newReg, ...prev];
    });
  };

  const handleDeleteRegistroPlanta = (id: string) => {
    setRegistrosPlanta((prev) => prev.filter((r) => r.id !== id));
  };

  // Handler for live Tasa BCV update
  const handleUpdateTasaBCV = (newTasa: number) => {
    setConfig((prev) => ({ ...prev, tasaBCVActual: newTasa }));
  };

  // Handler for Excel Export
  const handleExportExcel = () => {
    exportToExcel(compras, registrosPlanta, config);
  };

  // Reset to initial spreadsheet seed
  const handleResetData = () => {
    setCompras(INITIAL_COMPRAS);
    setRegistrosPlanta(INITIAL_REGISTROS_PLANTA);
    setConfig(INITIAL_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.COMPRAS);
    localStorage.removeItem(STORAGE_KEYS.PLANTA);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
  };

  // Full JSON backup import
  const handleImportFullBackup = (data: {
    config: AppConfig;
    compras: CompraGasoil[];
    registrosPlanta: RegistroPlanta[];
  }) => {
    if (data.config) setConfig(data.config);
    if (data.compras) setCompras(data.compras);
    if (data.registrosPlanta) setRegistrosPlanta(data.registrosPlanta);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header with quick metrics and tab navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        kpis={kpis}
        config={config}
        onOpenNewCompra={() => setIsCompraModalOpen(true)}
        onOpenNewRegistroPlanta={() => setIsPlantaModalOpen(true)}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onExportExcel={handleExportExcel}
        onUpdateTasaBCV={handleUpdateTasaBCV}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            kpis={kpis}
            config={config}
            monthly={monthly}
            compras={compras}
            registrosPlanta={registrosPlanta}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewCompra={() => setIsCompraModalOpen(true)}
            onOpenNewRegistroPlanta={() => setIsPlantaModalOpen(true)}
          />
        )}

        {activeTab === 'compras' && (
          <ComprasView
            compras={compras}
            config={config}
            onSaveCompra={handleSaveCompra}
            onDeleteCompra={handleDeleteCompra}
            isModalOpen={isCompraModalOpen}
            setIsModalOpen={setIsCompraModalOpen}
          />
        )}

        {activeTab === 'planta' && (
          <PlantaView
            registrosPlanta={registrosPlanta}
            config={config}
            onSaveRegistro={handleSaveRegistroPlanta}
            onDeleteRegistro={handleDeleteRegistroPlanta}
            isModalOpen={isPlantaModalOpen}
            setIsModalOpen={setIsPlantaModalOpen}
          />
        )}

        {activeTab === 'graficos' && (
          <GraficosView
            monthly={monthly}
            compras={compras}
            registrosPlanta={registrosPlanta}
            config={config}
          />
        )}

        {activeTab === 'reportes' && (
          <ReportesView
            monthly={monthly}
            compras={compras}
            registrosPlanta={registrosPlanta}
            config={config}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeTab === 'vercel' && (
          <VercelDeployView />
        )}
      </main>

      {/* Configuration & Backup Modal */}
      <ConfiguracionModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onSaveConfig={setConfig}
        onResetData={handleResetData}
        compras={compras}
        registrosPlanta={registrosPlanta}
        onImportFullBackup={handleImportFullBackup}
      />

      {/* Clean Industrial Footer (Hidden when printing) */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {config.nombreEmpresa} — Control de Combustible y Generación de Respaldo
          </span>
          <span className="text-slate-400">
            {kpis.comprasRegistradas} compras • {kpis.litrosComprados.toLocaleString('es-VE')} Litros • {kpis.horasPlantaRegistradas.toFixed(1)} Horas acumuladas
          </span>
        </div>
      </footer>
    </div>
  );
}
