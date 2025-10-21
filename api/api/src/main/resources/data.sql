-- Insere as barbearias com todos os dados, incluindo o CEP, APENAS SE elas ainda não existirem.
INSERT INTO barbershops (name, address, cep, phone, hours, rating, reviews) VALUES
    ('Navalha de Ouro - Setor Bueno', 'Av. T-63, 1234 - Setor Bueno, Goiânia - GO', '74230-100', '(62) 3281-1234', 'Seg-Sáb: 9h-20h', 4.8, 152)
    ON CONFLICT (name) DO NOTHING;

INSERT INTO barbershops (name, address, cep, phone, hours, rating, reviews) VALUES
    ('Goiânia Barber Club', 'Rua 9, 567 - Setor Marista, Goiânia - GO', '74150-130', '(62) 3241-5678', 'Ter-Sáb: 10h-21h', 4.9, 210)
    ON CONFLICT (name) DO NOTHING;

INSERT INTO barbershops (name, address, cep, phone, hours, rating, reviews) VALUES
    ('TadeuBRUTAL e Cortes', 'Alameda Ricardo Paranhos, 789 - Setor Marista, Goiânia - GO', '74150-020', '(62) 3945-7890', 'Seg-Sex: 8h-19h', 4.7, 98)
    ON CONFLICT (name) DO NOTHING;

INSERT INTO barbershops (name, address, cep, phone, hours, rating, reviews) VALUES
    ('Barbearia do Zé - Centro', 'Av. Goiás, 100 - Centro, Goiânia - GO', '74005-010', '(62) 3223-1020', 'Seg-Sáb: 7h-18h', 4.5, 312)
    ON CONFLICT (name) DO NOTHING;