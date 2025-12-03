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
                        
                        // 🔓 BARBEARIAS - GET público para cadastro e busca
                        .requestMatchers(HttpMethod.GET, "/api/barbershops/**").permitAll()  // Listar e buscar barbearias (PÚBLICO)
                        .requestMatchers(HttpMethod.POST, "/api/barbershops/**").authenticated() // Criar barbearias/serviços (PROTEGIDO)
                        .requestMatchers(HttpMethod.PUT, "/api/barbershops/**").authenticated()  // Atualizar barbearias (PROTEGIDO)
                        .requestMatchers(HttpMethod.DELETE, "/api/barbershops/**").authenticated() // Deletar barbearias (PROTEGIDO)

                        // 🔓 BARBEIROS - GET público para o frontend buscar dados após login
                        .requestMatchers(HttpMethod.GET, "/api/barbers/**").permitAll()  // Buscar barbeiro (PÚBLICO)
                        .requestMatchers(HttpMethod.POST, "/api/barbers/**").permitAll() // Registro já está em /barbers/register

                        // ===== ENDPOINTS PROTEGIDOS (Requerem Token JWT Válido) =====
                        .requestMatchers(HttpMethod.GET, "/api/users/**").authenticated()   // Buscar Usuários
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").authenticated()   // Atualizar Usuários
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").authenticated() // Deletar Usuários
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