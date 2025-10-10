package br.com.barbershop.api.dto;

import lombok.Data;

@Data
public class UserUpdateDTO {
    private String fullName;
    private String nickname;
    private String phone;
    private String city;
}