CREATE TABLE IF NOT EXISTS tires (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    size VARCHAR(30) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0)
);

INSERT INTO tires (brand, model, size, quantity)
VALUES
    ('Michelin', 'Pilot Sport 4S', '245/40R18', 12),
    ('Bridgestone', 'Blizzak WS90', '225/50R17', 8),
    ('Pirelli', 'P Zero', '305/30R20', 4);
