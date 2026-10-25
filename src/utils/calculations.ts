import * as XLSX from 'xlsx';
import { AppConfig, CompraGasoil, RegistroPlanta } from '../types';
import { formatMonthShort, formatMonthYear } from './formatters';

export interface MonthlySummary {
  monthKey: string; // "2026-08"
  label: string; // "Agosto 2026"
  shortLabel: string; // "ago-26"
  litrosComprados: number;
  totalUSDComprado: number;
  totalBsComprado: number;
  precioPromedioUSD: number;
  precioPromedioBs: number;
  litrosConsumidos: number;
  horasOperacion: number;
  consumoPromedioLPorHora: number;
  costoOperacionUSD: number;
  costoPorHoraUSD: number;
  diasConRegistro: number;
  balanceNetoLitros: number; // comprados - consumidos
  motivosCount: { [motivo: string]: number };
}

export interface GlobalKPIs {
  comprasRegistradas: number;
  litrosComprados: number;
  inversionTotalUSD: number;
  inversionTotalBs: number;
  precioPromedioUSD: number;
  precioPromedioBs: number;
  horasPlantaRegistradas: number;
  consumoRegistrado: number; // Litros surtidos
  consumoPromedioLPorHora: number; // L/h
  diasConRegistro: number;
  ultimoNivelTanquePlanta: number; // L
  stockTanquePrincipalEstimado: number; // Litros comprados menos surtidos a planta
  stockTotalDisponible: number;
  autonomiaHorasEstimadas: number;
  horometroActual: number;
  horasHastaMantenimiento: number;
  tasaBCVActual: number;
}

export function computeGlobalKPIs(
  compras: CompraGasoil[],
  registrosPlanta: RegistroPlanta[],
  config: AppConfig
): GlobalKPIs {
  const comprasRegistradas = compras.length;
  const litrosComprados = compras.reduce((acc, c) => acc + (c.litros || 0), 0);
  const inversionTotalUSD = compras.reduce((acc, c) => acc + (c.totalUSD || 0), 0);
  const inversionTotalBs = compras.reduce((acc, c) => acc + (c.totalBs || 0), 0);

  const precioPromedioUSD = litrosComprados > 0 ? inversionTotalUSD / litrosComprados : 0;
  const precioPromedioBs = litrosComprados > 0 ? inversionTotalBs / litrosComprados : 0;

  const horasPlantaRegistradas = registrosPlanta.reduce((acc, r) => acc + (r.horasOperacion || 0), 0);
  const consumoRegistrado = registrosPlanta.reduce((acc, r) => acc + (r.litrosSurtidos || 0), 0);
  const consumoPromedioLPorHora =
    horasPlantaRegistradas > 0 ? consumoRegistrado / horasPlantaRegistradas : 0;

  // Días únicos con registro en planta
  const uniquePlantDays = new Set(registrosPlanta.map(r => r.fecha));
  const diasConRegistro = uniquePlantDays.size;

  // Último registro para nivel de tanque y horómetro actual
  let ultimoNivelTanquePlanta = 46; // default si no hay registros
  let horometroActual = config.ultimoMantenimientoHorometro;

  if (registrosPlanta.length > 0) {
    // Sort chronologically
    const sorted = [...registrosPlanta].sort((a, b) => {
      const cmp = a.fecha.localeCompare(b.fecha);
      if (cmp !== 0) return cmp;
      return a.horometroFinal - b.horometroFinal;
    });
    const lastReg = sorted[sorted.length - 1];
    ultimoNivelTanquePlanta = lastReg.nivelTanqueDespues;
    horometroActual = lastReg.horometroFinal;
  }

  // Stock estimado en tanque principal nodriza
  // Litros comprados destinados a nodriza menos surtidos de nodriza
  const stockTanquePrincipalEstimado = Math.max(
    0,
    litrosComprados - consumoRegistrado
  );

  const stockTotalDisponible = stockTanquePrincipalEstimado + ultimoNivelTanquePlanta;

  // Autonomía en horas
  const autonomiaHorasEstimadas =
    consumoPromedioLPorHora > 0 ? stockTotalDisponible / consumoPromedioLPorHora : 0;

  // Mantenimiento
  const horasDesdeUltimoMtto = Math.max(0, horometroActual - config.ultimoMantenimientoHorometro);
  const horasHastaMantenimiento = Math.max(
    0,
    config.intervaloMantenimientoHoras - horasDesdeUltimoMtto
  );

  return {
    comprasRegistradas,
    litrosComprados,
    inversionTotalUSD,
    inversionTotalBs,
    precioPromedioUSD,
    precioPromedioBs,
    horasPlantaRegistradas,
    consumoRegistrado,
    consumoPromedioLPorHora,
    diasConRegistro,
    ultimoNivelTanquePlanta,
    stockTanquePrincipalEstimado,
    stockTotalDisponible,
    autonomiaHorasEstimadas,
    horometroActual,
    horasHastaMantenimiento,
    tasaBCVActual: config.tasaBCVActual,
  };
}

export function computeMonthlyBreakdown(
  compras: CompraGasoil[],
  registrosPlanta: RegistroPlanta[]
): MonthlySummary[] {
  // Extract all unique YYYY-MM
  const monthSet = new Set<string>();

  compras.forEach(c => {
    if (c.fecha && c.fecha.length >= 7) monthSet.add(c.fecha.substring(0, 7));
  });

  registrosPlanta.forEach(r => {
    if (r.fecha && r.fecha.length >= 7) monthSet.add(r.fecha.substring(0, 7));
  });

  const sortedMonths = Array.from(monthSet).sort();

  return sortedMonths.map(monthKey => {
    const monthCompras = compras.filter(c => c.fecha.startsWith(monthKey));
    const monthRegs = registrosPlanta.filter(r => r.fecha.startsWith(monthKey));

    const litrosComprados = monthCompras.reduce((sum, c) => sum + (c.litros || 0), 0);
    const totalUSDComprado = monthCompras.reduce((sum, c) => sum + (c.totalUSD || 0), 0);
    const totalBsComprado = monthCompras.reduce((sum, c) => sum + (c.totalBs || 0), 0);

    const precioPromedioUSD = litrosComprados > 0 ? totalUSDComprado / litrosComprados : 0;
    const precioPromedioBs = litrosComprados > 0 ? totalBsComprado / litrosComprados : 0;

    const litrosConsumidos = monthRegs.reduce((sum, r) => sum + (r.litrosSurtidos || 0), 0);
    const horasOperacion = monthRegs.reduce((sum, r) => sum + (r.horasOperacion || 0), 0);
    const consumoPromedioLPorHora = horasOperacion > 0 ? litrosConsumidos / horasOperacion : 0;

    // Costo operativo de combustible consumido (usando precio promedio del mes o general)
    const unitCost = precioPromedioUSD > 0 ? precioPromedioUSD : 0.8;
    const costoOperacionUSD = litrosConsumidos * unitCost;
    const costoPorHoraUSD = horasOperacion > 0 ? costoOperacionUSD / horasOperacion : 0;

    const uniqueDays = new Set(monthRegs.map(r => r.fecha)).size;
    const balanceNetoLitros = litrosComprados - litrosConsumidos;

    const motivosCount: { [motivo: string]: number } = {};
    monthRegs.forEach(r => {
      motivosCount[r.motivo] = (motivosCount[r.motivo] || 0) + 1;
    });

    return {
      monthKey,
      label: formatMonthYear(monthKey),
      shortLabel: formatMonthShort(monthKey),
      litrosComprados,
      totalUSDComprado,
      totalBsComprado,
      precioPromedioUSD,
      precioPromedioBs,
      litrosConsumidos,
      horasOperacion,
      consumoPromedioLPorHora,
      costoOperacionUSD,
      costoPorHoraUSD,
      diasConRegistro: uniqueDays,
      balanceNetoLitros,
      motivosCount,
    };
  });
}

/**
 * Export full workbook to Excel file (.xlsx)
 */
export function exportToExcel(
  compras: CompraGasoil[],
  registrosPlanta: RegistroPlanta[],
  config: AppConfig
) {
  const wb = XLSX.utils.book_new();
  const kpis = computeGlobalKPIs(compras, registrosPlanta, config);
  const monthly = computeMonthlyBreakdown(compras, registrosPlanta);

  // 1. Sheet: DASHBOARD RESUMEN
  const dashboardData = [
    ['SISTEMA DE CONTROL DE COMPRAS DE GASOIL Y PLANTA ELÉCTRICA'],
    ['Empresa:', config.nombreEmpresa],
    ['Generador:', config.modeloPlanta],
    ['Fecha de Emisión:', new Date().toLocaleDateString('es-VE')],
    [],
    ['INDICADORES CLAVE GLOBALES'],
    ['Indicador', 'Valor', 'Unidad'],
    ['Compras Registradas', kpis.comprasRegistradas, 'operaciones'],
    ['Litros Comprados Totales', kpis.litrosComprados, 'Litros (L)'],
    ['Inversión Total (USD)', kpis.inversionTotalUSD, 'USD ($)'],
    ['Inversión Total (Bs.)', kpis.inversionTotalBs, 'Bs.'],
    ['Precio Promedio (USD/L)', Number(kpis.precioPromedioUSD.toFixed(3)), 'USD/L'],
    ['Precio Promedio (Bs./L)', Number(kpis.precioPromedioBs.toFixed(2)), 'Bs./L'],
    ['Horas de Planta Registradas', Number(kpis.horasPlantaRegistradas.toFixed(1)), 'Horas (h)'],
    ['Consumo Total Registrado', kpis.consumoRegistrado, 'Litros (L)'],
    ['Consumo Promedio Específico', Number(kpis.consumoPromedioLPorHora.toFixed(2)), 'L/h'],
    ['Días con Registro Operativo', kpis.diasConRegistro, 'días'],
    ['Último Nivel de Tanque Diario', kpis.ultimoNivelTanquePlanta, 'Litros (L)'],
    ['Stock Tanque Principal (Estimado)', kpis.stockTanquePrincipalEstimado, 'Litros (L)'],
    ['Autonomía Restante Estimada', Number(kpis.autonomiaHorasEstimadas.toFixed(1)), 'Horas (h)'],
    ['Horómetro Actual', Number(kpis.horometroActual.toFixed(1)), 'Horas'],
    ['Horas para Próximo Mantenimiento', Number(kpis.horasHastaMantenimiento.toFixed(1)), 'Horas'],
    ['Tasa BCV de Referencia', config.tasaBCVActual, 'Bs./USD'],
  ];
  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardData);
  XLSX.utils.book_append_sheet(wb, wsDashboard, 'DASHBOARD RESUMEN');

  // 2. Sheet: EVOLUCION MENSUAL
  const monthlyHeaders = [
    'Mes',
    'Litros Comprados (L)',
    'Inversión USD ($)',
    'Inversión Bs.',
    'Precio Promedio (USD/L)',
    'Horas Planta (h)',
    'Litros Consumidos (L)',
    'Consumo Promedio (L/h)',
    'Balance Neto (L)',
    'Días Operativos',
  ];
  const monthlyRows = monthly.map(m => [
    m.shortLabel,
    m.litrosComprados,
    m.totalUSDComprado,
    m.totalBsComprado,
    Number(m.precioPromedioUSD.toFixed(3)),
    Number(m.horasOperacion.toFixed(1)),
    m.litrosConsumidos,
    Number(m.consumoPromedioLPorHora.toFixed(2)),
    m.balanceNetoLitros,
    m.diasConRegistro,
  ]);
  const wsMonthly = XLSX.utils.aoa_to_sheet([monthlyHeaders, ...monthlyRows]);
  XLSX.utils.book_append_sheet(wb, wsMonthly, 'EVOLUCIÓN MENSUAL');

  // 3. Sheet: COMPRAS GASOIL
  const comprasHeaders = [
    'ID',
    'Fecha',
    'Proveedor',
    'N° Factura / Control',
    'Litros Comprados',
    'Precio USD/L',
    'Total USD',
    'Tasa BCV (Bs./USD)',
    'Total Bolívares (Bs.)',
    'Tanque Destino',
    'Método de Pago',
    'Notas / Precinto',
  ];
  const comprasRows = compras.map(c => [
    c.id,
    c.fecha,
    c.proveedor,
    c.numeroFactura,
    c.litros,
    c.precioUnitarioUSD,
    c.totalUSD,
    c.tasaBCV,
    c.totalBs,
    c.tanqueDestino,
    c.metodoPago,
    c.notas || '',
  ]);
  const wsCompras = XLSX.utils.aoa_to_sheet([comprasHeaders, ...comprasRows]);
  XLSX.utils.book_append_sheet(wb, wsCompras, 'COMPRAS GASOIL');

  // 4. Sheet: OPERACIÓN PLANTA
  const plantaHeaders = [
    'ID',
    'Fecha',
    'Hora Inicio',
    'Hora Fin',
    'Horómetro Inicial (h)',
    'Horómetro Final (h)',
    'Horas Operación (h)',
    'Litros Surtidos (L)',
    'Consumo (L/h)',
    'Nivel Tanque Después (L)',
    'Motivo de Encendido',
    'Operador Responsable',
    'Tasa BCV',
    'Observaciones',
  ];
  const plantaRows = registrosPlanta.map(r => [
    r.id,
    r.fecha,
    r.horaInicio || '',
    r.horaFin || '',
    r.horometroInicial,
    r.horometroFinal,
    r.horasOperacion,
    r.litrosSurtidos,
    Number(r.consumoPorHora.toFixed(2)),
    r.nivelTanqueDespues,
    r.motivo,
    r.operador,
    r.tasaBCV,
    r.observaciones || '',
  ]);
  const wsPlanta = XLSX.utils.aoa_to_sheet([plantaHeaders, ...plantaRows]);
  XLSX.utils.book_append_sheet(wb, wsPlanta, 'PLANTA ELÉCTRICA');

  // Generate file
  const fileName = `Control_Gasoil_Planta_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
