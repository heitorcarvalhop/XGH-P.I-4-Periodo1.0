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
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class AppointmentService {

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
        br.com.barbershop.api.model.Service service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));

        LocalDateTime startTime = LocalDateTime.of(dto.getDate(), dto.getTime());
        LocalDateTime endTime = startTime.plusMinutes(service.getDuration());

        Appointment newAppointment = new Appointment();
        newAppointment.setClient(client);
        newAppointment.setBarber(barber);
        newAppointment.setBarbershop(barbershop);
        newAppointment.setService(service);
        newAppointment.setStartTime(startTime);
        newAppointment.setEndTime(endTime);
        newAppointment.setStatus(AppointmentStatus.PENDING);
        newAppointment.setPrice(service.getPrice());

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
        LocalDateTime newEndTime = newStartTime.plusMinutes(appointment.getService().getDuration());

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
        Barbershop barbershop = barbershopRepository.findById(barbershopId)
                .orElseThrow(() -> new RuntimeException("Barbearia não encontrada com o ID: " + barbershopId));

        LocalTime openingTime = LocalTime.of(8, 0);
        LocalTime closingTime = LocalTime.of(18, 0);
        int slotIntervalMinutes = 30;

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Appointment> existingAppointments = appointmentRepository
                .findByBarbershopIdAndStartTimeBetweenAndStatusIn(
                        barbershopId,
                        startOfDay,
                        endOfDay,
                        List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)
                );

        Set<LocalTime> occupiedSlots = existingAppointments.stream()
                .map(appointment -> appointment.getStartTime().toLocalTime())
                .collect(Collectors.toSet());

        List<String> availableSlots = new ArrayList<>();
        LocalTime currentTimeSlot = openingTime;
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        while (currentTimeSlot.isBefore(closingTime)) {
            if (!occupiedSlots.contains(currentTimeSlot)) {
                availableSlots.add(currentTimeSlot.format(timeFormatter));
            }
            currentTimeSlot = currentTimeSlot.plusMinutes(slotIntervalMinutes);
        }

        return new AvailableSlotsDTO(date, availableSlots);
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
        dto.setServiceId(appointment.getService().getId());
        dto.setService(appointment.getService().getName());
        dto.setDate(appointment.getStartTime().toLocalDate());
        dto.setTime(appointment.getStartTime().toLocalTime());
        dto.setDuration(appointment.getService().getDuration());
        dto.setPrice(appointment.getPrice());
        dto.setStatus(appointment.getStatus());
        return dto;
    }
}