# Documentação da API - BarberShop

Esta documentação descreve os endpoints necessários para integração com o sistema Spring Boot.

## Base URL
```
http://localhost:8080/api
```

## Endpoints de Autenticação

### POST /auth/login
Realiza login do usuário.

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@email.com",
    "fullName": "João Silva Santos",
    "nickname": "João",
    "cpf": "123.456.789-00",
    "phone": "(11) 99999-9999",
    "city": "São Paulo"
  }
}
```

**Response (401):**
```json
{
  "message": "Credenciais inválidas"
}
```

### POST /auth/logout
Realiza logout do usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

## Endpoints de Usuários

### POST /users/register
Cadastra novo usuário.

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "cpf": "123.456.789-00",
  "fullName": "João Silva Santos",
  "nickname": "João",
  "phone": "(11) 99999-9999",
  "city": "São Paulo"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "usuario@email.com",
  "fullName": "João Silva Santos",
  "nickname": "João",
  "cpf": "123.456.789-00",
  "phone": "(11) 99999-9999",
  "city": "São Paulo",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

**Response (409):**
```json
{
  "message": "Email já cadastrado"
}
```

**Response (422):**
```json
{
  "message": "Dados de validação inválidos",
  "errors": {
    "email": "Email inválido",
    "cpf": "CPF inválido"
  }
}
```

### GET /users/{id}
Busca usuário por ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "usuario@email.com",
  "fullName": "João Silva Santos",
  "nickname": "João",
  "cpf": "123.456.789-00",
  "phone": "(11) 99999-9999",
  "city": "São Paulo",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

### PUT /users/{id}
Atualiza dados do usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "fullName": "João Silva Santos",
  "nickname": "João",
  "phone": "(11) 99999-9999",
  "city": "São Paulo"
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "usuario@email.com",
  "fullName": "João Silva Santos",
  "nickname": "João",
  "cpf": "123.456.789-00",
  "phone": "(11) 99999-9999",
  "city": "São Paulo",
  "updatedAt": "2024-01-01T11:00:00Z"
}
```

### DELETE /users/{id}
Deleta usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Usuário deletado com sucesso"
}
```

## Endpoints de Validação

### POST /validation/cpf
Valida CPF.

**Request Body:**
```json
{
  "cpf": "123.456.789-00"
}
```

**Response (200):**
```json
{
  "valid": true,
  "message": "CPF válido"
}
```

**Response (422):**
```json
{
  "valid": false,
  "message": "CPF inválido"
}
```

### POST /validation/email
Valida email.

**Request Body:**
```json
{
  "email": "usuario@email.com"
}
```

**Response (200):**
```json
{
  "valid": true,
  "message": "Email válido"
}
```

**Response (422):**
```json
{
  "valid": false,
  "message": "Email inválido"
}
```

## Códigos de Status HTTP

- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **422** - Unprocessable Entity
- **500** - Internal Server Error

## Headers Obrigatórios

Para endpoints que requerem autenticação:
```
Authorization: Bearer {token}
Content-Type: application/json
```

## Exemplo de Implementação Spring Boot

### Dependências (pom.xml)
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
        <version>0.9.1</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

### Modelo de Usuário
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Email
    @NotBlank
    @Column(unique = true)
    private String email;
    
    @NotBlank
    private String password;
    
    @NotBlank
    @Column(name = "cpf", unique = true)
    private String cpf;
    
    @NotBlank
    @Column(name = "full_name")
    private String fullName;
    
    @NotBlank
    private String nickname;
    
    @NotBlank
    private String phone;
    
    @NotBlank
    private String city;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Getters e Setters
}
```

### Controller de Autenticação
```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                .body(Map.of("message", "Credenciais inválidas"));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // Implementar lógica de logout
        return ResponseEntity.ok(Map.of("message", "Logout realizado com sucesso"));
    }
}
```

### Controller de Usuários
```java
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User savedUser = userService.register(user);
            return ResponseEntity.status(201).body(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(409)
                .body(Map.of("message", "Email já cadastrado"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.findById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Outros endpoints...
}
```

## Configuração CORS

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## Configuração de Segurança

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**", "/api/validation/**").permitAll()
                .requestMatchers("/api/users/register").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        
        return http.build();
    }
}
```

Esta documentação fornece todas as informações necessárias para implementar o backend Spring Boot que se integra perfeitamente com a aplicação React.
