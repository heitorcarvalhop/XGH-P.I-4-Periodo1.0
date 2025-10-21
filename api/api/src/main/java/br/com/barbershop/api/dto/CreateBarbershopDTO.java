package br.com.barbershop.api.dto;

import lombok.Data;

@Data // Anotação do Lombok para gerar os getters e setters
public class CreateBarbershopDTO {
    private String name;
    private String address;
    private String phone;
    private String hours;
}