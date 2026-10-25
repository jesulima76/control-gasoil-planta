// =========================================================================
// BACKEND GOOGLE APPS SCRIPT - CONTROL DE GASOIL Y PLANTA ELECTRICA
// =========================================================================
// Este script se vincula a una hoja de Google Sheets y se despliega como Web App.

var SHEET_NAMES = {
  COMPRAS: 'COMPRA GASOIL',
  PLANTA: 'PLANTA ELECTRICA',
  CONFIG: 'CONFIGURACION'
};

// Agrega un menu personalizado en la interfaz de Google Sheets
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Control Gasoil & Planta')
    .addItem('Inicializar Estructura y Datos de Muestra', 'initSpreadsheet')
    .addToUi();
}

// Inicializa las pestañas con sus encabezados y datos iniciales
function initSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Hoja COMPRA GASOIL
  var sheetCompras = ss.getSheetByName(SHEET_NAMES.COMPRAS);
  if (!sheetCompras) {
    sheetCompras = ss.insertSheet(SHEET_NAMES.COMPRAS);
  }
  if (sheetCompras.getLastRow() === 0) {
    var headersCompras = [
      'ID',
      'Fecha',
      'Litros',
      'Precio USD/L',
      'Total USD',
      'Tasa BCV',
      'Total Bs.',
      'Proveedor',
      'N° Factura',
      'Tanque Destino',
      'Metodo de Pago',
      'Notas / Precinto'
    ];
    sheetCompras.getRange(1, 1, 1, headersCompras.length).setValues([headersCompras]);
    sheetCompras.getRange(1, 1, 1, headersCompras.length)
      .setBackground('#1e293b')
      .setFontColor('#f59e0b')
      .setFontWeight('bold');
    
    // Seed inicial (Agosto, Septiembre, Octubre 2026)
    var initialCompras = [
      ['comp-01', '2026-08-14', 1500, 0.75, 1125.0, 785.07, 883203.75, 'Distribuidora Petroleos del Centro C.A.', 'FAC-00892', 'Tanque Principal (Nodriza)', 'Transferencia USD', 'Precinto #4412'],
      ['comp-02', '2026-09-04', 1500, 0.80, 1200.0, 820.56, 984672.0, 'Transportes y Combustibles Andinos', 'FAC-01045', 'Tanque Principal (Nodriza)', 'Transferencia Bancaria', 'Descarga a tanque nodriza'],
      ['comp-03', '2026-09-22', 1500, 0.80, 1200.0, 824.23, 989072.0, 'Distribuidora Petroleos del Centro C.A.', 'FAC-01120', 'Tanque Principal (Nodriza)', 'Transferencia USD', 'Suministro preventivo'],
      ['comp-04', '2026-10-05', 1500, 0.80, 1200.0, 875.40, 1050480.0, 'Combustibles del Tuy C.A.', 'FAC-01254', 'Tanque Principal (Nodriza)', 'Transferencia', 'Carga contingencia oct-26'],
      ['comp-05', '2026-10-14', 1500, 0.80, 1200.0, 882.10, 1058520.0, 'Transportes y Combustibles Andinos', 'FAC-01311', 'Tanque Principal (Nodriza)', 'Transferencia Bancaria', 'Entrega diurna'],
      ['comp-06', '2026-10-22', 1000, 0.80, 800.0, 889.785, 711828.0, 'Distribuidora Petroleos del Centro C.A.', 'FAC-01399', 'Tanque Principal (Nodriza)', 'Pago Mixto USD/Bs.', 'Cierre de mes']
    ];
    sheetCompras.getRange(2, 1, initialCompras.length, headersCompras.length).setValues(initialCompras);
  }

  // 2. Hoja PLANTA ELECTRICA
  var sheetPlanta = ss.getSheetByName(SHEET_NAMES.PLANTA);
  if (!sheetPlanta) {
    sheetPlanta = ss.insertSheet(SHEET_NAMES.PLANTA);
  }
  if (sheetPlanta.getLastRow() === 0) {
    var headersPlanta = [
      'ID',
      'Fecha',
      'Hora Inicio',
      'Hora Fin',
      'Horometro Inicial',
      'Horometro Final',
      'Horas Operacion',
      'Litros Surtidos',
      'Nivel Tanque Despues (L)',
      'Consumo (L/h)',
      'Motivo',
      'Operador',
      'Tasa BCV',
      'Observaciones'
    ];
    sheetPlanta.getRange(1, 1, 1, headersPlanta.length).setValues([headersPlanta]);
    sheetPlanta.getRange(1, 1, 1, headersPlanta.length)
      .setBackground('#0f172a')
      .setFontColor('#38bdf8')
      .setFontWeight('bold');

    var initialPlanta = [
      ['reg-01', '2026-08-15', '08:30', '14:30', 1250.0, 1256.0, 6.0, 48, 195, 8.00, 'Falla de Red Publica', 'Carlos Mendez', 785.10, 'Apagon circuito 3'],
      ['reg-02', '2026-08-18', '10:00', '11:30', 1256.0, 1257.5, 1.5, 12, 185, 8.00, 'Prueba Periodica', 'Jose Rivas', 786.50, 'Prueba semanal con 60% carga'],
      ['reg-03', '2026-08-21', '13:00', '21:00', 1257.5, 1265.5, 8.0, 62, 150, 7.75, 'Falla de Red Publica', 'Carlos Mendez', 789.20, 'Caida de fase en subestacion'],
      ['reg-04', '2026-10-24', '14:00', '14:30', 1425.0, 1425.5, 0.5, 4, 46, 8.00, 'Mantenimiento Preventivo', 'Carlos Mendez', 895.50, 'Revision final de nivel']
    ];
    sheetPlanta.getRange(2, 1, initialPlanta.length, headersPlanta.length).setValues(initialPlanta);
  }

  // 3. Hoja CONFIGURACION
  var sheetConfig = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet(SHEET_NAMES.CONFIG);
  }
  if (sheetConfig.getLastRow() === 0) {
    var configData = [
      ['Parametro', 'Valor'],
      ['nombreEmpresa', 'Complejo Agroindustrial & Servicios'],
      ['modeloPlanta', 'Generador Cummins 150 kVA (Motor 6BT 5.9-G2)'],
      ['potenciaKVA', 150],
      ['capacidadTanquePrincipal', 5000],
      ['capacidadTanquePlanta', 250],
      ['alertaNivelBajoLitros', 50],
      ['tasaBCVActual', 895.50],
      ['intervaloMantenimientoHoras', 250],
      ['ultimoMantenimientoHorometro', 1250.0]
    ];
    sheetConfig.getRange(1, 1, configData.length, 2).setValues(configData);
    sheetConfig.getRange(1, 1, 1, 2).setBackground('#334155').setFontColor('#ffffff').setFontWeight('bold');
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('Estructura y datos iniciales creados exitosamente.', 'Listo');
}

// ENDPOINT GET: Recupera los datos en formato JSON
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ping') {
      return createJsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    var compras = getComprasData(ss);
    var registrosPlanta = getPlantaData(ss);
    var config = getConfigData(ss);

    var response = {
      status: 'success',
      config: config,
      compras: compras,
      registrosPlanta: registrosPlanta,
      serverTime: new Date().toISOString()
    };

    return createJsonResponse(response);
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// ENDPOINT POST: Guarda o elimina registros
function doPost(e) {
  try {
    var contents = e.postData ? JSON.parse(e.postData.contents) : {};
    var action = contents.action;
    var data = contents.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var result = { status: 'success' };

    if (action === 'saveCompra') {
      result.record = saveCompra(ss, data);
    } else if (action === 'deleteCompra') {
      result.deletedId = deleteRowById(ss, SHEET_NAMES.COMPRAS, data.id);
    } else if (action === 'saveRegistroPlanta') {
      result.record = saveRegistroPlanta(ss, data);
    } else if (action === 'deleteRegistroPlanta') {
      result.deletedId = deleteRowById(ss, SHEET_NAMES.PLANTA, data.id);
    } else if (action === 'updateConfig') {
      result.config = updateConfig(ss, data);
    } else {
      throw new Error('Accion no soportada: ' + action);
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// Funciones auxiliares de lectura y escritura
function getComprasData(ss) {
  var sheet = ss.getSheetByName(SHEET_NAMES.COMPRAS);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();
  return values.map(function(row) {
    return {
      id: String(row[0]),
      fecha: formatDate(row[1]),
      litros: Number(row[2]) || 0,
      precioUnitarioUSD: Number(row[3]) || 0,
      totalUSD: Number(row[4]) || 0,
      tasaBCV: Number(row[5]) || 0,
      totalBs: Number(row[6]) || 0,
      proveedor: String(row[7] || ''),
      numeroFactura: String(row[8] || ''),
      tanqueDestino: String(row[9] || 'Tanque Principal (Nodriza)'),
      metodoPago: String(row[10] || 'Transferencia'),
      notas: String(row[11] || '')
    };
  });
}

function getPlantaData(ss) {
  var sheet = ss.getSheetByName(SHEET_NAMES.PLANTA);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
  return values.map(function(row) {
    return {
      id: String(row[0]),
      fecha: formatDate(row[1]),
      horaInicio: String(row[2] || ''),
      horaFin: String(row[3] || ''),
      horometroInicial: Number(row[4]) || 0,
      horometroFinal: Number(row[5]) || 0,
      horasOperacion: Number(row[6]) || 0,
      litrosSurtidos: Number(row[7]) || 0,
      nivelTanqueDespues: Number(row[8]) || 0,
      consumoPorHora: Number(row[9]) || 0,
      motivo: String(row[10] || 'Falla de Red Publica'),
      operador: String(row[11] || ''),
      tasaBCV: Number(row[12]) || 0,
      observaciones: String(row[13] || '')
    };
  });
}

function getConfigData(ss) {
  var sheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  var defaultConfig = {
    nombreEmpresa: 'Complejo Agroindustrial & Servicios',
    modeloPlanta: 'Generador Cummins 150 kVA (Motor 6BT 5.9-G2)',
    potenciaKVA: 150,
    capacidadTanquePrincipal: 5000,
    capacidadTanquePlanta: 250,
    alertaNivelBajoLitros: 50,
    tasaBCVActual: 895.50,
    intervaloMantenimientoHoras: 250,
    ultimoMantenimientoHorometro: 1250.0
  };

  if (!sheet || sheet.getLastRow() < 2) return defaultConfig;

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  var config = { ...defaultConfig };
  rows.forEach(function(r) {
    var key = r[0];
    var val = r[1];
    if (key in config) {
      config[key] = typeof config[key] === 'number' ? Number(val) : val;
    }
  });
  return config;
}

function saveCompra(ss, data) {
  var sheet = ss.getSheetByName(SHEET_NAMES.COMPRAS);
  if (!sheet) throw new Error('Hoja de compras no encontrada');

  var id = data.id || ('comp-' + Date.now());
  var rowData = [
    id,
    data.fecha,
    Number(data.litros) || 0,
    Number(data.precioUnitarioUSD) || 0,
    Number(data.totalUSD) || 0,
    Number(data.tasaBCV) || 0,
    Number(data.totalBs) || 0,
    data.proveedor || '',
    data.numeroFactura || '',
    data.tanqueDestino || 'Tanque Principal (Nodriza)',
    data.metodoPago || 'Transferencia',
    data.notas || ''
  ];

  var lastRow = sheet.getLastRow();
  var foundRow = -1;
  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        foundRow = i + 2;
        break;
      }
    }
  }

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { id: id, data: data };
}

function saveRegistroPlanta(ss, data) {
  var sheet = ss.getSheetByName(SHEET_NAMES.PLANTA);
  if (!sheet) throw new Error('Hoja de planta no encontrada');

  var id = data.id || ('reg-' + Date.now());
  var rowData = [
    id,
    data.fecha,
    data.horaInicio || '',
    data.horaFin || '',
    Number(data.horometroInicial) || 0,
    Number(data.horometroFinal) || 0,
    Number(data.horasOperacion) || 0,
    Number(data.litrosSurtidos) || 0,
    Number(data.nivelTanqueDespues) || 0,
    Number(data.consumoPorHora) || 0,
    data.motivo || 'Falla de Red Publica',
    data.operador || '',
    Number(data.tasaBCV) || 0,
    data.observaciones || ''
  ];

  var lastRow = sheet.getLastRow();
  var foundRow = -1;
  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        foundRow = i + 2;
        break;
      }
    }
  }

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { id: id, data: data };
}

function deleteRowById(ss, sheetName, id) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Hoja no encontrada');

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      return id;
    }
  }
  return null;
}

function updateConfig(ss, data) {
  var sheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (!sheet) return data;

  var keys = Object.keys(data);
  var rows = keys.map(function(k) { return [k, data[k]]; });
  sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  return data;
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(val).split('T')[0];
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
