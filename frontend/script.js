// Configuration de l'API
const API_BASE = 'http://localhost:3000/api';

class ProductManager {
    constructor() {
        this.productsGrid = document.getElementById('products-grid');
        this.addProductForm = document.getElementById('add-product-form');
        
        this.init();
    }

    init() {
        // Charger les produits au démarrage
        this.loadProducts();
        
        // Écouter la soumission du formulaire
        this.addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });
    }

    // Afficher un message de chargement
    showLoading() {
        this.productsGrid.innerHTML = '<div class="loading">Chargement des produits...</div>';
    }

    // Afficher un message d'erreur
    showError(message) {
        this.productsGrid.innerHTML = `<div class="error">Erreur: ${message}</div>`;
    }

    // Charger et afficher tous les produits
    async loadProducts() {
        this.showLoading();
        
        try {
            const response = await fetch(`${API_BASE}/products`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const products = await response.json();
            this.displayProducts(products);
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
            this.showError('Impossible de charger les produits. Vérifiez que le serveur est démarré.');
        }
    }

    // Afficher les produits dans la grille
    displayProducts(products) {
        if (products.length === 0) {
            this.productsGrid.innerHTML = '<div class="empty-catalog">Aucun produit dans le catalogue</div>';
            return;
        }

        this.productsGrid.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-info">
                    <div class="product-name">${this.escapeHtml(product.nom)}</div>
                    <div class="product-price">${parseFloat(product.prix).toFixed(2)} €</div>
                    <button class="delete-btn" onclick="productManager.deleteProduct(${product.id})">Supprimer</button>
                </div>
            </div>
        `).join('');
    }

    // Ajouter un nouveau produit
    async addProduct() {
        const nameInput = document.getElementById('product-name');
        const priceInput = document.getElementById('product-price');
        
        const name = nameInput.value.trim();
        const price = priceInput.value.trim();
        
        if (!name || !price) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom: name,
                    prix: parseFloat(price)
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            // Réinitialiser le formulaire
            nameInput.value = '';
            priceInput.value = '';
            
            // Recharger les produits
            this.loadProducts();
        } catch (error) {
            console.error('Erreur lors de l\'ajout du produit:', error);
            alert('Erreur lors de l\'ajout du produit. Vérifiez que le serveur est démarré.');
        }
    }

    // Supprimer un produit
    async deleteProduct(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/products/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            this.loadProducts();
        } catch (error) {
            console.error('Erreur lors de la suppression du produit:', error);
            alert('Erreur lors de la suppression du produit');
        }
    }

    // Échapper les caractères HTML pour la sécurité
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser l'application
let productManager;

document.addEventListener('DOMContentLoaded', () => {
    productManager = new ProductManager();
});