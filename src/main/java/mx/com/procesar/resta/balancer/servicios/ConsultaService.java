package mx.com.procesar.resta.balancer.servicios;

import java.util.Date;

public interface ConsultaService {
	/**
	 * Procesa los resultados de la consulta e inserta en las tablas destino
	 */
	void procesarEInsertarDatos(Date fechaConsulta, String parametros);

	/**
	 * Realiza la consulta según la fecha y parámetros dados
	 */
	void realizarConsulta(Date fechaConsulta, String parametros);
}
