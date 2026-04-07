package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.ClientRegistrationDTO;
import br.com.barbershop.api.dto.ClientResponseDTO;
import br.com.barbershop.api.model.Client;
import br.com.barbershop.api.repository.ClientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ClientService clientService;

    @Test
    void registerCreatesClientWithEncodedPassword() {
        ClientRegistrationDTO dto = new ClientRegistrationDTO();
        dto.setName("Cliente Teste");
        dto.setEmail("cliente@email.com");
        dto.setPassword("senha123");

        when(clientRepository.findByEmail(dto.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(dto.getPassword())).thenReturn("senha-codificada");
        when(clientRepository.save(org.mockito.ArgumentMatchers.any(Client.class))).thenAnswer(invocation -> {
            Client saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        ClientResponseDTO response = clientService.register(dto);

        ArgumentCaptor<Client> clientCaptor = ArgumentCaptor.forClass(Client.class);
        verify(clientRepository).save(clientCaptor.capture());

        Client savedClient = clientCaptor.getValue();
        assertThat(savedClient.getName()).isEqualTo("Cliente Teste");
        assertThat(savedClient.getEmail()).isEqualTo("cliente@email.com");
        assertThat(savedClient.getPassword()).isEqualTo("senha-codificada");

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getName()).isEqualTo("Cliente Teste");
        assertThat(response.getEmail()).isEqualTo("cliente@email.com");
    }

    @Test
    void registerThrowsWhenEmailAlreadyExists() {
        ClientRegistrationDTO dto = new ClientRegistrationDTO();
        dto.setEmail("cliente@email.com");

        when(clientRepository.findByEmail(dto.getEmail())).thenReturn(Optional.of(new Client()));

        assertThatThrownBy(() -> clientService.register(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email já cadastrado");
    }
}
