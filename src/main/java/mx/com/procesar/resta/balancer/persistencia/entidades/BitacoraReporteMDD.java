package mx.com.procesar.resta.balancer.persistencia.entidades;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;

@Entity
@Table(name = "PSER_TB_MDD_REPORTE")
public class BitacoraReporteMDD {

	// Constantes para los estados
	public static final int ESTADO_PENDIENTE = 0;
	public static final int ESTADO_CONSULTANDO = 1;
	public static final int ESTADO_CARGANDO = 2;
	public static final int ESTADO_TERMINADO = 3;
	public static final int ESTADO_ERROR = 4;
	public static final int ESTADO_SIN_REGISTROS = 5;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "PSER_SEQ_MDD_REPORTE")
	@SequenceGenerator(name = "PSER_SEQ_MDD_REPORTE", sequenceName = "PSER_SEQ_MDD_REPORTE", allocationSize = 1)
	@Column(name = "ID_BITACORA_REPORTE_MDD")
	private Long idBitacoraReporteMdd;

	@Column(name = "CH_TIPO_REPORTE", length = 25)
	private String tipoReporte;

	@Column(name = "FC_INICIO_PROCESO")
	@Temporal(TemporalType.TIMESTAMP)
	private Date fechaInicioProceso;

	@Column(name = "FC_FIN_PROCESO")
	@Temporal(TemporalType.TIMESTAMP)
	private Date fechaFinProceso;

	@Column(name = "NU_ESTATUS")
	private Integer estatus;

	@Column(name = "CH_TIPO_CONSULTA", length = 100)
	private String tipoConsulta;

	@Column(name = "FC_CONTROL")
	@Temporal(TemporalType.TIMESTAMP)
	private Date fechaControl;

	@Column(name = "CH_USUARIO_MODIFICADOR", length = 50)
	private String usuarioModificador;

	// Nuevos campos para manejo de concurrencia entre nodos
	@Column(name = "CH_NODO_EJECUTOR", length = 100)
	private String nodoEjecutor;

	@Column(name = "FC_BLOQUEO")
	@Temporal(TemporalType.TIMESTAMP)
	private Date fechaBloqueo;

	@Column(name = "FC_EXPIRACION_BLOQUEO")
	@Temporal(TemporalType.TIMESTAMP)
	private Date fechaExpiracionBloqueo;

	// Otros campos que puedas necesitar para tu lógica de negocio
	@Transient
	private String parametrosConsulta;

	// Constructor, getters y setters
	public BitacoraReporteMDD() {
		this.fechaControl = new Date();
		this.estatus = ESTADO_PENDIENTE;
	}

	public Integer getEstatus() {
		return estatus;
	}

	public Date getFechaBloqueo() {
		return fechaBloqueo;
	}

	public Date getFechaControl() {
		return fechaControl;
	}

	public Date getFechaExpiracionBloqueo() {
		return fechaExpiracionBloqueo;
	}

	public Date getFechaFinProceso() {
		return fechaFinProceso;
	}

	public Date getFechaInicioProceso() {
		return fechaInicioProceso;
	}

	public Long getIdBitacoraReporteMdd() {
		return idBitacoraReporteMdd;
	}

	public String getNodoEjecutor() {
		return nodoEjecutor;
	}

	public String getParametrosConsulta() {
		return parametrosConsulta;
	}

	public String getTipoConsulta() {
		return tipoConsulta;
	}

	public String getTipoReporte() {
		return tipoReporte;
	}

	public String getUsuarioModificador() {
		return usuarioModificador;
	}

	public void incrementarIntentos() {
		// Implementación si necesitas contar intentos
		// Como no tienes un campo para intentos en tu tabla,
		// puedes manejarlo de manera lógica en el servicio
	}

	public void setEstatus(Integer estatus) {
		this.estatus = estatus;
		this.fechaControl = new Date();
	}

	public void setFechaBloqueo(Date fechaBloqueo) {
		this.fechaBloqueo = fechaBloqueo;
	}

	public void setFechaControl(Date fechaControl) {
		this.fechaControl = fechaControl;
	}

	public void setFechaExpiracionBloqueo(Date fechaExpiracionBloqueo) {
		this.fechaExpiracionBloqueo = fechaExpiracionBloqueo;
	}

	public void setFechaFinProceso(Date fechaFinProceso) {
		this.fechaFinProceso = fechaFinProceso;
	}

	public void setFechaInicioProceso(Date fechaInicioProceso) {
		this.fechaInicioProceso = fechaInicioProceso;
	}

	public void setIdBitacoraReporteMdd(Long idBitacoraReporteMdd) {
		this.idBitacoraReporteMdd = idBitacoraReporteMdd;
	}

	public void setNodoEjecutor(String nodoEjecutor) {
		this.nodoEjecutor = nodoEjecutor;
	}

	public void setParametrosConsulta(String parametrosConsulta) {
		this.parametrosConsulta = parametrosConsulta;
	}

	public void setTipoConsulta(String tipoConsulta) {
		this.tipoConsulta = tipoConsulta;
	}

	public void setTipoReporte(String tipoReporte) {
		this.tipoReporte = tipoReporte;
	}

	public void setUsuarioModificador(String usuarioModificador) {
		this.usuarioModificador = usuarioModificador;
	}
}
