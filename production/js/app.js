/**
 * =========================================================================
 * CLIENT-SIDE PRODUCTION JAVASCRIPT - CONTROL DE GASOIL & PLANTA ELÉCTRICA
 * =========================================================================
 * Compatible con Vercel y sincronizado con Google Sheets mediante Google Apps Script.
 */

// Estado global de la aplicación
const AppState = {
  webAppUrl: localStorage.getItem('gasoil_apps_script_url') || '',
  activeTab: 'dashboard',
  config: {
    nombreEmpresa: 'Complejo Agroindustrial & Servicios',
    modeloPlanta: 'Generador Cummins 150 kVA (Motor 6BT 5.9-G2)',
    potenciaKVA: 150,
    capacidadTanquePrincipal: 5000,
    capacidadTanquePlanta: 250,
    alertaNivelBajoLitros: 50,
    tasaBCVActual: 895.50,
    intervaloMantenimientoHoras: 250,
    ultimoMantenimientoHorometro: 1250.0
  },
  compras: [
    { id: 'comp-01', fecha: '2026-08-14', litros: 1500, precioUnitarioUSD: 0.75, totalUSD: 1125.0, tasaBCV: 785.07, totalBs: 883203.75, proveedor: 'Distribuidora Petróleos del Centro C.A.', numeroFactura: 'FAC-00892', tanqueDestino: 'Tanque Principal (Nodriza)', metodoPago: 'Transferencia USD', notas: 'Precinto #4412' },
    { id: 'comp-02', fecha: '2026-09-04', litros: 1500, precioUnitarioUSD: 0.80, totalUSD: 1200.0, tasaBCV: 820.56, totalBs: 984672.0, proveedor: 'Transportes y Combustibles Andinos', numeroFactura: 'FAC-01045', tanqueDestino: 'Tanque Principal (Nodriza)', metodoPago: 'Transferencia Bancaria', notas: 'Descarga a tanque nodriza' },
    { id: 'comp-03', fecha: '2026-09-22', litros: 1500, precioUnitarioUSD: 0.80, totalUSD: 1200.0, tasaBCV: 824.23, totalBs: 989072.0, proveedor: 'Distribuidora Petróleos del Centro C.A.', numeroFactura: 'FAC-01120', tanqueDestino: 'Tanque Principal (Nodriza)', metodoPago: 'Transferencia USD', notas: 'Suministro preventivo' },
    { id: 'comp-04', fecha: '2026-10-05', litros: 1500, precioUnitarioUSD: 0.80, totalUSD: 1200.0, tasaBCV: 875.40, totalBs: 1050480.0, proveedor: 'Combustibles del Tuy C.A.', numeroFactura: 'FAC-01254', tanqueDestino: 'Tanque Principal (Nodriza)', metodoPago: 'Transferencia', notas: 'Carga contingencia oct-26' },
    { id: 'comp-05', fecha: '2026-10-14', litros: 1500, precioUnitarioUSD: 0.80, totalUSD: 1200.0, tasaBCV: 882.10, totalBs: 1058520.0, proveedor: 'Transportes y Combustibles Andinos', numeroFactura: 'FAC-01311', tanqueDestino: 'Tanque Principal (Nodriza)', metodoPago: 'Transferencia Bancaria', notas: 'Entrega diurna' },
    { id: 'comp-06', fecha: '2026-10-22', litros: 1000, precioUnitarioUSD: 0.80, totalUSD: 800.0, tasaBCV: 889.785, totalBs: 711828.0, proveedor: 'Distribuidora Petróleos del Centro C.A.', numeroFactura: 'FAC-01399', tanqueDestino: 'Tanque Principal (Nodriza)', metodoPago: 'Pago Mixto USD/Bs.', notas: 'Cierre de mes' }
  ],
  registrosPlanta: [
    { id: 'reg-01', fecha: '2026-08-15', horaInicio: '08:30', horaFin: '14:30', horometroInicial: 1250.0, horometroFinal: 1256.0, horasOperacion: 6.0, litrosSurtidos: 48, nivelTanqueDespues: 195, consumoPorHora: 8.00, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 785.10, observaciones: 'Apagón general de circuito 3' },
    { id: 'reg-02', fecha: '2026-08-18', horaInicio: '10:00', horaFin: '11:30', horometroInicial: 1256.0, horometroFinal: 1257.5, horasOperacion: 1.5, litrosSurtidos: 12, nivelTanqueDespues: 185, consumoPorHora: 8.00, motivo: 'Prueba Periódica', operador: 'José Rivas', tasaBCV: 786.50, observaciones: 'Prueba semanal con 60% carga' },
    { id: 'reg-03', fecha: '2026-08-21', horaInicio: '13:00', horaFin: '21:00', horometroInicial: 1257.5, horometroFinal: 1265.5, horasOperacion: 8.0, litrosSurtidos: 62, nivelTanqueDespues: 150, consumoPorHora: 7.75, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 789.20, observaciones: 'Caída de fase en subestación' },
    { id: 'reg-04', fecha: '2026-08-25', horaInicio: '16:00', horaFin: '23:30', horometroInicial: 1265.5, horometroFinal: 1273.0, horasOperacion: 7.5, litrosSurtidos: 58, nivelTanqueDespues: 130, consumoPorHora: 7.73, motivo: 'Falla de Red Pública', operador: 'Miguel Salazar', tasaBCV: 792.00, observaciones: 'Tormenta en la zona' },
    { id: 'reg-05', fecha: '2026-08-28', horaInicio: '09:00', horaFin: '17:30', horometroInicial: 1273.0, horometroFinal: 1281.5, horasOperacion: 8.5, litrosSurtidos: 65, nivelTanqueDespues: 140, consumoPorHora: 7.65, motivo: 'Falla de Red Pública', operador: 'José Rivas', tasaBCV: 795.40, observaciones: 'Mantenimiento en líneas externas' },
    { id: 'reg-06', fecha: '2026-08-31', horaInicio: '11:00', horaFin: '18:00', horometroInicial: 1281.5, horometroFinal: 1288.5, horasOperacion: 7.0, litrosSurtidos: 55, nivelTanqueDespues: 120, consumoPorHora: 7.86, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 798.80, observaciones: 'Cierre de mes operativo' },
    { id: 'reg-07', fecha: '2026-09-02', horaInicio: '08:00', horaFin: '15:00', horometroInicial: 1288.5, horometroFinal: 1295.5, horasOperacion: 7.0, litrosSurtidos: 54, nivelTanqueDespues: 135, consumoPorHora: 7.71, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 805.10, observaciones: 'Falla de transformador' },
    { id: 'reg-08', fecha: '2026-09-05', horaInicio: '09:30', horaFin: '11:30', horometroInicial: 1295.5, horometroFinal: 1297.5, horasOperacion: 2.0, litrosSurtidos: 15, nivelTanqueDespues: 145, consumoPorHora: 7.50, motivo: 'Prueba Periódica', operador: 'José Rivas', tasaBCV: 812.30, observaciones: 'Chequeo de niveles' },
    { id: 'reg-09', fecha: '2026-09-08', horaInicio: '14:00', horaFin: '22:00', horometroInicial: 1297.5, horometroFinal: 1305.5, horasOperacion: 8.0, litrosSurtidos: 62, nivelTanqueDespues: 110, consumoPorHora: 7.75, motivo: 'Falla de Red Pública', operador: 'Miguel Salazar', tasaBCV: 818.00, observaciones: 'Corte vespertino' },
    { id: 'reg-10', fecha: '2026-09-11', horaInicio: '07:30', horaFin: '14:30', horometroInicial: 1305.5, horometroFinal: 1312.5, horasOperacion: 7.0, litrosSurtidos: 55, nivelTanqueDespues: 105, consumoPorHora: 7.86, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 822.40, observaciones: 'Soporte cuartos fríos' },
    { id: 'reg-11', fecha: '2026-09-14', horaInicio: '10:00', horaFin: '16:00', horometroInicial: 1312.5, horometroFinal: 1318.5, horasOperacion: 6.0, litrosSurtidos: 46, nivelTanqueDespues: 125, consumoPorHora: 7.67, motivo: 'Falla de Red Pública', operador: 'José Rivas', tasaBCV: 826.50, observaciones: 'Sin novedad' },
    { id: 'reg-12', fecha: '2026-09-17', horaInicio: '15:00', horaFin: '21:30', horometroInicial: 1318.5, horometroFinal: 1325.0, horasOperacion: 6.5, litrosSurtidos: 51, nivelTanqueDespues: 115, consumoPorHora: 7.85, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 830.00, observaciones: 'Transición suave' },
    { id: 'reg-13', fecha: '2026-09-20', horaInicio: '08:00', horaFin: '10:00', horometroInicial: 1325.0, horometroFinal: 1327.0, horasOperacion: 2.0, litrosSurtidos: 16, nivelTanqueDespues: 130, consumoPorHora: 8.00, motivo: 'Mantenimiento Preventivo', operador: 'José Rivas', tasaBCV: 834.10, observaciones: 'Limpieza bornes batería' },
    { id: 'reg-14', fecha: '2026-09-23', horaInicio: '12:00', horaFin: '21:00', horometroInicial: 1327.0, horometroFinal: 1336.0, horasOperacion: 9.0, litrosSurtidos: 70, nivelTanqueDespues: 100, consumoPorHora: 7.78, motivo: 'Falla de Red Pública', operador: 'Miguel Salazar', tasaBCV: 838.20, observaciones: 'Jornada prolongada' },
    { id: 'reg-15', fecha: '2026-09-25', horaInicio: '14:30', horaFin: '22:30', horometroInicial: 1336.0, horometroFinal: 1344.0, horasOperacion: 8.0, litrosSurtidos: 62, nivelTanqueDespues: 90, consumoPorHora: 7.75, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 842.00, observaciones: 'Temperatura estable' },
    { id: 'reg-16', fecha: '2026-09-28', horaInicio: '17:00', horaFin: '23:30', horometroInicial: 1344.0, horometroFinal: 1350.5, horasOperacion: 6.5, litrosSurtidos: 50, nivelTanqueDespues: 85, consumoPorHora: 7.69, motivo: 'Pico de Demanda / Sobrecarga', operador: 'José Rivas', tasaBCV: 846.50, observaciones: 'Pico de molienda' },
    { id: 'reg-17', fecha: '2026-09-30', horaInicio: '08:00', horaFin: '18:00', horometroInicial: 1350.5, horometroFinal: 1360.5, horasOperacion: 10.0, litrosSurtidos: 79, nivelTanqueDespues: 75, consumoPorHora: 7.90, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 850.00, observaciones: 'Corte extendido' },
    { id: 'reg-18', fecha: '2026-10-03', horaInicio: '09:00', horaFin: '17:00', horometroInicial: 1360.5, horometroFinal: 1368.5, horasOperacion: 8.0, litrosSurtidos: 62, nivelTanqueDespues: 110, consumoPorHora: 7.75, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 860.20, observaciones: 'Surtido nodriza' },
    { id: 'reg-19', fecha: '2026-10-06', horaInicio: '13:00', horaFin: '20:30', horometroInicial: 1368.5, horometroFinal: 1376.0, horasOperacion: 7.5, litrosSurtidos: 58, nivelTanqueDespues: 95, consumoPorHora: 7.73, motivo: 'Falla de Red Pública', operador: 'Miguel Salazar', tasaBCV: 865.00, observaciones: 'Protección servidores' },
    { id: 'reg-20', fecha: '2026-10-08', horaInicio: '10:00', horaFin: '12:00', horometroInicial: 1376.0, horometroFinal: 1378.0, horasOperacion: 2.0, litrosSurtidos: 15, nivelTanqueDespues: 115, consumoPorHora: 7.50, motivo: 'Prueba Periódica', operador: 'José Rivas', tasaBCV: 870.10, observaciones: 'Verificación alternador' },
    { id: 'reg-21', fecha: '2026-10-10', horaInicio: '14:00', horaFin: '22:00', horometroInicial: 1378.0, horometroFinal: 1386.0, horasOperacion: 8.0, litrosSurtidos: 63, nivelTanqueDespues: 90, consumoPorHora: 7.88, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 874.30, observaciones: 'Operación continua nocturna' },
    { id: 'reg-22', fecha: '2026-10-12', horaInicio: '08:00', horaFin: '15:30', horometroInicial: 1386.0, horometroFinal: 1393.5, horasOperacion: 7.5, litrosSurtidos: 58, nivelTanqueDespues: 85, consumoPorHora: 7.73, motivo: 'Falla de Red Pública', operador: 'José Rivas', tasaBCV: 878.00, observaciones: 'Feriado nacional con corte' },
    { id: 'reg-23', fecha: '2026-10-15', horaInicio: '12:30', horaFin: '21:30', horometroInicial: 1393.5, horometroFinal: 1402.5, horasOperacion: 9.0, litrosSurtidos: 70, nivelTanqueDespues: 78, consumoPorHora: 7.78, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 882.50, observaciones: 'Cisterna asegurada' },
    { id: 'reg-24', fecha: '2026-10-17', horaInicio: '10:00', horaFin: '17:00', horometroInicial: 1402.5, horometroFinal: 1409.5, horasOperacion: 7.0, litrosSurtidos: 54, nivelTanqueDespues: 72, consumoPorHora: 7.71, motivo: 'Falla de Red Pública', operador: 'Miguel Salazar', tasaBCV: 885.00, observaciones: 'Falla circuito' },
    { id: 'reg-25', fecha: '2026-10-19', horaInicio: '15:00', horaFin: '23:00', horometroInicial: 1409.5, horometroFinal: 1417.5, horasOperacion: 8.0, litrosSurtidos: 62, nivelTanqueDespues: 65, consumoPorHora: 7.75, motivo: 'Falla de Red Pública', operador: 'Carlos Méndez', tasaBCV: 887.20, observaciones: 'Consumo acorde carga' },
    { id: 'reg-26', fecha: '2026-10-21', horaInicio: '09:00', horaFin: '15:00', horometroInicial: 1417.5, horometroFinal: 1423.5, horasOperacion: 6.0, litrosSurtidos: 47, nivelTanqueDespues: 58, consumoPorHora: 7.83, motivo: 'Falla de Red Pública', operador: 'José Rivas', tasaBCV: 889.00, observaciones: 'Alarma nivel bajo' },
    { id: 'reg-27', fecha: '2026-10-23', horaInicio: '11:00', horaFin: '12:30', horometroInicial: 1423.5, horometroFinal: 1425.0, horasOperacion: 1.5, litrosSurtidos: 12, nivelTanqueDespues: 52, consumoPorHora: 8.00, motivo: 'Prueba Periódica', operador: 'Carlos Méndez', tasaBCV: 891.50, observaciones: 'Prueba ATS' },
    { id: 'reg-28', fecha: '2026-10-24', horaInicio: '14:00', horaFin: '14:30', horometroInicial: 1425.0, horometroFinal: 1425.5, horasOperacion: 0.5, litrosSurtidos: 4, nivelTanqueDespues: 46, consumoPorHora: 8.00, motivo: 'Mantenimiento Preventivo', operador: 'Carlos Méndez', tasaBCV: 895.50, observaciones: 'Nivel actual 46 L' }
  ],
  charts: {}
};

// -------------------------------------------------------------
// FORMATEADORES
// -------------------------------------------------------------
function formatUSD(num) {
  if (isNaN(num)) return '$ 0,00';
  return '$ ' + Number(num).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatBs(num) {
  if (isNaN(num)) return '0,00 Bs.';
  return Number(num).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs.';
}

function formatLitros(num) {
  if (isNaN(num)) return '0 L';
  return Number(num).toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' L';
}

function formatHoras(num) {
  if (isNaN(num)) return '0,0 h';
  return Number(num).toLocaleString('es-VE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' h';
}

// -------------------------------------------------------------
// CÁLCULOS PRINCIPALES
// -------------------------------------------------------------
function calculateKPIs() {
  const compras = AppState.compras;
  const planta = AppState.registrosPlanta;
  const cfg = AppState.config;

  const comprasCount = compras.length;
  const litrosComprados = compras.reduce((s, c) => s + (Number(c.litros) || 0), 0);
  const totalUSD = compras.reduce((s, c) => s + (Number(c.totalUSD) || 0), 0);
  const totalBs = compras.reduce((s, c) => s + (Number(c.totalBs) || 0), 0);
  const precioPromedioUSD = litrosComprados > 0 ? totalUSD / litrosComprados : 0;
  const precioPromedioBs = litrosComprados > 0 ? totalBs / litrosComprados : 0;

  const horasPlanta = planta.reduce((s, r) => s + (Number(r.horasOperacion) || 0), 0);
  const consumoRegistrado = planta.reduce((s, r) => s + (Number(r.litrosSurtidos) || 0), 0);
  const consumoPromedioLPorHora = horasPlanta > 0 ? consumoRegistrado / horasPlanta : 0;

  const uniqueDays = new Set(planta.map(r => r.fecha)).size;

  let ultimoNivel = 46;
  let horometroActual = cfg.ultimoMantenimientoHorometro;
  if (planta.length > 0) {
    const sorted = [...planta].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horometroFinal - b.horometroFinal);
    const last = sorted[sorted.length - 1];
    ultimoNivel = Number(last.nivelTanqueDespues) || 46;
    horometroActual = Number(last.horometroFinal) || horometroActual;
  }

  const stockNodriza = Math.max(0, litrosComprados - consumoRegistrado);
  const stockTotal = stockNodriza + ultimoNivel;
  const autonomiaHoras = consumoPromedioLPorHora > 0 ? stockTotal / consumoPromedioLPorHora : 0;
  const horasHastaMtto = Math.max(0, cfg.intervaloMantenimientoHoras - (horometroActual - cfg.ultimoMantenimientoHorometro));

  return {
    comprasCount,
    litrosComprados,
    totalUSD,
    totalBs,
    precioPromedioUSD,
    precioPromedioBs,
    horasPlanta,
    consumoRegistrado,
    consumoPromedioLPorHora,
    diasConRegistro: uniqueDays,
    ultimoNivelTanque: ultimoNivel,
    stockNodriza,
    stockTotal,
    autonomiaHoras,
    horometroActual,
    horasHastaMtto
  };
}

function calculateMonthlyBreakdown() {
  const compras = AppState.compras;
  const planta = AppState.registrosPlanta;
  const months = new Set();

  compras.forEach(c => c.fecha && months.add(c.fecha.substring(0, 7)));
  planta.forEach(r => r.fecha && months.add(r.fecha.substring(0, 7)));

  return Array.from(months).sort().map(mKey => {
    const mCompras = compras.filter(c => c.fecha.startsWith(mKey));
    const mPlanta = planta.filter(r => r.fecha.startsWith(mKey));

    const lComprados = mCompras.reduce((s, c) => s + (Number(c.litros) || 0), 0);
    const usdComprado = mCompras.reduce((s, c) => s + (Number(c.totalUSD) || 0), 0);
    const bsComprado = mCompras.reduce((s, c) => s + (Number(c.totalBs) || 0), 0);

    const lConsumidos = mPlanta.reduce((s, r) => s + (Number(r.litrosSurtidos) || 0), 0);
    const hOperacion = mPlanta.reduce((s, r) => s + (Number(r.horasOperacion) || 0), 0);
    const ratio = hOperacion > 0 ? lConsumidos / hOperacion : 0;
    const costoPorHora = hOperacion > 0 ? (lConsumidos * (usdComprado > 0 ? usdComprado / lComprados : 0.8)) / hOperacion : 0;

    const [yyyy, mm] = mKey.split('-');
    const mNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'];
    const shortLabel = `${mNames[parseInt(mm, 10) - 1] || mm}-${yyyy.slice(-2)}`;

    return {
      monthKey: mKey,
      shortLabel,
      litrosComprados: lComprados,
      totalUSD: usdComprado,
      totalBs: bsComprado,
      litrosConsumidos: lConsumidos,
      horasOperacion: hOperacion,
      ratioLPorHora: ratio,
      costoPorHora,
      dias: new Set(mPlanta.map(r => r.fecha)).size,
      balance: lComprados - lConsumidos
    };
  });
}

// -------------------------------------------------------------
// SINCRONIZACIÓN CON GOOGLE APPS SCRIPT
// -------------------------------------------------------------
async function syncFromGoogleSheets() {
  if (!AppState.webAppUrl) return;

  const btnSync = document.getElementById('btnSyncSheets');
  if (btnSync) btnSync.classList.add('animate-spin');

  try {
    const res = await fetch(`${AppState.webAppUrl}?action=getAll`);
    const json = await res.json();
    if (json.status === 'success') {
      if (json.config) AppState.config = json.config;
      if (json.compras && json.compras.length > 0) AppState.compras = json.compras;
      if (json.registrosPlanta && json.registrosPlanta.length > 0) AppState.registrosPlanta = json.registrosPlanta;
      renderAll();
      showToast('Sincronizado con Google Sheets exitosamente', 'success');
    }
  } catch (err) {
    console.error('Error al sincronizar con Google Sheets:', err);
    showToast('Error de conexión con Google Apps Script', 'error');
  } finally {
    if (btnSync) btnSync.classList.remove('animate-spin');
  }
}

async function sendToGoogleSheets(action, data) {
  if (!AppState.webAppUrl) return;
  try {
    await fetch(AppState.webAppUrl, {
      method: 'POST',
      mode: 'no-cors', // Apps Script standard POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data })
    });
  } catch (err) {
    console.warn('Error al enviar cambios a Google Sheets:', err);
  }
}

// -------------------------------------------------------------
// RENDERIZADO DE INTERFAZ
// -------------------------------------------------------------
function renderDashboard() {
  const kpis = calculateKPIs();
  const monthly = calculateMonthlyBreakdown();
  const cfg = AppState.config;

  // Header quick pills
  document.getElementById('headerBcvRate').textContent = `${formatBs(cfg.tasaBCVActual)}/USD`;
  document.getElementById('headerTankPlanta').textContent = `${kpis.ultimoNivelTanque} L`;
  document.getElementById('headerHorometro').textContent = `${kpis.horometroActual.toFixed(1)} h`;

  // 4 Top Cards
  document.getElementById('kpiComprasCount').textContent = kpis.comprasCount;
  document.getElementById('kpiLitrosComprados').textContent = formatLitros(kpis.litrosComprados);
  document.getElementById('kpiInversionUSD').textContent = formatUSD(kpis.totalUSD);
  document.getElementById('kpiInversionBs').textContent = formatBs(kpis.totalBs);

  // 4 Second Cards
  document.getElementById('kpiPrecioPromUSD').textContent = `$ ${kpis.precioPromedioUSD.toFixed(3)}`;
  document.getElementById('kpiPrecioPromBs').textContent = formatBs(kpis.precioPromedioBs);
  document.getElementById('kpiHorasPlanta').textContent = formatHoras(kpis.horasPlanta);
  document.getElementById('kpiConsumoRegistrado').textContent = formatLitros(kpis.consumoRegistrado);

  // Tank Gauge
  const pct = Math.min(100, Math.round((kpis.ultimoNivelTanque / cfg.capacidadTanquePlanta) * 100));
  document.getElementById('tankPlantaGaugeText').textContent = `${kpis.ultimoNivelTanque} L`;
  document.getElementById('tankPlantaGaugePct').textContent = `${pct}% de ${cfg.capacidadTanquePlanta} L`;
  document.getElementById('tankAutonomiaHours').textContent = `${(kpis.ultimoNivelTanque / (kpis.consumoPromedioLPorHora || 7.76)).toFixed(1)} h continuo`;

  // Nodriza & Total Stock
  document.getElementById('stockNodrizaText').textContent = formatLitros(kpis.stockNodriza);
  document.getElementById('stockTotalText').textContent = formatLitros(kpis.stockTotal);
  document.getElementById('autonomiaTotalText').textContent = formatHoras(kpis.autonomiaHoras);

  // Maintenance
  document.getElementById('mttoHorasRestantes').textContent = `${kpis.horasHastaMtto.toFixed(1)} h`;

  // Right Table (Operación Planta)
  document.getElementById('opDiasRegistro').textContent = kpis.diasConRegistro;
  document.getElementById('opLitrosSurtidos').textContent = formatLitros(kpis.consumoRegistrado);
  document.getElementById('opConsumoPromedio').textContent = `${kpis.consumoPromedioLPorHora.toFixed(2)} L/h`;
  document.getElementById('opUltimoTanque').textContent = `${kpis.ultimoNivelTanque} L`;
  document.getElementById('opTasaReciente').textContent = `${formatBs(cfg.tasaBCVActual)}/USD`;

  // Left Table (Evolución Mensual)
  const tbodyMonthly = document.getElementById('tbodyEvolucionMensual');
  if (tbodyMonthly) {
    tbodyMonthly.innerHTML = monthly.map(m => `
      <tr class="border-b border-slate-800 hover:bg-slate-800/40">
        <td class="py-2.5 px-3 font-medium text-slate-200">${m.shortLabel}</td>
        <td class="py-2.5 px-3 text-right text-blue-400 font-bold">${formatLitros(m.litrosComprados)}</td>
        <td class="py-2.5 px-3 text-right text-emerald-400 font-bold">${formatUSD(m.totalUSD)}</td>
        <td class="py-2.5 px-3 text-right text-slate-300">${formatBs(m.totalBs)}</td>
      </tr>
    `).join('');
  }
}

function renderComprasTable() {
  const tbody = document.getElementById('tbodyCompras');
  if (!tbody) return;

  tbody.innerHTML = AppState.compras.map(c => `
    <tr class="border-b border-slate-800 hover:bg-slate-850/60 font-mono text-xs">
      <td class="py-3 px-3 font-sans text-slate-200 whitespace-nowrap">${c.fecha}</td>
      <td class="py-3 px-3 font-sans">
        <div class="font-bold text-white">${c.proveedor}</div>
        <div class="text-[11px] text-slate-400">${c.numeroFactura} • ${c.metodoPago}</div>
      </td>
      <td class="py-3 px-3 text-right font-bold text-blue-400">${formatLitros(c.litros)}</td>
      <td class="py-3 px-3 text-right text-slate-300">$${Number(c.precioUnitarioUSD).toFixed(3)}</td>
      <td class="py-3 px-3 text-right font-bold text-emerald-400">${formatUSD(c.totalUSD)}</td>
      <td class="py-3 px-3 text-right text-slate-400 text-[11px]">${Number(c.tasaBCV).toFixed(2)}</td>
      <td class="py-3 px-3 text-right text-indigo-300 font-semibold">${formatBs(c.totalBs)}</td>
      <td class="py-3 px-3 font-sans text-slate-400 text-[11px]">${c.tanqueDestino}</td>
    </tr>
  `).join('');
}

function renderPlantaTable() {
  const tbody = document.getElementById('tbodyPlanta');
  if (!tbody) return;

  tbody.innerHTML = AppState.registrosPlanta.map(r => `
    <tr class="border-b border-slate-800 hover:bg-slate-850/60 font-mono text-xs">
      <td class="py-3 px-3 font-sans text-slate-200 whitespace-nowrap">
        <div class="font-bold">${r.fecha}</div>
        <div class="text-[10px] text-slate-400">${r.horaInicio || ''} - ${r.horaFin || ''}</div>
      </td>
      <td class="py-3 px-3 font-sans">
        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">${r.motivo}</span>
      </td>
      <td class="py-3 px-3 text-right text-slate-400">${Number(r.horometroInicial).toFixed(1)} h</td>
      <td class="py-3 px-3 text-right text-slate-200 font-bold">${Number(r.horometroFinal).toFixed(1)} h</td>
      <td class="py-3 px-3 text-right font-bold text-amber-400">${Number(r.horasOperacion).toFixed(1)} h</td>
      <td class="py-3 px-3 text-right font-bold text-sky-400">${formatLitros(r.litrosSurtidos)}</td>
      <td class="py-3 px-3 text-right font-bold ${r.consumoPorHora > 8.5 ? 'text-red-400' : 'text-emerald-400'}">${Number(r.consumoPorHora).toFixed(2)} L/h</td>
      <td class="py-3 px-3 text-right text-slate-300">${r.nivelTanqueDespues} L</td>
      <td class="py-3 px-3 font-sans text-slate-400 text-[11px]">${r.operador}</td>
    </tr>
  `).join('');
}

function renderCharts() {
  if (typeof Chart === 'undefined') return;
  const monthly = calculateMonthlyBreakdown();
  const labels = monthly.map(m => m.shortLabel);

  // 1. Chart Compras vs Consumo
  const ctxCompare = document.getElementById('chartCompareFuel');
  if (ctxCompare) {
    if (AppState.charts.compare) AppState.charts.compare.destroy();
    AppState.charts.compare = new Chart(ctxCompare, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Litros Comprados', data: monthly.map(m => m.litrosComprados), backgroundColor: '#3b82f6', borderRadius: 4 },
          { label: 'Litros Consumidos', data: monthly.map(m => m.litrosConsumidos), backgroundColor: '#f59e0b', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
        }
      }
    });
  }

  // 2. Chart Eficiencia L/h
  const ctxEfficiency = document.getElementById('chartEfficiency');
  if (ctxEfficiency) {
    if (AppState.charts.efficiency) AppState.charts.efficiency.destroy();
    AppState.charts.efficiency = new Chart(ctxEfficiency, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Consumo Específico (L/h)',
          data: monthly.map(m => m.ratioLPorHora),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
          y: { min: 6.5, max: 9.0, ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
        }
      }
    });
  }
}

function renderAll() {
  renderDashboard();
  renderComprasTable();
  renderPlantaTable();
  renderCharts();
}

// -------------------------------------------------------------
// UTILIDADES UI & MODALES
// -------------------------------------------------------------
function switchTab(tabName) {
  AppState.activeTab = tabName;
  document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(`view-${tabName}`);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.remove('bg-amber-500/20', 'text-amber-400', 'font-bold');
  });
  const activeBtn = document.getElementById(`nav-${tabName}`);
  if (activeBtn) activeBtn.classList.add('bg-amber-500/20', 'text-amber-400', 'font-bold');

  if (tabName === 'graficos') {
    setTimeout(renderCharts, 100);
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl transition-all duration-300 ${
    type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white border border-slate-700'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// -------------------------------------------------------------
// INICIALIZACIÓN
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderAll();

  // Input Google Apps Script URL
  const inputUrl = document.getElementById('inputAppsScriptUrl');
  if (inputUrl) {
    inputUrl.value = AppState.webAppUrl;
    inputUrl.addEventListener('change', (e) => {
      AppState.webAppUrl = e.target.value.trim();
      localStorage.setItem('gasoil_apps_script_url', AppState.webAppUrl);
      showToast('URL de Apps Script guardada', 'success');
      syncFromGoogleSheets();
    });
  }

  // Sincronizar al cargar si hay URL
  if (AppState.webAppUrl) {
    syncFromGoogleSheets();
  }
});
