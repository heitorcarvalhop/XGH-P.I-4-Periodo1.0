package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.UserUpdateDTO;
import br.com.barbershop.api.model.User;
import br.com.barbershop.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User savedUser = userService.register(user);
            return ResponseEntity.status(201).body(savedUser);
        } catch (Exception e) {
            // Conforme a documentação, retorna 409 Conflict se o email já existir
            return ResponseEntity.status(409)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Dentro da classe UserController
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.findById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Outros endpoints (GET, PUT, DELETE) virão aqui depois...
    // Adicione dentro da classe UserController

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserUpdateDTO data) {
        try {
            User updatedUser = userService.update(id, data);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Usuário deletado com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}