package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.BarberRegistrationDTO;
import br.com.barbershop.api.dto.BarberResponseDTO;
import br.com.barbershop.api.model.Barber;
import br.com.barbershop.api.repository.BarberRepository;
import br.com.barbershop.api.repository.BarbershopRepository;
import br.com.barbershop.api.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class BarberService {

    @Autowired
    private BarberRepository barberRepository;
    @Autowired
    private ClientRepository clientRepository; // Para verificar se o email já existe em clientes
    @Autowired
    private BarbershopRepository barbershopRepository; // Para verificar se a barbearia existe
    @Autowired
    private PasswordEncoder passwordEncoder;

    public BarberResponseDTO register(BarberRegistrationDTO dto) {
        // --- Validações de Negócio ---
        // 1. Verifica se o email já está em uso por um cliente ou outro barbeiro
        if (clientRepository.findByEmail(dto.getEmail()).isPresent() || barberRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado no sistema");
        }
        // 2. Verifica se o CPF já está em uso
        if (barberRepository.findByCpf(dto.getCpf()).isPresent()) {
            throw new RuntimeException("CPF já cadastrado");
        }
        // 3. Busca a barbearia pelo ID fornecido; se não encontrar, lança um erro
        var barbershop = barbershopRepository.findById(dto.getBarbershopId())
                .orElseThrow(() -> new RuntimeException("Barbearia não encontrada com o ID: " + dto.getBarbershopId()));

        // --- Criação da Entidade ---
        Barber newBarber = new Barber();
        newBarber.setName(dto.getName());
        newBarber.setCpf(dto.getCpf());
        newBarber.setBirthDate(dto.getBirthDate());
        newBarber.setPhone(dto.getPhone());
        newBarber.setEmail(dto.getEmail());
        newBarber.setPassword(passwordEncoder.encode(dto.getPassword())); // Criptografa a senha
        newBarber.setBarbershop(barbershop); // Associa o barbeiro à barbearia encontrada

        // --- Salvando no Banco ---
        Barber savedBarber = barberRepository.save(newBarber);

        // --- Mapeamento para a Resposta da API ---
        BarberResponseDTO response = new BarberResponseDTO();
        response.setId(savedBarber.getId());
        response.setName(savedBarber.getName());
        response.setEmail(savedBarber.getEmail());
        response.setCpf(savedBarber.getCpf());
        response.setBirthDate(savedBarber.getBirthDate());
        response.setPhone(savedBarber.getPhone());

        return response;
    }
}