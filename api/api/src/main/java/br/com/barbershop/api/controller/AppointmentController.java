package br.com.barbershop.api.controller;

import br.com.barbershop.api.dto.AppointmentDTO;
import br.com.barbershop.api.dto.AvailableSlotsDTO;
import br.com.barbershop.api.dto.CreateAppointmentDTO;
import br.com.barbershop.api.dto.RescheduleDTO;
import br.com.barbershop.api.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody CreateAppointmentDTO dto) {
        try {
            AppointmentDTO newAppointment = appointmentService.create(dto);
            return ResponseEntity.status(201).body(newAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<?> getClientAppointments(@PathVariable Long clientId) {
        try {
            List<AppointmentDTO> appointments = appointmentService.findByClientId(clientId);
            Map<String, List<AppointmentDTO>> response = Collections.singletonMap("appointments", appointments);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/barbershop/{barbershopId}")
    public ResponseEntity<?> getBarbershopAppointments(@PathVariable Long barbershopId) {
        try {
            List<AppointmentDTO> appointments = appointmentService.findByBarbershopId(barbershopId);
            Map<String, List<AppointmentDTO>> response = Collections.singletonMap("appointments", appointments);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        try {
            AppointmentDTO appointment = appointmentService.findById(id);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long id, @RequestBody RescheduleDTO dto) {
        try {
            AppointmentDTO updatedAppointment = appointmentService.reschedule(id, dto);
            Map<String, Object> response = Map.of(
                    "message", "Agendamento reagendado com sucesso",
                    "appointment", updatedAppointment
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        try {
            AppointmentDTO cancelledAppointment = appointmentService.cancel(id);
            Map<String, Object> response = Map.of(
                    "message", "Agendamento cancelado com sucesso",
                    "appointment", cancelledAppointment
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long id) {
        try {
            AppointmentDTO confirmedAppointment = appointmentService.confirm(id);
            Map<String, Object> response = Map.of(
                    "message", "Agendamento confirmado",
                    "appointment", confirmedAppointment
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable Long id) {
        try {
            AppointmentDTO completedAppointment = appointmentService.complete(id);
            Map<String, Object> response = Map.of(
                    "message", "Agendamento marcado como concluído",
                    "appointment", completedAppointment
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam Long barbershopId,
            @RequestParam LocalDate date
    ) {
        try {
            AvailableSlotsDTO availableSlots = appointmentService.findAvailableSlots(barbershopId, date);
            return ResponseEntity.ok(availableSlots);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }
}