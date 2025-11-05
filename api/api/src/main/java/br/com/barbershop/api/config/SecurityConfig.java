package br.com.barbershop.api.config; // Verifique se o nome do pacote está correto

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Import HttpMethod
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;
    @Autowired
    private AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // Habilita configuração CORS
                .csrf(AbstractHttpConfigurer::disable) // Desabilita CSRF
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Define como stateless
                .authorizeHttpRequests(authorize -> authorize
                        // ===== ENDPOINTS PÚBLICOS =====
                        .requestMatchers("/clients/register", "/barbers/register").permitAll() // Cadastro
                        .requestMatchers("/api/auth/**").permitAll()                         // Login/Logout
                        .requestMatchers("/api/validation/**").permitAll()                   // Validações

                        // ===== ENDPOINTS PROTEGIDOS (Requerem Token JWT Válido) =====
                        .requestMatchers("/api/barbershops/**").authenticated()         // Barbearias e Serviços
                        .requestMatchers(HttpMethod.GET, "/api/users/**").authenticated()   // Buscar Usuários
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").authenticated()   // Atualizar Usuários
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").authenticated() // Deletar Usuários (ajustar para ADMIN depois)

                        // ✅ REGRA ADICIONADA PARA AGENDAMENTOS
                        .requestMatchers("/api/appointments/**").authenticated()      // Agendamentos

                        // ===== REGRA FINAL =====
                        // Qualquer outra requisição não mapeada acima será negada
                        .anyRequest().denyAll()
                )
                .authenticationProvider(authenticationProvider) // Define o provedor de autenticação
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // Adiciona o filtro JWT

        return http.build();
    }
}