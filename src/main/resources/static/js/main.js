// Constantes
const TIPO_REPORTE_DEFAULT = "REPORTE_DIARIO";
const TIPO_CONSULTA_DEFAULT = "CONSULTA_ESTANDAR";

let table2;
let inicioTiempo;

$(document).ready(function () {
    // Configuración de DataTables
    table2 = $('#datatable-buttons-bitacora').DataTable({
        responsive: true,
        dom: '<"row"<"col-sm-6"l><"col-sm-6"f>>' +
             '<"row"<"col-sm-12"tr>>' +
             '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        paging: true,
        ordering: true,
        info: true,
        paginate: true,
        processing: true,
        lengthChange: true,
        scrollX: false,
        language: {
            lengthMenu: "Mostrar _MENU_ registros",
            zeroRecords: "No se encontraron resultados",
            emptyTable: "Ningún dato disponible en esta tabla",
            info: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
            infoFiltered: "(filtrado de un total de _MAX_ registros)",
            infoPostFix: "",
            thousands: ",",
            search: "Filtrar:",
            loadingRecords: "Cargando registros...",
            processing: "Buscando Información...",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            },
            aria: {
                orderable: ": Activar para ordenar la columna de manera ascendente",
                orderableReverse: ": Activar para ordenar la columna de manera descendente"
            }
        },
        order: [
            [0, 'desc']
        ],
        lengthMenu: [
            [5, 50, 100, 200, 300],
            [5, 50, 100, 200, 300]
        ],
        pageLength: 5,
        buttons: [
            {
                extend: 'colvis',
                text: '<i class="fa fa-eye"></i> Columnas',
                className: 'btn btn-default btn-sm',
                titleAttr: "Columnas Visibles"
            },
            {
                text: '<i class="fa fa-refresh"></i> Recargar',
                className: 'btn btn-default btn-sm',
                action: function (e, dt, node, config) {
                    dt.ajax.reload();
                }
            }
        ],
        ajax: {
            url: baseUrl + "/private/bitacoraReporteModificacionDatos",
            timeout: "600000",
            beforeSend: function () {
                inicioTiempo = performance.now();
            },
            dataSrc: function (json) {
                let finTiempo = performance.now();
                let tiempoTranscurrido = finTiempo - inicioTiempo;
                $('#tiempoCargaBitacora').text("La carga de datos ha tomado " + tiempoTranscurrido.toFixed(2) + " milisegundos.");
                return json;
            }
        },
        autoWidth: true,
        columns: [{
            data: "idBitacoraReporteMdd",
            name: "ID",
            title: "ID"
        },
        {
            data: "tipoReporte",
            name: "Tipo Reporte",
            title: "Tipo Reporte"
        },
        {
            data: "fechaInicioProcesoFormatoUno",
            name: "Fecha Inicio Proceso",
            title: "Fecha Inicio Proceso"
        },
        {
            data: "fechaFinProcesoFormatoUno",
            name: "Fecha Fin Proceso",
            title: "Fecha Fin Proceso"
        },
        {
            data: "estatus",
            name: "Estatus",
            title: "Estatus"
        },
        {
            data: "tipoConsulta",
            name: "Tipo Consulta",
            title: "Tipo Consulta"
        },
        {
            data: "fechaControlFormatoUno",
            name: "Fecha Consulta",
            title: "Fecha Consulta"
        }
        ],
        columnDefs: [{
            targets: 4,
            render: function (data, type, row) {
                if (type === 'display') {
                    const statusClasses = {
                        0: { bg: '#337ab7', text: 'En Cola' },
                        1: { bg: 'rgba(199, 30, 0, 1)', text: 'Buscando Registros' },
                        2: { bg: 'rgba(199, 30, 0, 1)', text: 'Cargando Datos' },
                        3: { bg: 'rgb(72 119 29)', text: 'Consulta Finaliza' },
                        4: { bg: '#d9534f', text: 'Consulta Cancelada' },
                        5: { bg: '#f0ad4e', text: 'Sin Registros' }
                    };

                    const status = statusClasses[data];
                    if (status) {
                        return `<div class="wrap-content">
                                    <div class="progress">
                                        <div class="progress-bar progress-bar-striped active" 
                                             role="progressbar" 
                                             style="width: 100%; background-color: ${status.bg}">
                                            <span class="current-value">${status.text}</span>
                                        </div>
                                    </div>
                                </div>`;
                    }
                    return '<div class="wrap-content">' + (data || '') + '</div>';
                }
                return data;
            }
        },
        {
            targets: [0, 1, 2, 3, 4, 5, 6],
            className: "text-center"
        }]
    });

    // Función para recargar los datos cada 5 segundos
    function reloadData() {
        table2.ajax.reload(null, false);
    }

    // Ejecutar la recarga de datos cada 5 segundos
    setInterval(reloadData, 1500);

    // Establecer la fecha actual como valor por defecto
    const today = new Date().toISOString().split('T')[0];
    $('#fechaConsulta').val(today);

    // Manejo del formulario de solicitud de reporte
    $('#reportForm').on('submit', function(e) {
        e.preventDefault();
        
        // Obtener la fecha sin hora
        const fechaConsulta = $('#fechaConsulta').val();
        
        // Ocultar alertas previas
        $('.alert').hide();

        // Deshabilitar el botón mientras se procesa
        const $submitBtn = $(this).find('button[type="submit"]');
        const originalText = $submitBtn.html();
        $submitBtn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Procesando...');
        
        // Realizar la petición AJAX
        $.ajax({
            url: baseUrl + '/api/reportes',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                fechaConsulta: fechaConsulta,
                tipoReporte: TIPO_REPORTE_DEFAULT,
                tipoConsulta: TIPO_CONSULTA_DEFAULT
            }),
            success: function(response) {
                $('#successMessage').text(response.mensaje);
                $('#successAlert').fadeIn();
                table2.ajax.reload();
            },
            error: function(xhr) {
                const errorMsg = xhr.responseJSON ? xhr.responseJSON.error : 'Error al solicitar el reporte';
                $('#errorMessage').text(errorMsg);
                $('#errorAlert').fadeIn();
            },
            complete: function() {
                // Restaurar el botón
                $submitBtn.prop('disabled', false).html(originalText);
            }
        });
    });
});
