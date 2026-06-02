package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.ClientRegistrationDTO;
import br.com.barbershop.api.dto.ClientResponseDTO;
import br.com.barbershop.api.model.Client;
import br.com.barbershop.api.repository.ClientRepository;
import br.com.barbershop.api.validation.EmailValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public ClientResponseDTO register(ClientRegistrationDTO dto) {
        String email = EmailValidator.validateAndNormalize(dto.getEmail());
        if (clientRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        Client newClient = new Client();
        newClient.setName(dto.getName());
        newClient.setEmail(email);
        newClient.setPassword(passwordEncoder.encode(dto.getPassword()));

        Client savedClient = clientRepository.save(newClient);

        ClientResponseDTO response = new ClientResponseDTO();
        response.setId(savedClient.getId());
        response.setName(savedClient.getName());
        response.setEmail(savedClient.getEmail());

        return response;
    }
}
