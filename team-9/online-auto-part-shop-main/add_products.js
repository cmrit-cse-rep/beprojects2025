import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API = 'https://server-auto.onrender.com';
const sampleData = JSON.parse(readFileSync(join(__dirname, 'sample_products.json'), 'utf-8'));

async function addProducts() {
    try {
        // Add categories first
        const categories = [...new Set(sampleData.products.map(p => p.category))];
        for (const category of categories) {
            const response = await fetch(`${API}/category`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: category,
                    image_url: sampleData.products.find(p => p.category === category).image_url
                })
            });
            console.log(`Added category: ${category}`);
        }

        // Add products
        for (const product of sampleData.products) {
            const response = await fetch(`${API}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            console.log(`Added product: ${product.name}`);
        }

        console.log('All products and categories have been added successfully!');
    } catch (error) {
        console.error('Error adding products:', error);
    }
}

addProducts();
