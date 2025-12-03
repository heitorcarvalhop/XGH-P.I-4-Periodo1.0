package br.com.barbershop.api.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BarberDetailDTO {
    private Long id;
    private String name;
    private String email;
    private String cpf;
    private LocalDate birthDate;
    private String phone;
    
    // Informações da Barbearia
    private Long barbershopId;
    private String barbershopName;
    private String barbershopAddress;
    private String barbershopPhone;
}

