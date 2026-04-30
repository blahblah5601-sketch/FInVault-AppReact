CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password_hash) VALUES
('test@finvault.app', '$2b$12$abcdefghijklmnopqrstuv'),
('user1@example.com', '$2b$12$abcdefghijklmnopqrstuv'),
('user2@example.com', '$2b$12$abcdefghijklmnopqrstuv');

INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES
(1, 'FINV001', 'Checking', 5000.00),
(1, 'FINV002', 'Savings', 15000.00),
(2, 'FINV003', 'Checking', 2500.00);

INSERT INTO transactions (account_id, transaction_type, amount, description) VALUES
(1, 'DEPOSIT', 5000.00, 'Initial deposit'),
(1, 'WITHDRAWAL', 250.00, 'ATM withdrawal'),
(2, 'DEPOSIT', 15000.00, 'Initial savings deposit'),
(3, 'DEPOSIT', 2500.00, 'Initial checking deposit');