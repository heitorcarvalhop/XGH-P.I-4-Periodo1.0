package br.com.barbershop.api.repository;

import br.com.barbershop.api.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByEmail(String email);
    
    @Modifying
    @Transactional
    @Query("UPDATE Client c SET c.phone = :phone WHERE c.id = :id")
    void updatePhone(@Param("id") Long id, @Param("phone") String phone);
}