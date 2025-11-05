package br.com.barbershop.api.dto;

import br.com.barbershop.api.model.AppointmentStatus; // Importe o Enum
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate; // Para a data
import java.time.LocalTime; // Para a hora

@Data
public class AppointmentDTO {
    private Long id;

    // Dados do Cliente
    private Long clientId;
    private String clientName;

    // Dados da Barbearia
    private Long barbershopId;
    private String barbershopName;
    private String barbershopAddress;
    private String barbershopPhone;

    // Dados do Barbeiro
    private Long barberId;
    private String barberName;

    // Dados do Serviço
    private Long serviceId;
    private String service; // Nome do serviço

    // Data e Hora
    private LocalDate date; // Apenas a data (YYYY-MM-DD)
    private LocalTime time; // Apenas a hora (HH:MM)

    // Detalhes do Agendamento
    private Integer duration; // Duração em minutos
    private BigDecimal price; // Preço
    private AppointmentStatus status; // Status (PENDING, CONFIRMED, etc.)

    // Poderíamos adicionar createdAt, updatedAt, cancelledAt, completedAt aqui no futuro
}