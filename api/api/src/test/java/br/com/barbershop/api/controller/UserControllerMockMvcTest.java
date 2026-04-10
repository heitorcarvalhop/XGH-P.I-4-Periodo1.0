package br.com.barbershop.api.controller;

import br.com.barbershop.api.config.JwtAuthFilter;
import br.com.barbershop.api.dto.UserResponseDTO;
import br.com.barbershop.api.dto.UserUpdateDTO;
import br.com.barbershop.api.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = UserController.class,
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthFilter.class)
        }
)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    void getAllUsersReturnsWrappedList() throws Exception {
        when(userService.findAllUsers()).thenReturn(List.of(buildClientUser(), buildBarberUser()));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users.length()").value(2))
                .andExpect(jsonPath("$.users[0].userType").value("CLIENT"))
                .andExpect(jsonPath("$.users[1].userType").value("BARBER"));
    }

    @Test
    void getUserByIdReturns200ForAuthenticatedClient() throws Exception {
        when(userService.findUserById(1L, "CLIENT")).thenReturn(buildClientUser());

        mockMvc.perform(get("/api/users/1").with(authenticatedUser("CLIENT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Maria"))
                .andExpect(jsonPath("$.userType").value("CLIENT"));
    }

    @Test
    void getUserByIdReturns404WhenUserDoesNotExist() throws Exception {
        when(userService.findUserById(99L, "BARBER"))
                .thenThrow(new RuntimeException("Barbeiro nao encontrado com ID: 99"));

        mockMvc.perform(get("/api/users/99").with(authenticatedUser("BARBER")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Barbeiro nao encontrado com ID: 99"));
    }

    @Test
    void updateUserReturns200WhenPayloadIsValid() throws Exception {
        UserUpdateDTO request = new UserUpdateDTO();
        request.setName("Carlos Atualizado");
        request.setPhone("11988887777");

        UserResponseDTO updated = buildBarberUser();
        updated.setName("Carlos Atualizado");
        updated.setPhone("11988887777");

        when(userService.updateUser(eq(2L), eq("BARBER"), any(UserUpdateDTO.class))).thenReturn(updated);

        mockMvc.perform(put("/api/users/2")
                        .with(authenticatedUser("BARBER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Carlos Atualizado"))
                .andExpect(jsonPath("$.phone").value("11988887777"))
                .andExpect(jsonPath("$.userType").value("BARBER"));
    }

    @Test
    void updateUserReturns404WhenUserDoesNotExist() throws Exception {
        UserUpdateDTO request = new UserUpdateDTO();
        request.setName("Inexistente");

        when(userService.updateUser(eq(99L), eq("CLIENT"), any(UserUpdateDTO.class)))
                .thenThrow(new RuntimeException("Cliente não encontrado com ID: 99"));

        mockMvc.perform(put("/api/users/99")
                        .with(authenticatedUser("CLIENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Cliente não encontrado com ID: 99"));
    }

    @Test
    void updateUserReturns400WhenBusinessRuleFails() throws Exception {
        UserUpdateDTO request = new UserUpdateDTO();
        request.setCurrentPassword("errada");
        request.setNewPassword("novaSenha123");

        when(userService.updateUser(eq(1L), eq("CLIENT"), any(UserUpdateDTO.class)))
                .thenThrow(new RuntimeException("Senha atual incorreta"));

        mockMvc.perform(put("/api/users/1")
                        .with(authenticatedUser("CLIENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Senha atual incorreta"));
    }

    @Test
    void deleteUserReturns200WhenDeletionSucceeds() throws Exception {
        doNothing().when(userService).deleteUser(2L, "BARBER");

        mockMvc.perform(delete("/api/users/2").with(authenticatedUser("BARBER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Usuário deletado com sucesso"));
    }

    @Test
    void deleteUserReturns409WhenUserHasAssociatedAppointments() throws Exception {
        doThrow(new RuntimeException("agendamentos associados"))
                .when(userService).deleteUser(2L, "BARBER");

        mockMvc.perform(delete("/api/users/2").with(authenticatedUser("BARBER")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("agendamentos associados"));
    }

    @Test
    void deleteUserReturns404WhenUserDoesNotExist() throws Exception {
        doThrow(new RuntimeException("Cliente não encontrado com ID: 88"))
                .when(userService).deleteUser(88L, "CLIENT");

        mockMvc.perform(delete("/api/users/88").with(authenticatedUser("CLIENT")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Cliente não encontrado com ID: 88"));
    }

    @Test
    void deleteUserReturns500WhenUnexpectedErrorOccurs() throws Exception {
        doThrow(new RuntimeException("Erro interno qualquer"))
                .when(userService).deleteUser(1L, "CLIENT");

        mockMvc.perform(delete("/api/users/1").with(authenticatedUser("CLIENT")))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Erro inesperado ao deletar usuário"));
    }

    private RequestPostProcessor authenticatedUser(String role) {
        return request -> {
            request.setUserPrincipal(new UsernamePasswordAuthenticationToken(
                    "usuario@email.com",
                    "senha",
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
            ));
            return request;
        };
    }

    private UserResponseDTO buildClientUser() {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(1L);
        dto.setName("Maria");
        dto.setEmail("maria@email.com");
        dto.setPhone("11999990000");
        dto.setUserType("CLIENT");
        return dto;
    }

    private UserResponseDTO buildBarberUser() {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(2L);
        dto.setName("Carlos");
        dto.setEmail("carlos@email.com");
        dto.setPhone("11988887777");
        dto.setCpf("12345678901");
        dto.setBirthDate(LocalDate.of(1990, 5, 15));
        dto.setUserType("BARBER");
        return dto;
    }
}
