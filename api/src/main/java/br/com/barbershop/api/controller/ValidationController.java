package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.ValidationRequest;
import br.com.barbershop.api.dto.ValidationResponse;
import br.com.barbershop.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/validation")
public class ValidationController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/email")
    public ResponseEntity<ValidationResponse> validateEmail(@RequestBody ValidationRequest request) {
        boolean emailExists = userRepository.findByEmail(request.getValue()).isPresent();
        if (emailExists) {
            return ResponseEntity.ok(new ValidationResponse(false, "Email já está em uso"));
        }
        return ResponseEntity.ok(new ValidationResponse(true, "Email disponível"));
    }

    @PostMapping("/cpf")
    public ResponseEntity<ValidationResponse> validateCpf(@RequestBody ValidationRequest request) {
        boolean cpfExists = userRepository.findByCpf(request.getValue()).isPresent();
        if (cpfExists) {
            return ResponseEntity.ok(new ValidationResponse(false, "CPF já está em uso"));
        }
        // Aqui você poderia adicionar uma lógica extra para validar o formato do CPF
        return ResponseEntity.ok(new ValidationResponse(true, "CPF disponível"));
    }
}