package br.com.barbershop.api.controller;

import br.com.barbershop.api.config.JwtAuthFilter;
import br.com.barbershop.api.dto.AppointmentDTO;
import br.com.barbershop.api.dto.AvailableSlotsDTO;
import br.com.barbershop.api.dto.CreateAppointmentDTO;
import br.com.barbershop.api.dto.RescheduleDTO;
import br.com.barbershop.api.model.AppointmentStatus;
import br.com.barbershop.api.service.AppointmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AppointmentController.class,
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthFilter.class)
        }
)
@AutoConfigureMockMvc(addFilters = false)
class AppointmentControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    @Test
    void createAppointmentReturns201WhenPayloadIsValid() throws Exception {
        CreateAppointmentDTO request = new CreateAppointmentDTO();
        request.setClientId(1L);
        request.setBarbershopId(2L);
        request.setBarberId(3L);
        request.setServiceId(4L);
        request.setDate(LocalDate.of(2026, 4, 10));
        request.setTime(LocalTime.of(14, 30));

        when(appointmentService.create(any(CreateAppointmentDTO.class))).thenReturn(buildAppointmentDTO(AppointmentStatus.PENDING));

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(99))
                .andExpect(jsonPath("$.clientId").value(1))
                .andExpect(jsonPath("$.barbershopId").value(2))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createAppointmentReturns400WhenBusinessRuleFails() throws Exception {
        CreateAppointmentDTO request = new CreateAppointmentDTO();
        request.setClientId(1L);
        request.setBarbershopId(2L);
        request.setBarberId(3L);
        request.setServiceId(4L);
        request.setDate(LocalDate.of(2026, 4, 10));
        request.setTime(LocalTime.of(14, 30));

        when(appointmentService.create(any(CreateAppointmentDTO.class))).thenThrow(new RuntimeException("Horário indisponível"));

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Horário indisponível"));
    }

    @Test
    void getClientAppointmentsReturns200AndWrappedList() throws Exception {
        when(appointmentService.findByClientId(1L)).thenReturn(List.of(buildAppointmentDTO(AppointmentStatus.CONFIRMED)));

        mockMvc.perform(get("/api/appointments/client/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointments.length()").value(1))
                .andExpect(jsonPath("$.appointments[0].id").value(99))
                .andExpect(jsonPath("$.appointments[0].status").value("CONFIRMED"));
    }

    @Test
    void getBarbershopAppointmentsReturns200AndWrappedList() throws Exception {
        when(appointmentService.findByBarbershopId(2L)).thenReturn(List.of(buildAppointmentDTO(AppointmentStatus.PENDING)));

        mockMvc.perform(get("/api/appointments/barbershop/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointments.length()").value(1))
                .andExpect(jsonPath("$.appointments[0].barbershopId").value(2))
                .andExpect(jsonPath("$.appointments[0].status").value("PENDING"));
    }

    @Test
    void getAppointmentByIdReturns404WhenAppointmentDoesNotExist() throws Exception {
        when(appointmentService.findById(999L)).thenThrow(new RuntimeException("Agendamento não encontrado"));

        mockMvc.perform(get("/api/appointments/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Agendamento não encontrado"));
    }

    @Test
    void rescheduleAppointmentReturns200WithUpdatedAppointment() throws Exception {
        RescheduleDTO request = new RescheduleDTO();
        request.setDate(LocalDate.of(2026, 4, 12));
        request.setTime(LocalTime.of(16, 0));

        AppointmentDTO updated = buildAppointmentDTO(AppointmentStatus.CONFIRMED);
        updated.setDate(LocalDate.of(2026, 4, 12));
        updated.setTime(LocalTime.of(16, 0));

        when(appointmentService.reschedule(any(Long.class), any(RescheduleDTO.class))).thenReturn(updated);

        mockMvc.perform(put("/api/appointments/99/reschedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Agendamento reagendado com sucesso"))
                .andExpect(jsonPath("$.appointment.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.appointment.date[0]").value(2026))
                .andExpect(jsonPath("$.appointment.date[1]").value(4))
                .andExpect(jsonPath("$.appointment.date[2]").value(12))
                .andExpect(jsonPath("$.appointment.time[0]").value(16))
                .andExpect(jsonPath("$.appointment.time[1]").value(0));
    }

    @Test
    void rescheduleAppointmentReturns400WhenRequestedSlotConflicts() throws Exception {
        RescheduleDTO request = new RescheduleDTO();
        request.setDate(LocalDate.of(2026, 4, 12));
        request.setTime(LocalTime.of(16, 0));

        when(appointmentService.reschedule(any(Long.class), any(RescheduleDTO.class)))
                .thenThrow(new IllegalStateException("Horario indisponivel para o barbeiro selecionado"));

        mockMvc.perform(put("/api/appointments/99/reschedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Horario indisponivel para o barbeiro selecionado"));
    }

    @Test
    void cancelAppointmentReturns200WithCancelledStatus() throws Exception {
        when(appointmentService.cancel(99L)).thenReturn(buildAppointmentDTO(AppointmentStatus.CANCELLED));

        mockMvc.perform(put("/api/appointments/99/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Agendamento cancelado com sucesso"))
                .andExpect(jsonPath("$.appointment.status").value("CANCELLED"));
    }

    @Test
    void confirmAppointmentReturns200WithConfirmedStatus() throws Exception {
        when(appointmentService.confirm(99L)).thenReturn(buildAppointmentDTO(AppointmentStatus.CONFIRMED));

        mockMvc.perform(put("/api/appointments/99/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Agendamento confirmado"))
                .andExpect(jsonPath("$.appointment.status").value("CONFIRMED"));
    }

    @Test
    void completeAppointmentReturns200WithCompletedStatus() throws Exception {
        when(appointmentService.complete(99L)).thenReturn(buildAppointmentDTO(AppointmentStatus.COMPLETED));

        mockMvc.perform(put("/api/appointments/99/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Agendamento marcado como concluído"))
                .andExpect(jsonPath("$.appointment.status").value("COMPLETED"));
    }

    @Test
    void getAvailableSlotsReturns200WithAvailableTimes() throws Exception {
        AvailableSlotsDTO slots = new AvailableSlotsDTO(
                LocalDate.of(2026, 4, 15),
                List.of("08:00", "10:00", "10:30")
        );

        when(appointmentService.findAvailableSlots(2L, LocalDate.of(2026, 4, 15))).thenReturn(slots);

        mockMvc.perform(get("/api/appointments/available-slots")
                        .param("barbershopId", "2")
                        .param("date", "2026-04-15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.date[0]").value(2026))
                .andExpect(jsonPath("$.date[1]").value(4))
                .andExpect(jsonPath("$.date[2]").value(15))
                .andExpect(jsonPath("$.availableSlots.length()").value(3))
                .andExpect(jsonPath("$.availableSlots[0]").value("08:00"))
                .andExpect(jsonPath("$.availableSlots[1]").value("10:00"))
                .andExpect(jsonPath("$.availableSlots[2]").value("10:30"));
    }

    private AppointmentDTO buildAppointmentDTO(AppointmentStatus status) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(99L);
        dto.setClientId(1L);
        dto.setClientName("João");
        dto.setBarbershopId(2L);
        dto.setBarbershopName("Barber Hub");
        dto.setBarbershopAddress("Rua A");
        dto.setBarbershopPhone("11999999999");
        dto.setBarberId(3L);
        dto.setBarberName("Carlos");
        dto.setServiceId(4L);
        dto.setService("Corte");
        dto.setDate(LocalDate.of(2026, 4, 10));
        dto.setTime(LocalTime.of(14, 30));
        dto.setDuration(30);
        dto.setPrice(new BigDecimal("45.00"));
        dto.setStatus(status);
        return dto;
    }
}
