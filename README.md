# RestBalancer

Sistema de balanceo y gestión de consultas REST pesadas con colas de priorización para el procesamiento de reportes de Modificación de Datos Diarios (MDD).

## 📋 Descripción

RestBalancer es una aplicación Spring Boot diseñada para manejar consultas REST pesadas mediante un sistema de colas y priorización. El sistema está optimizado para procesar reportes de modificación de datos de manera asíncrona y distribuida, evitando la sobrecarga del servidor y garantizando el procesamiento ordenado de las solicitudes.

### Características principales:

- **Procesamiento asíncrono**: Manejo de reportes pesados sin bloquear el servidor
- **Sistema de colas con priorización**: Gestión inteligente de solicitudes según su prioridad
- **Procesamiento distribuido**: Soporte para múltiples nodos de procesamiento
- **Reintentos automáticos**: Manejo robusto de errores con reintentos configurables
- **Interfaz web**: Panel de control para monitorear el estado de los reportes
- **Base de datos embebida**: H2 Database para desarrollo y pruebas rápidas

## 🚀 Tecnologías

- **Java 21**
- **Spring Boot 3.4.4**
- **Spring Data JPA**
- **Thymeleaf** (Motor de plantillas)
- **H2 Database** (Base de datos en memoria)
- **Maven** (Gestión de dependencias)
- **Lombok** (Reducción de código boilerplate)

## 📦 Requisitos previos

- Java 21 o superior
- Maven 3.6 o superior

## 🔧 Instalación y configuración

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd RestBalancer
   ```

2. **Compilar el proyecto**
   ```bash
   ./mvnw clean install
   ```
   
   En Windows:
   ```bash
   mvnw.cmd clean install
   ```

3. **Ejecutar la aplicación**
   ```bash
   ./mvnw spring-boot:run
   ```
   
   O ejecutar el JAR generado:
   ```bash
   java -jar target/resta.balancer-0.0.1-SNAPSHOT.jar
   ```

## 🖥️ Uso

### Acceso a la aplicación

Una vez iniciada la aplicación, puedes acceder a:

- **Aplicación web**: http://localhost:8080
- **Consola H2**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:testdb`
  - Usuario: `sa`
  - Contraseña: (dejar en blanco)

### Endpoints principales

- `GET /` - Página principal con el panel de control
- `POST /api/reportes` - Crear una nueva solicitud de reporte
- `GET /api/reportes/{id}` - Consultar el estado de un reporte
- `GET /api/reportes` - Listar todos los reportes

## 🏗️ Arquitectura

El proyecto sigue una arquitectura de capas típica de Spring Boot:

```
src/main/java/mx/com/procesar/resta/balancer/
├── exposicion/
│   └── controladores/      # Controladores REST y vistas
├── servicios/              # Lógica de negocio
├── persistencia/
│   ├── entidades/          # Entidades JPA
│   └── repositorios/       # Repositorios Spring Data
└── RestBalancerApplication.java  # Clase principal
```

### Componentes principales:

- **MddReporteService**: Servicio principal que gestiona el procesamiento de reportes con:
  - Sistema de bloqueo distribuido
  - Reintentos automáticos (máximo 3 intentos)
  - Timeout configurable (15 minutos por defecto)
  
- **BitacoraReporteMDD**: Entidad que representa un reporte en el sistema
- **ReporteController**: API REST para la gestión de reportes
- **ReporteViewController**: Controlador para las vistas web

## ⚙️ Configuración

La configuración principal se encuentra en `src/main/resources/application.properties`:

```properties
# Base de datos H2 en memoria
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# Configuración JPA
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.defer-datasource-initialization=true

# Consola H2
spring.h2.console.enabled=true
```

## 🔄 Flujo de procesamiento

1. **Recepción de solicitud**: El sistema recibe una petición de generación de reporte
2. **Encolamiento**: La solicitud se registra en la base de datos con estado "PENDIENTE"
3. **Procesamiento**: Un nodo disponible toma la solicitud y la procesa
4. **Bloqueo**: Durante el procesamiento, el registro se bloquea para evitar procesamiento duplicado
5. **Finalización**: Al completar, el estado se actualiza a "COMPLETADO" o "ERROR"
6. **Reintentos**: En caso de error, se reintenta hasta 3 veces

## 🧪 Desarrollo

### Estructura de datos inicial

El archivo `data.sql` contiene datos de prueba que se cargan automáticamente al iniciar la aplicación.

### Ejecutar en modo desarrollo

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## 📝 Notas adicionales

- El sistema utiliza H2 como base de datos en memoria, ideal para desarrollo y pruebas
- Para producción, se recomienda configurar una base de datos persistente (PostgreSQL, MySQL, etc.)
- El procesamiento distribuido se basa en un identificador único de nodo generado automáticamente
- Los logs se configuran mediante SLF4J con Logback

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia [ESPECIFICAR LICENCIA].

## 👥 Autores

- **Equipo de Desarrollo** - *Trabajo inicial* - [Procesar]

---

Para más información o soporte, contactar al equipo de desarrollo.
