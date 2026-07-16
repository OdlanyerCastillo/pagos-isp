# Instrucciones de Configuración y Despliegue (Actualizadas)

## 📋 Resumen de cambios recientes
- **Seguridad mejorada**: validación de tamaño y tipo de archivo, sanitización del nombre de la captura y verificación de URL del script.
- **Nuevos campos obligatorios**: se valida el número de referencia (mínimo 4 dígitos) y la captura de pantalla del pago.
- **Mejoras de UI**: mensajes de error claros y preview de imagen.

---

## 📊 Paso 1: Configurar Google Sheets y Google Apps Script
1. Crea una hoja de cálculo en Google Drive llamada `Pagos de Clientes ISP`.
2. En el menú **Extensiones → Apps Script** crea un nuevo proyecto.
3. Reemplaza el contenido del archivo `Code.gs` con el código del repositorio (ver archivo `Code.gs`).
4. Guarda los cambios.

## 🌐 Paso 2: Desplegar la Aplicación Web (Apps Script)
1. Haz clic en **Desplegar → Nuevo despliegue**.
2. Selecciona **Aplicación web**.
3. Configura:
   - **Descripción**: `API Registro Pagos ISP`
   - **Ejecutar como**: **Mi usuario**
   - **Quién tiene acceso**: **Cualquiera**
4. Autoriza los permisos.
5. Copia la URL que aparece (p.ej. `https://script.google.com/macros/s/AKfycbz_.../exec`).

## 🔗 Paso 3: Conectar el Formulario con la API
1. Abre `app.js`.
2. En la línea 6 reemplaza `SCRIPT_URL` con la URL copiada del paso anterior.
3. Guarda el archivo.

## 🚀 Paso 4: Despliegue en GitHub Pages o Vercel
### Opción A: GitHub Pages
1. Crea (o usa) el repositorio `pagos-isp`.
2. Sube `index.html`, `style.css`, `app.js` y este archivo `INSTRUCCIONES.md`.
3. En **Settings → Pages**, selecciona la rama `main` y la carpeta `/root`.
4. Espera unos minutos y obtén la URL `https://<usuario>.github.io/pagos-isp/`.

### Opción B: Vercel
1. Sube el proyecto a GitHub.
2. En Vercel, importa el repositorio y despliega.
3. Obtén la URL pública (`https://pagos-isp.vercel.app`).

---

## 📁 Estructura del proyecto
- **index.html** – Estructura del formulario.
- **style.css** – Estilos modernos y responsivos.
- **app.js** – Lógica de validación, preview de imagen y envío a Apps Script.
- **Code.gs** – Backend de Google Apps Script que escribe en la hoja.
- **INSTRUCCIONES.md** – Este documento (actualizado).

---

## ✅ Verificación de funcionamiento
1. Abre la URL del sitio desplegado.
2. Completa el formulario con datos válidos y una captura < 5 MB.
3. Envía y verifica que aparezca la pantalla de éxito y que los datos se registren en la hoja de cálculo.
4. En caso de error, revisa la consola del navegador para depurar.

---

**¡Listo!** Con estos pasos tu solución está 100 % actualizada y segura.
