package br.com.barbershop.api.dto;

import lombok.Data;

@Data
public class ClientRegistrationDTO {
    private String name;
    private String email;
    private String password;
}