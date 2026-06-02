package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.BarbershopDetailDTO;
import br.com.barbershop.api.dto.BarbershopListDTO;
import br.com.barbershop.api.dto.CreateBarbershopDTO;
import br.com.barbershop.api.dto.AddServiceDTO;
import br.com.barbershop.api.dto.ServiceDTO;
import br.com.barbershop.api.dto.UpdateBarbershopDTO;
import br.com.barbershop.api.model.Barbershop;
import br.com.barbershop.api.model.Service;
import br.com.barbershop.api.repository.BarbershopRepository;
import br.com.barbershop.api.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class BarbershopService {

    @Autowired
    private BarbershopRepository barbershopRepository;
    @Autowired
    private ServiceRepository serviceRepository;

    public BarbershopDetailDTO findById(Long id) {
        Barbershop barbershop = barbershopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barbearia não encontrada com o ID: " + id));
        return mapToBarbershopDetailDTO(barbershop);
    }

    public List<BarbershopListDTO> findAll() {
        return barbershopRepository.findAllWithServices()
                .stream()
                .map(this::mapToBarbershopListDTO)
                .collect(Collectors.toList());
    }

    public Barbershop create(CreateBarbershopDTO dto) {
        if (dto == null || isBlank(dto.getName()) || isBlank(dto.getAddress()) || isBlank(dto.getCep())) {
            throw new IllegalArgumentException("Nome, endereco e CEP da barbearia sao obrigatorios");
        }
        if (barbershopRepository.existsByName(dto.getName().trim())) {
            throw new IllegalArgumentException("Ja existe uma barbearia cadastrada com esse nome");
        }

        Barbershop newBarbershop = new Barbershop();
        newBarbershop.setName(dto.getName().trim());
        newBarbershop.setAddress(dto.getAddress().trim());
        newBarbershop.setCep(dto.getCep().trim());
        newBarbershop.setPhone(dto.getPhone());
        newBarbershop.setHours(dto.getHours());
        newBarbershop.setRating(0.0);
        newBarbershop.setReviews(0);
        return barbershopRepository.save(newBarbershop);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public ServiceDTO addServiceToBarbershop(Long barbershopId, AddServiceDTO serviceDto) {
        Barbershop barbershop = barbershopRepository.findById(barbershopId)
                .orElseThrow(() -> new RuntimeException("Barbearia não encontrada com o ID: " + barbershopId));

        if (serviceDto == null || isBlank(serviceDto.getName())
                || serviceDto.getDuration() == null || serviceDto.getDuration() <= 0
                || serviceDto.getPrice() == null || serviceDto.getPrice().signum() < 0) {
            throw new IllegalArgumentException("Informe nome, duracao e preco validos para o servico");
        }

        Service newService = new Service();
        newService.setName(serviceDto.getName());
        newService.setDuration(serviceDto.getDuration());
        newService.setPrice(serviceDto.getPrice());
        newService.setBarbershop(barbershop);

        if (barbershop.getServices() == null) {
            barbershop.setServices(new java.util.ArrayList<>());
        }
        barbershop.getServices().add(newService);

        Service savedService = serviceRepository.save(newService);
        return mapToServiceDTO(savedService);
    }

    public BarbershopDetailDTO update(Long id, UpdateBarbershopDTO dto) {
        Barbershop barbershop = barbershopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barbearia nao encontrada com o ID: " + id));

        if (dto == null || isBlank(dto.getName()) || isBlank(dto.getAddress()) || isBlank(dto.getCep())) {
            throw new IllegalArgumentException("Nome, endereco e CEP da barbearia sao obrigatorios");
        }

        barbershop.setName(dto.getName().trim());
        barbershop.setAddress(dto.getAddress().trim());
        barbershop.setCep(dto.getCep().trim());
        barbershop.setPhone(dto.getPhone());
        barbershop.setHours(dto.getOpeningHours());
        barbershop.setLatitude(dto.getLatitude());
        barbershop.setLongitude(dto.getLongitude());

        return mapToBarbershopDetailDTO(barbershopRepository.save(barbershop));
    }

    public void deleteService(Long barbershopId, Long serviceId) {
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Servico nao encontrado"));
        if (service.getBarbershop() == null || !service.getBarbershop().getId().equals(barbershopId)) {
            throw new IllegalArgumentException("Servico nao pertence a barbearia selecionada");
        }
        serviceRepository.delete(service);
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
        dto.setLatitude(barbershop.getLatitude()); // Inclui coordenadas (podem ser null)
        dto.setLongitude(barbershop.getLongitude()); // Inclui coordenadas (podem ser null)

        if (barbershop.getServices() != null) {
            List<ServiceDTO> serviceDTOs = barbershop.getServices().stream()
                    .map(this::mapToServiceDTO)
                    .collect(Collectors.toList());
            dto.setServices(serviceDTOs);
        } else {
            dto.setServices(Collections.emptyList());
        }

        dto.setImages(Collections.emptyList());
        return dto;
    }

    private ServiceDTO mapToServiceDTO(Service service) {
        ServiceDTO dto = new ServiceDTO();
        dto.setId(service.getId());
        dto.setName(service.getName());
        dto.setPrice(service.getPrice());
        dto.setDuration(service.getDuration());
        return dto;
    }

    private BarbershopListDTO mapToBarbershopListDTO(Barbershop barbershop) {
        BarbershopListDTO dto = new BarbershopListDTO();
        dto.setId(barbershop.getId());
        dto.setName(barbershop.getName());
        dto.setAddress(barbershop.getAddress());
        dto.setCep(barbershop.getCep());
        dto.setPhone(barbershop.getPhone()); // ✅ Adiciona telefone
        dto.setOpeningHours(barbershop.getHours()); // ✅ Adiciona horários (hours -> openingHours)
        dto.setRating(barbershop.getRating());
        dto.setReviews(barbershop.getReviews());
        dto.setLatitude(barbershop.getLatitude());
        dto.setLongitude(barbershop.getLongitude());

        // Calcula preço médio dos serviços ou usa valor padrão
        if (barbershop.getServices() != null && !barbershop.getServices().isEmpty()) {
            BigDecimal avgPrice = barbershop.getServices().stream()
                    .map(Service::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(barbershop.getServices().size()), 2, RoundingMode.HALF_UP);
            dto.setPrice(avgPrice);
        } else {
            dto.setPrice(new BigDecimal("50.00"));
        }
        
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
