package br.com.barbershop.api.repository;

import br.com.barbershop.api.model.Barber;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BarberRepository extends JpaRepository<Barber, Long> {
    Optional<Barber> findByEmail(String email);
    Optional<Barber> findByCpf(String cpf);
    List<Barber> findByBarbershopIdOrderByNameAsc(Long barbershopId);

    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
}
