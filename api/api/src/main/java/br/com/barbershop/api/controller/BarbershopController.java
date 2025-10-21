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
        Map<String, List<BarbershopListDTO>> response = Collections.singletonMap("barbershops", barbershops);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BarbershopDetailDTO> getBarbershopById(@PathVariable Long id) {
        try {
            BarbershopDetailDTO barbershopDetail = barbershopService.findById(id);
            return ResponseEntity.ok(barbershopDetail);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Barbershop> createBarbershop(@RequestBody CreateBarbershopDTO dto) {
        Barbershop createdBarbershop = barbershopService.create(dto);
        return ResponseEntity.status(201).body(createdBarbershop);
    }


    @PostMapping("/{id}/services")
    public ResponseEntity<?> addService(@PathVariable Long id, @RequestBody AddServiceDTO dto) {
        try {
            Service newService = barbershopService.addServiceToBarbershop(id, dto);
            return ResponseEntity.status(201).body(newService);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}