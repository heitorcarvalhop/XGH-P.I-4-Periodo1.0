package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.BarberDetailDTO;
import br.com.barbershop.api.dto.BarberRegistrationDTO;
import br.com.barbershop.api.dto.BarberResponseDTO;
import br.com.barbershop.api.service.BarberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/barbers")
public class BarberController {

    @Autowired
    private BarberService barberService;

    @PostMapping("/register")
    public ResponseEntity<?> registerBarber(@RequestBody BarberRegistrationDTO dto) {
        try {
            BarberResponseDTO newBarber = barberService.register(dto);
            return ResponseEntity.status(201).body(newBarber);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBarberById(@PathVariable Long id) {
        try {
            BarberDetailDTO barber = barberService.findById(id);
            return ResponseEntity.ok(barber);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }
}
