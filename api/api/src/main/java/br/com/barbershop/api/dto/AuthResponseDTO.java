package br.com.barbershop.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String userType; // "CLIENT" ou "BARBER"
    private Object userData; // Aqui ficará o ClientResponseDTO ou BarberResponseDTO
}