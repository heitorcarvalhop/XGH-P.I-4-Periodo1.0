package br.com.barbershop.api.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ServiceDTO {
    private Long id;
    private String name;
    private Integer duration;
    private BigDecimal price;
}