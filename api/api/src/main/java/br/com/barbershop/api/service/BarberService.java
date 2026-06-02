package br.com.barbershop.api.service;

import br.com.barbershop.api.dto.BarberDetailDTO;
import br.com.barbershop.api.dto.BarberRegistrationDTO;
import br.com.barbershop.api.dto.BarberResponseDTO;
import br.com.barbershop.api.model.Barber;
import br.com.barbershop.api.repository.BarberRepository;
import br.com.barbershop.api.repository.BarbershopRepository;
import br.com.barbershop.api.repository.ClientRepository;
import br.com.barbershop.api.validation.EmailValidator;
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

    public br.com.barbershop.api.dto.BarberResponseDTO register(BarberRegistrationDTO dto) {
        String email = EmailValidator.validateAndNormalize(dto.getEmail());
        if (barberRepository.existsByEmail(email)) {
            throw new RuntimeException("E-mail já cadastrado");
        }
        if (barberRepository.existsByCpf(dto.getCpf())) {
            throw new RuntimeException("CPF já cadastrado");
        }
        var shop = barbershopRepository.findById(dto.getBarbershopId())
                .orElseThrow(() -> new RuntimeException("Barbearia não encontrada: id=" + dto.getBarbershopId()));

        var b = new br.com.barbershop.api.model.Barber();
        b.setName(dto.getName());
        b.setEmail(email);
        b.setCpf(dto.getCpf());
        b.setPhone(dto.getPhone());
        b.setBirthDate(dto.getBirthDate());
        b.setPassword(passwordEncoder.encode(dto.getPassword()));
        b.setBarbershop(shop);

        var saved = barberRepository.save(b);

        var resp = new br.com.barbershop.api.dto.BarberResponseDTO();
        resp.setId(saved.getId());
        resp.setName(saved.getName());
        resp.setEmail(saved.getEmail());
        resp.setCpf(saved.getCpf());
        resp.setPhone(saved.getPhone());
        resp.setBirthDate(saved.getBirthDate());
        return resp;
    }

    public BarberDetailDTO findById(Long id) {
        Barber barber = barberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barbeiro não encontrado"));

        BarberDetailDTO response = new BarberDetailDTO();
        response.setId(barber.getId());
        response.setName(barber.getName());
        response.setEmail(barber.getEmail());
        response.setCpf(barber.getCpf());
        response.setBirthDate(barber.getBirthDate());
        response.setPhone(barber.getPhone());

        // 🔥 AQUI É ONDE A MÁGICA ACONTECE!
        // Quando acessamos barber.getBarbershop(), o JPA faz um SELECT no banco
        // e carrega os dados da barbearia (mesmo com LAZY loading)
        if (barber.getBarbershop() != null) {
            response.setBarbershopId(barber.getBarbershop().getId());
            response.setBarbershopName(barber.getBarbershop().getName());
            response.setBarbershopAddress(barber.getBarbershop().getAddress());
            response.setBarbershopPhone(barber.getBarbershop().getPhone());
        }

        return response;
    }
}
