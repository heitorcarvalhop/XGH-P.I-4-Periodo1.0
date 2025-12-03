-- Garante as colunas de coordenadas (PostgreSQL)
ALTER TABLE barbershops
    ADD COLUMN IF NOT EXISTS latitude  DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Navalha de Ouro - Setor Bueno
INSERT INTO barbershops (name, address, cep, phone, hours, rating, reviews, latitude, longitude) VALUES
    ('Navalha de Ouro - Setor Bueno',
     'Av. T-63, 1234 - Setor Bueno, Goiânia - GO',
     '74230-100',
     '(62) 3281-1234',
     'Seg-Sáb: 9h-20h',
     4.8,
     152,
     -16.70420,   -- latitude
     -49.27190)   -- longitude
    ON CONFLICT (name) DO NOTHING;

-- Goiânia Barber Club - Setor Marista (Rua 9)
INSERT INTO barbershops (name, address, cep, phone, hours, rating, reviews, latitude, longitude) VALUES
    ('Goiânia Barber Club',
     'Rua 9, 567 - Setor Marista, Goiânia - GO',
     '74150-130',
     '(62) 3241-5678',
     'Ter-Sáb: 10h-21h',
     4.9,
     210,
     -16.70400,   -- latitude
     -49.26200)   -- longitude
    ON CONFLICT (name) DO NOTHING;

-- TadeuBRUTAL e Cortes - Alameda Ricardo Paranhos (Marista)
INSERT INTO barbershops (name, address, cep, phone, hours, rating, reviews, latitude, longitude) VALUES
    ('TadeuBRUTAL e Cortes',
     'Alameda Ricardo Paranhos, 789 - Setor Marista, Goiânia - GO',
     '74150-020',
     '(62) 3945-7890',
     'Seg-Sex: 8h-19h',
     4.7,
     98,
     -16.70820,   -- latitude
     -49.25480)   -- longitude
    ON CONFLICT (name) DO NOTHING;

-- Barbearia do Zé - Centro (Av. Goiás, 100)
INSERT INTO barbershops (name, address, cep, phone, hours, rating, reviews, latitude, longitude) VALUES
    ('Barbearia do Zé - Centro',
     'Av. Goiás, 100 - Centro, Goiânia - GO',
     '74005-010',
     '(62) 3223-1020',
     'Seg-Sáb: 7h-18h',
     4.5,
     312,
     -16.67450,   -- latitude
     -49.25400)   -- longitude
    ON CONFLICT (name) DO NOTHING;
