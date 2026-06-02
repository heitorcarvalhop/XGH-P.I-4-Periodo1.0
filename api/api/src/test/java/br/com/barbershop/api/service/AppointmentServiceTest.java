package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.AppointmentDTO;
import br.com.barbershop.api.dto.AvailableSlotsDTO;
import br.com.barbershop.api.dto.CreateAppointmentDTO;
import br.com.barbershop.api.dto.RescheduleDTO;
import br.com.barbershop.api.model.Appointment;
import br.com.barbershop.api.model.AppointmentStatus;
import br.com.barbershop.api.model.Barber;
import br.com.barbershop.api.model.Barbershop;
import br.com.barbershop.api.model.Client;
import br.com.barbershop.api.repository.AppointmentRepository;
import br.com.barbershop.api.repository.BarberRepository;
import br.com.barbershop.api.repository.BarbershopRepository;
import br.com.barbershop.api.repository.ClientRepository;
import br.com.barbershop.api.repository.ServiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private BarberRepository barberRepository;
    @Mock
    private BarbershopRepository barbershopRepository;
    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private AppointmentService appointmentService;

    @BeforeEach
    void setUpClock() {
        appointmentService.setClock(Clock.fixed(
                Instant.parse("2026-04-01T13:15:00Z"),
                ZoneId.of("America/Sao_Paulo")
        ));
    }

    @Test
    void createBuildsPendingAppointmentWithCalculatedEndTime() {
        CreateAppointmentDTO dto = new CreateAppointmentDTO();
        dto.setClientId(1L);
        dto.setBarberId(2L);
        dto.setBarbershopId(3L);
        dto.setServiceId(4L);
        dto.setDate(LocalDate.of(2026, 4, 10));
        dto.setTime(LocalTime.of(14, 30));

        Client client = new Client();
        client.setId(1L);
        client.setName("Joao");

        Barber barber = new Barber();
        barber.setId(2L);
        barber.setName("Carlos");

        Barbershop shop = new Barbershop();
        shop.setId(3L);
        shop.setName("Barber Hub");
        shop.setAddress("Rua A");
        shop.setPhone("11999999999");
        barber.setBarbershop(shop);

        br.com.barbershop.api.model.Service service = new br.com.barbershop.api.model.Service();
        service.setId(4L);
        service.setName("Corte");
        service.setDuration(30);
        service.setPrice(new BigDecimal("45.00"));

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(barberRepository.findById(2L)).thenReturn(Optional.of(barber));
        when(barbershopRepository.findById(3L)).thenReturn(Optional.of(shop));
        when(serviceRepository.findById(4L)).thenReturn(Optional.of(service));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> {
            Appointment saved = invocation.getArgument(0);
            saved.setId(99L);
            return saved;
        });

        AppointmentDTO response = appointmentService.create(dto);

        ArgumentCaptor<Appointment> appointmentCaptor = ArgumentCaptor.forClass(Appointment.class);
        verify(appointmentRepository).save(appointmentCaptor.capture());

        Appointment savedAppointment = appointmentCaptor.getValue();
        assertThat(savedAppointment.getStatus()).isEqualTo(AppointmentStatus.PENDING);
        assertThat(savedAppointment.getStartTime()).isEqualTo(LocalDateTime.of(2026, 4, 10, 14, 30));
        assertThat(savedAppointment.getEndTime()).isEqualTo(LocalDateTime.of(2026, 4, 10, 15, 0));
        assertThat(savedAppointment.getPrice()).isEqualByComparingTo("45.00");

        assertThat(response.getId()).isEqualTo(99L);
        assertThat(response.getClientId()).isEqualTo(1L);
        assertThat(response.getBarberId()).isEqualTo(2L);
        assertThat(response.getBarbershopId()).isEqualTo(3L);
        assertThat(response.getServiceId()).isEqualTo(4L);
        assertThat(response.getStatus()).isEqualTo(AppointmentStatus.PENDING);
    }

    @Test
    void createCombinesSelectedServicesDurationAndPrice() {
        CreateAppointmentDTO dto = new CreateAppointmentDTO();
        dto.setClientId(1L);
        dto.setBarberId(2L);
        dto.setBarbershopId(3L);
        dto.setServiceIds(List.of(4L, 5L));
        dto.setDate(LocalDate.of(2026, 4, 10));
        dto.setTime(LocalTime.of(14, 30));

        Client client = new Client();
        client.setId(1L);
        client.setName("Joao");

        Barber barber = new Barber();
        barber.setId(2L);
        barber.setName("Carlos");

        Barbershop shop = new Barbershop();
        shop.setId(3L);
        shop.setName("Barber Hub");
        shop.setAddress("Rua A");
        shop.setPhone("11999999999");
        barber.setBarbershop(shop);

        br.com.barbershop.api.model.Service haircut = new br.com.barbershop.api.model.Service();
        haircut.setId(4L);
        haircut.setName("Corte");
        haircut.setDuration(30);
        haircut.setPrice(new BigDecimal("30.00"));
        haircut.setBarbershop(shop);

        br.com.barbershop.api.model.Service beard = new br.com.barbershop.api.model.Service();
        beard.setId(5L);
        beard.setName("Barba");
        beard.setDuration(20);
        beard.setPrice(new BigDecimal("22.00"));
        beard.setBarbershop(shop);

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(barberRepository.findById(2L)).thenReturn(Optional.of(barber));
        when(barbershopRepository.findById(3L)).thenReturn(Optional.of(shop));
        when(serviceRepository.findById(4L)).thenReturn(Optional.of(haircut));
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(beard));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> {
            Appointment saved = invocation.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        AppointmentDTO response = appointmentService.create(dto);

        ArgumentCaptor<Appointment> appointmentCaptor = ArgumentCaptor.forClass(Appointment.class);
        verify(appointmentRepository).save(appointmentCaptor.capture());
        Appointment savedAppointment = appointmentCaptor.getValue();

        assertThat(savedAppointment.getServices()).containsExactly(haircut, beard);
        assertThat(savedAppointment.getEndTime()).isEqualTo(LocalDateTime.of(2026, 4, 10, 15, 20));
        assertThat(savedAppointment.getPrice()).isEqualByComparingTo("52.00");
        assertThat(response.getService()).isEqualTo("Corte + Barba");
        assertThat(response.getServiceIds()).containsExactly(4L, 5L);
        assertThat(response.getDuration()).isEqualTo(50);
        assertThat(response.getPrice()).isEqualByComparingTo("52.00");
    }

    @Test
    void createRejectsOverlappingAppointmentForSameBarber() {
        CreateAppointmentDTO dto = new CreateAppointmentDTO();
        dto.setClientId(1L);
        dto.setBarberId(2L);
        dto.setBarbershopId(3L);
        dto.setServiceId(4L);
        dto.setDate(LocalDate.of(2026, 4, 10));
        dto.setTime(LocalTime.of(14, 30));

        Client client = new Client();
        client.setId(1L);

        Barber barber = new Barber();
        barber.setId(2L);

        Barbershop shop = new Barbershop();
        shop.setId(3L);
        barber.setBarbershop(shop);

        br.com.barbershop.api.model.Service service = new br.com.barbershop.api.model.Service();
        service.setId(4L);
        service.setDuration(30);

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(barberRepository.findById(2L)).thenReturn(Optional.of(barber));
        when(barbershopRepository.findById(3L)).thenReturn(Optional.of(shop));
        when(serviceRepository.findById(4L)).thenReturn(Optional.of(service));
        when(appointmentRepository.existsByBarberIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                eq(2L),
                eq(List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)),
                eq(LocalDateTime.of(2026, 4, 10, 15, 0)),
                eq(LocalDateTime.of(2026, 4, 10, 14, 30))
        )).thenReturn(true);

        assertThatThrownBy(() -> appointmentService.create(dto))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Horario indisponivel para o barbeiro selecionado");

        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    void createRejectsAppointmentInThePast() {
        CreateAppointmentDTO dto = new CreateAppointmentDTO();
        dto.setClientId(1L);
        dto.setBarberId(2L);
        dto.setBarbershopId(3L);
        dto.setServiceId(4L);
        dto.setDate(LocalDate.of(2026, 4, 1));
        dto.setTime(LocalTime.of(9, 30));

        Client client = new Client();
        client.setId(1L);

        Barber barber = new Barber();
        barber.setId(2L);

        Barbershop shop = new Barbershop();
        shop.setId(3L);
        barber.setBarbershop(shop);

        br.com.barbershop.api.model.Service service = new br.com.barbershop.api.model.Service();
        service.setId(4L);
        service.setDuration(30);

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(barberRepository.findById(2L)).thenReturn(Optional.of(barber));
        when(barbershopRepository.findById(3L)).thenReturn(Optional.of(shop));
        when(serviceRepository.findById(4L)).thenReturn(Optional.of(service));

        assertThatThrownBy(() -> appointmentService.create(dto))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Nao e possivel agendar um horario que ja passou");

        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    void rescheduleUpdatesDateTimeAndMarksAppointmentConfirmed() {
        Appointment appointment = buildAppointment();
        appointment.setId(7L);

        RescheduleDTO dto = new RescheduleDTO();
        dto.setDate(LocalDate.of(2026, 4, 12));
        dto.setTime(LocalTime.of(16, 0));

        when(appointmentRepository.findById(7L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppointmentDTO response = appointmentService.reschedule(7L, dto);

        assertThat(response.getDate()).isEqualTo(LocalDate.of(2026, 4, 12));
        assertThat(response.getTime()).isEqualTo(LocalTime.of(16, 0));
        assertThat(response.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
        assertThat(appointment.getEndTime()).isEqualTo(LocalDateTime.of(2026, 4, 12, 16, 30));
    }

    @Test
    void rescheduleRejectsOverlappingAppointmentForSameBarber() {
        Appointment appointment = buildAppointment();
        appointment.setId(7L);

        RescheduleDTO dto = new RescheduleDTO();
        dto.setDate(LocalDate.of(2026, 4, 12));
        dto.setTime(LocalTime.of(16, 0));

        when(appointmentRepository.findById(7L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.existsByBarberIdAndIdNotAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                eq(2L),
                eq(7L),
                eq(List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)),
                eq(LocalDateTime.of(2026, 4, 12, 16, 30)),
                eq(LocalDateTime.of(2026, 4, 12, 16, 0))
        )).thenReturn(true);

        assertThatThrownBy(() -> appointmentService.reschedule(7L, dto))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Horario indisponivel para o barbeiro selecionado");

        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    void cancelConfirmAndCompleteUpdateAppointmentStatus() {
        Appointment appointment = buildAppointment();
        appointment.setId(8L);

        when(appointmentRepository.findById(8L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppointmentDTO cancelled = appointmentService.cancel(8L);
        assertThat(cancelled.getStatus()).isEqualTo(AppointmentStatus.CANCELLED);

        AppointmentDTO confirmed = appointmentService.confirm(8L);
        assertThat(confirmed.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);

        AppointmentDTO completed = appointmentService.complete(8L);
        assertThat(completed.getStatus()).isEqualTo(AppointmentStatus.COMPLETED);
    }

    @Test
    void findAvailableSlotsSkipsPendingAndConfirmedTimes() {
        LocalDate date = LocalDate.of(2026, 4, 15);

        Appointment pendingAtNine = buildAppointment();
        pendingAtNine.setStartTime(LocalDateTime.of(date, LocalTime.of(9, 0)));
        pendingAtNine.setEndTime(LocalDateTime.of(date, LocalTime.of(9, 30)));
        pendingAtNine.setStatus(AppointmentStatus.PENDING);

        Appointment confirmedAtTenThirty = buildAppointment();
        confirmedAtTenThirty.setStartTime(LocalDateTime.of(date, LocalTime.of(10, 30)));
        confirmedAtTenThirty.setEndTime(LocalDateTime.of(date, LocalTime.of(11, 0)));
        confirmedAtTenThirty.setStatus(AppointmentStatus.CONFIRMED);

        Barbershop shop = new Barbershop();
        shop.setId(3L);
        shop.setName("Barber Hub");

        when(barbershopRepository.findById(3L)).thenReturn(Optional.of(shop));
        when(appointmentRepository.findByBarbershopIdAndStartTimeBetweenAndStatusIn(
                eq(3L),
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                eq(List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED))
        )).thenReturn(List.of(pendingAtNine, confirmedAtTenThirty));

        AvailableSlotsDTO response = appointmentService.findAvailableSlots(3L, date);

        assertThat(response.getDate()).isEqualTo(date);
        assertThat(response.getAvailableSlots()).doesNotContain("09:00", "10:30");
        assertThat(response.getAvailableSlots()).contains("08:00", "09:30", "11:00", "17:30");
    }

    @Test
    void findAvailableSlotsBlocksIntermediateSlotsForLongAppointments() {
        LocalDate date = LocalDate.of(2026, 4, 15);

        Appointment oneHourAppointment = buildAppointment();
        oneHourAppointment.setStartTime(LocalDateTime.of(date, LocalTime.of(9, 0)));
        oneHourAppointment.setEndTime(LocalDateTime.of(date, LocalTime.of(10, 0)));
        oneHourAppointment.setStatus(AppointmentStatus.CONFIRMED);

        Barbershop shop = new Barbershop();
        shop.setId(3L);
        shop.setName("Barber Hub");

        when(barbershopRepository.findById(3L)).thenReturn(Optional.of(shop));
        when(appointmentRepository.findByBarbershopIdAndStartTimeBetweenAndStatusIn(
                eq(3L),
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                eq(List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED))
        )).thenReturn(List.of(oneHourAppointment));

        AvailableSlotsDTO response = appointmentService.findAvailableSlots(3L, date);

        assertThat(response.getAvailableSlots()).doesNotContain("09:00", "09:30");
        assertThat(response.getAvailableSlots()).contains("08:30", "10:00", "10:30");
    }

    @Test
    void findAvailableSlotsSkipsTimesThatAlreadyPassedToday() {
        LocalDate date = LocalDate.of(2026, 4, 1);

        Barbershop shop = new Barbershop();
        shop.setId(3L);

        when(barbershopRepository.findById(3L)).thenReturn(Optional.of(shop));
        when(appointmentRepository.findByBarbershopIdAndStartTimeBetweenAndStatusIn(
                eq(3L),
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                eq(List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED))
        )).thenReturn(List.of());

        AvailableSlotsDTO response = appointmentService.findAvailableSlots(3L, date);

        assertThat(response.getAvailableSlots()).doesNotContain("08:00", "09:30", "10:00");
        assertThat(response.getAvailableSlots()).contains("10:30", "17:30");
    }

    private Appointment buildAppointment() {
        Client client = new Client();
        client.setId(1L);
        client.setName("Joao");

        Barber barber = new Barber();
        barber.setId(2L);
        barber.setName("Carlos");

        Barbershop shop = new Barbershop();
        shop.setId(3L);
        shop.setName("Barber Hub");
        shop.setAddress("Rua A");
        shop.setPhone("11999999999");

        br.com.barbershop.api.model.Service service = new br.com.barbershop.api.model.Service();
        service.setId(4L);
        service.setName("Corte");
        service.setDuration(30);
        service.setPrice(new BigDecimal("45.00"));

        Appointment appointment = new Appointment();
        appointment.setClient(client);
        appointment.setBarber(barber);
        appointment.setBarbershop(shop);
        appointment.setService(service);
        appointment.setStartTime(LocalDateTime.of(2026, 4, 10, 14, 30));
        appointment.setEndTime(LocalDateTime.of(2026, 4, 10, 15, 0));
        appointment.setPrice(new BigDecimal("45.00"));
        appointment.setStatus(AppointmentStatus.PENDING);
        return appointment;
    }
}
