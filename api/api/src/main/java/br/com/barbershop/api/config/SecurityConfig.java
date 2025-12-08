package br.com.barbershop.api.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

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
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // ===== ENDPOINTS PÚBLICOS =====
                        .requestMatchers("/clients/register", "/barbers/register").permitAll() // Cadastro
                        .requestMatchers("/api/auth/**").permitAll()                         // Login/Logout
                        .requestMatchers("/api/validation/**").permitAll()                   // Validações
                        
                        // 🔓 BARBEARIAS - GET público para cadastro e busca
                        .requestMatchers(HttpMethod.GET, "/api/barbershops/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/barbershops/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/barbershops/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/barbershops/**").authenticated()

                        // 🔓 BARBEIROS - GET público para o frontend buscar dados após login
                        .requestMatchers(HttpMethod.GET, "/barbers/**").permitAll()  // ✅ Buscar barbeiro (sem /api/)
                        // ❌ REMOVIDA: .requestMatchers(HttpMethod.POST, "/api/barbers/**").permitAll()

                        // 🔓 USUÁRIOS - GET público (opcional, se necessário)
                        .requestMatchers(HttpMethod.GET, "/users/**").permitAll()

                        // ===== ENDPOINTS PROTEGIDOS (Requerem Token JWT Válido) =====
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").authenticated()
                        .requestMatchers("/api/appointments/**").authenticated()

                        // ===== REGRA FINAL =====
                        .anyRequest().denyAll()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    
}