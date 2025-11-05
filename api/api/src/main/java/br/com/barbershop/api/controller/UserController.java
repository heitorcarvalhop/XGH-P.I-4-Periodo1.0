package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.UserResponseDTO;
import br.com.barbershop.api.dto.UserUpdateDTO;
import br.com.barbershop.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            String role = authentication.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElseThrow(() -> new RuntimeException("Tipo de usuário não encontrado no token"));
            String userType = role.replace("ROLE_", "");

            UserResponseDTO user = userService.findUserById(id, userType);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdateDTO dto,
            Authentication authentication
    ) {
        try {
            String role = authentication.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElseThrow(() -> new RuntimeException("Tipo de usuário não encontrado no token"));
            String userType = role.replace("ROLE_", "");

            UserResponseDTO updatedUser = userService.updateUser(id, userType, dto);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("não encontrado")) {
                return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
            } else {
                return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
            }
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            String role = authentication.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElseThrow(() -> new RuntimeException("Tipo de usuário não encontrado no token"));
            String userType = role.replace("ROLE_", "");

            userService.deleteUser(id, userType);
            return ResponseEntity.ok(Map.of("message", "Usuário deletado com sucesso"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("agendamentos associados")) {
                return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
            }
            else if (e.getMessage().contains("não encontrado")) {
                return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
            }
            else {
                return ResponseEntity.status(500).body(Map.of("error", "Erro inesperado ao deletar usuário"));
            }
        }
    }
}