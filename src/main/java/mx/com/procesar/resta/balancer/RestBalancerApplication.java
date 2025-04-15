package mx.com.procesar.resta.balancer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * The Class RestBalancerApplication.
 */
@SpringBootApplication
@EnableScheduling
public class RestBalancerApplication {

	/**
	 * The main method.
	 *
	 * @param args the arguments
	 */
	public static void main(String[] args) {
		SpringApplication.run(RestBalancerApplication.class, args);
	}

}
