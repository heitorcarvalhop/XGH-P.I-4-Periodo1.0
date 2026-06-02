package br.com.barbershop.api.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class CreateAppointmentDTO {
    private Long clientId;
    private Long barbershopId;
    private Long barberId;
    private Long serviceId;
    private List<Long> serviceIds;
    private LocalDate date; // Data no formato YYYY-MM-DD
    private LocalTime time; // Hora no formato HH:MM
}
