package mx.com.procesar.resta.balancer.exposicion.controladores;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import mx.com.procesar.resta.balancer.persistencia.entidades.BitacoraReporteMDD;
import mx.com.procesar.resta.balancer.servicios.MddReporteService;

/**
 * The Class ReporteViewController.
 */
@Controller
public class ReporteViewController {

	/** The reporte service. */
	@Autowired
	private MddReporteService reporteService;

	/** The date format. */
	private SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

	/**
	 * Inicio.
	 *
	 * @return the model and view
	 */
	@GetMapping("/")
	public ModelAndView inicio() {
		return new ModelAndView("index");
	}

	/**
	 * Obtener bitacora.
	 *
	 * @return the response entity
	 */
	@GetMapping("/private/bitacoraReporteModificacionDatos")
	@ResponseBody
	public ResponseEntity<?> obtenerBitacora() {
		List<BitacoraReporteMDD> reportes = reporteService.findAll();

		// Transformar los datos para el DataTable
		List<Map<String, Object>> data = reportes.stream().map(reporte -> {
			Map<String, Object> item = new HashMap<>();
			item.put("idBitacoraReporteMdd", reporte.getIdBitacoraReporteMdd());
			item.put("tipoReporte", reporte.getTipoReporte());
			item.put("fechaInicioProcesoFormatoUno",
					reporte.getFechaInicioProceso() != null ? dateFormat.format(reporte.getFechaInicioProceso()) : "");
			item.put("fechaFinProcesoFormatoUno",
					reporte.getFechaFinProceso() != null ? dateFormat.format(reporte.getFechaFinProceso()) : "");
			item.put("estatus", reporte.getEstatus());
			item.put("tipoConsulta", reporte.getTipoConsulta());
			item.put("fechaControlFormatoUno",
					reporte.getFechaControl() != null ? dateFormat.format(reporte.getFechaControl()) : "");
			return item;
		}).toList();

		return ResponseEntity.ok(data);
	}
}
