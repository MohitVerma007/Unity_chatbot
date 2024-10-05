-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                          -- Auto-incrementing integer primary key
    username VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email LIKE '%@%.%'),
    phone VARCHAR(20),
    address TEXT,
    password_hash TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Approved' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    daily_request_count INT DEFAULT 0 CHECK (daily_request_count <= 50),  -- Daily request count (max 50)
    total_request_count INT DEFAULT 0,              -- Total request count (accumulates over time)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- **Password Reset Requests Table**
-- Handles OTP-based password reset requests
CREATE TABLE password_reset_requests (
    id SERIAL PRIMARY KEY,  -- Auto-incrementing integer primary key
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,  
    otp VARCHAR(10) NOT NULL,
    otp_expiry TIMESTAMP NOT NULL,
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Used', 'Expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



