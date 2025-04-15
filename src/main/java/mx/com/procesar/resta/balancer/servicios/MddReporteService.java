package mx.com.procesar.resta.balancer.servicios;

import java.net.InetAddress;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import mx.com.procesar.resta.balancer.persistencia.entidades.BitacoraReporteMDD;
import mx.com.procesar.resta.balancer.persistencia.repositorios.BitacoraReporteMDDRepository;

/**
 * The Class MddReporteService.
 */
@Service
public class MddReporteService {

	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(MddReporteService.class);

	/** The Constant MAX_INTENTOS. */
	private static final int MAX_INTENTOS = 3;

	/** The Constant LOCK_DURATION_MINUTES. */
	private static final int LOCK_DURATION_MINUTES = 15; // Tiempo de bloqueo en minutos

	/** The Constant SISTEMA_USUARIO. */
	private static final String SISTEMA_USUARIO = "SISTEMA";

	/** The nodo id. */
	private String nodoId;

	/** The contador intentos por reporte. */
	private int contadorIntentosPorReporte = 0;

	/** The reporte repository. */
	@Autowired
	private BitacoraReporteMDDRepository reporteRepository;

	/** The reporte consulta service. */
	@Autowired
	private ReporteConsultaService reporteConsultaService;

	/**
	 * Método para consultar el estado de un reporte.
	 *
	 * @param idReporte the id reporte
	 * @return the bitacora reporte MDD
	 */
	public BitacoraReporteMDD consultarEstadoReporte(Long idReporte) {
		return reporteRepository.findById(idReporte).orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
	}

	/**
	 * Método para encolar una nueva petición de reporte.
	 *
	 * @param fechaConsulta      the fecha consulta
	 * @param tipoReporte        the tipo reporte
	 * @param tipoConsulta       the tipo consulta
	 * @param parametrosConsulta the parametros consulta
	 * @param usuario            the usuario
	 * @return the bitacora reporte MDD
	 */
	public BitacoraReporteMDD encolarReporte(Date fechaConsulta, String tipoReporte, String tipoConsulta,
			String parametrosConsulta, String usuario) {
		BitacoraReporteMDD reporte = new BitacoraReporteMDD();
		reporte.setFechaInicioProceso(null);
		reporte.setFechaFinProceso(null);
		reporte.setTipoReporte(tipoReporte);
		reporte.setTipoConsulta(tipoConsulta);
		reporte.setParametrosConsulta(parametrosConsulta);
		reporte.setEstatus(BitacoraReporteMDD.ESTADO_PENDIENTE);
		reporte.setUsuarioModificador(usuario);
		reporte.setFechaControl(fechaConsulta);

		return reporteRepository.save(reporte);
	}

	/**
	 * Find all.
	 *
	 * @return the list
	 */
	public List<BitacoraReporteMDD> findAll() {
		return reporteRepository.findAll();
	}

	/**
	 * Inits the.
	 */
	@PostConstruct
	public void init() {
		try {
			this.nodoId = InetAddress.getLocalHost().getHostName() + "-" + UUID.randomUUID().toString().substring(0, 8);
			log.info("Nodo inicializado con ID: {}", this.nodoId);
		} catch (Exception e) {
			this.nodoId = "NODO-" + UUID.randomUUID().toString();
			log.warn("No se pudo obtener hostname, usando ID alternativo: {}", this.nodoId);
		}
	}

	/**
	 * Liberar reportes cuyo bloqueo ha expirado Se ejecuta cada minuto.
	 */
	@Scheduled(fixedDelay = 60000)
	@Transactional
	public void liberarReportesExpirados() {
		Date ahora = new Date();
		int liberados = reporteRepository.liberarReportesExpirados(ahora, BitacoraReporteMDD.ESTADO_PENDIENTE,
				SISTEMA_USUARIO);

		if (liberados > 0) {
			log.info("Se liberaron {} reportes con bloqueo expirado", liberados);
		}
	}

	/**
	 * Servicio para consultar reportes pendientes.
	 *
	 * @return the list
	 */
	public List<BitacoraReporteMDD> obtenerReportesPendientes() {
		return reporteRepository.findByEstatusOrderByFechaControlAsc(BitacoraReporteMDD.ESTADO_PENDIENTE);
	}

	/**
	 * Intenta adquirir y procesar el siguiente reporte pendiente Se ejecuta cada 10
	 * segundos.
	 */
	@Scheduled(fixedDelay = 10000)
	public void procesarSiguienteReporte() {
		List<BitacoraReporteMDD> reportesPendientes = reporteConsultaService.obtenerReportesPendientes();

		if (reportesPendientes.isEmpty()) {
			log.debug("No hay reportes pendientes para procesar");
			return;
		}

		BitacoraReporteMDD reporte = reportesPendientes.get(0);

		Date ahora = new Date();
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(ahora);
		calendar.add(Calendar.MINUTE, LOCK_DURATION_MINUTES);
		Date expiracion = calendar.getTime();

		int actualizados = reporteRepository.marcarReporteEnProceso(reporte.getIdBitacoraReporteMdd(),
				BitacoraReporteMDD.ESTADO_SIN_REGISTROS, nodoId, ahora, expiracion, nodoId,
				BitacoraReporteMDD.ESTADO_PENDIENTE);

		if (actualizados == 0) {
			log.debug("No se pudo adquirir el reporte ID: {}, otro nodo podría haberlo tomado",
					reporte.getIdBitacoraReporteMdd());
			return;
		}

		log.info("Nodo {} adquirió el reporte ID: {}", nodoId, reporte.getIdBitacoraReporteMdd());

		try {
			procesarReporte(reporte);
		} catch (Exception e) {
			log.error("Error al procesar reporte ID: {}", reporte.getIdBitacoraReporteMdd(), e);
			manejarErrorReporte(reporte, e);
		}
	}

	/**
	 * Actualizar estado reporte.
	 *
	 * @param reporte     the reporte
	 * @param nuevoEstado the nuevo estado
	 * @param esFinal     the es final
	 */
	private void actualizarEstadoReporte(BitacoraReporteMDD reporte, Integer nuevoEstado, boolean esFinal) {
		reporte = reporteRepository.findById(reporte.getIdBitacoraReporteMdd())
				.orElseThrow(() -> new RuntimeException("Reporte no encontrado"));

		reporte.setEstatus(nuevoEstado);
		if (esFinal) {
			reporte.setFechaFinProceso(new Date());
		}
		reporteRepository.save(reporte);
		log.info("Reporte ID: {} actualizado a estado: {}", reporte.getIdBitacoraReporteMdd(), nuevoEstado);
	}

	/**
	 * Maneja errores al procesar un reporte.
	 *
	 * @param reporte the reporte
	 * @param e       the e
	 */
	private void manejarErrorReporte(BitacoraReporteMDD reporte, Exception e) {
		try {
			reporte = reporteRepository.findById(reporte.getIdBitacoraReporteMdd())
					.orElseThrow(() -> new RuntimeException("Reporte no encontrado"));

			contadorIntentosPorReporte++;

			if (contadorIntentosPorReporte >= MAX_INTENTOS) {
				reporte.setEstatus(BitacoraReporteMDD.ESTADO_ERROR);
				reporte.setFechaFinProceso(new Date());
				log.error("Reporte ID: {} marcado como error después de {} intentos", reporte.getIdBitacoraReporteMdd(),
						MAX_INTENTOS);
			} else {
				reporte.setEstatus(BitacoraReporteMDD.ESTADO_PENDIENTE);
				reporte.setNodoEjecutor(null);
				reporte.setFechaBloqueo(null);
				reporte.setFechaExpiracionBloqueo(null);
				log.info("Reporte ID: {} volverá a intentarse. Intento actual: {}", reporte.getIdBitacoraReporteMdd(),
						contadorIntentosPorReporte);
			}

			reporteRepository.save(reporte);
		} catch (DataAccessException dae) {
			log.error("Error al actualizar estado del reporte ID: {}", reporte.getIdBitacoraReporteMdd(), dae);
		}
	}

	/**
	 * Marcar sin registros.
	 *
	 * @param reporte the reporte
	 */
	private void marcarSinRegistros(BitacoraReporteMDD reporte) {
		reporte = reporteRepository.findById(reporte.getIdBitacoraReporteMdd())
				.orElseThrow(() -> new RuntimeException("Reporte no encontrado"));

		reporte.setEstatus(BitacoraReporteMDD.ESTADO_SIN_REGISTROS);
		reporte.setFechaFinProceso(new Date());
		reporteRepository.save(reporte);
		log.info("Reporte ID: {} marcado sin registros", reporte.getIdBitacoraReporteMdd());
	}

	/**
	 * Procesa un reporte ya adquirido.
	 *
	 * @param reporte the reporte
	 */
	private void procesarReporte(BitacoraReporteMDD reporte) {
		try {
			// Actualizar estado a CONSULTANDO (Buscando Registros)
			actualizarEstadoReporte(reporte, BitacoraReporteMDD.ESTADO_CONSULTANDO, false);

			// Simular búsqueda de registros (5 segundos)
			log.info("Buscando registros para reporte ID: {}", reporte.getIdBitacoraReporteMdd());
			TimeUnit.SECONDS.sleep(4);

			// Simular si hay registros o no (aleatoriamente)
			boolean hayRegistros = Math.random() < 0.7; // 70% de probabilidad de encontrar registros

			if (!hayRegistros) {
				marcarSinRegistros(reporte);
				log.info("No se encontraron registros para el reporte ID: {}", reporte.getIdBitacoraReporteMdd());
				return;
			}

			// Actualizar estado a CARGANDO e insertar datos
			actualizarEstadoReporte(reporte, BitacoraReporteMDD.ESTADO_CARGANDO, false);

			// Simular inserción de datos (3 segundos)
			log.info("Insertando datos para reporte ID: {}", reporte.getIdBitacoraReporteMdd());
			TimeUnit.SECONDS.sleep(8);

			// Finalizar el reporte
			actualizarEstadoReporte(reporte, BitacoraReporteMDD.ESTADO_TERMINADO, true);
			log.info("Reporte ID: {} procesado exitosamente", reporte.getIdBitacoraReporteMdd());

		} catch (Exception e) {
			log.error("Error al procesar reporte ID: {}", reporte.getIdBitacoraReporteMdd(), e);
			manejarErrorReporte(reporte, e);
		}
	}
}
