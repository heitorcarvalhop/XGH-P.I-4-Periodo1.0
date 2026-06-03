package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.AppointmentDTO;
import br.com.barbershop.api.dto.AvailableSlotsDTO;
import br.com.barbershop.api.dto.CreateAppointmentDTO;
import br.com.barbershop.api.dto.RescheduleDTO;
import br.com.barbershop.api.model.Barber;
import br.com.barbershop.api.model.Client;
import br.com.barbershop.api.repository.BarberRepository;
import br.com.barbershop.api.repository.ClientRepository;
import br.com.barbershop.api.service.AppointmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private BarberRepository barberRepository;

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody CreateAppointmentDTO dto, Authentication authentication) {
        try {
            if (!canCreateAppointment(dto, authentication)) {
                return forbidden();
            }

            AppointmentDTO newAppointment = appointmentService.create(dto);
            return ResponseEntity.status(201).body(newAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<?> getClientAppointments(@PathVariable Long clientId, Authentication authentication) {
        try {
            if (!isAuthenticatedClient(clientId, authentication)) {
                return forbidden();
            }

            List<AppointmentDTO> list = appointmentService.findByClientId(clientId);
            return ResponseEntity.ok(Map.of("appointments", list));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", "Cliente não encontrado"
            ));
        }
    }

    @GetMapping("/barbershop/{barbershopId}")
    public ResponseEntity<?> getBarbershopAppointments(@PathVariable Long barbershopId, Authentication authentication) {
        try {
            if (!isAuthenticatedBarberFromBarbershop(barbershopId, authentication)) {
                return forbidden();
            }

            List<AppointmentDTO> list = appointmentService.findByBarbershopId(barbershopId);
            return ResponseEntity.ok(Map.of("appointments", list));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id, Authentication authentication) {
        try {
            AppointmentDTO appointment = appointmentService.findById(id);
            if (!canAccessAppointment(appointment, authentication)) {
                return forbidden();
            }

            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody RescheduleDTO dto,
            Authentication authentication
    ) {
        try {
            AppointmentDTO existing = appointmentService.findById(id);
            if (!canAccessAppointment(existing, authentication)) {
                return forbidden();
            }

            AppointmentDTO updated = appointmentService.reschedule(id, dto);
            return ResponseEntity.ok(Map.of(
                    "message", "Agendamento reagendado com sucesso",
                    "appointment", updated
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id, Authentication authentication) {
        try {
            AppointmentDTO existing = appointmentService.findById(id);
            if (!canAccessAppointment(existing, authentication)) {
                return forbidden();
            }

            AppointmentDTO cancelled = appointmentService.cancel(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Agendamento cancelado com sucesso",
                    "appointment", cancelled
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long id, Authentication authentication) {
        try {
            AppointmentDTO existing = appointmentService.findById(id);
            if (!canManageAppointmentAsBarber(existing, authentication)) {
                return forbidden();
            }

            AppointmentDTO confirmed = appointmentService.confirm(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Agendamento confirmado",
                    "appointment", confirmed
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable Long id, Authentication authentication) {
        try {
            AppointmentDTO existing = appointmentService.findById(id);
            if (!canManageAppointmentAsBarber(existing, authentication)) {
                return forbidden();
            }

            AppointmentDTO completed = appointmentService.complete(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Agendamento marcado como concluído",
                    "appointment", completed
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam Long barbershopId,
            @RequestParam(required = false) Long barberId,
            @RequestParam LocalDate date,
            @RequestParam(defaultValue = "30") Integer duration
    ) {
        try {
            AvailableSlotsDTO slots = appointmentService.findAvailableSlots(barbershopId, barberId, date, duration);
            return ResponseEntity.ok(slots);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(403).body(Map.of(
                "message", "Usuario nao autorizado para este recurso"
        ));
    }

    private boolean canCreateAppointment(CreateAppointmentDTO dto, Authentication authentication) {
        return isAuthenticatedClient(dto.getClientId(), authentication);
    }

    private boolean canAccessAppointment(AppointmentDTO appointment, Authentication authentication) {
        return isAuthenticatedClient(appointment.getClientId(), authentication)
                || isAuthenticatedBarberFromBarbershop(appointment.getBarbershopId(), authentication);
    }

    private boolean canManageAppointmentAsBarber(AppointmentDTO appointment, Authentication authentication) {
        return isAuthenticatedBarberFromBarbershop(appointment.getBarbershopId(), authentication);
    }

    private boolean isAuthenticatedClient(Long clientId, Authentication authentication) {
        if (clientId == null || !hasRole(authentication, "ROLE_CLIENT")) {
            return false;
        }

        return getAuthenticatedClient(authentication)
                .map(client -> clientId.equals(client.getId()))
                .orElse(false);
    }

    private boolean isAuthenticatedBarberFromBarbershop(Long barbershopId, Authentication authentication) {
        if (barbershopId == null || !hasRole(authentication, "ROLE_BARBER")) {
            return false;
        }

        return getAuthenticatedBarber(authentication)
                .map(Barber::getBarbershop)
                .map(barbershop -> barbershopId.equals(barbershop.getId()))
                .orElse(false);
    }

    private Optional<Client> getAuthenticatedClient(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return Optional.empty();
        }

        return clientRepository.findByEmail(authentication.getName());
    }

    private Optional<Barber> getAuthenticatedBarber(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return Optional.empty();
        }

        return barberRepository.findByEmail(authentication.getName());
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> role.equals(authority.getAuthority()));
    }
}
