package br.com.barbershop.api.controller;

import br.com.barbershop.api.config.JwtAuthFilter;
import br.com.barbershop.api.dto.AuthResponseDTO;
import br.com.barbershop.api.dto.BarberRegistrationDTO;
import br.com.barbershop.api.dto.BarberResponseDTO;
import br.com.barbershop.api.dto.BarbershopListDTO;
import br.com.barbershop.api.dto.ClientRegistrationDTO;
import br.com.barbershop.api.dto.ClientResponseDTO;
import br.com.barbershop.api.dto.LoginRequest;
import br.com.barbershop.api.service.AuthService;
import br.com.barbershop.api.service.BarberService;
import br.com.barbershop.api.service.BarbershopService;
import br.com.barbershop.api.service.ClientService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = {
                AuthController.class,
                ClientController.class,
                BarberController.class,
                BarbershopController.class
        },
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthFilter.class)
        }
)
@AutoConfigureMockMvc(addFilters = false)
class PublicEndpointsMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private ClientService clientService;

    @MockBean
    private BarberService barberService;

    @MockBean
    private BarbershopService barbershopService;

    @Test
    void loginReturns200WhenCredentialsAreValid() throws Exception {
        ClientResponseDTO client = new ClientResponseDTO();
        client.setId(1L);
        client.setName("Joao");
        client.setEmail("joao@email.com");

        AuthResponseDTO response = AuthResponseDTO.builder()
                .token("jwt-token")
                .userType("CLIENT")
                .userData(client)
                .build();

        LoginRequest request = new LoginRequest();
        request.setEmail("joao@email.com");
        request.setPassword("senha123");

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.userType").value("CLIENT"))
                .andExpect(jsonPath("$.userData.id").value(1))
                .andExpect(jsonPath("$.userData.name").value("Joao"))
                .andExpect(jsonPath("$.userData.email").value("joao@email.com"));
    }

    @Test
    void loginReturns401WhenCredentialsAreInvalid() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("joao@email.com");
        request.setPassword("senha-errada");

        when(authService.login(any(LoginRequest.class))).thenThrow(new RuntimeException("Credenciais inválidas"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Credenciais inválidas"));
    }

    @Test
    void registerClientReturns201WhenPayloadIsValid() throws Exception {
        ClientRegistrationDTO request = new ClientRegistrationDTO();
        request.setName("Maria");
        request.setEmail("maria@email.com");
        request.setPassword("senha123");

        ClientResponseDTO response = new ClientResponseDTO();
        response.setId(10L);
        response.setName("Maria");
        response.setEmail("maria@email.com");

        when(clientService.register(any(ClientRegistrationDTO.class))).thenReturn(response);

        mockMvc.perform(post("/clients/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Maria"))
                .andExpect(jsonPath("$.email").value("maria@email.com"));
    }

    @Test
    void registerClientReturns409WhenEmailAlreadyExists() throws Exception {
        ClientRegistrationDTO request = new ClientRegistrationDTO();
        request.setName("Maria");
        request.setEmail("maria@email.com");
        request.setPassword("senha123");

        when(clientService.register(any(ClientRegistrationDTO.class))).thenThrow(new RuntimeException("Email já cadastrado"));

        mockMvc.perform(post("/clients/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email já cadastrado"));
    }

    @Test
    void registerBarberReturns201WhenPayloadIsValid() throws Exception {
        BarberRegistrationDTO request = new BarberRegistrationDTO();
        request.setName("Carlos");
        request.setCpf("12345678901");
        request.setBirthDate(LocalDate.of(1990, 5, 15));
        request.setPhone("11999999999");
        request.setEmail("carlos@email.com");
        request.setPassword("senha123");
        request.setBarbershopId(1L);

        BarberResponseDTO response = new BarberResponseDTO();
        response.setId(20L);
        response.setName("Carlos");
        response.setEmail("carlos@email.com");
        response.setCpf("12345678901");
        response.setBirthDate(LocalDate.of(1990, 5, 15));
        response.setPhone("11999999999");

        when(barberService.register(any(BarberRegistrationDTO.class))).thenReturn(response);

        mockMvc.perform(post("/barbers/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(20))
                .andExpect(jsonPath("$.name").value("Carlos"))
                .andExpect(jsonPath("$.email").value("carlos@email.com"))
                .andExpect(jsonPath("$.cpf").value("12345678901"))
                .andExpect(jsonPath("$.phone").value("11999999999"));
    }

    @Test
    void registerBarberReturns409WhenCpfAlreadyExists() throws Exception {
        BarberRegistrationDTO request = new BarberRegistrationDTO();
        request.setName("Carlos");
        request.setCpf("12345678901");
        request.setBirthDate(LocalDate.of(1990, 5, 15));
        request.setPhone("11999999999");
        request.setEmail("carlos@email.com");
        request.setPassword("senha123");
        request.setBarbershopId(1L);

        when(barberService.register(any(BarberRegistrationDTO.class))).thenThrow(new RuntimeException("CPF já cadastrado"));

        mockMvc.perform(post("/barbers/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("CPF já cadastrado"));
    }

    @Test
    void getAllBarbershopsReturns200AndWrappedList() throws Exception {
        BarbershopListDTO first = new BarbershopListDTO();
        first.setId(1L);
        first.setName("Navalha de Ouro");
        first.setRating(4.8);
        first.setReviews(152);
        first.setPrice(new BigDecimal("50.00"));
        first.setAddress("Av. T-63, 1234");
        first.setCep("74230-100");
        first.setPhone("(62) 3281-1234");
        first.setOpeningHours("Seg-Sáb: 9h-20h");
        first.setServices(List.of("Corte", "Barba"));
        first.setImage("https://example.com/image.jpg");
        first.setLatitude(-16.7042);
        first.setLongitude(-49.2719);

        BarbershopListDTO second = new BarbershopListDTO();
        second.setId(2L);
        second.setName("Goiânia Barber Club");
        second.setRating(4.9);
        second.setReviews(210);
        second.setPrice(new BigDecimal("60.00"));
        second.setAddress("Rua 9, 567");
        second.setCep("74150-130");
        second.setPhone("(62) 3241-5678");
        second.setOpeningHours("Ter-Sáb: 10h-21h");
        second.setServices(List.of("Corte"));
        second.setImage("https://example.com/image2.jpg");
        second.setLatitude(-16.7040);
        second.setLongitude(-49.2620);

        when(barbershopService.findAll()).thenReturn(List.of(first, second));

        mockMvc.perform(get("/api/barbershops"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.barbershops.length()").value(2))
                .andExpect(jsonPath("$.barbershops[0].id").value(1))
                .andExpect(jsonPath("$.barbershops[0].name").value("Navalha de Ouro"))
                .andExpect(jsonPath("$.barbershops[1].id").value(2))
                .andExpect(jsonPath("$.barbershops[1].name").value("Goiânia Barber Club"));
    }
}
