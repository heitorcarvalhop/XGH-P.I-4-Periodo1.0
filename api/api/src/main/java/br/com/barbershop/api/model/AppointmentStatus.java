package br.com.barbershop.api.model; // ou br.com.barbershop.api.model.enums

public enum AppointmentStatus {
    PENDING,    // Aguardando confirmação
    CONFIRMED,  // Confirmado
    CANCELLED,  // Cancelado
    COMPLETED   // Concluído
}