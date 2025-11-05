package br.com.barbershop.api.repository;

import br.com.barbershop.api.model.Appointment;
import br.com.barbershop.api.model.AppointmentStatus; // Import Enum
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByClientId(Long clientId);
    List<Appointment> findByBarbershopId(Long barbershopId);
    List<Appointment> findByBarberId(Long barberId);

    // Método para buscar por barbearia e intervalo de tempo
    List<Appointment> findByBarbershopIdAndStartTimeBetween(Long barbershopId, LocalDateTime start, LocalDateTime end);

    // Método para buscar por barbearia, intervalo de tempo E status específicos
    List<Appointment> findByBarbershopIdAndStartTimeBetweenAndStatusIn(Long barbershopId, LocalDateTime start, LocalDateTime end, List<AppointmentStatus> statuses);

}