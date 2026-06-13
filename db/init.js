require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDB() {
  try {
    console.log('Veritabanı tabloları oluşturuluyor...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        ad VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        sifre VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        isim VARCHAR(255) NOT NULL,
        fiyat INTEGER NOT NULL,
        kategori VARCHAR(100),
        altkategori VARCHAR(100),
        vitrin BOOLEAN DEFAULT false,
        aciklama TEXT,
        resim TEXT,
        renkler JSONB,
        bedenler JSONB
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      );
    `);

    console.log('Tablolar başarıyla oluşturuldu.');

    // Seed Admin User
    const adminCheck = await pool.query("SELECT * FROM users WHERE email = 'admin@ustform.com'");
    if (adminCheck.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (ad, email, sifre, role) VALUES ($1, $2, $3, $4)",
        ['Yönetici Admin', 'admin@ustform.com', 'admin123', 'admin']
      );
      console.log('Admin kullanıcısı oluşturuldu.');
    }

    // Seed Products
    const productsCheck = await pool.query("SELECT COUNT(*) FROM products");
    if (parseInt(productsCheck.rows[0].count) === 0) {
      console.log('Ürünler ekleniyor...');
      // Extract products from public/js/products.js
      const productsFile = fs.readFileSync(path.join(__dirname, '../public/js/products.js'), 'utf8');
      const jsonStrMatch = productsFile.match(/const urunlerData = (\[[\s\S]*?\]);/);
      
      if (jsonStrMatch) {
        const products = eval(jsonStrMatch[1]);
        for (const p of products) {
          await pool.query(
            `INSERT INTO products (id, isim, fiyat, kategori, altkategori, vitrin, aciklama, resim, renkler, bedenler)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [p.id, p.isim, p.fiyat, p.kategori, p.altkategori, p.vitrin, p.aciklama, p.resim, JSON.stringify(p.renkler), JSON.stringify(p.bedenler)]
          );
        }
        // update sequence for products since we inserted with specific IDs
        await pool.query(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));`);
        console.log(`${products.length} ürün eklendi.`);
      } else {
         console.error("Products array could not be matched from products.js");
      }
    } else {
      console.log('Ürünler zaten mevcut, seed atlandı.');
    }

    console.log('Veritabanı kurulumu tamamlandı!');
    process.exit(0);
  } catch (err) {
    console.error('Veritabanı kurulum hatası:', err);
    process.exit(1);
  }
}

initDB();
