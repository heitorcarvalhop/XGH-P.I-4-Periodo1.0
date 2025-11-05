package br.com.barbershop.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotsDTO {
    private LocalDate date;
    private List<String> availableSlots; // Lista de horários no formato "HH:mm"
}