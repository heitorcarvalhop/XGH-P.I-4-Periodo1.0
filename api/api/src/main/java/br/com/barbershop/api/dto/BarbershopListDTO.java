package br.com.barbershop.api.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class BarbershopListDTO {
    private Long id;
    private String name;
    private Double rating;
    private Integer reviews;
    private BigDecimal price;
    private String address;
    private String cep;
    private String phone;
    private String openingHours;
    private List<String> services;
    private String image;
    private Double latitude;
    private Double longitude;
}