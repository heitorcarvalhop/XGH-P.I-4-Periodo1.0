package br.com.barbershop.api.config; // Verifique se o nome do pacote está correto

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
// NÃO PRECISAMOS MAIS DO PASSWORDENCODER AQUI

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // O MÉTODO DUPLICADO FOI REMOVIDO DAQUI

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/clients/register").permitAll()
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}