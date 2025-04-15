/**
 * Initializes the page by setting the minimum and maximum dates for the 'fechaSolicitudConsulta' and 'fechaSolicitud' input fields.
 * This ensures that users can only select dates within the last 6 months.
 */
window.onload = function () {
    limitarFecha("fechaSolicitudConsulta");
    limitarFecha("fechaSolicitud");
  };
  
  
  /**
   * Limits the date input field to a range of 6 months from the current date.
   *
   * @param {string} idCampo - The ID of the date input field to be limited.
   */
  function limitarFecha(idCampo) {
    let fechaInput = document.getElementById(idCampo);
  
    // Obtener la fecha actual
    let fechaActual = new Date();
  
    // Calcular la fecha máxima (6 meses atrás)
    let fechaMaxima = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 6, fechaActual.getDate());
  
    // Formatear las fechas en el formato 'YYYY-MM-DD'
    let fechaActualStr = fechaActual.toISOString().split("T")[0];
    let fechaMaximaStr = fechaMaxima.toISOString().split("T")[0];
  
    // Establecer los atributos 'min' y 'max' del campo de fecha
    fechaInput.setAttribute("min", fechaMaximaStr);
    fechaInput.setAttribute("max", fechaActualStr);
  }
  
  /**
   * Validates the form and sends a request to generate a daily report.
   *
   * This function is responsible for validating the form input, specifically the
   * `fechaSolicitudConsulta` field. If the field is empty, it displays a warning
   * message using Swal.fire. If the field is not empty, it sends a POST request
   * to the "/private/solicitarReporteDiario" endpoint with the formatted date.
   * The response from the server is then handled, displaying either a success or
   * warning message based on the response data.
   */
  function validarFormularioSolicitud() {
  
    let fechaSolicitudConsulta = document.getElementById("fechaSolicitudConsulta").value;
    let btnSolicitudConsulta = document.getElementById("btnSolicitudConsulta").value;
    btnSolicitudConsulta.disabled = true;
  
    if (fechaSolicitudConsulta === "") {
      Swal.fire("Acción cancelada", "Seleccinar una fecha.", "warning");
      btnSolicitudConsulta.disabled = false;
      return;
    }
  
    $.ajax({
      url: context + "/private/solicitarReporteDiario", // Cambia esto por la URL del controller en Spring Boot
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(formatearFecha(fechaSolicitudConsulta)),
      success: function (response) {
        if (response.existeError) {
          Swal.fire("Acción cancelada", response.descripcion, "warning");
          btnSolicitudConsulta.disabled = false;
        } else {
          Swal.fire("Acción aceptada", "Se realizó la solicitud de Reporte Diario.", "success");
          btnSolicitudConsulta.disabled = false;
          table2.ajax.reload(null, false);
        }
      },
      error: function () {
        btnSolicitudConsulta.disabled = false;
        console.log("Error en la petición");
        
      },
    });
  }
  
  
  function validarFormulario() {
  
    let btnSolicitudConsultaReporte = document.getElementById("btnSolicitudConsultaReporte").value;
    btnSolicitudConsultaReporte.disabled = true;
  
  
    let fechaSolicitud = document.getElementById("fechaSolicitud").value;
    let folio = document.getElementById("folio").value;
    let curp = document.getElementById("curp").value;
  
    if (fechaSolicitud === "" && folio === "" && curp === "") {
      Swal.fire("Acción cancelada", "Debe llenar al menos uno de los campos.", "warning");
      btnSolicitudConsultaReporte.disabled = false;
      return;
    }
    btnSolicitudConsultaReporte.disabled = false;
    buscarReportes(fechaSolicitud, folio, curp);
  }
  
  /**
   * Converts the input value to uppercase.
   * @param {HTMLInputElement} input - The input element to convert to uppercase.
   */
  function convertirMayusculas(input) {
    input.value = input.value.toUpperCase();
  }
  
  /**
   * Formats a date string in the format 'YYYY-MM-DD' to 'DD-MM-YYYY'.
   * @param {string} fecha - The date string to be formatted.
   * @returns {string} The formatted date string.
   */
  function formatearFecha(fecha) {
    let partesFecha = fecha.split("-");
    let fechaFormateada = partesFecha[2] + "-" + partesFecha[1] + "-" + partesFecha[0];
    return fechaFormateada;
  }
  
  function formatearFechaNombreArchivo(fecha) {
    let partesFecha = fecha.split("-");
    let fechaFormateada = partesFecha[2] + "_" + partesFecha[1] + "_" + partesFecha[0];
    return fechaFormateada;
  }
  
  function formatearFechaNombreArchivoDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1; // Los meses en JavaScript van de 0 a 11, por eso sumamos 1
    let year = date.getFullYear();
  
    // Agregar un cero inicial si el día o el mes tienen un solo dígito
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
  
    return day + '_' + month + '_' + year;
  }
  
  //BEGIN: Datatables
  
  let table;
  let table2;
  let tableDuplicidad;
  
  
  function buscarReportes(fecha, folio, curp) {
  
      if (fecha !== '') {
          fecha = formatearFecha(fecha);
      }
  
      table.ajax.url(context + "/private/reportediariohistorico?data=&fechaSolicitud=" + fecha + "&folio=" + folio + "&curp=" + curp).load();
      tableDuplicidad.ajax.url(context + "/private/reportediariohistoricoDuplicidad").load();
  
  }
  
  $(document).ready(function () {
  
  
      table2 = $('#datatable-buttons-bitacora').DataTable({
          responsive: true,
          "dom": 'l<"mt-1"Bir><"text-right mb-3"f><"clear">ti<"float-end mt-1"p>',
          "paging": true,
          "ordering": true,
          "info": true,
          "paginate": true,
          "processing": true,
          "lengthChange": true,
          "scrollX": false,
          "language": {
              "lengthMenu": "Mostrar _MENU_ registros",
              "zeroRecords": "No se encontraron resultados",
              "emptyTable": "Ningún dato disponible en esta tabla",
              "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
              "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
              "infoFiltered": "(filtrado de un total de _MAX_ registros)",
              "infoPostFix": "",
              "thousands": ",",
              "sSearch": "Filtrar:",
              "loadingRecords": "Cargando registros...",
              "processing": "Buscando Información...",
              "paginate": {
                  "first": "Primero",
                  "last": "Último",
                  "next": "Siguiente",
                  "previous": "Anterior"
              },
              "aria": {
                  "orderable": ": Activar para ordenar la columna de manera ascendente",
                  "orderableReverse": ": Activar para ordenar la columna de manera descendente"
              }
          },
          order: [
              [0, 'desc']
          ],
          lengthMenu: [
              [5, 50, 100, 200, 300 - 1],
              [5, 50, 100, 200, 300, "Todos"],
          ],
          iDisplayLength: 5,
          buttons: [
  
              {
                  extend: 'colvis',
                  columnText: function (dt, idx, title) {
                      return (idx + 1) + ': ' + title;
                  },
                  className: "btn-sm",
                  text: "Columnas Visibles",
                  titleAttr: "Columnas Visibles"
              },
              {
                  text: '<i class="fa fa-refresh" aria-hidden="true"></i> Recargar información ',
                  className: "btn-sm",
                  action: function (e, dt, node, config) {
                      dt.ajax.reload();
                  }
              }
          ],
          "ajax": {
              url: context + "/private/bitacoraReporteModificacionDatos",
              timeout: "600000",
              "beforeSend": function () {
                  inicioTiempo = performance.now(); // Guardar el tiempo de inicio antes de la solicitud
              },
              "dataSrc": function (json) {
                  let finTiempo = performance.now(); // Tiempo al finalizar la carga
                  let tiempoTranscurrido = finTiempo - inicioTiempo; // Calcular el tiempo transcurrido
                  // Alternativamente, podrías mostrar esta información en tu página web
                  $('#tiempoCargaBitacora').text("La carga de datos ha tomado " + tiempoTranscurrido.toFixed(2) + " milisegundos.");
                  return json; // No olvides retornar los datos JSON para que DataTables pueda usarlos
              }
          },
  
          "autowidth": true,
  
          "columns": [{
              "data": "idBitacoraReporteMdd",
              "name": "ID",
              "title": "ID"
          },
          {
              "data": "tipoReporte",
              "name": "Tipo Reporte",
              "title": "Tipo Reporte"
          },
          {
              "data": "fechaInicioProcesoFormatoUno",
              "name": "Fecha Inicio Proceso",
              "title": "Fecha Inicio Proceso"
          },
          {
              "data": "fechaFinProcesoFormatoUno",
              "name": "Fecha Fin Proceso",
              "title": "Fecha Fin Proceso"
          },
          {
              "data": "estatus",
              "name": "Estatus",
              "title": "Estatus"
          },
          {
              "data": "tipoConsulta",
              "name": "Tipo Consulta",
              "title": "Tipo Consulta"
          },
          {
              "data": "fechaControlFormatoUno",
              "name": "Fecha Consulta",
              "title": "Fecha Consulta"
          }
          ],
          "columnDefs": [{
              // Encuentra el índice de tu columna "Flujo final" y reemplaza `X` con ese índice
              // Si no estás seguro del índice, puedes usar el nombre de la propiedad de los datos: { "targets": "flujoFinal" }
              "targets": 4, // Aquí se especifica la columna por su propiedad `data`
              "render": function (data, type, row) {
  
                  if (type === 'display') {
  
                      // Aquí puedes personalizar el HTML basado en el contenido de data
                      // Por ejemplo, si data es "En proceso", mostrar un span con una clase específica
                      if (data === 0) {
                          return '<div class="wrap-content"><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-info active" role="progressbar" style="width: 100%;background:#337ab7;"><span class="current-value">En Cola</span></div></div></div>';
                      } else if (data === 1) {
                          return '<div class="wrap-content"><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-info active" role="progressbar" style="width: 100%;background: rgba(199, 30, 0, 1);"><span class="current-value">Buscando Registros</span></div></div></div>';
                      } else if (data === 2) {
                          return '<div class="wrap-content"><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-info active" role="progressbar" style="width: 100%;background: rgba(199, 30, 0, 1);"><span class="current-value">Cargando Datos</span></div></div></div>';
                      } else if (data === 3) {
                          return '<div class="wrap-content"><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-info active" role="progressbar" style="width: 100%;background: rgb(72 119 29);"><span class="current-value">Consulta Finaliza</span></div></div></div>';
                      } else if (data === 4) {
                          return '<div class="wrap-content"><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-danger active" role="progressbar" style="width: 100%;"><span class="current-value">Consulta Cancelada</span></div></div></div>';
                      } else if (data === 5) {
                          return '<div class="wrap-content"><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-warning active" role="progressbar" style="width: 100%;"><span class="current-value">Sin Registros</span></div></div></div>';
                      } else {
                          // Si data no es "En proceso", simplemente envuelve el data existente en un div
                          return '<div class="wrap-content">' + (data ? data : '') + '</div>';
                      }
                  }
                  return data;
              }
          },
          {
              "targets": [0, 1, 2, 3, 4, 5, 6],
              "className": "text-center"
          }
          ]
  
      });
  
      // Función para recargar los datos cada 5 segundos
      function reloadData() {
          table2.ajax.reload(null, false);
      }
  
      // Ejecutar la recarga de datos cada 5 segundos
      setInterval(reloadData, 5000);
  
  	  // Se inicializa con un valor por si existe vacio
      let filename = "ReporteMDD_Diario_DD_MM_YYYY";
  
      table = $('#datatable-buttons').DataTable({
          responsive: true,
          "dom": 'l<"mt-1"Bir><"text-right mb-3"f><"clear">ti<"float-end mt-1"p>',
          "paging": true,
          "ordering": true,
          "info": true,
          "paginate": true,
          "processing": true,
          "lengthChange": true,
          "scrollX": true,
          "language": {
              "lengthMenu": "Mostrar _MENU_ registros",
              "zeroRecords": "No se encontraron resultados",
              "emptyTable": "Ningún dato disponible en esta tabla",
              "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
              "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
              "infoFiltered": "(filtrado de un total de _MAX_ registros)",
              "infoPostFix": "",
              "thousands": ",",
              "sSearch": "Filtrar:",
              "loadingRecords": "Cargando registros...",
              "processing": "Buscando Información...",
              "paginate": {
                  "first": "Primero",
                  "last": "Último",
                  "next": "Siguiente",
                  "previous": "Anterior"
              },
              "aria": {
                  "orderable": ": Activar para ordenar la columna de manera ascendente",
                  "orderableReverse": ": Activar para ordenar la columna de manera descendente"
              }
          },
          iDisplayLength: 50,
          buttons: [
  
              {
                  extend: 'colvis',
                  columnText: function (dt, idx, title) {
                      return (idx + 1) + ': ' + title;
                  },
                  className: "btn-sm",
                  text: "Columnas Visibles",
                  titleAttr: "Columnas Visibles"
              },
              {
                  extend: "excel",
                  text: "Exportar a Excel",
                  className: "btn-sm",
  
                  filename: function () {
                      return filename; // Usar el valor de la variable filename
                  },
                  title: "REPORTE DIARIO",
                  exportOptions: {
                      format: {
                          header: function (data, columnIdx) {
                              return data.toUpperCase();
                          },
                      },
                  },
                  customize: function (xlsx) {
                      let sheet = xlsx.xl["workbook.xml"].getElementsByTagName("sheet")[0];
  
                      sheet.setAttribute("name", "REPORTE MDD DIARIO");
                  },
                  extension: ".xlsx",
              },
              {
                  text: '<i class="fa fa-refresh" aria-hidden="true"></i> Recargar información ',
                  className: "btn-sm",
                  action: function (e, dt, node, config) {
                      dt.ajax.reload();
                  }
              }
          ],
          "ajax": {
              url: context + "/private/reportediariohistorico",
              "beforeSend": function () {
                  inicioTiempo = performance.now(); // Guardar el tiempo de inicio antes de la solicitud
              },
              "dataSrc": function (json) {
  
                  let fechaSolicitud = document.getElementById('fechaSolicitud').value;
  
                  let fechaFormateada = fechaSolicitud === '' ? formatearFechaNombreArchivoDate(new Date()) : formatearFechaNombreArchivo(fechaSolicitud);
  
                  filename = "ReporteMDD_Diario_" + fechaFormateada;
  
                  let finTiempo = performance.now(); // Tiempo al finalizar la carga
                  let tiempoTranscurrido = finTiempo - inicioTiempo; // Calcular el tiempo transcurrido
                  // Alternativamente, podrías mostrar esta información en tu página web
                  $('#tiempoCarga').text("La carga de datos ha tomado " + tiempoTranscurrido.toFixed(2) + " milisegundos.");
                  return json; // No olvides retornar los datos JSON para que DataTables pueda usarlos
              }
          },
  
          "autowidth": true,
  
          "columns": [{
              "data": "fechaSolicitudFormatoUno",
              "name": "Fecha y Hora de Solicitud",
              "title": "Fecha y Hora de Solicitud"
          }, {
              "data": "tipoCaso",
              "name": "Tipo de caso",
              "title": "Tipo de caso"
          }, {
              "data": "modificadoPor",
              "name": "Modificado por",
              "title": "Modificado por"
          }, {
              "data": "modificadoEl",
              "name": "Modificado El",
              "title": "Modificado El"
          }, {
              "data": "folio",
              "name": "Folio",
              "title": "Folio",
          }, {
              "data": "fechaArriboFormatoUno",
              "name": "Fecha y Hora de Arribo",
              "title": "Fecha y Hora de Arribo"
          }, {
              "data": "fechaDictaminacionFormatoUno",
              "name": "Fecha y Hora de Dictaminación",
              "title": "Fecha y Hora de Dictaminación"
          }, {
              "data": "fechaRespuestaProcesarFormatoUno",
              "name": "Fecha y Hora Respuesta PROCESAR",
              "title": "Fecha y Hora Respuesta PROCESAR"
          }, {
              "data": "estatusTramite",
              "name": "Estatus del Trámite",
              "title": "Estatus del Trámite",
          }, {
              "data": "tipoSolicitante",
              "name": "Tipo De Solicitante",
              "title": "Tipo De Solicitante",
          }, {
              "data": "curp",
              "name": "CURP del Trabajador",
              "title": "CURP del Trabajador",
          }, {
              "data": "curpHistorica",
              "name": "CURP Histórica del Trabajador",
              "title": "CURP Histórica del Trabajador",
          }, {
              "data": "curpNueva",
              "name": "CURP Nueva del Trabajador",
              "title": "CURP Nueva del Trabajador",
          }, {
              "data": "rfc",
              "name": "RFC del Trabajador",
              "title": "RFC del Trabajador",
          }, {
              "data": "nss",
              "name": "NSS del Trabajador",
              "title": "NSS del Trabajador",
          }, {
              "data": "apellidoPaterno",
              "name": "Apellido Paterno del Trabajador",
              "title": "Apellido Paterno del Trabajador"
          }, {
              "data": "apellidoMaterno",
              "name": "Apellido Materno del Trabajador",
              "title": "Apellido Materno del Trabajador"
          }, {
              "data": "nombre",
              "name": "Nombre(s) del Trabajador",
              "title": "Nombre(s) del Trabajador"
          }, {
              "data": "flujoFinal",
              "name": "Flujo final",
              "title": "Flujo final"
          }, {
              "data": "sello",
              "name": "Sello de voluntad",
              "title": "Sello de voluntad"
          }, {
              "data": "apellidoPaternoSolicitante",
              "name": "Apellido paterno del solicitante",
              "title": "Apellido paterno del solicitante"
          }, {
              "data": "apellidoMaternoSolicitante",
              "name": "Apellido materno del solicitante",
              "title": "Apellido materno del solicitante"
          }, {
              "data": "nombreSolicitante",
              "name": "Nombre(s) del solicitante",
              "title": "Nombre(s) del solicitante"
          }, {
              "data": "curpSolicitante",
              "name": "CURP del solicitante",
              "title": "CURP del solicitante"
          }, {
              "data": "curpEmpleado",
              "name": "CURP del empleado",
              "title": "CURP del empleado"
          }, {
              "data": "nominaEmpleado",
              "name": "Nómina del empleado",
              "title": "Nómina del empleado"
          }, {
              "data": "sirhCare",
              "name": "SIRH CARE",
              "title": "SIRH CARE"
          }, {
              "data": "dictaminadorAnalista",
              "name": "Dictaminador analísta",
              "title": "Dictaminador analísta"
          }, {
              "data": "dictaminadorSupervisor",
              "name": "Dictaminador supervisor",
              "title": "Dictaminador supervisor"
          }, {
              "data": "claveRechazo01Dictaminacion",
              "name": "Clave rechazo 1 dictaminación",
              "title": "Clave rechazo 1 dictaminación"
          }, {
              "data": "descripcionRechazo01",
              "name": "Descripción rechazo 1",
              "title": "Descripción rechazo 1"
          }, {
              "data": "claveRechazo02Dictaminacion",
              "name": "Clave rechazo 2 dictaminación",
              "title": "Clave rechazo 2 dictaminación"
          }, {
              "data": "descripcionRechazo02",
              "name": "Descripción rechazo 2",
              "title": "Descripción rechazo 2"
          }, {
              "data": "comentarioRechazo01",
              "name": "Comentario del rechazo 1",
              "title": "Comentario del rechazo 1"
          }, {
              "data": "comentarioRechazo02",
              "name": "Comentario del rechazo 2",
              "title": "Comentario del rechazo 2"
          }, {
              "data": "respuestaEnvioEeiCodigo",
              "name": "Respuesta envío EEI código",
              "title": "Respuesta envío EEI código"
          }, {
              "data": "respuestaEnvioEeiDescripcion",
              "name": "Respuesta envío EEI descripción",
              "title": "Respuesta envío EEI descripción"
          }, {
              "data": "respuestaEnvioEesCodigo",
              "name": "Respuesta envío EES código",
              "title": "Respuesta envío EES código"
          }, {
              "data": "respuestaEnvioEesDescripcion",
              "name": "Respuesta envío EES descripción",
              "title": "Respuesta envío EES descripción"
          }, {
              "data": "respuestaAcubio",
              "name": "Respuesta ACUBIO",
              "title": "Respuesta ACUBIO"
          }, {
              "data": "respuestaRenbio",
              "name": "Respuesta RENBIO",
              "title": "Respuesta RENBIO"
          }, {
              "data": "permanenciaRespuesta",
              "name": "Permanencia respuesta",
              "title": "Permanencia respuesta"
          }, {
              "data": "permanenciaDiagnostico",
              "name": "Permanencia diagnóstico",
              "title": "Permanencia diagnóstico"
          }, {
              "data": "respuesta13",
              "name": "13+ respuesta",
              "title": "13+ respuesta"
          }, {
              "data": "diagnostico13",
              "name": "13+ diagnóstico",
              "title": "13+ diagnóstico"
          }, {
              "data": "susceptibleUnificacion",
              "name": "Suceptible unificación",
              "title": "Suceptible unificación"
          }, {
              "data": "duplicidad",
              "name": "Existe Duplicidad",
              "title": "Existe Duplicidad",
              "defaultContent": ""
          }],
          'columnDefs': [{
              "targets": 0,
              "className": "text-center",
          }, {
              "targets": 1,
              "className": "text-center",
          }, {
              "targets": 2,
              "className": "text-center",
          }, {
              "targets": 3,
              "className": "text-center",
          }, {
              "targets": 4,
              "className": "text-center",
          }, {
              "targets": 5,
              "className": "text-center",
          }, {
              "targets": 6,
              "className": "text-center",
          }, {
              "targets": 7,
              "className": "text-center",
          }, {
              "targets": 8,
              "className": "text-center",
          }, {
              "targets": 9,
              "className": "text-center",
          }, {
              "targets": 10,
              "className": "text-center",
          }, {
              "targets": 11,
              "className": "text-center",
          }, {
              "targets": 12,
              "className": "text-center",
          }, {
              "targets": 13,
              "className": "text-center",
          }, {
              "targets": 14,
              "className": "text-center",
          }, {
              "targets": 15,
              "className": "text-center",
          }, {
              "targets": 16,
              "className": "text-center",
          }, {
              "targets": 17,
              "className": "text-center",
          }, {
              "targets": 18,
              "className": "text-center",
          }, {
              "targets": 19,
              "className": "text-center",
          }, {
              "targets": 20,
              "className": "text-center",
          }, {
              "targets": 21,
              "className": "text-center",
          }, {
              "targets": 22,
              "className": "text-center",
          }, {
              "targets": 23,
              "className": "text-center",
          }, {
              "targets": 24,
              "className": "text-center",
          }, {
              "targets": 25,
              "className": "text-center",
          }, {
              "targets": 26,
              "className": "text-center",
          }, {
              "targets": 27,
              "className": "text-center",
          }, {
              "targets": 28,
              "className": "text-center",
          }, {
              "targets": 29,
              "className": "text-center",
          }, {
              "targets": 30,
              "className": "text-center",
          }, {
        	  "targets": 46,
              "className": "text-center",
        	  "render": function (data, type, row) {
                  if (data != null) {
                	  if(data == 'CON DUPLICIDAD') {
                		  return '<a href="javascript:void(0)" onclick="respuestaDuplicidad(\'' + row.folio + '\');return false;">' + data + '</a>';
                	  } else if(data == 'SIN DUPLICIDAD') {
                		  return '<div class="wrap-content">' + data + '</div>';
                	  }
                  }
                  return data;
        	  }
          }, {
        	  "targets": "_all", // Aplica la función de renderizado a todas las columnas
              "render": function (data, type, row) {
                  if (type === 'display' && data != null) {
                      return '<div class="wrap-content">' + data + '</div>';
                  }
                  return data;
              }
          }]
  
      });
  
      // BEGIN: Datatables Duplicidad
      
      // Se inicializa con un valor por si existe vacio
      let filenameduplicidad = "ReporteMDD_Diario_Duplicados_DD_MM_YYYY";
      
       tableDuplicidad = $('#datatable-buttons-duplicidad').DataTable({
          responsive: true,
          "dom": 'l<"mt-1"Bir><"text-right mb-3"f><"clear">ti<"float-end mt-1"p>',
          "paging": true,
          "ordering": true,
          "info": true,
          "paginate": true,
          "processing": true,
          "lengthChange": true,
          "scrollX": true,
          "language": {
              "lengthMenu": "Mostrar _MENU_ registros",
              "zeroRecords": "No se encontraron resultados",
              "emptyTable": "Ningún dato disponible en esta tabla",
              "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
              "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
              "infoFiltered": "(filtrado de un total de _MAX_ registros)",
              "infoPostFix": "",
              "thousands": ",",
              "sSearch": "Filtrar:",
              "loadingRecords": "Cargando registros...",
              "processing": "Buscando Información...",
              "paginate": {
                  "first": "Primero",
                  "last": "Último",
                  "next": "Siguiente",
                  "previous": "Anterior"
              },
              "aria": {
                  "orderable": ": Activar para ordenar la columna de manera ascendente",
                  "orderableReverse": ": Activar para ordenar la columna de manera descendente"
              }
          },
          iDisplayLength: 50,
          buttons: [
  
              {
                  extend: 'colvis',
                  columnText: function (dt, idx, title) {
                      return (idx + 1) + ': ' + title;
                  },
                  className: "btn-sm",
                  text: "Columnas Visibles",
                  titleAttr: "Columnas Visibles"
              },
              {
                  extend: "excel",
                  text: "Exportar a Excel",
                  className: "btn-sm",
  
                  filename: function () {
                      return filenameduplicidad; // Usar el valor de la variable filename
                  },
                  title: "REPORTE DIARIO",
                  exportOptions: {
                      format: {
                          header: function (data, columnIdx) {
                              return data.toUpperCase();
                          },
                      },
                  },
                  customize: function (xlsx) {
                      let sheet = xlsx.xl["workbook.xml"].getElementsByTagName("sheet")[0];
  
                      sheet.setAttribute("name", "REPORTE MDD DIARIO");
                  },
                  extension: ".xlsx",
              },
              {
                  text: '<i class="fa fa-refresh" aria-hidden="true"></i> Recargar información ',
                  className: "btn-sm",
                  action: function (e, dt, node, config) {
                      dt.ajax.reload();
                  }
              }
          ],
          "ajax": {
              url: context + "/private/reportediariohistoricoDuplicidad",
              "beforeSend": function () {
                  inicioTiempo = performance.now(); // Guardar el tiempo de inicio antes de la solicitud
              },
              "dataSrc": function (json) {
  
                  let fechaSolicitud = document.getElementById('fechaSolicitud').value;
  
                  let fechaFormateada = fechaSolicitud === '' ? formatearFechaNombreArchivoDate(new Date()) : formatearFechaNombreArchivo(fechaSolicitud);
  
                  filenameduplicidad = "ReporteMDD_Diario_Duplicados_" + fechaFormateada;
  
                  let finTiempo = performance.now(); // Tiempo al finalizar la carga
                  let tiempoTranscurrido = finTiempo - inicioTiempo; // Calcular el tiempo transcurrido
                  // Alternativamente, podrías mostrar esta información en tu página web
                  $('#tiempoCarga').text("La carga de datos ha tomado " + tiempoTranscurrido.toFixed(2) + " milisegundos.");
                  return json; // No olvides retornar los datos JSON para que DataTables pueda usarlos
              }
          },
  
          "autowidth": true,
  
          "columns": [{
              "data": "folio",
              "name": "Folio",
              "title": "Folio",
          }, {
              "data": "curpCoincidencia",
              "name": "CURP de Coincidencia",
              "title": "CURP de Coincidencia"
          }, {
              "data": "claveAforeEnrolo",
              "name": "Clave Afore Enroló",
              "title": "Clave de Afore que Enroló la Coincidencia"
          }, {
              "data": "excepcion1",
              "name": "Excepción Huella 1",
              "title": "Excepción 1"
          }, {
              "data": "excepcion2",
              "name": "Excepción Huella 2",
              "title": "Excepción 2"
          }, {
              "data": "excepcion3",
              "name": "Excepción Huella 3",
              "title": "Excepción Huella 3"
          }, {
              "data": "excepcion4",
              "name": "Excepción Huella 4",
              "title": "Excepción Huella 4"
          }, {
              "data": "excepcion5",
              "name": "Excepción Huella 5",
              "title": "Excepción Huella 5"
          }, {
              "data": "excepcion6",
              "name": "Excepción Huella 6",
              "title": "Excepción Huella 6"
          }, {
              "data": "excepcion7",
              "name": "Excepción Huella 7",
              "title": "Excepción Huella 7"
          }, {
              "data": "excepcion8",
              "name": "Excepción Huella 8",
              "title": "Excepción Huella 8"
          }, {
              "data": "excepcion9",
              "name": "Excepción Huella 9",
              "title": "Excepción Huella 9"
          }, {
              "data": "excepcion10",
              "name": "Excepción Huella 10",
              "title": "Excepción Huella 10"
          }],
          'columnDefs': [{
              "targets": 0,
              "className": "text-center",
          }, {
              "targets": 1,
              "className": "text-center",
          }, {
              "targets": 2,
              "className": "text-center",
          }, {
              "targets": 3,
              "className": "text-center",
          }, {
              "targets": 4,
              "className": "text-center",
          }, {
              "targets": 5,
              "className": "text-center",
          }, {
              "targets": 6,
              "className": "text-center",
          }, {
              "targets": 7,
              "className": "text-center",
          }, {
              "targets": 8,
              "className": "text-center",
          }, {
              "targets": 9,
              "className": "text-center",
          }, {
              "targets": 10,
              "className": "text-center",
          }, {
              "targets": 11,
              "className": "text-center",
          }, {
              "targets": 12,
              "className": "text-center",
          }, {
              "targets": "_all", // Aplica la función de renderizado a todas las columnas
              "render": function (data, type, row) {
                  if (type === 'display' && data != null) {
                      return '<div class="wrap-content">' + data + '</div>';
                  }
                  return data;
              }
          }]
      });
      // END: Datatables Duplicidad
  });
  //END: Datatables