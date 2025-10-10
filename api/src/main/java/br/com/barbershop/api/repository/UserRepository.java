package br.com.barbershop.api.repository;

import br.com.barbershop.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Método para buscar um usuário pelo email
    Optional<User> findByEmail(String email);

    // Dentro da interface UserRepository
    Optional<User> findByCpf(String cpf);
}