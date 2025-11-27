const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuration de la base de données MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'catalogue_produits',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Pool de connexions MySQL
let pool;

// Initialisation de la connexion à la base de données
async function initializeDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        
        // Tester la connexion
        const connection = await pool.getConnection();
        console.log('✅ Connecté à la base de données MySQL');
        connection.release();
        
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion à MySQL:', error.message);
        return false;
    }
}

// Routes API

// Récupérer tous les produits
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Ajouter un nouveau produit
app.post('/api/products', async (req, res) => {
    try {
        const { nom, prix } = req.body;
        
        if (!nom || !prix) {
            return res.status(400).json({ error: 'Le nom et le prix sont requis' });
        }
        
        const [result] = await pool.execute(
            'INSERT INTO products (nom, prix) VALUES (?, ?)',
            [nom, parseFloat(prix)]
        );
        
        const [newProduct] = await pool.execute(
            'SELECT * FROM products WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json(newProduct[0]);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du produit:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer un produit
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        const [result] = await pool.execute(
            'DELETE FROM products WHERE id = ?',
            [productId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        res.json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour servir l'application frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
async function startServer() {
    const dbConnected = await initializeDatabase();
    
    if (!dbConnected) {
        console.log('⚠️  Le serveur démarre sans connexion à la base de données');
    }
    
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
        console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
    });
}

startServer();