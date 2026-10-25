# ⛽ Control de Gasoil & Planta Eléctrica

Sistema para control de compras de combustible (gasoil/diesel), registro de horas de operación de planta eléctrica, reportes mensuales detallados y gráficos comparativos de eficiencia.

### Arquitectura de Producción Serverless
- **Base de Datos**: Google Sheets (Hojas: `COMPRA GASOIL`, `PLANTA ELÉCTRICA`, `CONFIGURACIÓN`)
- **Backend API**: Google Apps Script (`Code.gs`) desplegado como Aplicación Web (Web App REST)
- **Frontend**: HTML5, Tailwind CSS y JavaScript Vanilla (sin dependencias de servidor)
- **Hosting**: Vercel con despliegue continuo desde GitHub

---

## 🚀 Despliegue Rápido en 4 Pasos

### 1. Configurar Google Sheets y Apps Script
1. Crea una hoja en [Google Sheets](https://sheets.new) llamada `CONTROL_GASOIL_PLANTA`.
2. Ve a **Extensiones > Apps Script**.
3. Pega el código de `google-apps-script/Code.gs`.
4. Ejecuta la función `initSpreadsheet` para generar automáticamente los encabezados y datos de muestra.

### 2. Desplegar como Web App
1. En Apps Script, haz clic en **Implementar > Nueva implementación**.
2. Tipo: **Aplicación Web**.
3. Ejecutar como: **Yo**.
4. Quién tiene acceso: **Cualquiera** (imprescindible para permitir llamadas desde Vercel).
5. Copia la URL generada (`https://script.google.com/macros/s/.../exec`).

### 3. Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### 4. Desplegar en Vercel
1. Ve a [vercel.com/new](https://vercel.com/new) e importa este repositorio.
2. Vercel detectará la configuración en `vercel.json` y desplegará tu frontend estático en segundos.
3. Abre la aplicación en Vercel, ve a la pestaña **🌐 Conexión Google Sheets** y pega la URL de tu Web App.
