package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.BarberRegistrationDTO;
import br.com.barbershop.api.dto.BarberResponseDTO;
import br.com.barbershop.api.service.BarberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/barbers") // Endpoint base para barbeiros
public class BarberController {

    @Autowired
    private BarberService barberService;

    @PostMapping("/register")
    public ResponseEntity<?> registerBarber(@RequestBody BarberRegistrationDTO dto) {
        try {
            BarberResponseDTO newBarber = barberService.register(dto);
            return ResponseEntity.status(201).body(newBarber);
        } catch (RuntimeException e) {
            // Retorna 409 Conflict para dados duplicados ou 404 se a barbearia não for encontrada
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        }
    }
}