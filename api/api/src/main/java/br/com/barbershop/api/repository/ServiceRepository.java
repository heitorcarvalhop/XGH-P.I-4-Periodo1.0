package br.com.barbershop.api.repository;

import br.com.barbershop.api.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<Service, Long> {
}