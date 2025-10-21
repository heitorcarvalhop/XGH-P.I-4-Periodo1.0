package br.com.barbershop.api.dto;

import lombok.Data;
import java.time.LocalDate;

@Data // Anotação do Lombok para criar os getters e setters
public class BarberResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String cpf;
    private LocalDate birthDate;
    private String phone;
}