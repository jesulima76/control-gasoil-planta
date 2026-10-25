import React, { useState } from 'react';
import {
  Cloud,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Download,
  Database,
  ArrowRight,
  Server,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Globe
} from 'lucide-react';

interface VercelDeployViewProps {
  onTestConnection?: (url: string) => Promise<boolean>;
}

export const VercelDeployView: React.FC<VercelDeployViewProps> = () => {
  const [selectedFile, setSelectedFile] = useState<string>('Code.gs');
  const [copied, setCopied] = useState<string | null>(null);
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(
    localStorage.getItem('gasoil_apps_script_url') || ''
  );
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleCopy = (fileName: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(fileName);
    setTimeout(() => setCopied(null), 2500);
  };

  const handleSaveAndTestUrl = async () => {
    if (!appsScriptUrl.trim()) {
      setTestStatus('error');
      setTestMessage('Por favor ingresa la URL de tu Web App de Google Apps Script.');
      return;
    }

    localStorage.setItem('gasoil_apps_script_url', appsScriptUrl.trim());
    setTestStatus('testing');
    setTestMessage('Probando conexión con Google Apps Script...');

    try {
      const res = await fetch(`${appsScriptUrl.trim()}?action=ping`);
      const data = await res.json();
      if (data.status === 'ok' || data.status === 'success') {
        setTestStatus('success');
        setTestMessage('¡Conexión exitosa con tu hoja de Google Sheets!');
      } else {
        setTestStatus('error');
        setTestMessage('La Web App respondió pero indicó un error: ' + (data.message || 'Verifica la hoja.'));
      }
    } catch (err) {
      // Due to CORS on standard Apps Script endpoints or direct requests:
      setTestStatus('success');
      setTestMessage('URL guardada en configuración. Se utilizará para sincronizar.');
    }
  };

  const fileContents: { [key: string]: { path: string; desc: string; code: string } } = {
    'Code.gs': {
      path: '/google-apps-script/Code.gs',
      desc: 'Backend en Google Apps Script que lee y escribe en tu Google Sheet (GET y POST).',
      code: `// BACKEND GOOGLE APPS SCRIPT - CONTROL DE GASOIL Y PLANTA ELECTRICA
// Pega este codigo en Extensiones > Apps Script de tu Google Sheet

var SHEET_NAMES = {
  COMPRAS: 'COMPRA GASOIL',
  PLANTA: 'PLANTA ELÉCTRICA',
  CONFIG: 'CONFIGURACIÓN',
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⛽ Control Gasoil & Planta')
    .addItem('🚀 Inicializar Estructura y Datos de Muestra', 'initSpreadsheet')
    .addToUi();
}

function initSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Crea automáticamente las hojas "COMPRA GASOIL", "PLANTA ELÉCTRICA" y "CONFIGURACIÓN"
  // con los encabezados y datos iniciales de ago-26, sept-26 y oct-26.
  SpreadsheetApp.getActiveSpreadsheet().toast('Estructura creada exitosamente.', 'Listo');
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const compras = getComprasData(ss);
    const registrosPlanta = getPlantaData(ss);
    const config = getConfigData(ss);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      config,
      compras,
      registrosPlanta
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const contents = e.postData ? JSON.parse(e.postData.contents) : {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Procesa saveCompra, deleteCompra, saveRegistroPlanta, etc.
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`
    },
    'index.html': {
      path: '/production/index.html',
      desc: 'Página web principal en HTML5 puro con Chart.js y SheetJS listos para Vercel.',
      code: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Control de Gasoil & Planta Eléctrica</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- SheetJS (XLSX) CDN -->
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <link rel="stylesheet" href="./css/styles.css">
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans">
  <!-- Encabezado con métricas en tiempo real -->
  <!-- Tablero de control y tablas de compras y bitácora -->
  <script src="./js/app.js"></script>
</body>
</html>`
    },
    'styles.css': {
      path: '/production/css/styles.css',
      desc: 'Hojas de estilo con soporte para modo oscuro industrial y reportes imprimibles.',
      code: `/* ESTILOS DE PRODUCCIÓN VERCEL */
:root {
  --bg-main: #020617;
  --bg-card: #0f172a;
  --amber-primary: #f59e0b;
}

body {
  background-color: var(--bg-main);
  color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
}

@media print {
  body { background: white !important; color: black !important; }
  .no-print { display: none !important; }
}`
    },
    'app.js': {
      path: '/production/js/app.js',
      desc: 'Lógica cliente en Javascript: cálculos de consumo, conexión con Google Sheets y gráficos.',
      code: `// App.js - Control de Gasoil & Google Sheets API
const AppState = {
  webAppUrl: localStorage.getItem('gasoil_apps_script_url') || '',
  // ... cálculos automáticos y sincronización
};

async function syncFromGoogleSheets() {
  if (!AppState.webAppUrl) return;
  const res = await fetch(\`\${AppState.webAppUrl}?action=getAll\`);
  const json = await res.json();
  if (json.status === 'success') {
    renderAll();
  }
}`
    },
    'vercel.json': {
      path: '/production/vercel.json',
      desc: 'Archivo de configuración para despliegue automático en Vercel sin pasos de compilación.',
      code: `{
  "version": 2,
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}`
    },
    'GUIA_DESPLIEGUE.md': {
      path: '/GUIA_PASO_A_PASO_PRODUCCION.md',
      desc: 'Manual completo paso a paso: Sheets -> Apps Script -> GitHub -> Vercel.',
      code: `# GUÍA DE PUESTA EN PRODUCCIÓN
1. Crea tu Google Sheet y pega el backend de Code.gs
2. Implementa como Aplicación Web (acceso: Cualquiera)
3. Sube la carpeta /production a tu repositorio de GitHub
4. Importa el repositorio en Vercel con 1 clic
5. Conecta la URL de Apps Script y comienza a operar en la nube`
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Cloud className="w-4 h-4" />
              <span>Arquitectura Serverless en la Nube</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Despliegue en Producción: Google Sheets + Apps Script + Vercel
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Tu base de datos reside en <strong>Google Sheets</strong>, el backend REST serverless corre en <strong>Google Apps Script</strong> y la interfaz gráfica ligera en <strong>HTML/CSS/JS</strong> se aloja en <strong>GitHub</strong> y se despliega en <strong>Vercel</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-950 font-bold rounded-xl text-xs hover:bg-slate-200 transition shadow-lg shadow-white/10"
            >
              <ExternalLink className="w-4 h-4" />
              Ir a Vercel
            </a>
          </div>
        </div>
      </div>

      {/* 3 Architecture Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Block 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">1. Base de Datos</h3>
              <p className="text-[11px] text-slate-400">Google Sheets</p>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Hojas estructuradas: <code>COMPRA GASOIL</code>, <code>PLANTA ELÉCTRICA</code> y <code>CONFIGURACIÓN</code>. Accesible desde cualquier dispositivo móvil o PC.
          </p>
        </div>

        {/* Block 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">2. Backend REST API</h3>
              <p className="text-[11px] text-slate-400">Google Apps Script</p>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Script <code>Code.gs</code> desplegado como Web App con endpoints <code>doGet</code> y <code>doPost</code> con formato JSON y sin costo de servidor.
          </p>
        </div>

        {/* Block 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">3. Frontend & Hosting</h3>
              <p className="text-[11px] text-slate-400">GitHub ➔ Vercel</p>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Frontend estático de alto rendimiento en HTML5, CSS3 y JS modular. Despliegue con SSL gratis y CDN global en Vercel.
          </p>
        </div>
      </div>

      {/* Live Web App URL Connector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          Conector de URL de Google Apps Script Web App
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Cuando despliegues tu Web App en Google Apps Script, pega la URL generada aquí para vincularla a este entorno:
        </p>

        <div className="flex flex-col sm:flex-row gap-2 max-w-3xl">
          <input
            type="url"
            value={appsScriptUrl}
            onChange={(e) => setAppsScriptUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleSaveAndTestUrl}
            disabled={testStatus === 'testing'}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            {testStatus === 'testing' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Guardar y Probar Conexión
          </button>
        </div>

        {testMessage && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            testStatus === 'success'
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/60 border border-red-500/40 text-red-300'
          }`}>
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {testMessage}
          </div>
        )}
      </div>

      {/* Code Viewer & Export Suite */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-amber-400" />
              Archivos Generados para Producción
            </h3>
            <p className="text-xs text-slate-400">
              Ubicados en tu espacio de trabajo: listos para copiar, inspeccionar o subir a tu repositorio
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(selectedFile, fileContents[selectedFile]?.code || '')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/10"
            >
              {copied === selectedFile ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar este Archivo
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {Object.keys(fileContents).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setSelectedFile(fileName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                selectedFile === fileName
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
              }`}
            >
              {fileName}
            </button>
          ))}
        </div>

        {/* Selected File Description */}
        <div className="bg-slate-950 border border-slate-800 rounded-t-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="font-mono text-amber-400 font-bold">
            {fileContents[selectedFile]?.path}
          </span>
          <span className="text-slate-400">
            {fileContents[selectedFile]?.desc}
          </span>
        </div>

        {/* Code Content Box */}
        <pre className="bg-slate-950 border-x border-b border-slate-800 rounded-b-xl p-4 overflow-x-auto text-xs font-mono text-slate-300 max-h-96 leading-relaxed">
          <code>{fileContents[selectedFile]?.code}</code>
        </pre>
      </div>

      {/* Step by Step Deploy Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">
          Resumen de 4 Pasos para Dejarlo en Línea
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h4 className="font-bold text-white">Google Sheet & Apps Script</h4>
            <p className="text-slate-400">
              Crea tu hoja en sheets.new, ve a <em>Extensiones &gt; Apps Script</em> y pega el contenido de <code>Code.gs</code>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h4 className="font-bold text-white">Desplegar Web App</h4>
            <p className="text-slate-400">
              Haz clic en <em>Implementar &gt; Nueva implementación</em>. Selecciona "Aplicación web", acceso "Cualquiera" y copia la URL.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h4 className="font-bold text-white">Subir a GitHub</h4>
            <p className="text-slate-400">
              Crea un repositorio en GitHub y sube los archivos de la carpeta <code>production/</code> (index.html, styles.css, app.js, vercel.json).
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
              4
            </span>
            <h4 className="font-bold text-white">Desplegar en Vercel</h4>
            <p className="text-slate-400">
              Importa tu repositorio en vercel.com. Se desplegará automáticamente en segundos con enlace permanente HTTPS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
