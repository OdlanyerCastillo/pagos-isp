# Instrucciones de Configuración y Despliegue

Sigue este paso a paso detallado para configurar tu base de datos en Google Sheets y desplegar el sitio en GitHub Pages o Vercel de forma 100% gratuita.

---

## 📊 Paso 1: Configurar Google Sheets y Google Apps Script

El servidor de la aplicación se ejecuta sobre **Google Apps Script**. No necesitas pagar base de datos ni hosting para procesar las imágenes ni los registros.

1. **Crea una nueva Hoja de Cálculo de Google** en tu cuenta de Google Drive. Puedes ponerle de nombre `Pagos de Clientes ISP`.
2. En el menú superior de la hoja, haz clic en **Extensiones** > **Apps Script**.
3. Se abrirá el editor de código. Borra cualquier código existente por defecto en el archivo `Código.gs` (o `Code.gs`).
4. Abre el archivo [Code.gs](file:///home/noba/odoo-wisp/pagos_isp/Code.gs), copia todo su contenido y pégalo en el editor de Apps Script.
5. Haz clic en el botón de **Guardar** (el icono de disco de la barra superior).

---

## 🌐 Paso 2: Desplegar la Aplicación Web (Apps Script)

Para que el formulario pueda enviarle información a Google Sheets, debemos habilitar el script como una API pública:

1. Haz clic en el botón azul **Desplegar** (o *Deploy*) en la esquina superior derecha del editor y selecciona **Nuevo despliegue** (*New deployment*).
2. En el menú de la izquierda, haz clic en la rueda dentada de configuración y asegúrate de elegir **Aplicación web** (*Web app*).
3. Rellena los datos de la siguiente manera (¡Es muy importante para evitar errores de permisos!):
   * **Descripción:** `API Registro Pagos ISP`
   * **Ejecutar como (Execute as):** **Mi usuario** (*Me*) (tu correo electrónico).
   * **Quién tiene acceso (Who has access):** **Cualquiera** (*Anyone*) (esta opción permite que el formulario web envíe los datos de manera pública sin pedir contraseña de Google al cliente).
4. Haz clic en el botón azul **Desplegar**.
5. *Nota:* Google te solicitará otorgar permisos para que el script pueda escribir en tu hoja de cálculo. Haz clic en **Autorizar acceso**, selecciona tu cuenta de Google, pulsa en **Advanced** (Configuración avanzada) y luego en **Go to... (unsafe)** (Ir a... no seguro).
6. Una vez completado el despliegue, la pantalla te mostrará la **URL de la aplicación web**. Cópiala. Debe lucir similar a esto:
   `https://script.google.com/macros/s/AKfycbz_.../exec`

---

## 🔗 Paso 3: Conectar el Formulario con tu API de Google Sheets

1. Abre el archivo de tu proyecto [app.js](file:///home/noba/odoo-wisp/pagos_isp/app.js).
2. Busca la línea número 6:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_XXXXXXXXXXXXXX/exec';
   ```
3. Reemplaza el valor de `SCRIPT_URL` entre las comillas simples por la URL de la aplicación web que copiaste en el Paso 2.
4. Guarda el archivo [app.js](file:///home/noba/odoo-wisp/pagos_isp/app.js).

---

## 🚀 Paso 4: Despliegue en GitHub Pages o Vercel

### Opción A: Desplegar en GitHub Pages (Totalmente Gratis y Estático)
GitHub Pages es excelente para alojar proyectos estáticos simples como este formulario.

1. Crea un nuevo repositorio en GitHub (puede llamarse `pagos-isp`).
2. Sube los archivos `index.html`, `style.css` y `app.js` al repositorio. (Nota: No es necesario subir `Code.gs` ni `INSTRUCCIONES.md`, pero subirlos no afectará en nada).
3. En tu repositorio de GitHub, ve a **Settings** (Configuración) > pestaña **Pages** en la barra lateral izquierda.
4. En la sección **Build and deployment**, bajo **Source**, selecciona **Deploy from a branch**.
5. Bajo **Branch**, selecciona tu rama principal (usualmente `main` o `master`) y la carpeta `/root`, luego haz clic en **Save**.
6. Espera 1 o 2 minutos. GitHub generará un enlace público permanente del tipo:
   `https://tu-usuario.github.io/pagos-isp/`
   ¡Ese es el enlace que le enviarás a tus clientes!

---

### Opción B: Desplegar en Vercel (Totalmente Gratis y Rápido)
Vercel compila y despliega webs estáticas de manera ultra rápida.

#### Usando la interfaz web de Vercel:
1. Sube tu proyecto a un repositorio de GitHub (público o privado).
2. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **Add New** > **Project**.
4. Importa tu repositorio recién creado.
5. Haz clic en **Deploy**. ¡Listo! Vercel te dará un enlace público automático (ej. `pagos-isp.vercel.app`).

#### Usando la consola (Vercel CLI):
Si tienes instalada la consola de Vercel en tu computadora, puedes desplegar en segundos ejecutando el siguiente comando dentro de la carpeta del proyecto (`/home/noba/odoo-wisp/pagos_isp`):
```bash
vercel --prod
```
Sigue los pasos interactivos en pantalla para asociar tu cuenta y desplegar.

---

## 📁 Estructura del Proyecto
* [index.html](file:///home/noba/odoo-wisp/pagos_isp/index.html) - Estructura visual del formulario.
* [style.css](file:///home/noba/odoo-wisp/pagos_isp/style.css) - Estilos modernos responsive (Apto para móviles y PC).
* [app.js](file:///home/noba/odoo-wisp/pagos_isp/app.js) - Lógica de validación de campos y conexión con Google.
* [Code.gs](file:///home/noba/odoo-wisp/pagos_isp/Code.gs) - Backend en Google Apps Script que registrará la información de los pagos en una fila ordenada de la hoja de cálculo.
