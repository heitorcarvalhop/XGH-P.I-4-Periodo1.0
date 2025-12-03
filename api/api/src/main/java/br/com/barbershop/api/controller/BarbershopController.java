package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.AddServiceDTO;
import br.com.barbershop.api.dto.BarbershopDetailDTO;
import br.com.barbershop.api.dto.BarbershopListDTO;
import br.com.barbershop.api.dto.CreateBarbershopDTO;
import br.com.barbershop.api.model.Barbershop;
import br.com.barbershop.api.model.Service;
import br.com.barbershop.api.service.BarbershopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/barbershops")
public class BarbershopController {

    @Autowired
    private BarbershopService barbershopService;

    @GetMapping
    public ResponseEntity<?> getAllBarbershops() {
        List<BarbershopListDTO> barbershops = barbershopService.findAll();
        return ResponseEntity.ok(Collections.singletonMap("barbershops", barbershops));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBarbershopById(@PathVariable Long id) {
        try {
            BarbershopDetailDTO detail = barbershopService.findById(id);
            return ResponseEntity.ok(detail);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createBarbershop(@RequestBody CreateBarbershopDTO dto) {
        Barbershop created = barbershopService.create(dto);
        return ResponseEntity.status(201).body(created);
    }

    @PostMapping("/{id}/services")
    public ResponseEntity<?> addService(@PathVariable Long id, @RequestBody AddServiceDTO dto) {
        try {
            Service service = barbershopService.addServiceToBarbershop(id, dto);
            return ResponseEntity.status(201).body(service);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }
}
