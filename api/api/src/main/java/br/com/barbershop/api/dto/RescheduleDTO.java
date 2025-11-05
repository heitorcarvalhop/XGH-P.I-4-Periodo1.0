package br.com.barbershop.api.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RescheduleDTO {
    private LocalDate date; // Nova data no formato YYYY-MM-DD
    private LocalTime time; // Nova hora no formato HH:MM
}