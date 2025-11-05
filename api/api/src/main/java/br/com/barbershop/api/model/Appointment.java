package br.com.barbershop.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamento com o Cliente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    // Relacionamento com o Barbeiro
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barber_id", nullable = false)
    private Barber barber;

    // Relacionamento com a Barbearia (embora possamos pegar via Barbeiro, ter direto pode facilitar queries)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barbershop_id", nullable = false)
    private Barbershop barbershop;

    // Relacionamento com o Serviço
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    // Data e Hora do início do agendamento
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    // Data e Hora do fim do agendamento (calculado com base na duração do serviço)
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    // Status do Agendamento (usaremos um Enum para os valores definidos na documentação)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status;

    // Preço do serviço no momento do agendamento (pode mudar depois)
    @Column(nullable = false)
    private BigDecimal price;

    // Timestamps automáticos (opcional, mas bom ter)
    @Column(name = "created_at", updatable = false)
    @org.hibernate.annotations.CreationTimestamp // Para popular automaticamente
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @org.hibernate.annotations.UpdateTimestamp // Para atualizar automaticamente
    private LocalDateTime updatedAt;

    // Campos adicionais mencionados na documentação podem ser adicionados aqui se necessário
    // Ex: cancelledAt, completedAt
}