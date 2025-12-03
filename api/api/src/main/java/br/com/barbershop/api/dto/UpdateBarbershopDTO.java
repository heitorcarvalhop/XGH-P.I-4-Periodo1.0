package br.com.barbershop.api.dto;

import lombok.Data;

@Data
public class UpdateBarbershopDTO {
    private String name;
    private String address;
    private String cep;
    private String phone;
    private String hours;
    private Double latitude;
    private Double longitude;
}
