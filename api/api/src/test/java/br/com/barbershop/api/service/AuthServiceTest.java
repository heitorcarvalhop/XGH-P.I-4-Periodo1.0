package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.AuthResponseDTO;
import br.com.barbershop.api.dto.BarberResponseDTO;
import br.com.barbershop.api.dto.ClientResponseDTO;
import br.com.barbershop.api.dto.LoginRequest;
import br.com.barbershop.api.model.Barber;
import br.com.barbershop.api.model.Client;
import br.com.barbershop.api.repository.BarberRepository;
import br.com.barbershop.api.repository.ClientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private ClientRepository clientRepository;
    @Mock
    private BarberRepository barberRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginReturnsClientTokenAndPayloadWhenClientExists() {
        LoginRequest request = new LoginRequest();
        request.setEmail("cliente@email.com");
        request.setPassword("senha123");

        Client client = new Client();
        client.setId(1L);
        client.setName("Cliente Teste");
        client.setEmail(request.getEmail());
        client.setPassword("hash");

        when(clientRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(client));
        when(jwtService.generateToken(any(UserDetails.class), eq("CLIENT"))).thenReturn("client-token");

        AuthResponseDTO response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("client-token");
        assertThat(response.getUserType()).isEqualTo("CLIENT");
        assertThat(response.getUserData()).isInstanceOf(ClientResponseDTO.class);

        ClientResponseDTO userData = (ClientResponseDTO) response.getUserData();
        assertThat(userData.getId()).isEqualTo(1L);
        assertThat(userData.getName()).isEqualTo("Cliente Teste");
        assertThat(userData.getEmail()).isEqualTo(request.getEmail());

        verify(authenticationManager).authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
    }

    @Test
    void loginReturnsBarberTokenAndPayloadWhenBarberExists() {
        LoginRequest request = new LoginRequest();
        request.setEmail("barbeiro@email.com");
        request.setPassword("senha123");

        Barber barber = new Barber();
        barber.setId(2L);
        barber.setName("Barbeiro Teste");
        barber.setEmail(request.getEmail());
        barber.setPassword("hash");
        barber.setCpf("12345678901");
        barber.setPhone("11999999999");
        barber.setBirthDate(LocalDate.of(1990, 1, 1));

        when(clientRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(barberRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(barber));
        when(jwtService.generateToken(any(UserDetails.class), eq("BARBER"))).thenReturn("barber-token");

        AuthResponseDTO response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("barber-token");
        assertThat(response.getUserType()).isEqualTo("BARBER");
        assertThat(response.getUserData()).isInstanceOf(BarberResponseDTO.class);

        BarberResponseDTO userData = (BarberResponseDTO) response.getUserData();
        assertThat(userData.getId()).isEqualTo(2L);
        assertThat(userData.getName()).isEqualTo("Barbeiro Teste");
        assertThat(userData.getEmail()).isEqualTo(request.getEmail());
        assertThat(userData.getCpf()).isEqualTo("12345678901");
    }
}
