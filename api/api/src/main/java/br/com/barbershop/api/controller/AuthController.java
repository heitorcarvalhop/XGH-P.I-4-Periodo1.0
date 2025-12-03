package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.AuthResponseDTO;
import br.com.barbershop.api.dto.LoginRequest;
import br.com.barbershop.api.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponseDTO response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                    "message", "Credenciais inválidas"
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of(
                "message", "Logout realizado com sucesso"
        ));
    }
}
