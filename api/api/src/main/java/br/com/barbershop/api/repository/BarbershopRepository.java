package br.com.barbershop.api.repository;

import br.com.barbershop.api.model.Barbershop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Importe a anotação Query
import java.util.List; // Importe a classe List

public interface BarbershopRepository extends JpaRepository<Barbershop, Long> {

    // NOVO MÉTODO:
    // Esta consulta diz ao Hibernate para buscar todas as barbearias e,
    // na mesma consulta, já "puxar" (FETCH) a lista de serviços de cada uma.
    @Query("SELECT DISTINCT b FROM Barbershop b LEFT JOIN FETCH b.services")
    List<Barbershop> findAllWithServices();
}