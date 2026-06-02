package br.com.barbershop.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BarberOptionDTO {
    private Long id;
    private String name;
}
