/**
 * Código de Google Apps Script (Code.gs)
 * Vincula este script a tu Hoja de Cálculo de Google
 */

// =============================================
// CONFIGURACIÓN
// =============================================

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// =============================================
// doGet - Servir datos para el Dashboard
// =============================================

function doGet(e) {
  // Obtener el parámetro 'mes' (ej: Ene-2025) o 'action' (months)
  var action = e && e.parameter && e.parameter.action ? e.parameter.action : null;
  
  if (action === 'months') {
    return doGetMonths();
  }
  
  var mesParam = e && e.parameter && e.parameter.mes ? e.parameter.mes : null;
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet;
    
    if (mesParam) {
      sheet = ss.getSheetByName(mesParam);
      if (!sheet) {
        throw new Error("No se encontró la hoja para el mes: " + mesParam);
      }
    } else {
      // Obtener la hoja del mes actual
      var ahora = new Date();
      var nombreHoja = MONTHS[ahora.getMonth()] + "-" + ahora.getFullYear();
      sheet = ss.getSheetByName(nombreHoja);
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "empty",
          message: "Aún no hay pagos registrados para el mes actual.",
          data: [],
          metadata: { mes: nombreHoja }
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "empty",
        message: "No hay registros en esta hoja.",
        data: [],
        metadata: { mes: sheet.getName() }
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0];
    var rows = data.slice(1);
    
    var jsonData = rows.map(function(row) {
      var obj = {};
      headers.forEach(function(header, index) {
        obj[header] = row[index];
      });
      return obj;
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: jsonData,
      metadata: {
        mes: sheet.getName(),
        totalRegistros: jsonData.length
      }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// doPost - Recibir pagos y guardar en hoja mensual
// =============================================

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No se recibieron datos en la solicitud.");
    }
    
    var data = JSON.parse(e.postData.contents);
    
    var cedula = data.cedula;
    var telefono = data.telefono;
    var referencia = data.referencia;
    var nombre = data.nombre;
    var sector = data.sector;
    var corte = data.corte;
    var base64Image = data.image;
    var imageName = data.imageName || "comprobante.png";
    
    if (!cedula || !telefono || !referencia || !nombre || !sector || !corte) {
      throw new Error("Faltan campos requeridos en el formulario.");
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Validar duplicados en la hoja del mes actual
    var ahora = new Date();
    var nombreHoja = MONTHS[ahora.getMonth()] + "-" + ahora.getFullYear();
    var sheet = ss.getSheetByName(nombreHoja);
    
    if (sheet) {
      var lastRow = sheet.getLastRow();
      if (lastRow > 0) {
        var dataRange = sheet.getRange(2, 7, lastRow - 1, 1);
        var references = dataRange.getValues().flat();
        if (references.includes(referencia)) {
          throw new Error("❌ El número de referencia " + referencia + " ya fue registrado este mes. Por favor, verifica.");
        }
      }
    }
    
    if (!sheet) {
      sheet = ss.insertSheet(nombreHoja);
      sheet.appendRow([
        "Fecha/Hora Registro",
        "Nombre y Apellido",
        "Cédula Propietario",
        "Teléfono Propietario",
        "Sector / Zona",
        "Día de Corte",
        "Número de Referencia",
        "Enlace de Captura (Drive)"
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    }
    
    var fileUrl = "No se cargó imagen";
    
    if (base64Image) {
      var decodedImage = Utilities.base64Decode(base64Image);
      
      var folderName = "Comprobantes de Pago ISP";
      var folder;
      var folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }
      
      var mimeType = "image/png";
      if (imageName.endsWith(".jpg") || imageName.endsWith(".jpeg")) {
        mimeType = "image/jpeg";
      }
      
      var blob = Utilities.newBlob(decodedImage, mimeType, imageName);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    }
    
    sheet.appendRow([
      new Date(),
      nombre,
      cedula,
      telefono,
      sector,
      corte,
      referencia,
      fileUrl
    ]);
    
    sheet.autoResizeColumns(1, 8);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "✅ El pago se ha registrado correctamente en " + nombreHoja,
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// Función para listar meses disponibles
// =============================================

function doGetMonths() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var months = [];
  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    if (/^[A-Z][a-z]{2}-\d{4}$/.test(name)) {
      months.push(name);
    }
  });
  months.sort().reverse();
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    months: months
  })).setMimeType(ContentService.MimeType.JSON);
}