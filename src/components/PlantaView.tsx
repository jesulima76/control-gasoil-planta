import React, { useState, useMemo } from 'react';
import {
  Zap,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  Clock,
  Gauge,
  Fuel,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AppConfig, MotivoOperacion, RegistroPlanta } from '../types';
import { formatConsumoRatio, formatHoras, formatLitros, formatMonthYear } from '../utils/formatters';

interface PlantaViewProps {
  registrosPlanta: RegistroPlanta[];
  config: AppConfig;
  onSaveRegistro: (registro: RegistroPlanta) => void;
  onDeleteRegistro: (id: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const PlantaView: React.FC<PlantaViewProps> = ({
  registrosPlanta,
  config,
  onSaveRegistro,
  onDeleteRegistro,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedMotivo, setSelectedMotivo] = useState('all');
  const [editingRegistro, setEditingRegistro] = useState<RegistroPlanta | null>(null);

  // Latest horometer for default autofill
  const latestHorometro = useMemo(() => {
    if (registrosPlanta.length === 0) return config.ultimoMantenimientoHorometro;
    const sorted = [...registrosPlanta].sort((a, b) => b.horometroFinal - a.horometroFinal);
    return sorted[0].horometroFinal;
  }, [registrosPlanta, config]);

  // Form State
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '08:00',
    horaFin: '14:00',
    horometroInicial: latestHorometro,
    horometroFinal: Number((latestHorometro + 6.0).toFixed(1)),
    litrosSurtidos: 46,
    nivelTanqueDespues: 50,
    motivo: 'Falla de Red Pública' as MotivoOperacion,
    operador: 'Carlos Méndez',
    tasaBCV: config.tasaBCVActual,
    observaciones: '',
  });

  // Extract unique months
  const months = useMemo(() => {
    const set = new Set<string>();
    registrosPlanta.forEach((r) => {
      if (r.fecha && r.fecha.length >= 7) set.add(r.fecha.substring(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [registrosPlanta]);

  // Filtered generator operations
  const filteredRegistros = useMemo(() => {
    return registrosPlanta.filter((r) => {
      const matchMonth = selectedMonth === 'all' || r.fecha.startsWith(selectedMonth);
      const matchMotivo = selectedMotivo === 'all' || r.motivo === selectedMotivo;
      const matchSearch =
        r.operador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.observaciones && r.observaciones.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.motivo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchMonth && matchMotivo && matchSearch;
    }).sort((a, b) => {
      const cmp = b.fecha.localeCompare(a.fecha);
      if (cmp !== 0) return cmp;
      return b.horometroFinal - a.horometroFinal;
    });
  }, [registrosPlanta, selectedMonth, selectedMotivo, searchTerm]);

  // Aggregated totals
  const totals = useMemo(() => {
    const horas = filteredRegistros.reduce((sum, r) => sum + (r.horasOperacion || 0), 0);
    const litros = filteredRegistros.reduce((sum, r) => sum + (r.litrosSurtidos || 0), 0);
    const avgRatio = horas > 0 ? litros / horas : 0;
    const dias = new Set(filteredRegistros.map((r) => r.fecha)).size;
    return { horas, litros, avgRatio, dias };
  }, [filteredRegistros]);

  const handleOpenAdd = () => {
    setEditingRegistro(null);
    const hInit = latestHorometro;
    const hFin = Number((hInit + 6.0).toFixed(1));
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '08:00',
      horaFin: '14:00',
      horometroInicial: hInit,
      horometroFinal: hFin,
      litrosSurtidos: 46,
      nivelTanqueDespues: 50,
      motivo: 'Falla de Red Pública',
      operador: 'Carlos Méndez',
      tasaBCV: config.tasaBCVActual,
      observaciones: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reg: RegistroPlanta) => {
    setEditingRegistro(reg);
    setFormData({
      fecha: reg.fecha,
      horaInicio: reg.horaInicio || '08:00',
      horaFin: reg.horaFin || '14:00',
      horometroInicial: reg.horometroInicial,
      horometroFinal: reg.horometroFinal,
      litrosSurtidos: reg.litrosSurtidos,
      nivelTanqueDespues: reg.nivelTanqueDespues,
      motivo: reg.motivo,
      operador: reg.operador,
      tasaBCV: reg.tasaBCV,
      observaciones: reg.observaciones || '',
    });
    setIsModalOpen(true);
  };

  const liveHoras = Math.max(
    0,
    Number((formData.horometroFinal - formData.horometroInicial).toFixed(2))
  );
  const liveConsumoRatio =
    liveHoras > 0 ? Number((formData.litrosSurtidos / liveHoras).toFixed(2)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hInit = Number(formData.horometroInicial) || 0;
    const hFin = Number(formData.horometroFinal) || hInit;
    const horas = Math.max(0, Number((hFin - hInit).toFixed(2)));
    const litros = Number(formData.litrosSurtidos) || 0;
    const ratio = horas > 0 ? Number((litros / horas).toFixed(2)) : 0;

    const newReg: RegistroPlanta = {
      id: editingRegistro ? editingRegistro.id : `reg-${Date.now()}`,
      fecha: formData.fecha,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      horometroInicial: hInit,
      horometroFinal: hFin,
      horasOperacion: horas,
      litrosSurtidos: litros,
      nivelTanqueDespues: Number(formData.nivelTanqueDespues) || 0,
      consumoPorHora: ratio,
      motivo: formData.motivo,
      operador: formData.operador.trim() || 'Operador en Turno',
      tasaBCV: Number(formData.tasaBCV) || config.tasaBCVActual,
      observaciones: formData.observaciones.trim(),
    };

    onSaveRegistro(newReg);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-400" />
            Bitácora de Horas de Planta & Surtido de Combustible
          </h2>
          <p className="text-xs text-slate-400">
            Control exacto de horómetros, tiempo de respaldo brindado y consumo específico (L/h)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-sky-600/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Registrar Operación de Planta
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar operador, motivo u observación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
          >
            <option value="all">Todos los Meses</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {formatMonthYear(m)} ({m})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedMotivo}
            onChange={(e) => setSelectedMotivo(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
          >
            <option value="all">Todos los Motivos de Encendido</option>
            <option value="Falla de Red Pública">Falla de Red Pública (Apagón)</option>
            <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
            <option value="Prueba Periódica">Prueba Periódica</option>
            <option value="Pico de Demanda / Sobrecarga">Pico de Demanda</option>
          </select>
        </div>
      </div>

      {/* Filtered Summary Card Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Horas Registradas:</span>
          <span className="font-mono font-bold text-amber-400 text-sm">
            {formatHoras(totals.horas)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Combustible Consumido:</span>
          <span className="font-mono font-bold text-sky-400 text-sm">
            {formatLitros(totals.litros)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Consumo Medio (L/h):</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {formatConsumoRatio(totals.avgRatio)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Días con Encendido:</span>
          <span className="font-mono font-bold text-slate-200 text-sm">
            {totals.dias} días
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Fecha & Horario</th>
                <th className="py-3 px-4 font-semibold">Motivo</th>
                <th className="py-3 px-4 font-semibold text-right">Horómetro Inicial</th>
                <th className="py-3 px-4 font-semibold text-right">Horómetro Final</th>
                <th className="py-3 px-4 font-semibold text-right">Horas Uso</th>
                <th className="py-3 px-4 font-semibold text-right">Litros Surtidos</th>
                <th className="py-3 px-4 font-semibold text-right">Consumo (L/h)</th>
                <th className="py-3 px-4 font-semibold text-right">Nivel Tanque</th>
                <th className="py-3 px-4 font-semibold">Operador</th>
                <th className="py-3 px-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredRegistros.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                    No se encontraron operaciones de planta con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRegistros.map((r) => {
                  const isHighConsumption = r.consumoPorHora > 8.5;
                  return (
                    <tr key={r.id} className="hover:bg-slate-850/60 transition group">
                      <td className="py-3 px-4 font-sans text-slate-200 whitespace-nowrap">
                        <div className="font-bold">{r.fecha}</div>
                        {r.horaInicio && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            {r.horaInicio} - {r.horaFin}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            r.motivo === 'Falla de Red Pública'
                              ? 'bg-rose-950/50 border-rose-500/30 text-rose-300'
                              : r.motivo === 'Prueba Periódica'
                              ? 'bg-sky-950/50 border-sky-500/30 text-sky-300'
                              : 'bg-amber-950/50 border-amber-500/30 text-amber-300'
                          }`}
                        >
                          {r.motivo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                        {r.horometroInicial.toFixed(1)} h
                      </td>
                      <td className="py-3 px-4 text-right text-slate-200 font-bold whitespace-nowrap">
                        {r.horometroFinal.toFixed(1)} h
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400 whitespace-nowrap">
                        {r.horasOperacion.toFixed(1)} h
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-sky-400 whitespace-nowrap">
                        {formatLitros(r.litrosSurtidos)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-bold ${
                            isHighConsumption ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {r.consumoPorHora.toFixed(2)} L/h
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 whitespace-nowrap">
                        {r.nivelTanqueDespues} L
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-300 whitespace-nowrap">
                        <div>{r.operador}</div>
                        {r.observaciones && (
                          <div className="text-[10px] text-slate-400 max-w-xs truncate" title={r.observaciones}>
                            {r.observaciones}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            title="Editar registro"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Desea eliminar el registro del ${r.fecha} (${r.horasOperacion}h)?`)) {
                                onDeleteRegistro(r.id);
                              }
                            }}
                            title="Eliminar registro"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar u Operación de Planta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  {editingRegistro ? 'Editar Operación de Planta' : 'Registrar Horas de Planta & Combustible'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Fecha */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Hora Inicio */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Hora Fin */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Horómetros y Cálculo Automático */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Horómetro Inicial (h) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.horometroInicial}
                    onChange={(e) => setFormData({ ...formData, horometroInicial: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Horómetro Final (h) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.horometroFinal}
                    onChange={(e) => setFormData({ ...formData, horometroFinal: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Litros Surtidos / Usados *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={formData.litrosSurtidos}
                    onChange={(e) => setFormData({ ...formData, litrosSurtidos: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Live Efficiency Feedback Card */}
              <div className="bg-slate-950 border border-sky-500/30 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Horas Calculadas
                  </span>
                  <span className="text-base font-black font-mono text-amber-400">
                    {liveHoras.toFixed(1)} h
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Consumo Específico
                  </span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    {liveConsumoRatio.toFixed(2)} L/h
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Estado Eficiencia
                  </span>
                  <span className={`text-[11px] font-bold block mt-1 ${
                    liveConsumoRatio <= 8.0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {liveConsumoRatio <= 8.0 ? '✓ Óptimo (~7.76 L/h)' : '⚡ Demanda Alta'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nivel de Tanque Después */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nivel Final en Tanque de Planta (Litros) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={config.capacidadTanquePlanta}
                    required
                    value={formData.nivelTanqueDespues}
                    onChange={(e) => setFormData({ ...formData, nivelTanqueDespues: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    Capacidad máxima tanque: {config.capacidadTanquePlanta} L
                  </span>
                </div>

                {/* Motivo de Operación */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Motivo de Encendido *
                  </label>
                  <select
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value as MotivoOperacion })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Falla de Red Pública">Falla de Red Pública (Apagón / Baja Tensión)</option>
                    <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                    <option value="Prueba Periódica">Prueba Periódica Semanal / Mensual</option>
                    <option value="Pico de Demanda / Sobrecarga">Pico de Demanda / Sobrecarga</option>
                    <option value="Otro">Otro Motivo</option>
                  </select>
                </div>
              </div>

              {/* Operador */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Operador / Técnico Responsable *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Méndez / José Rivas"
                  value={formData.operador}
                  onChange={(e) => setFormData({ ...formData, operador: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Observaciones Técnicas (Carga de planta, temperatura, incidente)
                </label>
                <textarea
                  rows={2}
                  placeholder="Temperatura normal, presión de aceite 55 PSI, sin alarmas activas..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 placeholder-slate-600"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition shadow-lg shadow-sky-600/20"
                >
                  {editingRegistro ? 'Guardar Cambios' : 'Registrar Operación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
