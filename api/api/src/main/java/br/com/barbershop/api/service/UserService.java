package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.UserResponseDTO;
import br.com.barbershop.api.dto.UserUpdateDTO;
import br.com.barbershop.api.model.Appointment;
import br.com.barbershop.api.model.Barber;
import br.com.barbershop.api.model.Client;
import br.com.barbershop.api.repository.AppointmentRepository;
import br.com.barbershop.api.repository.BarberRepository;
import br.com.barbershop.api.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private BarberRepository barberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<UserResponseDTO> findAllUsers() {
        List<UserResponseDTO> clients = clientRepository.findAll()
                .stream()
                .map(this::mapClientToUserResponseDTO)
                .toList();

        List<UserResponseDTO> barbers = barberRepository.findAll()
                .stream()
                .map(this::mapBarberToUserResponseDTO)
                .toList();

        List<UserResponseDTO> combined = new ArrayList<>();
        combined.addAll(clients);
        combined.addAll(barbers);

        return combined;
    }

    public UserResponseDTO findUserById(Long id, String userType) {
        if ("CLIENT".equalsIgnoreCase(userType)) {
            Client client = clientRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado com ID: " + id));
            return mapClientToUserResponseDTO(client);
        } else if ("BARBER".equalsIgnoreCase(userType)) {
            Barber barber = barberRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Barbeiro não encontrado com ID: " + id));
            return mapBarberToUserResponseDTO(barber);
        } else {
            throw new RuntimeException("Tipo de usuário inválido: " + userType);
        }
    }

    public UserResponseDTO updateUser(Long id, String userType, UserUpdateDTO dto) {
        if ("CLIENT".equalsIgnoreCase(userType)) {
            Client client = clientRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado com ID: " + id));

            if (dto.getName() != null) client.setName(dto.getName());
            if (dto.getEmail() != null) client.setEmail(dto.getEmail());

            if (dto.getNewPassword() != null && !dto.getNewPassword().isBlank()) {
                if (dto.getCurrentPassword() == null || dto.getCurrentPassword().isBlank()) {
                    throw new RuntimeException("Senha atual é obrigatória para definir uma nova senha");
                }
                if (!passwordEncoder.matches(dto.getCurrentPassword(), client.getPassword())) {
                    throw new RuntimeException("Senha atual incorreta");
                }
                client.setPassword(passwordEncoder.encode(dto.getNewPassword()));
            }

            Client updated = clientRepository.save(client);
            return mapClientToUserResponseDTO(updated);

        } else if ("BARBER".equalsIgnoreCase(userType)) {
            Barber barber = barberRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Barbeiro não encontrado com ID: " + id));

            if (dto.getName() != null) barber.setName(dto.getName());
            if (dto.getEmail() != null) barber.setEmail(dto.getEmail());
            if (dto.getPhone() != null) barber.setPhone(dto.getPhone());
            if (dto.getCpf() != null) barber.setCpf(dto.getCpf());
            if (dto.getBirthDate() != null) barber.setBirthDate(dto.getBirthDate());

            if (dto.getNewPassword() != null && !dto.getNewPassword().isBlank()) {
                if (dto.getCurrentPassword() == null || dto.getCurrentPassword().isBlank()) {
                    throw new RuntimeException("Senha atual é obrigatória para definir uma nova senha");
                }
                if (!passwordEncoder.matches(dto.getCurrentPassword(), barber.getPassword())) {
                    throw new RuntimeException("Senha atual incorreta");
                }
                barber.setPassword(passwordEncoder.encode(dto.getNewPassword()));
            }

            Barber updated = barberRepository.save(barber);
            return mapBarberToUserResponseDTO(updated);

        } else {
            throw new RuntimeException("Tipo de usuário inválido: " + userType);
        }
    }

    public void deleteUser(Long id, String userType) {
        if ("CLIENT".equalsIgnoreCase(userType)) {
            if (!clientRepository.existsById(id)) {
                throw new RuntimeException("Cliente não encontrado com ID: " + id);
            }
            clientRepository.deleteById(id);

        } else if ("BARBER".equalsIgnoreCase(userType)) {
            if (!barberRepository.existsById(id)) {
                throw new RuntimeException("Barbeiro não encontrado com ID: " + id);
            }

            List<Appointment> appointments = appointmentRepository.findByBarberId(id);
            if (!appointments.isEmpty()) {
                throw new RuntimeException("Não é possível deletar o barbeiro pois ele possui agendamentos associados.");
            }

            barberRepository.deleteById(id);

        } else {
            throw new RuntimeException("Tipo de usuário inválido: " + userType);
        }
    }

    private UserResponseDTO mapClientToUserResponseDTO(Client client) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setEmail(client.getEmail());
        dto.setUserType("CLIENT");
        return dto;
    }

    private UserResponseDTO mapBarberToUserResponseDTO(Barber barber) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(barber.getId());
        dto.setName(barber.getName());
        dto.setEmail(barber.getEmail());
        dto.setPhone(barber.getPhone());
        dto.setCpf(barber.getCpf());
        dto.setBirthDate(barber.getBirthDate());
        dto.setUserType("BARBER");
        return dto;
    }
}
