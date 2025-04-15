package mx.com.procesar.resta.balancer.persistencia.repositorios;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.LockModeType;
import mx.com.procesar.resta.balancer.persistencia.entidades.BitacoraReporteMDD;

/**
 * The Interface BitacoraReporteMDDRepository.
 */
public interface BitacoraReporteMDDRepository extends JpaRepository<BitacoraReporteMDD, Long> {

	/**
	 * Find by estatus order by fecha control asc.
	 *
	 * @param estado the estado
	 * @return the list
	 */
	@Query("SELECT m FROM BitacoraReporteMDD m WHERE m.estatus = :estado ORDER BY m.fechaControl ASC")
	List<BitacoraReporteMDD> findByEstatusOrderByFechaControlAsc(@Param("estado") Integer estado);

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the optional
	 */
	@Override
	Optional<BitacoraReporteMDD> findById(Long id);

	/**
	 * Find next pending request for processing.
	 *
	 * @param estado the estado
	 * @return the list
	 */
	@Query("SELECT m FROM BitacoraReporteMDD m WHERE m.estatus = :estado ORDER BY m.fechaControl ASC")
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	List<BitacoraReporteMDD> findNextPendingRequestForProcessing(@Param("estado") Integer estado);

	/**
	 * Find pending reports no lock.
	 *
	 * @param estado the estado
	 * @return the list
	 */
	@Query("SELECT m FROM BitacoraReporteMDD m WHERE m.estatus = :estado ORDER BY m.fechaControl ASC")
	@Lock(LockModeType.NONE)
	List<BitacoraReporteMDD> findPendingReportsNoLock(@Param("estado") Integer estado);

	/**
	 * Liberar reportes expirados.
	 *
	 * @param ahora           the ahora
	 * @param estadoPendiente the estado pendiente
	 * @param sistema         the sistema
	 * @return the int
	 */
	@Transactional
	@Modifying
	@Query("UPDATE BitacoraReporteMDD m SET m.estatus = :estadoPendiente, " + "m.nodoEjecutor = NULL, "
			+ "m.fechaBloqueo = NULL, " + "m.fechaExpiracionBloqueo = NULL, " + "m.fechaControl = :ahora, "
			+ "m.usuarioModificador = :sistema "
			+ "WHERE m.fechaExpiracionBloqueo < :ahora AND m.estatus = :estadoPendiente")
	int liberarReportesExpirados(@Param("ahora") Date ahora, @Param("estadoPendiente") Integer estadoPendiente,
			@Param("sistema") String sistema);

	/**
	 * Marcar reporte en proceso.
	 *
	 * @param reporteId    the reporte id
	 * @param nuevoEstado  the nuevo estado
	 * @param nodoId       the nodo id
	 * @param ahora        the ahora
	 * @param expiracion   the expiracion
	 * @param usuario      the usuario
	 * @param estadoActual the estado actual
	 * @return the int
	 */
	@Transactional
	@Modifying
	@Query("UPDATE BitacoraReporteMDD m SET m.estatus = :nuevoEstado, " + "m.nodoEjecutor = :nodoId, "
			+ "m.fechaBloqueo = :ahora, " + "m.fechaExpiracionBloqueo = :expiracion, " + "m.fechaControl = :ahora, "
			+ "m.usuarioModificador = :usuario "
			+ "WHERE m.idBitacoraReporteMdd = :reporteId AND m.estatus = :estadoActual")
	int marcarReporteEnProceso(@Param("reporteId") Long reporteId, @Param("nuevoEstado") Integer nuevoEstado,
			@Param("nodoId") String nodoId, @Param("ahora") Date ahora, @Param("expiracion") Date expiracion,
			@Param("usuario") String usuario, @Param("estadoActual") Integer estadoActual);

}
