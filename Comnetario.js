/*//listo
function dataBanco(content) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("MovimientosBanco") || ss.insertSheet("MovimientosBanco");
  var datos = content.split('\n').slice(1).filter(function(l) { return l.trim(); }).map(function(l) {
    return l.split('|').map(function(i) { return i.trim(); });
  });
  if (datos.length) {
    sh.getRange(sh.getLastRow() + 1, 1, datos.length, datos[0].length).setValues(datos);
  }
}
*/


/*function generarYGuardarPDF() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName); // Utiliza la variable sheetName definida al inicio
  var data = sheet.getDataRange().getValues();
  var pdfFolderId = "1EHUcwIqQLnDj1hv8hYvVXWnuGQndXv6T"; // Reemplaza con el ID de tu carpeta de PDFs
  var pdfFolder = DriveApp.getFolderById(pdfFolderId);

  for (var i = 1; i < data.length; i++) { // Empezamos desde la fila 2 (omitiendo encabezados)
    var row = data[i];
    var listoParaEnviar = row[15]; // Columna P (índice 15)
    var pdfLinkRegistrado = row[17]; // Columna R (índice 17)

    // Verificar si la columna O es true y la columna R está vacía
    if (listoParaEnviar === true && !pdfLinkRegistrado) {
      var orden = row[0];
      var firstName = row[1];
      var lastName = row[2];
      var email = row[5];
      var siteC = row[3];
      var siteN = row[4];
      var phone = row[6];
      var ref = row[10];
      var dateOfPey = row[7];
      var type = row[8];
      var monto = row[9];
      var oriPdf = row [17];
      var emailSentTime = Utilities.formatDate(new Date(), "America/Caracas", "dd/MM/yyyy hh:mm a");
      var pdfFileName = "Recibo_Pago_" + firstName + "_" + lastName + "_" + orden + ".pdf";


      // Cargar la plantilla del documento PDF
      var pdfTemplate = HtmlService.createTemplateFromFile('PdfTemplate');
      pdfTemplate.firstName = firstName;
      pdfTemplate.lastName = lastName;
      pdfTemplate.email = email;
      pdfTemplate.siteC = siteC;
      pdfTemplate.siteN = siteN;
      pdfTemplate.phone = phone;
      pdfTemplate.ref = ref;
      pdfTemplate.dateOfPey = dateOfPey;
      pdfTemplate.type = type;
      pdfTemplate.monto = monto;
      pdfTemplate.orden = orden;
      pdfTemplate.emailSentTime = emailSentTime;
      pdfTemplate.showQRCode = false; // No mostrar el QR en este caso
      var pdfContent = pdfTemplate.evaluate().getContent();

      // Generar el PDF a partir de la plantilla
      var pdfBlob = Utilities.newBlob(pdfContent, 'text/html').getAs('application/pdf').setName(pdfFileName);

      try {
        // Guardar el PDF en la carpeta de Google Drive
        var pdfFile = pdfFolder.createFile(pdfBlob);
        

        // Hacer el archivo público para compartir
        pdfFile.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
        var publicPdfUrl = pdfFile.getUrl();

        // Registrar el enlace público en la columna R
        sheet.getRange(i + 1, 18).setValue(publicPdfUrl); // Columna R (índice 17 + 1)

      } catch (error) {
        Logger.log("Error al generar o guardar el PDF: " + error.toString());
      }
    }
  }
}*/




/*function doGet(e) {


  var page = e.parameter.page || "Index";

  switch (page) {
    case "comentarios":
      return HtmlService.createTemplateFromFile('comentarios').evaluate();
    case "buscarecibo":
      return HtmlService.createTemplateFromFile('buscarecibo').evaluate();
    case "index":
    default:
      return HtmlService.createTemplateFromFile('index').evaluate();
  }
}*/


/*function registrarComentario(data) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('comentarios');
  if (!hoja) {
    throw new Error('La hoja "Comentarios" no existe.');
  }

  const fechaHora = new Date();
  hoja.appendRow([
    data.nombre,
    data.apellido,
    data.telefono,
    data.correo,
    data.comentario,
    Utilities.formatDate(fechaHora, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
  ]);

  return 'Comentario registrado con éxito';
}*/


/*
//Esta Funcion permite ejecutar funciones desde Checkbox
/*function accionCombinada() {
    const libro = SpreadsheetApp.getActiveSpreadsheet();
      //funcion para cargar txt desde Checkbox
    const hojaMovimientosBanco = libro.getSheetByName("MovimientosBanco");
    const valorF1 = hojaMovimientosBanco.getRange("F1").getValue();
    if (valorF1 === true) {
        hojaMovimientosBanco.getRange("F1").setValue(false);
        // Código integrado de showDialog()
        const htmlOutput = HtmlService.createHtmlOutputFromFile('UploadForm')
            .setWidth(400)
            .setHeight(300);
        SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Upload TXT File');
        return; // Importante: Detener la ejecución aquí
    }

    // Lógica para la función enviar correos desde Checkbox
    const hojaData = libro.getSheetByName("Data");
    const valorP2 = hojaData.getRange("P2").getValue();
    
    if (valorP2 === true) {
        hojaData.getRange("P2").setValue(false);
        sendEmails();
    }
}

function onEdit(e) {
    const sheet = e.source.getActiveSheet();
    const sheetName = "Verificación"; // Nombre de la hoja
    const checkboxColumn = 4; // Columna D

    // Obtiene el rango de la celda editada
    var editedRange = e.range;
    // Obtiene la fila de la celda editada
    var editedRow = editedRange.getRow();
    // Obtiene la columna de la celda editada
    var editedColumn = editedRange.getColumn();
    // Obtiene el valor de la celda editada (true si se marcó el checkbox, false si se desmarcó)
    var editedValue = e.value;

    // Verifica si la edición ocurrió en la hoja correcta, en la columna de checkboxes
    // y si el valor de la celda editada es TRUE (checkbox marcado)
    if (sheet.getName() === sheetName && editedColumn === checkboxColumn && editedValue === "TRUE") {
        // Obtiene el rango de todas las celdas en la columna de checkboxes
        var range = sheet.getRange(1, checkboxColumn, sheet.getLastRow(), 1);
        // Obtiene todos los valores de ese rango
        var values = range.getValues();

        // Itera sobre todas las filas de la columna de checkboxes
        for (var i = 0; i < values.length; i++) {
            // Si la fila actual no es la fila que se acaba de editar
            if (i + 1 !== editedRow) {
                // Si el checkbox en la fila actual está marcado, desmárcalo
                if (values[i][0] === true) {
                    sheet.getRange(i + 1, checkboxColumn).setValue(false);
                }
            }
        }
    }
}*/
