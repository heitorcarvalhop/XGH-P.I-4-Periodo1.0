package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.UserUpdateDTO;
import br.com.barbershop.api.model.User;
import br.com.barbershop.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user) throws Exception {
        // 1. Verifica se o email já está em uso
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new Exception("Email já cadastrado"); // Futuramente, criaremos exceções customizadas
        }

        // 2. Criptografa a senha antes de salvar (MUITO IMPORTANTE)
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        // 3. Salva o novo usuário no banco de dados
        return userRepository.save(user);
    }
    // Dentro da classe UserService
    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow();
    }
    // Adicione dentro da classe UserService

    public User update(Long id, UserUpdateDTO data) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        user.setFullName(data.getFullName());
        user.setNickname(data.getNickname());
        user.setPhone(data.getPhone());
        user.setCity(data.getCity());

        return userRepository.save(user);
    }

    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado");
        }
        userRepository.deleteById(id);
    }
}