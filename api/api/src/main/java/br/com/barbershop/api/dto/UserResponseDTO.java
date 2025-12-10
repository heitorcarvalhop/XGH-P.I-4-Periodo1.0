package br.com.barbershop.api.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;         // Cliente ou Barbeiro
    private String cpf;           // Apenas Barbeiro
    private LocalDate birthDate;  // Apenas Barbeiro
    private String userType;      // "CLIENT" ou "BARBER"
}