# 🚀 GUÍA DE PUESTA EN PRODUCCIÓN: GOOGLE SHEETS + APPS SCRIPT + VERCEL

Esta guía detalla el proceso completo para utilizar **Google Sheets como base de datos**, **Google Apps Script como backend API** y desplegar el **frontend (HTML, CSS, JS)** en **Vercel** conectado a **GitHub**.

---

## 📁 ESTRUCTURA DEL PROYECTO

```text
├── google-apps-script/
│   ├── Code.gs                <- Backend para Google Sheets (GET y POST)
│   └── appsscript.json        <- Manifiesto de ejecución
├── production/                <- CARPETA LISTA PARA SUBIR A GITHUB / VERCEL
│   ├── index.html             <- Frontend principal en HTML5
│   ├── css/
│   │   └── styles.css         <- Estilos modernos, responsivos y de impresión
│   ├── js/
│   │   └── app.js             <- Lógica de cálculo, gráficos y conexión API
│   ├── vercel.json            <- Configuración de despliegue en Vercel
│   └── README.md
```

---

## PASO 1: CREAR Y CONFIGURAR LA BASE DE DATOS EN GOOGLE SHEETS

1. Abre tu navegador e ingresa a [Google Sheets](https://sheets.new) para crear una hoja nueva.
2. Nómbrala como: **`CONTROL_DE_GASOIL_Y_PLANTA_ELECTRICA`**.
3. En el menú superior de Google Sheets, haz clic en **Extensiones** ➔ **Apps Script**.

---

## PASO 2: INSTALAR EL BACKEND EN GOOGLE APPS SCRIPT

1. En el editor de Apps Script que se abrió, borra el contenido por defecto del archivo `Código.gs`.
2. Abre el archivo `google-apps-script/Code.gs` de este proyecto y copia todo su contenido.
3. Pega el código en el editor de Apps Script y haz clic en el icono de **Guardar** (💾).
4. En el selector de funciones (arriba al centro), selecciona `initSpreadsheet` y haz clic en **Ejecutar**.
   - *Nota:* Google te pedirá autorizar permisos para acceder a la hoja de cálculo. Haz clic en "Revisar permisos", elige tu cuenta y haz clic en "Avanzado" ➔ "Ir a proyecto (no seguro)" ➔ "Permitir".
5. Al finalizar la ejecución, vuelve a tu Google Sheet y verás que automáticamente se han creado las pestañas:
   - `COMPRA GASOIL` (con encabezados y compras de agosto, septiembre y octubre 2026).
   - `PLANTA ELÉCTRICA` (con la bitácora de horómetros y surtidos).
   - `CONFIGURACIÓN` (con los parámetros de capacidad de tanque y tasa BCV).

---

## PASO 3: DESPLEGAR LA APLICACIÓN WEB (WEB APP)

1. En la esquina superior derecha del editor de Apps Script, haz clic en el botón azul **Implementar** ➔ **Nueva implementación**.
2. Haz clic en el engranaje (⚙️) al lado de "Seleccionar tipo" y elige **Aplicación web**.
3. Configura los siguientes campos:
   - **Descripción**: `Backend Gasoil Producción v1`
   - **Ejecutar como**: `Yo (tu_correo@gmail.com)`
   - **Quién tiene acceso**: **`Cualquiera`** *(Importante: Debe ser "Cualquiera" para que tu aplicación en Vercel pueda enviar y recibir datos sin problemas de autenticación).*
4. Haz clic en **Implementar**.
5. Copia la **URL de la aplicación web** generada (termina en `/exec`). Ejemplo:
   ```
   https://script.google.com/macros/s/AKfycbwXYZ.../exec
   ```

---

## PASO 4: ALOJAR EN GITHUB

1. Crea un nuevo repositorio en [GitHub](https://github.com/new), por ejemplo: `control-gasoil-planta`.
2. En tu computadora, sube los archivos de la carpeta `production/`:
   ```bash
   cd production
   git init
   git add .
   git commit -m "Initial production release: Gasoil & Planta Electrica"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/control-gasoil-planta.git
   git push -u origin main
   ```

---

## PASO 5: DESPLEGAR EN VERCEL

1. Entra a [Vercel](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** ➔ **"Project"**.
3. Selecciona tu repositorio recién creado (`control-gasoil-planta`) y haz clic en **Import**.
4. En la configuración:
   - **Framework Preset**: `Other` (detectará automáticamente el `index.html` estático).
   - **Root Directory**: `./` (o el directorio raíz donde subiste los archivos).
5. Haz clic en **Deploy**.
6. ¡Listo! En menos de 30 segundos tu aplicación estará en línea con una URL HTTPS segura (ejemplo: `https://control-gasoil-planta.vercel.app`).

---

## PASO 6: CONECTAR EL FRONTEND CON GOOGLE SHEETS

1. Abre la URL de tu aplicación en Vercel.
2. Dirígete a la pestaña **🌐 Conexión Google Sheets**.
3. Pega la URL de tu Web App de Google Apps Script copiada en el Paso 3.
4. Haz clic en **"Probar Conexión y Sincronizar"**.
5. ¡Toda compra y encendido de planta que registres se guardará directamente en tu Google Sheet en tiempo real!
