package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.ClientRegistrationDTO;
import br.com.barbershop.api.dto.ClientResponseDTO;
import br.com.barbershop.api.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/clients") // Novo endpoint base para clientes
public class ClientController {

    @Autowired
    private ClientService clientService;

    @PostMapping("/register")
    public ResponseEntity<?> registerClient(@RequestBody ClientRegistrationDTO dto) {
        try {
            ClientResponseDTO newClient = clientService.register(dto);
            return ResponseEntity.status(201).body(newClient);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        }
    }
}