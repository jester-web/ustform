require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// API Routes

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    // Bedenler ve Renkler JSON olarak tutuluyor
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching product' });
  }
});

// --- AUTH ---
app.post('/api/auth/register', async (req, res) => {
  const { ad, email, sifre } = req.body;
  try {
    const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda' });
    }
    const result = await pool.query(
      'INSERT INTO users (ad, email, sifre, role) VALUES ($1, $2, $3, $4) RETURNING id, ad, email, role',
      [ad, email, sifre, 'user']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error registering user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, sifre } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND sifre = $2', [email, sifre]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Hatalı e-posta veya şifre' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error logging in' });
  }
});

// --- FAVORITES ---
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT p.* FROM favorites f JOIN products p ON f.product_id = p.id WHERE f.user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching favorites' });
  }
});

app.post('/api/favorites/toggle', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const check = await pool.query('SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2', [userId, productId]);
    if (check.rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2', [userId, productId]);
      res.json({ action: 'removed' });
    } else {
      await pool.query('INSERT INTO favorites (user_id, product_id) VALUES ($1, $2)', [userId, productId]);
      res.json({ action: 'added' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error toggling favorite' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
