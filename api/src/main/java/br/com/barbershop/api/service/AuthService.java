package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.AuthResponse;
import br.com.barbershop.api.dto.LoginRequest;
import br.com.barbershop.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        // 1. O AuthenticationManager valida as credenciais (email e senha)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 2. Se as credenciais forem válidas, busca o usuário no banco
        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        // 3. Gera o token JWT para o usuário
        var jwtToken = jwtService.generateToken(new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), new java.util.ArrayList<>()));

        // 4. Retorna a resposta com o token e os dados do usuário
        return AuthResponse.builder()
                .token(jwtToken)
                .user(user)
                .build();
    }
}