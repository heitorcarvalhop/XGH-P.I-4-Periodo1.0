package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.BarbershopDetailDTO;
import br.com.barbershop.api.dto.BarbershopListDTO;
import br.com.barbershop.api.dto.CreateBarbershopDTO;
import br.com.barbershop.api.dto.AddServiceDTO;
import br.com.barbershop.api.dto.ServiceDTO;
import br.com.barbershop.api.model.Barbershop;
import br.com.barbershop.api.model.Service;
import br.com.barbershop.api.repository.BarbershopRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class BarbershopService {

    @Autowired
    private BarbershopRepository barbershopRepository;

    public BarbershopDetailDTO findById(Long id) {
        Barbershop barbershop = barbershopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barbearia não encontrada"));
        return mapToBarbershopDetailDTO(barbershop);
    }

    public List<BarbershopListDTO> findAll() {
        // CORREÇÃO: Usamos o novo método otimizado
        return barbershopRepository.findAllWithServices()
                .stream()
                .map(this::mapToBarbershopListDTO)
                .collect(Collectors.toList());
    }

    public Barbershop create(CreateBarbershopDTO dto) {
        Barbershop newBarbershop = new Barbershop();
        newBarbershop.setName(dto.getName());
        newBarbershop.setAddress(dto.getAddress());
        newBarbershop.setPhone(dto.getPhone());
        newBarbershop.setHours(dto.getHours());
        newBarbershop.setRating(0.0);
        newBarbershop.setReviews(0);
        return barbershopRepository.save(newBarbershop);
    }

    public Service addServiceToBarbershop(Long barbershopId, AddServiceDTO serviceDto) {
        Barbershop barbershop = barbershopRepository.findById(barbershopId)
                .orElseThrow(() -> new RuntimeException("Barbearia não encontrada"));

        Service newService = new Service();
        newService.setName(serviceDto.getName());
        newService.setDuration(serviceDto.getDuration());
        newService.setPrice(serviceDto.getPrice());
        newService.setBarbershop(barbershop);

        barbershop.getServices().add(newService);
        barbershopRepository.save(barbershop);
        return newService;
    }

    private BarbershopDetailDTO mapToBarbershopDetailDTO(Barbershop barbershop) {
        BarbershopDetailDTO dto = new BarbershopDetailDTO();
        dto.setId(barbershop.getId());
        dto.setName(barbershop.getName());
        dto.setAddress(barbershop.getAddress());
        dto.setCep(barbershop.getCep());
        dto.setPhone(barbershop.getPhone());
        dto.setHours(barbershop.getHours());
        dto.setRating(barbershop.getRating());
        dto.setReviews(barbershop.getReviews());

        if (barbershop.getServices() != null) {
            List<ServiceDTO> serviceDTOs = barbershop.getServices().stream().map(service -> {
                ServiceDTO serviceDTO = new ServiceDTO();
                serviceDTO.setId(service.getId());
                serviceDTO.setName(service.getName());
                serviceDTO.setPrice(service.getPrice());
                serviceDTO.setDuration(service.getDuration());
                return serviceDTO;
            }).collect(Collectors.toList());
            dto.setServices(serviceDTOs);
        } else {
            dto.setServices(Collections.emptyList());
        }

        dto.setImages(List.of("image1.jpg", "image2.jpg"));
        return dto;
    }

    private BarbershopListDTO mapToBarbershopListDTO(Barbershop barbershop) {
        BarbershopListDTO dto = new BarbershopListDTO();
        dto.setId(barbershop.getId());
        dto.setName(barbershop.getName());
        dto.setAddress(barbershop.getAddress());
        dto.setCep(barbershop.getCep());
        dto.setRating(barbershop.getRating());
        dto.setReviews(barbershop.getReviews());
        dto.setPrice(new BigDecimal("50.00"));
        dto.setImage("https://example.com/image.jpg");

        if (barbershop.getServices() != null) {
            dto.setServices(barbershop.getServices().stream()
                    .map(Service::getName)
                    .collect(Collectors.toList()));
        } else {
            dto.setServices(Collections.emptyList());
        }

        return dto;
    }
}