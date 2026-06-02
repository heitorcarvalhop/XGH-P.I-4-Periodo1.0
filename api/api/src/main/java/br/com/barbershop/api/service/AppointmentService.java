package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.AppointmentDTO;
import br.com.barbershop.api.dto.AvailableSlotsDTO;
import br.com.barbershop.api.dto.CreateAppointmentDTO;
import br.com.barbershop.api.dto.RescheduleDTO;
import br.com.barbershop.api.model.*;
import br.com.barbershop.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class AppointmentService {

    private static final List<AppointmentStatus> ACTIVE_STATUSES = List.of(
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED
    );

    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private BarberRepository barberRepository;
    @Autowired
    private BarbershopRepository barbershopRepository;
    @Autowired
    private ServiceRepository serviceRepository;

    public AppointmentDTO create(CreateAppointmentDTO dto) {
        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        Barber barber = barberRepository.findById(dto.getBarberId())
                .orElseThrow(() -> new RuntimeException("Barbeiro não encontrado"));
        Barbershop barbershop = barbershopRepository.findById(dto.getBarbershopId())
                .orElseThrow(() -> new RuntimeException("Barbearia não encontrada"));
        List<br.com.barbershop.api.model.Service> services = resolveServices(dto);
        validateBarberBelongsToBarbershop(barber, barbershop);
        validateServicesBelongToBarbershop(services, barbershop);
        br.com.barbershop.api.model.Service primaryService = services.get(0);
        int totalDuration = calculateTotalDuration(services);
        BigDecimal totalPrice = calculateTotalPrice(services);

        LocalDateTime startTime = LocalDateTime.of(dto.getDate(), dto.getTime());
        LocalDateTime endTime = startTime.plusMinutes(totalDuration);
        validateSlotAvailability(barber.getId(), startTime, endTime, null);

        Appointment newAppointment = new Appointment();
        newAppointment.setClient(client);
        newAppointment.setBarber(barber);
        newAppointment.setBarbershop(barbershop);
        newAppointment.setService(primaryService);
        newAppointment.setServices(services);
        newAppointment.setStartTime(startTime);
        newAppointment.setEndTime(endTime);
        newAppointment.setStatus(AppointmentStatus.PENDING);
        newAppointment.setPrice(totalPrice);

        Appointment savedAppointment = appointmentRepository.save(newAppointment);

        return mapToAppointmentDTO(savedAppointment);
    }

    public List<AppointmentDTO> findByClientId(Long clientId) {
        return appointmentRepository.findByClientId(clientId)
                .stream()
                .map(this::mapToAppointmentDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> findByBarbershopId(Long barbershopId) {
        if (!barbershopRepository.existsById(barbershopId)) {
            throw new RuntimeException("Barbearia não encontrada com o ID: " + barbershopId);
        }
        return appointmentRepository.findByBarbershopId(barbershopId)
                .stream()
                .map(this::mapToAppointmentDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO findById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + id));
        return mapToAppointmentDTO(appointment);
    }

    public AppointmentDTO reschedule(Long id, RescheduleDTO dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + id));

        LocalDateTime newStartTime = LocalDateTime.of(dto.getDate(), dto.getTime());
        LocalDateTime newEndTime = newStartTime.plusMinutes(calculateTotalDuration(getAppointmentServices(appointment)));
        validateSlotAvailability(appointment.getBarber().getId(), newStartTime, newEndTime, appointment.getId());

        appointment.setStartTime(newStartTime);
        appointment.setEndTime(newEndTime);
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentDTO(updatedAppointment);
    }

    public AppointmentDTO cancel(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + id));

        appointment.setStatus(AppointmentStatus.CANCELLED);

        Appointment cancelledAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentDTO(cancelledAppointment);
    }

    public AppointmentDTO confirm(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + id));

        appointment.setStatus(AppointmentStatus.CONFIRMED);

        Appointment confirmedAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentDTO(confirmedAppointment);
    }

    public AppointmentDTO complete(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + id));

        appointment.setStatus(AppointmentStatus.COMPLETED);

        Appointment completedAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentDTO(completedAppointment);
    }

    public AvailableSlotsDTO findAvailableSlots(Long barbershopId, LocalDate date) {
        return findAvailableSlots(barbershopId, date, 30);
    }

    public AvailableSlotsDTO findAvailableSlots(Long barbershopId, LocalDate date, Integer duration) {
        return findAvailableSlots(barbershopId, null, date, duration);
    }

    public AvailableSlotsDTO findAvailableSlots(Long barbershopId, Long barberId, LocalDate date, Integer duration) {
        Barbershop barbershop = barbershopRepository.findById(barbershopId)
                .orElseThrow(() -> new RuntimeException("Barbearia não encontrada com o ID: " + barbershopId));

        LocalTime openingTime = LocalTime.of(8, 0);
        LocalTime closingTime = LocalTime.of(18, 0);
        int slotIntervalMinutes = 30;
        int appointmentDuration = duration != null && duration > 0 ? duration : slotIntervalMinutes;

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Appointment> existingAppointments = barberId == null
                ? appointmentRepository.findByBarbershopIdAndStartTimeBetweenAndStatusIn(
                        barbershopId, startOfDay, endOfDay, ACTIVE_STATUSES)
                : appointmentRepository.findByBarberIdAndStartTimeBetweenAndStatusIn(
                        barberId, startOfDay, endOfDay, ACTIVE_STATUSES);

        List<String> availableSlots = new ArrayList<>();
        LocalTime currentTimeSlot = openingTime;
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        while (currentTimeSlot.isBefore(closingTime)) {
            LocalDateTime slotStart = date.atTime(currentTimeSlot);
            LocalDateTime slotEnd = slotStart.plusMinutes(appointmentDuration);

            if (!slotEnd.toLocalTime().isAfter(closingTime)
                    && !hasSlotConflict(existingAppointments, slotStart, slotEnd)) {
                availableSlots.add(currentTimeSlot.format(timeFormatter));
            }
            currentTimeSlot = currentTimeSlot.plusMinutes(slotIntervalMinutes);
        }

        return new AvailableSlotsDTO(date, availableSlots);
    }

    private List<br.com.barbershop.api.model.Service> resolveServices(CreateAppointmentDTO dto) {
        List<Long> requestedIds = dto.getServiceIds();
        if (requestedIds == null || requestedIds.isEmpty()) {
            if (dto.getServiceId() == null) {
                throw new RuntimeException("Selecione pelo menos um servico");
            }
            requestedIds = List.of(dto.getServiceId());
        }

        if (requestedIds.stream().anyMatch(java.util.Objects::isNull)) {
            throw new RuntimeException("Selecione pelo menos um servico");
        }

        return new LinkedHashSet<>(requestedIds).stream()
                .map(id -> serviceRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Servico nao encontrado: id=" + id)))
                .toList();
    }

    private void validateBarberBelongsToBarbershop(Barber barber, Barbershop barbershop) {
        if (barber.getBarbershop() == null || !barber.getBarbershop().getId().equals(barbershop.getId())) {
            throw new RuntimeException("Barbeiro não pertence à barbearia selecionada");
        }
    }

    private void validateServicesBelongToBarbershop(
            List<br.com.barbershop.api.model.Service> services,
            Barbershop barbershop
    ) {
        boolean hasInvalidService = services.stream()
                .anyMatch(service -> service.getBarbershop() != null
                        && !service.getBarbershop().getId().equals(barbershop.getId()));
        if (hasInvalidService) {
            throw new RuntimeException("Servico nao pertence a barbearia selecionada");
        }
    }

    private List<br.com.barbershop.api.model.Service> getAppointmentServices(Appointment appointment) {
        return appointment.getServices() == null || appointment.getServices().isEmpty()
                ? List.of(appointment.getService())
                : appointment.getServices();
    }

    private int calculateTotalDuration(List<br.com.barbershop.api.model.Service> services) {
        return services.stream()
                .mapToInt(service -> service.getDuration() == null ? 0 : service.getDuration())
                .sum();
    }

    private BigDecimal calculateTotalPrice(List<br.com.barbershop.api.model.Service> services) {
        return services.stream()
                .map(service -> service.getPrice() == null ? BigDecimal.ZERO : service.getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean hasSlotConflict(
            List<Appointment> existingAppointments,
            LocalDateTime slotStart,
            LocalDateTime slotEnd
    ) {
        return existingAppointments.stream()
                .anyMatch(appointment ->
                        appointment.getStartTime().isBefore(slotEnd)
                                && appointment.getEndTime().isAfter(slotStart)
                );
    }

    private void validateSlotAvailability(
            Long barberId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Long excludedAppointmentId
    ) {
        boolean hasConflict = excludedAppointmentId == null
                ? appointmentRepository.existsByBarberIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        barberId,
                        ACTIVE_STATUSES,
                        endTime,
                        startTime
                )
                : appointmentRepository.existsByBarberIdAndIdNotAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        barberId,
                        excludedAppointmentId,
                        ACTIVE_STATUSES,
                        endTime,
                        startTime
                );

        if (hasConflict) {
            throw new IllegalStateException("Horario indisponivel para o barbeiro selecionado");
        }
    }


    private AppointmentDTO mapToAppointmentDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setClientId(appointment.getClient().getId());
        dto.setClientName(appointment.getClient().getName());
        dto.setBarbershopId(appointment.getBarbershop().getId());
        dto.setBarbershopName(appointment.getBarbershop().getName());
        dto.setBarbershopAddress(appointment.getBarbershop().getAddress());
        dto.setBarbershopPhone(appointment.getBarbershop().getPhone());
        dto.setBarberId(appointment.getBarber().getId());
        dto.setBarberName(appointment.getBarber().getName());
        List<br.com.barbershop.api.model.Service> services = getAppointmentServices(appointment);
        dto.setServiceId(appointment.getService().getId());
        dto.setService(services.stream().map(br.com.barbershop.api.model.Service::getName).collect(Collectors.joining(" + ")));
        dto.setServiceIds(services.stream().map(br.com.barbershop.api.model.Service::getId).toList());
        dto.setServices(services.stream().map(br.com.barbershop.api.model.Service::getName).toList());
        dto.setDate(appointment.getStartTime().toLocalDate());
        dto.setTime(appointment.getStartTime().toLocalTime());
        dto.setDuration(calculateTotalDuration(services));
        dto.setPrice(appointment.getPrice());
        dto.setStatus(appointment.getStatus());
        return dto;
    }
}
