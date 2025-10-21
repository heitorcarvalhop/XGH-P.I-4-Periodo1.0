package br.com.barbershop.api.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AddServiceDTO {
    private String name;
    private Integer duration; // Duração em minutos
    private BigDecimal price;
}