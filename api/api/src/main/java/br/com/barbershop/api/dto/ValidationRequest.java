package br.com.barbershop.api.dto;

import lombok.Data;

@Data
public class ValidationRequest {
    private String value; // Usaremos um nome genérico para receber tanto email quanto cpf
}