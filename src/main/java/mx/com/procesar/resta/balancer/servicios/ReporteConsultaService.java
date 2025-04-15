package mx.com.procesar.resta.balancer.servicios;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import mx.com.procesar.resta.balancer.persistencia.entidades.BitacoraReporteMDD;
import mx.com.procesar.resta.balancer.persistencia.repositorios.BitacoraReporteMDDRepository;

@Service
public class ReporteConsultaService {

    @Autowired
    private BitacoraReporteMDDRepository reporteRepository;

    /**
     * Servicio para consultar reportes pendientes con aislamiento READ_COMMITTED
     * para evitar bloqueos en las actualizaciones
     */
    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly = true)
    public List<BitacoraReporteMDD> obtenerReportesPendientes() {
        return reporteRepository.findPendingReportsNoLock(BitacoraReporteMDD.ESTADO_PENDIENTE);
    }
}
