package br.com.barbershop.api.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;         // Pode ser null para Cliente
    private String cpf;           // Pode ser null para Cliente
    private LocalDate birthDate;  // Pode ser null para Cliente
    private String userType;      // "CLIENT" ou "BARBER"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}