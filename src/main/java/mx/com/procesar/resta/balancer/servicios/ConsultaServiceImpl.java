package mx.com.procesar.resta.balancer.servicios;

import java.util.Date;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * The Class ConsultaServiceImpl.
 */
@Service
public class ConsultaServiceImpl implements ConsultaService {

	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(ConsultaServiceImpl.class);

	/** The random. */
	private Random random = new Random();

	/**
	 * Procesar E insertar datos.
	 *
	 * @param fechaConsulta the fecha consulta
	 * @param parametros    the parametros
	 */
	@Override
	public void procesarEInsertarDatos(Date fechaConsulta, String parametros) {
		log.info("Iniciando procesamiento e inserción de datos para fecha: {}", fechaConsulta);

		// Simulamos el procesamiento e inserción de datos
		try {
			// Tiempo de procesamiento aleatorio entre 2 y 5 segundos
			int tiempoProcesamiento = 2000 + random.nextInt(3000);
			log.info("El procesamiento tomará aproximadamente {} segundos", tiempoProcesamiento / 1000);
			Thread.sleep(tiempoProcesamiento);

			// Simular un error aleatorio en aproximadamente 5% de los casos
			if (random.nextInt(20) == 0) {
				throw new RuntimeException("Error simulado al procesar e insertar datos");
			}

			log.info("Procesamiento e inserción de datos completado exitosamente");
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new RuntimeException("El procesamiento fue interrumpido", e);
		}
	}

	/**
	 * Realizar consulta.
	 *
	 * @param fechaConsulta the fecha consulta
	 * @param parametros    the parametros
	 */
	@Override
	public void realizarConsulta(Date fechaConsulta, String parametros) {
		log.info("Iniciando consulta con fecha: {} y parámetros: {}", fechaConsulta, parametros);

		// Simulamos una consulta pesada
		try {
			// Tiempo de consulta aleatorio entre 3 y 8 segundos
			int tiempoConsulta = 3000 + random.nextInt(5000);
			log.info("La consulta tomará aproximadamente {} segundos", tiempoConsulta / 1000);
			Thread.sleep(tiempoConsulta);

			// Simular un error aleatorio en aproximadamente 10% de los casos
			if (random.nextInt(10) == 0) {
				throw new RuntimeException("Error simulado en la consulta");
			}

			log.info("Consulta completada exitosamente");
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new RuntimeException("La consulta fue interrumpida", e);
		}
	}
}
