package br.com.barbershop.api.dto;

import lombok.Data;

@Data
public class ClientResponseDTO {
    private Long id;
    private String name;
    private String email;
}