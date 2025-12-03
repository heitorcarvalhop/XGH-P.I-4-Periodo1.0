package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.UserResponseDTO;
import br.com.barbershop.api.dto.UserUpdateDTO;
import br.com.barbershop.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserAliasController {
    @Autowired private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> list() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id, Authentication authentication) {
        try {
            String userType = resolveUserType(authentication);
            return ResponseEntity.ok(userService.findUserById(id, userType));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UserUpdateDTO dto, Authentication authentication) {
        try {
            String userType = resolveUserType(authentication);
            return ResponseEntity.ok(userService.updateUser(id, userType, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        try {
            String userType = resolveUserType(authentication);
            userService.deleteUser(id, userType);
            return ResponseEntity.ok(Map.of("message", "Usuário deletado com sucesso"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("agendamentos associados")) {
                return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
            } else if (e.getMessage().contains("não encontrado")) {
                return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "Erro inesperado ao deletar usuário"));
            }
        }
    }

    private String resolveUserType(Authentication authentication) {
        if (authentication == null) throw new RuntimeException("Autenticação não encontrada");
        for (GrantedAuthority auth : authentication.getAuthorities()) {
            String role = auth.getAuthority();
            if (role.contains("BARBER")) return "BARBER";
            if (role.contains("CLIENT")) return "CLIENT";
        }
        throw new RuntimeException("Tipo de usuário não identificado");
    }
}
