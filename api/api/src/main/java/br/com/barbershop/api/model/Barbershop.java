package br.com.barbershop.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "barbershops")
@Data
public class Barbershop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String cep;

    private String phone;
    private String hours;
    private Double rating;
    private Integer reviews;

    // NOVOS CAMPOS OPCIONAIS PARA COORDENADAS
    private Double latitude;
    private Double longitude;

    @OneToMany(mappedBy = "barbershop", fetch = FetchType.LAZY)
    private List<Barber> barbers;

    @OneToMany(mappedBy = "barbershop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Service> services;
}