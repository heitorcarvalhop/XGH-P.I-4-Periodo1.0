package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.AuthResponseDTO;
import br.com.barbershop.api.dto.BarberResponseDTO;
import br.com.barbershop.api.dto.ClientResponseDTO;
import br.com.barbershop.api.dto.LoginRequest;
import br.com.barbershop.api.repository.BarberRepository;
import br.com.barbershop.api.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private BarberRepository barberRepository;
    @Autowired
    private JwtService jwtService;

    public AuthResponseDTO login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var clientOptional = clientRepository.findByEmail(request.getEmail());
        if (clientOptional.isPresent()) {
            var client = clientOptional.get();
            UserDetails userDetails = new User(client.getEmail(), client.getPassword(), new ArrayList<>());
            var jwtToken = jwtService.generateToken(userDetails);

            // ✅ CORREÇÃO PARA O CLIENTE
            ClientResponseDTO clientDto = new ClientResponseDTO();
            clientDto.setId(client.getId());
            clientDto.setName(client.getName());
            clientDto.setEmail(client.getEmail());

            return AuthResponseDTO.builder()
                    .token(jwtToken)
                    .userType("CLIENT")
                    .userData(clientDto)
                    .build();
        }

        var barberOptional = barberRepository.findByEmail(request.getEmail());
        if (barberOptional.isPresent()) {
            var barber = barberOptional.get();
            UserDetails userDetails = new User(barber.getEmail(), barber.getPassword(), new ArrayList<>());
            var jwtToken = jwtService.generateToken(userDetails);

            // ✅ CORREÇÃO PARA O BARBEIRO
            BarberResponseDTO barberDto = new BarberResponseDTO();
            barberDto.setId(barber.getId());
            barberDto.setName(barber.getName());
            barberDto.setEmail(barber.getEmail());
            barberDto.setCpf(barber.getCpf());
            barberDto.setBirthDate(barber.getBirthDate());
            barberDto.setPhone(barber.getPhone());

            return AuthResponseDTO.builder()
                    .token(jwtToken)
                    .userType("BARBER")
                    .userData(barberDto)
                    .build();
        }

        throw new RuntimeException("Usuário autenticado não encontrado nos repositórios.");
    }
}