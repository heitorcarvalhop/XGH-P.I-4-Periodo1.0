package br.com.barbershop.api.config; // Verifique se o nome do pacote está correto

import br.com.barbershop.api.repository.BarberRepository;
import br.com.barbershop.api.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;

@Configuration
public class ApplicationConfig {

    // 1. Injetamos os DOIS novos repositórios
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private BarberRepository barberRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        // 2. Esta é a nova lógica de busca unificada
        return username -> {
            // Tenta encontrar o usuário primeiro na tabela de clientes
            UserDetails clientDetails = clientRepository.findByEmail(username)
                    .map(client -> new org.springframework.security.core.userdetails.User(
                            client.getEmail(),
                            client.getPassword(),
                            new ArrayList<>() // Lista de permissões, vazia por enquanto
                    ))
                    .orElse(null); // Retorna nulo se não encontrar

            if (clientDetails != null) {
                return clientDetails;
            }

            // Se não encontrou como cliente, tenta encontrar na tabela de barbeiros
            return barberRepository.findByEmail(username)
                    .map(barber -> new org.springframework.security.core.userdetails.User(
                            barber.getEmail(),
                            barber.getPassword(),
                            new ArrayList<>() // Lista de permissões
                    ))
                    // Se não encontrar em nenhuma das duas tabelas, lança o erro
                    .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + username));
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}