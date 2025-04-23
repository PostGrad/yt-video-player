CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('kirtan', 'dhun', 'katha')),
    type VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private')),
    length INTEGER,
    "lastPlayedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
); 