package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.BarberRegistrationDTO;
import br.com.barbershop.api.dto.BarberResponseDTO;
import br.com.barbershop.api.model.Barber;
import br.com.barbershop.api.model.Barbershop;
import br.com.barbershop.api.repository.BarberRepository;
import br.com.barbershop.api.repository.BarbershopRepository;
import br.com.barbershop.api.repository.ClientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BarberServiceTest {

    @Mock
    private BarberRepository barberRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private BarbershopRepository barbershopRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private BarberService barberService;

    @Test
    void registerCreatesBarberWhenDataIsValid() {
        BarberRegistrationDTO dto = new BarberRegistrationDTO();
        dto.setName("Carlos");
        dto.setCpf("12345678901");
        dto.setBirthDate(LocalDate.of(1990, 5, 15));
        dto.setPhone("11999999999");
        dto.setEmail("carlos@email.com");
        dto.setPassword("senha123");
        dto.setBarbershopId(3L);

        Barbershop shop = new Barbershop();
        shop.setId(3L);
        shop.setName("Barber Hub");
        shop.setAddress("Rua A");
        shop.setCep("00000-000");

        when(barberRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(barberRepository.existsByCpf(dto.getCpf())).thenReturn(false);
        when(barbershopRepository.findById(dto.getBarbershopId())).thenReturn(Optional.of(shop));
        when(passwordEncoder.encode(dto.getPassword())).thenReturn("senha-codificada");
        when(barberRepository.save(org.mockito.ArgumentMatchers.any(Barber.class))).thenAnswer(invocation -> {
            Barber saved = invocation.getArgument(0);
            saved.setId(20L);
            return saved;
        });

        BarberResponseDTO response = barberService.register(dto);

        ArgumentCaptor<Barber> barberCaptor = ArgumentCaptor.forClass(Barber.class);
        verify(barberRepository).save(barberCaptor.capture());

        Barber savedBarber = barberCaptor.getValue();
        assertThat(savedBarber.getBarbershop()).isEqualTo(shop);
        assertThat(savedBarber.getPassword()).isEqualTo("senha-codificada");
        assertThat(savedBarber.getCpf()).isEqualTo("12345678901");

        assertThat(response.getId()).isEqualTo(20L);
        assertThat(response.getName()).isEqualTo("Carlos");
        assertThat(response.getEmail()).isEqualTo("carlos@email.com");
    }

    @Test
    void registerThrowsWhenCpfAlreadyExists() {
        BarberRegistrationDTO dto = new BarberRegistrationDTO();
        dto.setCpf("12345678901");
        dto.setEmail("carlos@email.com");

        when(barberRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(barberRepository.existsByCpf(dto.getCpf())).thenReturn(true);

        assertThatThrownBy(() -> barberService.register(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("CPF já cadastrado");
    }
}
