package br.com.barbershop.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class BarbershopDetailDTO {
    private Long id;
    private String name;
    private Double rating;
    private Integer reviews;
    private String address;
    private String cep;
    private String phone;
    private String hours;
    private List<ServiceDTO> services;
    private List<String> images;
    private Double latitude; // ADICIONADO
    private Double longitude; // ADICIONADO
}