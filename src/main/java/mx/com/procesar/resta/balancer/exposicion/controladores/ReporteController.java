package mx.com.procesar.resta.balancer.exposicion.controladores;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mx.com.procesar.resta.balancer.persistencia.entidades.BitacoraReporteMDD;
import mx.com.procesar.resta.balancer.servicios.MddReporteService;

/**
 * The Class ReporteController.
 */
@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

	/** The Constant dateFormat. */
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

	/** The reporte service. */
	@Autowired
	private MddReporteService reporteService;

	/**
	 * Endpoint para consultar el estado de un reporte.
	 *
	 * @param idReporte the id reporte
	 * @return the response entity
	 */
	@GetMapping("/{idReporte}")
	public ResponseEntity<?> consultarEstadoReporte(@PathVariable Long idReporte) {
		try {
			BitacoraReporteMDD reporte = reporteService.consultarEstadoReporte(idReporte);

			Map<String, Object> response = new HashMap<>();
			response.put("id", reporte.getIdBitacoraReporteMdd());
			response.put("estado", getDescripcionEstado(reporte.getEstatus()));
			response.put("tipoReporte", reporte.getTipoReporte());
			response.put("fechaCreacion", reporte.getFechaControl());

			if (reporte.getFechaInicioProceso() != null) {
				response.put("fechaInicioProceso", reporte.getFechaInicioProceso());
			}

			if (reporte.getFechaFinProceso() != null) {
				response.put("fechaFinProceso", reporte.getFechaFinProceso());
			}

			// Agregar mensaje según el estado
			String mensaje = "";
			switch (reporte.getEstatus()) {
			case BitacoraReporteMDD.ESTADO_PENDIENTE:
				mensaje = "Tu reporte está en cola, esperando ser procesado.";
				break;
			case BitacoraReporteMDD.ESTADO_SIN_REGISTROS:
			case BitacoraReporteMDD.ESTADO_CONSULTANDO:
				mensaje = "Tu reporte está siendo procesado actualmente.";
				break;
			case BitacoraReporteMDD.ESTADO_CARGANDO:
				mensaje = "Se están cargando los datos del reporte.";
				break;
			case BitacoraReporteMDD.ESTADO_TERMINADO:
				mensaje = "Tu reporte ha sido procesado exitosamente.";
				break;
			case BitacoraReporteMDD.ESTADO_ERROR:
				mensaje = "Ocurrió un error al procesar tu reporte.";
				break;
			}
			response.put("mensaje", mensaje);

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("error", "Error al consultar reporte: " + e.getMessage()));
		}
	}

	/**
	 * Endpoint para solicitar un nuevo reporte.
	 *
	 * @param request the request
	 * @return the response entity
	 */
	@PostMapping
	public ResponseEntity<Map<String, Object>> solicitarReporte(@RequestBody Map<String, Object> request) {
		try {
			// Parsear la fecha sin hora
			Date fechaConsulta;
			if (request.containsKey("fechaConsulta")) {
				fechaConsulta = dateFormat.parse((String) request.get("fechaConsulta"));
				// Establecer la hora a las 00:00:00
				Calendar cal = Calendar.getInstance();
				cal.setTime(fechaConsulta);
				cal.set(Calendar.HOUR_OF_DAY, 0);
				cal.set(Calendar.MINUTE, 0);
				cal.set(Calendar.SECOND, 0);
				cal.set(Calendar.MILLISECOND, 0);
				fechaConsulta = cal.getTime();
			} else {
				// Si no se proporciona fecha, usar la fecha actual sin hora
				Calendar cal = Calendar.getInstance();
				cal.set(Calendar.HOUR_OF_DAY, 0);
				cal.set(Calendar.MINUTE, 0);
				cal.set(Calendar.SECOND, 0);
				cal.set(Calendar.MILLISECOND, 0);
				fechaConsulta = cal.getTime();
			}

			String tipoReporte = (String) request.getOrDefault("tipoReporte", "");
			String tipoConsulta = (String) request.getOrDefault("tipoConsulta", "");
			String parametros = request.containsKey("parametros") ? request.get("parametros").toString() : "{}";
			String usuario = (String) request.getOrDefault("usuario", "SISTEMA");

			// Encolar la petición de reporte
			BitacoraReporteMDD reporte = reporteService.encolarReporte(fechaConsulta, tipoReporte, tipoConsulta,
					parametros, usuario);

			return ResponseEntity.ok(Map.of("id", reporte.getIdBitacoraReporteMdd(), "estado",
					getDescripcionEstado(reporte.getEstatus()), "mensaje",
					"Tu petición de reporte ha sido encolada y será procesada pronto."));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("error", "Error al encolar reporte: " + e.getMessage()));
		}
	}

	/**
	 * Obtener descripción legible del estado.
	 *
	 * @param estado the estado
	 * @return the descripcion estado
	 */
	private String getDescripcionEstado(Integer estado) {
		switch (estado) {
		case BitacoraReporteMDD.ESTADO_PENDIENTE:
			return "Pendiente";
		case BitacoraReporteMDD.ESTADO_CONSULTANDO:
			return "Consultando";
		case BitacoraReporteMDD.ESTADO_CARGANDO:
			return "Cargando Datos";
		case BitacoraReporteMDD.ESTADO_TERMINADO:
			return "Terminado";
		case BitacoraReporteMDD.ESTADO_ERROR:
			return "Error";
		case BitacoraReporteMDD.ESTADO_SIN_REGISTROS:
			return "En Proceso";
		default:
			return "Desconocido";
		}
	}
}
