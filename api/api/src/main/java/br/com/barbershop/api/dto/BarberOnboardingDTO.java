package br.com.barbershop.api.dto;

import lombok.Data;

@Data
public class BarberOnboardingDTO {
    private BarberRegistrationDTO barber;
    private CreateBarbershopDTO barbershop;
}
