package br.com.barbershop.api.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BarberRegistrationDTO {
    private String name;
    private String cpf;
    private LocalDate birthDate;
    private String phone;
    private String email;
    private String password;
    private Long barbershopId; // ID da barbearia à qual ele pertence
}