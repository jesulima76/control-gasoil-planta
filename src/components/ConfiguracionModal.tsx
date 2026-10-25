import React, { useState, useRef } from 'react';
import {
  Settings,
  Fuel,
  Zap,
  DollarSign,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AppConfig, CompraGasoil, RegistroPlanta } from '../types';

interface ConfiguracionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  onResetData: () => void;
  compras: CompraGasoil[];
  registrosPlanta: RegistroPlanta[];
  onImportFullBackup: (data: { config: AppConfig; compras: CompraGasoil[]; registrosPlanta: RegistroPlanta[] }) => void;
}

export const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetData,
  compras,
  registrosPlanta,
  onImportFullBackup,
}) => {
  const [formData, setFormData] = useState<AppConfig>({ ...config });
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSuccessMsg('Configuración actualizada con éxito');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 900);
  };

  const handleExportBackup = () => {
    const backupData = {
      config: formData,
      compras,
      registrosPlanta,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Respaldo_Gasoil_Planta_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.compras && parsed.registrosPlanta) {
          onImportFullBackup(parsed);
          setSuccessMsg('Copia de seguridad restaurada correctamente');
          setTimeout(() => {
            setSuccessMsg('');
            onClose();
          }, 1200);
        } else {
          alert('El archivo no tiene el formato de respaldo válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Configuración de Planta, Tanques & Parámetros
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Identificación de Planta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nombre de la Empresa / Instalación
              </label>
              <input
                type="text"
                required
                value={formData.nombreEmpresa}
                onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Modelo del Generador / Motor
              </label>
              <input
                type="text"
                required
                value={formData.modeloPlanta}
                onChange={(e) => setFormData({ ...formData, modeloPlanta: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Potencia Eléctrica (kVA)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.potenciaKVA}
                onChange={(e) => setFormData({ ...formData, potenciaKVA: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tasa BCV por Defecto (Bs./USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.tasaBCVActual}
                onChange={(e) => setFormData({ ...formData, tasaBCVActual: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Intervalo Mantenimiento (Horas)
              </label>
              <input
                type="number"
                min="50"
                required
                value={formData.intervaloMantenimientoHoras}
                onChange={(e) => setFormData({ ...formData, intervaloMantenimientoHoras: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Tanques */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Capacidad Tanque Nodriza (L)
              </label>
              <input
                type="number"
                min="100"
                required
                value={formData.capacidadTanquePrincipal}
                onChange={(e) => setFormData({ ...formData, capacidadTanquePrincipal: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Capacidad Tanque Planta (L)
              </label>
              <input
                type="number"
                min="20"
                required
                value={formData.capacidadTanquePlanta}
                onChange={(e) => setFormData({ ...formData, capacidadTanquePlanta: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Alerta Nivel Crítico (Litros)
              </label>
              <input
                type="number"
                min="5"
                required
                value={formData.alertaNivelBajoLitros}
                onChange={(e) => setFormData({ ...formData, alertaNivelBajoLitros: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Horómetro del Último Servicio Mayor (h)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={formData.ultimoMantenimientoHorometro}
              onChange={(e) => setFormData({ ...formData, ultimoMantenimientoHorometro: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-500">
              Utilizado para proyectar las horas restantes para el siguiente cambio de aceite y filtros.
            </span>
          </div>

          {/* Backup & Restore Section */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Gestión de Datos y Copias de Seguridad
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-semibold transition"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                Descargar JSON
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-semibold transition"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                Restaurar JSON
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Desea restablecer los datos originales de la hoja de cálculo anexa (Agosto, Septiembre y Octubre 2026)?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/50 text-rose-300 rounded-xl font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Datos Originales
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
