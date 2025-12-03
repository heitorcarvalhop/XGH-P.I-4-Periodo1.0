package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.ValidationRequest;
import br.com.barbershop.api.dto.ValidationResponse;
import br.com.barbershop.api.repository.BarberRepository;
import br.com.barbershop.api.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/validation")
public class ValidationController {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private BarberRepository barberRepository;

    @PostMapping("/email")
    public ResponseEntity<ValidationResponse> validateEmail(@RequestBody ValidationRequest request) {
        boolean existsClient = clientRepository.findByEmail(request.getValue()).isPresent();
        boolean existsBarber = barberRepository.findByEmail(request.getValue()).isPresent();

        if (existsClient || existsBarber) {
            return ResponseEntity.ok(new ValidationResponse(false, "Email já está em uso"));
        }
        return ResponseEntity.ok(new ValidationResponse(true, "Email disponível"));
    }

    @PostMapping("/cpf")
    public ResponseEntity<ValidationResponse> validateCpf(@RequestBody ValidationRequest request) {
        boolean exists = barberRepository.findByCpf(request.getValue()).isPresent();

        if (exists) {
            return ResponseEntity.ok(new ValidationResponse(false, "CPF já está em uso"));
        }
        return ResponseEntity.ok(new ValidationResponse(true, "CPF disponível"));
    }
}
