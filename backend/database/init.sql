-- Création de la base de données
CREATE DATABASE IF NOT EXISTS catalogue_produits;
USE catalogue_produits;

-- Création de la table products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prix DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertion de quelques données d'exemple
INSERT INTO products (nom, prix) VALUES 
('Ordinateur Portable', 899.99),
('Souris Gaming', 45.50),
('Clavier Mécanique', 89.99),
('Écran 24 pouces', 199.99);