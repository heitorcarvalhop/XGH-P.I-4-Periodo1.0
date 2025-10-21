# Configuração CORS para o Backend Spring Boot

## ⚠️ Erro Atual

Você está recebendo este erro:
```
Access to XMLHttpRequest at 'http://localhost:8080/clients/register' from origin 'http://localhost:3000/' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔧 Solução: Configurar CORS no Backend

### Opção 1: Configuração Global (Recomendado)

Crie um arquivo `WebConfig.java` no seu projeto Spring Boot:

```java
package com.barberhub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Opção 2: Anotação nos Controllers

Adicione `@CrossOrigin` em cada controller:

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    // seus endpoints aqui
}
```

```java
@RestController
@RequestMapping("/clients")
@CrossOrigin(origins = "http://localhost:3000")
public class ClientController {
    // seus endpoints aqui
}
```

```java
@RestController
@RequestMapping("/barbers")
@CrossOrigin(origins = "http://localhost:3000")
public class BarberController {
    // seus endpoints aqui
}
```

```java
@RestController
@RequestMapping("/api/barbershops")
@CrossOrigin(origins = "http://localhost:3000")
public class BarbershopController {
    // seus endpoints aqui
}
```

### Opção 3: Configuração no SecurityConfig

Se você está usando Spring Security, adicione no `SecurityConfig.java`:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/validation/**").permitAll()
                .requestMatchers("/clients/register", "/barbers/register").permitAll()
                .requestMatchers("/api/barbershops/**").authenticated()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## ✅ Checklist de Verificação

Após configurar o CORS, verifique:

- [ ] Backend está rodando em `http://localhost:8080`
- [ ] Frontend está rodando em `http://localhost:3000`
- [ ] Configuração CORS permite origem `http://localhost:3000`
- [ ] Métodos permitidos incluem: GET, POST, PUT, DELETE, OPTIONS
- [ ] Headers permitidos incluem `*` ou pelo menos `Authorization` e `Content-Type`
- [ ] `allowCredentials` está como `true`

## 🧪 Testando

1. Reinicie o backend após adicionar a configuração CORS
2. Abra o frontend em `http://localhost:3000`
3. Tente fazer um cadastro
4. Verifique o console do navegador - não deve mais haver erros de CORS

## 📝 Endpoints que Precisam de CORS

### Públicos (sem autenticação):
- `POST /api/auth/login`
- `POST /clients/register`
- `POST /barbers/register`
- `POST /api/validation/email`
- `POST /api/validation/cpf`

### Privados (requerem autenticação):
- `GET /api/barbershops`
- `GET /api/barbershops/{id}`
- `POST /api/barbershops/{id}/services`

## 🔐 Importante para Produção

⚠️ **NUNCA use estas configurações em produção!**

Para produção, substitua:
```java
.allowedOrigins("http://localhost:3000")
```

Por:
```java
.allowedOrigins("https://seu-dominio.com")
```

E configure adequadamente os métodos e headers permitidos.

