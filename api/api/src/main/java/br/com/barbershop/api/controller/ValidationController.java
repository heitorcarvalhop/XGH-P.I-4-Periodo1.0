package br.com.barbershop.api.controller; // Verifique se o nome do pacote está correto

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

    // 1. Injetamos os DOIS repositórios necessários
    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private BarberRepository barberRepository;

    @PostMapping("/email")
    public ResponseEntity<ValidationResponse> validateEmail(@RequestBody ValidationRequest request) {
        // 2. Verifica se o email existe em QUALQUER uma das duas tabelas
        boolean emailExistsAsClient = clientRepository.findByEmail(request.getValue()).isPresent();
        boolean emailExistsAsBarber = barberRepository.findByEmail(request.getValue()).isPresent();

        if (emailExistsAsClient || emailExistsAsBarber) {
            return ResponseEntity.ok(new ValidationResponse(false, "Email já está em uso"));
        }
        return ResponseEntity.ok(new ValidationResponse(true, "Email disponível"));
    }

    @PostMapping("/cpf")
    public ResponseEntity<ValidationResponse> validateCpf(@RequestBody ValidationRequest request) {
        // 3. Verifica se o CPF existe APENAS na tabela de barbeiros
        boolean cpfExists = barberRepository.findByCpf(request.getValue()).isPresent();
        if (cpfExists) {
            return ResponseEntity.ok(new ValidationResponse(false, "CPF já está em uso"));
        }
        return ResponseEntity.ok(new ValidationResponse(true, "CPF disponível"));
    }
}