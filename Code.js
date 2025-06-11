var folderID = "1PSauhY-tcXcqkJXW4qK1MMBwFz-gFr9F"; //Replace the "root" with folder ID to upload files to a specific folder
var sheetName = "Data"; //Replace the "Data" with your data sheet name

//Numero 01 listo 
function doGet(e) {
  var page = (e.parameter.page || "index").toLowerCase();
  var allowedPagesString = "comentarios,buscarecibo,datospago,deuda,index,ocupacion"; // Agregar "ocupacion" a la lista
  var allowedPages = allowedPagesString.split(",");
  var filename = (allowedPages.indexOf(page) !== -1) ? page : "index";
  return HtmlService.createTemplateFromFile(filename).evaluate();
}

//Numero 02 listo 
function guardarRegistro(datos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("ocupacion");
  const cedulaIngresada = String(datos.numeroCedula).trim();

  let cedulasExistentes = [];
  const ultimaFila = sheet.getLastRow();

  if (ultimaFila > 1) { // Si hay al menos una fila de datos
    const data = sheet.getRange(2, 1, ultimaFila - 1, 1).getValues(); // Solo columna A desde fila 2
    cedulasExistentes = data.map(row => String(row[0]).trim());
  }

  if (cedulasExistentes.includes(cedulaIngresada)) {
    throw new Error("Ya existe un registro con esa cédula.");
  }

  const newRow = [
    datos.numeroCedula, datos.nombre, datos.apellido,
    datos.tipoOcupacion, datos.numeroTelefono, datos.tieneWhatsapp, datos.correoElectronico, 
    datos.numeroCasa, datos.nombreCalle, datos.cancelaCondominio, datos.tieneVehiculo,
    datos.modeloVehiculo,datos.placaVehiculo,datos.colorVehiculo,
    datos.nombrePagador, datos.apellidoPagador, datos.numeroCedulaPagador,
 datos.numeroTelefonoPagador, datos.tieneWhatsappPagador,datos.emailPagador
  ];

  sheet.appendRow(newRow);
  return "Datos guardados correctamente.";
}

//Numero 03 listo 
function registrarComentario(data) {
  const hoja = SpreadsheetApp.getActive().getSheetByName('comentarios');
  const fila = [data.nombre || '', data.apellido || '', data.cedula || '', data.telefono || '', data.correo || '', data.comentario || '', new Date()];
  hoja.appendRow(fila);
}

//Numero 04 listo 
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

//Numero 05 listo 
function generarYGuardarPDF() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  var data = sheet.getDataRange().getValues();
  var pdfFolder = DriveApp.getFolderById("1EHUcwIqQLnDj1hv8hYvVXWnuGQndXv6T");
  for (var i = 2; i < data.length; i++) { // Empezar desde la fila 3
    var row = data[i];
    if (row[16] === true && !row[17]) {
      var pdfContent = HtmlService.createTemplateFromFile('PdfTemplate');
      pdfContent.firstName = row[1];
      pdfContent.lastName = row[2];
      pdfContent.email = row[6];
      pdfContent.siteC = row[3];
      pdfContent.siteN = row[4];
      pdfContent.phone = row[7];
      pdfContent.ref = row[11];
      pdfContent.dateOfPey = row[8];
      plantillaPDF.type = row[9];
      plantillaPDF.monto = row[10];
      plantillaPDF.orden = ordenId;
      plantillaPDF.showQRCode = false;
      plantillaPDF.oriPdf = false;
      plantillaPDF.emailSentTime = Utilities.formatDate(new Date(), "America/Caracas", "dd/MM/yyyy hh:mm a");
      var contenidoPDFHtml = plantillaPDF.evaluate().getContent();
      var archivoPDF = Utilities.newBlob(contenidoPDFHtml, 'text/html').getAs('application/pdf').setName(nombreArchivoPDF);
      try {
        MailApp.sendEmail({
          to: emailDestino,
          subject: asunto,
          htmlBody: cuerpoEmail,
          attachments: [archivoPDF]
        });
        datos[i][17] = fechaHoraEnvio;
        algunCorreoEnviado = true;
      } catch (e) {
      }
    }
  }
  if (algunCorreoEnviado) {
    var columnaQValores = datos.map(function (fila) {
      return [fila[17]];
    });
    hoja.getRange(1, 18, datos.length, 1).setValues(columnaQValores);
  }
}

//Numero 06 listo
function getNextId() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var idColumn = 1;
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var maxId = 100000 - 1;

  for (var i = 0; i < values.length; i++) {
    var currentId = parseInt(values[i][idColumn - 1]);
    if (!isNaN(currentId) && currentId > maxId) {
      maxId = currentId;
    }
  }
  return maxId + 1;
}

//Numero 07 listo
function uploadFiles(formObject) {
  try {
    var folder = DriveApp.getFolderById(folderID);
    var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
    var fileUrl = "";
    var fileName = "";
    var nextId = getNextId();

    // Subir archivo si existe y actualizar la URL y el nombre del archivo
    if (formObject.myFile.length > 0) {
      var blob = formObject.myFile;
      var originalFileName = blob.getName();
      var fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'));
      var referenceNumber = formObject.ref || "Archivo_Sin_Referencia";
      var newFileName = referenceNumber + fileExtension;
      var file = folder.createFile(blob);
      file.setName(newFileName);
      file.setDescription("Uploaded by " + formObject.first_name);
      file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
      fileName = file.getName();
    } else {
      fileUrl = "Registro guardado sin Comprobante";
    }

    var types = [];
    if (Array.isArray(formObject.type)) {
      types = formObject.type;
    } else if (formObject.type) {
      types.push(formObject.type);
    }

    sheet.insertRowAfter(2); // Inserta una nueva fila en la posición 2 (después de la primera fila)
    sheet.getRange(3, 1, 1, 19).setValues([
      [
        nextId, // Columna A: ID Consecutivo
        formObject.first_name,
        formObject.last_name,
        formObject.siteC,
        formObject.siteN,
        formObject.idC,
        formObject.email,
        formObject.phone,
        formObject.dateOfPey,
        types.join(", "),
        formObject.monto,
        formObject.ref,
        fileName,
        fileUrl,
        Utilities.formatDate(new Date(), "America/Caracas", "dd/MM/yyyy hh:mm a"),
        "", // Columna P (Enviado)
        "", // Columna Q (Estado Enviado)
        "", // Columna R (Fecha y Hora de Envío)
        "" // Columna S (Fecha y Hora de Envío)
      ]
    ]);

    return fileUrl;

  } catch (error) {
    return error.toString();
  }
}

//Numero 08 listo
function buscarOcupantePoridC(idC) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ocupacion');
  const datos = hoja.getDataRange().getValues();

  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0].toString() === idC.toString()) {
      return {

        encontrado: true,
        firstName: datos[i][1],
        lastName: datos[i][2],
        phone: datos[i][4],
        email: datos[i][6],
        siteC: datos[i][7],
        siteN: datos[i][8],
        
        
      };
    }
  }
  return { encontrado: false };
}

//Numero 09 listo
function accionCombinada() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const hojaBanco = libro.getSheetByName("MovimientosBanco"), hojaData = libro.getSheetByName("Data");

  if (hojaBanco.getRange("J1").getValue() && hojaBanco.getRange("J1").setValue(false)) {
    return SpreadsheetApp.getUi().showModalDialog(
      HtmlService.createHtmlOutputFromFile('UploadForm').setWidth(400).setHeight(300),
      'Moviemientos Bancarios');}
  if (hojaData.getRange("Q2").getValue() && hojaData.getRange("Q2").setValue(false)) sendEmails();
}

//Numero 10 listo
function getDeudaByCedula(cedulaBuscada) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hojaConsolidado = ss.getSheetByName('consolidado');
    const hojaTasas = ss.getSheetByName('tasas');

    const tasaCambio = hojaTasas.getRange('B1').getValue();
    Logger.log('Tasa de cambio: ' + tasaCambio);

    const datos = hojaConsolidado.getDataRange().getValues();
    Logger.log('Total filas en consolidado: ' + datos.length);

    const encabezados = datos[0];
    Logger.log('Encabezados: ' + encabezados.join(', '));

    // Buscar fila con la cédula
    let filaUsuario = null;
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][1].toString() === cedulaBuscada) {
        filaUsuario = datos[i];
        Logger.log('Fila encontrada en índice ' + i + ': ' + filaUsuario.join(', '));
        break;
      }
    }

    if (!filaUsuario) {
      Logger.log('No se encontró la cédula: ' + cedulaBuscada);
      return null;
    }

    const nombre = filaUsuario[2];
    const deudaAcumuladaUSD = parseFloat(filaUsuario[4]) || 0;
    const plazoDias = parseInt(filaUsuario[5]) || 0;

    Logger.log('Nombre: ' + nombre);
    Logger.log('Deuda acumulada USD: ' + deudaAcumuladaUSD);
    Logger.log('Plazo días: ' + plazoDias);

    const fechaHoy = new Date();
    const mesActualIndex = fechaHoy.getMonth(); // 0 para enero, 11 para diciembre
    Logger.log('Mes actual (0-11): ' + mesActualIndex);

    const indicePrimerMes = 6; // Columna G
    const nombresMeses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];
    const nombresMesesLargos = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    let ultimoMesPagadoIndex = -1; // Índice del último mes que tiene algún valor no vacío
    let allMonthsPaid = true;
    const mesesPendientes = [];

    const response = {
      nCasa: filaUsuario[0] || '',
      cedula: filaUsuario[1] || '',
      nombre: filaUsuario[2] || '',
      deuAnt: parseFloat(filaUsuario[4]) || 0,
      plazo: parseInt(filaUsuario[5]) || 0,
      cuoExtOrdAnual: parseFloat(filaUsuario[42]) || 0,
      deudaAtrasadaUSD: deudaAcumuladaUSD, // Mantener para la lógica del mensaje si es necesario
    };

    for (let i = 0; i < nombresMeses.length; i++) {
      const mesKey = nombresMeses[i];
      const indiceBaseMes = indicePrimerMes + i * 3; // Columna inicial para el mes

      const montoMes = filaUsuario[indiceBaseMes];
      const sedematMes = filaUsuario[indiceBaseMes + 1];
      const abonoMes = filaUsuario[indiceBaseMes + 2];

      // Asignar valores al objeto de respuesta, convirtiendo a número si es posible o dejando vacío/N/A
      response[mesKey] = (montoMes !== '' && montoMes !== null) ? parseFloat(montoMes) || 0 : '';
      response[`${mesKey}Sedemat`] = (sedematMes !== '' && sedematMes !== null) ? parseFloat(sedematMes) || 0 : '';
      response[`${mesKey}AdoDeu`] = (abonoMes !== '' && abonoMes !== null) ? parseFloat(abonoMes) || 0 : '';

      // Determinar si el mes está "pagado" (basado en si CUALQUIERA de las tres celdas no está vacía)
      if (montoMes !== '' || sedematMes !== '' || abonoMes !== '') {
        ultimoMesPagadoIndex = i; // Guarda el índice del mes
      } else if (i < mesActualIndex) {
        allMonthsPaid = false;
        mesesPendientes.push(nombresMesesLargos[i]);
      }
    }

    Logger.log('Último mes con datos (pagado): ' + ultimoMesPagadoIndex);

    // --- Lógica para determinar qué meses mostrar y el mensaje de pendientes ---

    let mesesAMostrarHastaIndex = ultimoMesPagadoIndex; // Muestra hasta el último pagado
    const isAnticipated = ultimoMesPagadoIndex > mesActualIndex;

     let mensajeMesesPendientes = "";
     if (allMonthsPaid && ultimoMesPagadoIndex >= 11) {
          mensajeMesesPendientes = `Al día con los pagos hasta <span class="badge text-bg-success">Diciembre</span>`;
    } else if (allMonthsPaid) {
      mensajeMesesPendientes = "Al día con los pagos hasta " + nombresMesesLargos[mesActualIndex];
         if (isAnticipated) {
           mensajeMesesPendientes = `Al día con los pagos hasta ${nombresMesesLargos[mesActualIndex]}  <span class="badge text-bg-success">${nombresMesesLargos[ultimoMesPagadoIndex]}</span> (Pago anticipado)`;
         }
    } else {
           let mesesPendientesHTML = "";
           for (let i = 0; i < mesesPendientes.length; i++) {
               mesesPendientesHTML += `<span class="badge text-bg-danger">${mesesPendientes[i]}</span> `; // Add badge to each pending month
           }
           mensajeMesesPendientes = "Meses pendientes de pago: " + mesesPendientesHTML;
      }


    Logger.log('Mes actual index: ' + mesActualIndex);
    Logger.log('Último mes pagado index: ' + ultimoMesPagadoIndex);
    Logger.log('Meses a mostrar hasta index: ' + mesesAMostrarHastaIndex);
    Logger.log('Pago anticipado: ' + isAnticipated);
    Logger.log('Mensaje meses pendientes ' + mensajeMesesPendientes);

    // Incluir los índices, bandera y mensaje en la respuesta
    response.mesesAMostrarHastaIndex = mesesAMostrarHastaIndex;
    response.isAnticipated = isAnticipated;
    response.mesActualIndex = mesActualIndex; // Asegurar que el índice del mes actual también se envía
    response.mensajeMesesPendientes = mensajeMesesPendientes;

    // Recalcular el mensaje general de deuda/solvente
    const tieneDeudaTotal = response.deuAnt > 0 || mesesPendientes.length > 0;
    response.mensaje = tieneDeudaTotal ? "Tiene deuda pendiente" : "Está solvente";

    return response;

  } catch (e) {
    return { error: 'Error en getDeudaByCedula: ' + e.message };
  }

}


//Numero 11 listo
function dataBanco(content) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MovimientosBanco");
  if (!sheet) return;
  var lines = content.split('\n').slice(1).filter(function (l) { return l.trim(); });
  var outputData = lines.map(function (line) { return line.split('|').map(function (item) { return item.trim(); }); });
  if (outputData.length) {
    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, outputData.length, outputData[0].length).setValues(outputData);
  }
}

//Numero 12 listo
function onEdit(e) {
  if (!e) return;

  var sh = e.source.getActiveSheet();
  var cell = e.range.getA1Notation();
  var val = e.range.getValue();
  var name = sh.getName();

  if (name === "QR" && ["D3", "D4"].indexOf(cell) > -1) {
    var color = String(val).trim();
    if (/^([0-9A-F]{3}){1,2}$/i.test(color)) color = "#" + color;
    var ok = /^#([0-9A-F]{3}){1,2}$/i.test(color) || isCssColorName(color.toLowerCase());
    e.range.setBackground(ok ? color : "white");
  }

  if (name === "Verificación" && e.range.getColumn() === 4 && e.value === "TRUE") {
    var row = e.range.getRow();
    var checks = sh.getRange(1, 4, sh.getLastRow(), 1).getValues();
    for (var i = 0; i < checks.length; i++) {
      if (i + 1 !== row && checks[i][0] === true) sh.getRange(i + 1, 4).setValue(false);
    }
  }
}

//Numero 13 listo
function buscarPropietario(id) {
  var hoja = SpreadsheetApp.getActive().getSheetByName("Data");
  var datos = hoja.getDataRange().getValues();
  var idBuscado = String(id).trim();
  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    var idC = String(fila[5] || "").trim();
    var emailSentTime = String(fila[16] || "").trim();
    if (idC === idBuscado && emailSentTime) {
      var plantilla = HtmlService.createTemplateFromFile("PdfTemplate");
      plantilla.orden = fila[0];
      plantilla.firstName = fila[1];
      plantilla.lastName = fila[2];
      plantilla.siteC = fila[3];
      plantilla.siteN = fila[4];
      plantilla.idC = fila[5];
      plantilla.email = fila[6];
      plantilla.phone = fila[7];
      plantilla.dateOfPey = fila[8];
      plantilla.type = fila[9];
      plantilla.monto = fila[10];
      plantilla.ref = fila[11];
      plantilla.emailSentTime = fila[17];
      plantilla.oriPdf = fila[18];
      plantilla.showQRCode = true;
      return plantilla.evaluate().getContent();
    }
  }
  return '<div class="alert alert-warning" role="alert"><i class="bi bi-alarm"></i>No se encontraron datos para el Identificador ingresado o la información aún no ha sido procesada.</div>';
}

//Numero 14 listo
function sendEmails() {
  var hojaNombre = "Data";
  var hoja = SpreadsheetApp.getActive().getSheetByName(hojaNombre);
  var datos = hoja.getDataRange().getValues();
  var hojaMensajes = SpreadsheetApp.getActive().getSheetByName("MensajesCorreo");
  var asunto = hojaMensajes.getRange("C3").getValue();
  var titulo = hojaMensajes.getRange("C5").getValue();
  var urlImagen = hojaMensajes.getRange("C7").getValue();
  var mensajePrincipal = hojaMensajes.getRange("C9").getValue();
  var mensajeSecundario = hojaMensajes.getRange("C11").getValue();
  var algunCorreoEnviado = false;
  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    if (fila[15] === true && fila[16] === true && fila[17] === "") {
      var emailDestino = fila[6];
      var nombre = fila[1];
      var apellido = fila[2];
      var ordenId = fila[0];
      var fechaHoraEnvio = Utilities.formatDate(new Date(), "America/Caracas", "dd/MM/yyyy hh:mm a");
      var nombreArchivoPDF = "ReciboPago-" + nombre + "-" + apellido + "-" + ordenId + ".pdf";
      var plantillaEmail = HtmlService.createTemplateFromFile('EmailMessageTemplate');
      plantillaEmail.firstName = nombre;
      plantillaEmail.lastName = apellido;
      plantillaEmail.emailSentTime = fechaHoraEnvio;
      plantillaEmail.titulo = titulo;
      plantillaEmail.mensaje = mensajePrincipal;
      plantillaEmail.mensaje2 = mensajeSecundario;
      plantillaEmail.imagenPersonalizada = urlImagen;
      var cuerpoEmail = plantillaEmail.evaluate().getContent();
      var plantillaPDF = HtmlService.createTemplateFromFile('PdfTemplate');
      plantillaPDF.firstName = nombre;
      plantillaPDF.lastName = apellido;
      plantillaPDF.email = emailDestino;
      plantillaPDF.siteC = fila[3];
      plantillaPDF.siteN = fila[4];
      plantillaPDF.phone = fila[7];
      plantillaPDF.ref = fila[11];
      plantillaPDF.dateOfPey = fila[8];
      plantillaPDF.type = fila[9];
      plantillaPDF.monto = fila[10];
      plantillaPDF.orden = ordenId;
      plantillaPDF.showQRCode = false;
      plantillaPDF.oriPdf = false;
      plantillaPDF.emailSentTime = fechaHoraEnvio;
      var contenidoPDFHtml = plantillaPDF.evaluate().getContent();
      var archivoPDF = Utilities.newBlob(contenidoPDFHtml, 'text/html').getAs('application/pdf').setName(nombreArchivoPDF);
      try {
        MailApp.sendEmail({
          to: emailDestino,
          subject: asunto,
          htmlBody: cuerpoEmail,
          attachments: [archivoPDF]
        });
        datos[i][17] = fechaHoraEnvio;
        algunCorreoEnviado = true;
      } catch (e) {
      }
    }
  }
  if (algunCorreoEnviado) {
    var columnaQValores = datos.map(function (fila) {
      return [fila[17]];
    });
    hoja.getRange(1, 18, datos.length, 1).setValues(columnaQValores);
  }
}


function registrarTasa() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tasas");
  const datos = hoja.getRange("A1:E1").getValues()[0];

  hoja.insertRowBefore(6);
  hoja.getRange(6, 1, 1, 5).setValues([datos]);
}

function bloquearData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const rowCount = values.length;
  const qColIdx = 16; // Columna Q (indice 16)
  const maxSheetCol = sheet.getMaxColumns(); // <<< Usamos getMaxColumns() aquí

  const allProtections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  const scriptProtections = allProtections.filter(p => p.getDescription() === "Protegido basado en Columna Q");

  for (let i = 2; i < rowCount; i++) { // Desde fila 3 (indice 2)
    const row = i + 1;

    const rowProtections = scriptProtections.filter(p => {
      try { return p.getRange().getRow() === row; } catch (e) { return false; }
    });

    if (values[i] && values[i].length > qColIdx) {
      const qValue = values[i][qColIdx];
      const rangeBeforeQ = (qColIdx > 0) ? sheet.getRange(row, 1, 1, qColIdx) : null; // Columnas A a P
      const rangeAfterR = (maxSheetCol >= qColIdx + 3) ? sheet.getRange(row, qColIdx + 3, 1, maxSheetCol - (qColIdx + 2)) : null; // Desde Columna S (19) hasta la Max Columna de la Hoja

      if (qValue === true) {
        if (rangeBeforeQ) {
          let isProtected = false;
          for (const p of rowProtections) { try { if (p.getRange().equals(rangeBeforeQ)) { isProtected = true; break; } } catch (e) { } }
          if (!isProtected) {
            const p = rangeBeforeQ.protect();
            p.setDescription("Protegido basado en Columna Q");
            p.removeEditors(p.getEditors());
            if (p.canDomainEdit()) p.setDomainEdit(false);
          }
        }
        if (rangeAfterR) {
          let isProtected = false;
          for (const p of rowProtections) { try { if (p.getRange().equals(rangeAfterR)) { isProtected = true; break; } } catch (e) { } }
          if (!isProtected) {
            const p = rangeAfterR.protect();
            p.setDescription("Protegido basado en Columna Q");
            p.removeEditors(p.getEditors());
            if (p.canDomainEdit()) p.setDomainEdit(false);
          }
        }
        for (const p of rowProtections) {
          let isExpected = false;
          try {
            isExpected = (rangeBeforeQ && p.getRange().equals(rangeBeforeQ)) || (rangeAfterR && p.getRange().equals(rangeAfterR));
          } catch (e) { }
          if (!isExpected) { try { p.remove(); } catch (e) { } }
        }
      } else {
        for (const p of rowProtections) { try { p.remove(); } catch (e) { } }
      }
    } else {
      for (const p of rowProtections) { try { p.remove(); } catch (e) { } }
    }
  }
}
