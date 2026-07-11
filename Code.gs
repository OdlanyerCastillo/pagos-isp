/**
 * Código de Google Apps Script (Code.gs)
 * Vincula este script a tu Hoja de Cálculo de Google (Google Sheet)
 * 
 * Instrucciones de instalación en el archivo INSTRUCCIONES.md
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "El servicio de pagos de tu ISP está en línea y recibiendo solicitudes."
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Configuración de CORS
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  try {
    // 1. Obtener y parsear los datos del formulario enviados por el frontend
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No se recibieron datos en la solicitud (postData vacío).");
    }
    
    var data = JSON.parse(e.postData.contents);
    
    var cedula = data.cedula;
    var telefono = data.telefono;
    var referencia = data.referencia;
    var nombre = data.nombre;
    var base64Image = data.image; // Cadena en Base64 de la imagen
    var imageName = data.imageName || "comprobante.png";

    // 2. Validar que la información obligatoria exista
    if (!cedula || !telefono || !referencia || !nombre) {
      throw new Error("Faltan campos requeridos en el formulario.");
    }

    var fileUrl = "No se cargó imagen";

    // 3. Procesar y guardar la imagen en Google Drive (si existe)
    if (base64Image) {
      var folderName = "Comprobantes de Pago ISP";
      var folder;
      var folders = DriveApp.getFoldersByName(folderName);
      
      // Buscar si ya existe la carpeta, de lo contrario crearla
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }
      
      // Convertir base64 a archivo binario (Blob)
      var decodedImage = Utilities.base64Decode(base64Image);
      
      // Intentar obtener el tipo mime de la extensión o usar png por defecto
      var mimeType = "image/png";
      if (imageName.endsWith(".jpg") || imageName.endsWith(".jpeg")) {
        mimeType = "image/jpeg";
      }
      
      var blob = Utilities.newBlob(decodedImage, mimeType, "pago_" + referencia + "_" + imageName);
      
      // Crear el archivo en la carpeta de Drive
      var file = folder.createFile(blob);
      
      // Dar permisos de lectura públicos para que el administrador de la hoja pueda hacer clic y ver la imagen
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    }

    // 4. Registrar los datos en la Hoja de Cálculo de Google (Active Spreadsheet)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Si la hoja está vacía, inicializar la fila de encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha/Hora Registro", 
        "Nombre y Apellido", 
        "Cédula Propietario", 
        "Teléfono Propietario", 
        "Número de Referencia", 
        "Enlace de Captura (Drive)"
      ]);
      
      // Dar formato en negrita a los encabezados
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    }

    // Agregar la fila con la información del pago
    var fechaActual = new Date();
    sheet.appendRow([
      fechaActual,
      nombre,
      cedula,
      telefono,
      referencia,
      fileUrl
    ]);
    
    // Auto-ajustar las columnas al tamaño de los datos
    sheet.autoResizeColumns(1, 6);

    // 5. Responder con éxito
    var response = {
      status: "success",
      message: "El pago se ha registrado correctamente en la hoja de cálculo.",
      row: sheet.getLastRow()
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Responder con el error capturado
    var errResponse = {
      status: "error",
      message: error.toString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(errResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
