export const sqlSchema = `
-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Geo-spatial

-- 2. USERS & AUTH
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    preferences JSONB DEFAULT '{}', -- { "seat": "WINDOW", "meal": "VEG" }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MASTER DATA (Cached in Redis)
CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 'Uber', 'IndiGo'
    type VARCHAR(20) NOT NULL, -- 'CAB', 'FLIGHT'
    api_config JSONB, -- Encrypted API Keys
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    country_code CHAR(2) DEFAULT 'IN'
);

CREATE TABLE rate_cards (
    id SERIAL PRIMARY KEY,
    city_id INT REFERENCES cities(id),
    provider_type VARCHAR(20), -- 'CAB'
    base_fare DECIMAL(10,2),
    per_km_rate DECIMAL(10,2),
    per_min_rate DECIMAL(10,2),
    surge_cap DECIMAL(3,2) DEFAULT 3.0,
    valid_from TIMESTAMP,
    valid_to TIMESTAMP
);

-- 4. CORE SEARCH (Partitioned by Month)
CREATE TABLE searches (
    id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    origin_city_id INT,
    dest_city_id INT,
    travel_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TABLE searches_y2024m10 PARTITION OF searches
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

-- 5. QUOTES (Transient)
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_id UUID NOT NULL, 
    provider_id INT REFERENCES providers(id),
    price DECIMAL(10,2) NOT NULL,
    eta_minutes INT,
    deep_link TEXT,
    raw_response JSONB, -- Full payload for debugging
    expires_at TIMESTAMP
);
CREATE INDEX idx_quotes_search ON quotes(search_id);

-- 6. TRANSACTIONS
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    quote_id UUID REFERENCES quotes(id),
    status VARCHAR(20) CHECK (status IN ('PENDING', 'CONFIRMED')),
    amount DECIMAL(10,2),
    provider_ref_id VARCHAR(100), -- Uber/Indigo Booking ID
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. LOGS (Partitioned by Day)
CREATE TABLE api_logs (
    id BIGSERIAL,
    service VARCHAR(50),
    latency_ms INT,
    status_code INT,
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);
`;

export const cachingStrategy = {
    l1: "In-Memory (Node.js LRU) - Feature Flags, Config",
    l2: "Redis Cluster - Rate Cards (TTL 24h), Hot Routes (TTL 5m)",
    keys: [
        "rate_card:{city_id}",
        "search:{origin}:{dest}:{date}",
        "session:{user_token}"
    ]
};

export const partitioningStrategy = [
    { table: "searches", method: "Range Partitioning (Monthly)", reason: "High volume, rarely queried after 30 days." },
    { table: "api_logs", method: "Range Partitioning (Daily)", reason: "Extremely high write volume, easy archival." }
];