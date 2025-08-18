CREATE DATABASE IF NOT EXISTS portafolio_db;
USE portafolio_db;

CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(20) NOT NULL UNIQUE,
    mail VARCHAR(100) NOT NULL UNIQUE,
    password_user VARCHAR(12) NOT NULL,
	first_name VARCHAR(10) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_password DATETIME,
    c_cash INT DEFAULT 0
);


CREATE TABLE investments (
    id_inv INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    simbol VARCHAR(10) NOT NULL,
    name_inv VARCHAR(100) NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    buy_price DECIMAL(15,4) NOT NULL,
    total_price DECIMAL(20,4) AS (quantity * buy_price) STORED,
    date_inv DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);

CREATE TABLE currency_values (
    id_value INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    simbol VARCHAR(10) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);


