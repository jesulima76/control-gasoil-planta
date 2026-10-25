import React, { useState, useMemo } from 'react';
import {
  Fuel,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  DollarSign,
  Download,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { AppConfig, CompraGasoil } from '../types';
import { formatBs, formatLitros, formatMonthYear, formatUSD } from '../utils/formatters';

interface ComprasViewProps {
  compras: CompraGasoil[];
  config: AppConfig;
  onSaveCompra: (compra: CompraGasoil) => void;
  onDeleteCompra: (id: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const ComprasView: React.FC<ComprasViewProps> = ({
  compras,
  config,
  onSaveCompra,
  onDeleteCompra,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [editingCompra, setEditingCompra] = useState<CompraGasoil | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    litros: 1500,
    precioUnitarioUSD: 0.80,
    tasaBCV: config.tasaBCVActual,
    proveedor: '',
    numeroFactura: '',
    tanqueDestino: 'Tanque Principal (Nodriza)' as CompraGasoil['tanqueDestino'],
    metodoPago: 'Transferencia USD',
    notas: '',
  });

  // Extract unique months for filter
  const months = useMemo(() => {
    const set = new Set<string>();
    compras.forEach((c) => {
      if (c.fecha && c.fecha.length >= 7) set.add(c.fecha.substring(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [compras]);

  // Filtered purchases
  const filteredCompras = useMemo(() => {
    return compras.filter((c) => {
      const matchMonth = selectedMonth === 'all' || c.fecha.startsWith(selectedMonth);
      const matchSearch =
        c.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.notas && c.notas.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchMonth && matchSearch;
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [compras, selectedMonth, searchTerm]);

  // Aggregate totals for the filtered subset
  const filteredTotals = useMemo(() => {
    const litros = filteredCompras.reduce((sum, c) => sum + (c.litros || 0), 0);
    const totalUSD = filteredCompras.reduce((sum, c) => sum + (c.totalUSD || 0), 0);
    const totalBs = filteredCompras.reduce((sum, c) => sum + (c.totalBs || 0), 0);
    const avgUSD = litros > 0 ? totalUSD / litros : 0;
    return { litros, totalUSD, totalBs, avgUSD };
  }, [filteredCompras]);

  const handleOpenAdd = () => {
    setEditingCompra(null);
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      litros: 1500,
      precioUnitarioUSD: 0.80,
      tasaBCV: config.tasaBCVActual,
      proveedor: '',
      numeroFactura: `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      tanqueDestino: 'Tanque Principal (Nodriza)',
      metodoPago: 'Transferencia USD',
      notas: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (compra: CompraGasoil) => {
    setEditingCompra(compra);
    setFormData({
      fecha: compra.fecha,
      litros: compra.litros,
      precioUnitarioUSD: compra.precioUnitarioUSD,
      tasaBCV: compra.tasaBCV,
      proveedor: compra.proveedor,
      numeroFactura: compra.numeroFactura,
      tanqueDestino: compra.tanqueDestino,
      metodoPago: compra.metodoPago,
      notas: compra.notas || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const litros = Number(formData.litros) || 0;
    const precioUnitarioUSD = Number(formData.precioUnitarioUSD) || 0;
    const tasaBCV = Number(formData.tasaBCV) || config.tasaBCVActual;
    const totalUSD = Number((litros * precioUnitarioUSD).toFixed(2));
    const totalBs = Number((totalUSD * tasaBCV).toFixed(2));

    const newEntry: CompraGasoil = {
      id: editingCompra ? editingCompra.id : `comp-${Date.now()}`,
      fecha: formData.fecha,
      litros,
      precioUnitarioUSD,
      totalUSD,
      tasaBCV,
      totalBs,
      proveedor: formData.proveedor.trim() || 'Proveedor General de Combustible',
      numeroFactura: formData.numeroFactura.trim() || 'S/N',
      tanqueDestino: formData.tanqueDestino,
      metodoPago: formData.metodoPago,
      notas: formData.notas.trim(),
    };

    onSaveCompra(newEntry);
    setIsModalOpen(false);
  };

  // Live modal computed values
  const liveTotalUSD = (Number(formData.litros) || 0) * (Number(formData.precioUnitarioUSD) || 0);
  const liveTotalBs = liveTotalUSD * (Number(formData.tasaBCV) || config.tasaBCVActual);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-400" />
            Compras de Gasoil (Diesel)
          </h2>
          <p className="text-xs text-slate-400">
            Registro de abastecimiento, costo unitario en USD y tasa oficial en Bolívares
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Registrar Nueva Compra
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por proveedor, factura o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="all">Todos los Meses Registrados</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {formatMonthYear(m)} ({m})
              </option>
            ))}
          </select>
        </div>

        {/* Filter Summary Stats */}
        <div className="md:col-span-3 flex items-center justify-end text-xs text-slate-400 gap-2">
          <span>{filteredCompras.length} compras</span>
          <span>•</span>
          <span className="font-mono font-bold text-amber-400">
            {formatLitros(filteredTotals.litros)}
          </span>
        </div>
      </div>

      {/* Filtered Summary Card Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Volumen Filtrado:</span>
          <span className="font-mono font-bold text-blue-400 text-sm">
            {formatLitros(filteredTotals.litros)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Inversión Filtrada USD:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {formatUSD(filteredTotals.totalUSD)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Inversión Filtrada Bs.:</span>
          <span className="font-mono font-bold text-indigo-300 text-sm truncate block">
            {formatBs(filteredTotals.totalBs)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Precio Medio Ponderado:</span>
          <span className="font-mono font-bold text-amber-300 text-sm">
            ${filteredTotals.avgUSD.toFixed(3)} / L
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Fecha</th>
                <th className="py-3 px-4 font-semibold">Proveedor / Factura</th>
                <th className="py-3 px-4 font-semibold text-right">Litros</th>
                <th className="py-3 px-4 font-semibold text-right">Precio USD/L</th>
                <th className="py-3 px-4 font-semibold text-right">Total USD</th>
                <th className="py-3 px-4 font-semibold text-right">Tasa BCV</th>
                <th className="py-3 px-4 font-semibold text-right">Total Bs.</th>
                <th className="py-3 px-4 font-semibold">Destino</th>
                <th className="py-3 px-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredCompras.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No se encontraron registros de compra con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredCompras.map((compra) => (
                  <tr key={compra.id} className="hover:bg-slate-850/60 transition group">
                    <td className="py-3 px-4 font-sans text-slate-200 whitespace-nowrap">
                      {compra.fecha}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-white group-hover:text-amber-400 transition">
                        {compra.proveedor}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                        <span>{compra.numeroFactura}</span>
                        <span>•</span>
                        <span className="text-slate-400">{compra.metodoPago}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-400 whitespace-nowrap">
                      {formatLitros(compra.litros)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 whitespace-nowrap">
                      ${compra.precioUnitarioUSD.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 whitespace-nowrap">
                      {formatUSD(compra.totalUSD)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap text-[11px]">
                      {compra.tasaBCV.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-indigo-300 whitespace-nowrap">
                      {formatBs(compra.totalBs)}
                    </td>
                    <td className="py-3 px-4 font-sans whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {compra.tanqueDestino.replace('Tanque Principal (Nodriza)', 'Nodriza')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(compra)}
                          title="Editar compra"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Desea eliminar la compra ${compra.numeroFactura} de ${compra.litros} Litros?`)) {
                              onDeleteCompra(compra.id);
                            }
                          }}
                          title="Eliminar compra"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar o Editar Compra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingCompra ? 'Editar Compra de Gasoil' : 'Registrar Nueva Compra de Gasoil'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fecha */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fecha de Despacho *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* N° Factura / Control */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    N° Factura / Guía de Despacho *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. FAC-01450"
                    value={formData.numeroFactura}
                    onChange={(e) => setFormData({ ...formData, numeroFactura: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Proveedor */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Empresa Proveedora / Distribuidor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Distribuidora Petróleos del Centro C.A."
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Litros */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Litros Suministrados *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formData.litros}
                    onChange={(e) => setFormData({ ...formData, litros: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Precio USD / Litro */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Precio Unitario USD ($/L) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.001"
                    required
                    value={formData.precioUnitarioUSD}
                    onChange={(e) => setFormData({ ...formData, precioUnitarioUSD: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Tasa BCV */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tasa Oficial BCV (Bs./USD) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={formData.tasaBCV}
                    onChange={(e) => setFormData({ ...formData, tasaBCV: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Live Calculation Preview Banner */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 grid grid-cols-2 gap-3 text-center">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Cálculo Total USD
                  </span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {formatUSD(liveTotalUSD)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Equivalente en Bolívares
                  </span>
                  <span className="text-sm font-black font-mono text-indigo-300 truncate block">
                    {formatBs(liveTotalBs)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tanque Destino */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tanque de Almacenamiento
                  </label>
                  <select
                    value={formData.tanqueDestino}
                    onChange={(e) => setFormData({ ...formData, tanqueDestino: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Tanque Principal (Nodriza)">Tanque Principal (Nodriza)</option>
                    <option value="Tanque Planta">Tanque Diario Planta</option>
                    <option value="Tambor / Reserva">Tambor Móvil / Reserva</option>
                  </select>
                </div>

                {/* Método de Pago */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={formData.metodoPago}
                    onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Transferencia USD">Transferencia USD</option>
                    <option value="Transferencia Bancaria Bs.">Transferencia Bancaria Bs.</option>
                    <option value="Efectivo Divisas">Efectivo Divisas</option>
                    <option value="Pago Mixto USD/Bs.">Pago Mixto USD/Bs.</option>
                    <option value="Crédito 15 días">Crédito 15 días</option>
                  </select>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Notas de Despacho / Precinto de Seguridad
                </label>
                <textarea
                  rows={2}
                  placeholder="Número de precinto, chofer de la cisterna, observaciones técnicas..."
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 placeholder-slate-600"
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
                >
                  {editingCompra ? 'Guardar Cambios' : 'Registrar Compra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
