package br.com.barbershop.api.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserUpdateDTO {
    // Campos comuns que podem ser atualizados
    private String name;
    private String email;
    private String phone;

    // Campos específicos do Barbeiro (serão ignorados se o usuário for Cliente)
    private String cpf;
    private LocalDate birthDate;

    // Campos para atualização de senha (opcionais)
    private String currentPassword;
    private String newPassword;
}