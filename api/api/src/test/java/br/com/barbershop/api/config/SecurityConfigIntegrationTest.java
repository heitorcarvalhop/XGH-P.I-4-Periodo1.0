package br.com.barbershop.api.config;

import br.com.barbershop.api.dto.AppointmentDTO;
import br.com.barbershop.api.dto.BarbershopListDTO;
import br.com.barbershop.api.model.AppointmentStatus;
import br.com.barbershop.api.service.AppointmentService;
import br.com.barbershop.api.service.BarbershopService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BarbershopService barbershopService;

    @MockBean
    private AppointmentService appointmentService;

    @Test
    void publicBarbershopEndpointAllowsAnonymousAccess() throws Exception {
        BarbershopListDTO shop = new BarbershopListDTO();
        shop.setId(1L);
        shop.setName("Barber Hub");
        shop.setPrice(new BigDecimal("45.00"));

        when(barbershopService.findAll()).thenReturn(List.of(shop));

        mockMvc.perform(get("/api/barbershops"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.barbershops.length()").value(1))
                .andExpect(jsonPath("$.barbershops[0].name").value("Barber Hub"));
    }

    @Test
    void protectedAppointmentsEndpointRejectsAnonymousAccess() throws Exception {
        mockMvc.perform(get("/api/appointments/client/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "cliente@email.com", roles = "CLIENT")
    void protectedAppointmentsEndpointAllowsAuthenticatedAccess() throws Exception {
        AppointmentDTO appointment = new AppointmentDTO();
        appointment.setId(77L);
        appointment.setClientId(1L);
        appointment.setClientName("João");
        appointment.setBarbershopId(2L);
        appointment.setBarbershopName("Barber Hub");
        appointment.setBarberId(3L);
        appointment.setBarberName("Carlos");
        appointment.setServiceId(4L);
        appointment.setService("Corte");
        appointment.setDate(LocalDate.of(2026, 4, 15));
        appointment.setTime(LocalTime.of(15, 0));
        appointment.setDuration(30);
        appointment.setPrice(new BigDecimal("45.00"));
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        when(appointmentService.findByClientId(1L)).thenReturn(List.of(appointment));

        mockMvc.perform(get("/api/appointments/client/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointments.length()").value(1))
                .andExpect(jsonPath("$.appointments[0].id").value(77))
                .andExpect(jsonPath("$.appointments[0].status").value("CONFIRMED"));
    }
}
