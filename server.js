// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create a PostgreSQL pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
  keepAlive: true,
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test PostgreSQL connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Unable to connect to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL');
    done();
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes for Posts
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content } = req.body;
    const query = 'INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [title, content]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const query = 'SELECT * FROM posts;';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const query = 'SELECT * FROM posts WHERE id = $1';
    const result = await pool.query(query, [postId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;
    const query = 'UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *';
    const result = await pool.query(query, [title, content, postId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const query = 'DELETE FROM posts WHERE id = $1';
    await pool.query(query, [postId]);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Routes for Users
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [name, email]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email } = req.body;
    const query = 'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *';
    const result = await pool.query(query, [name, email, userId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/hello', (req, res) => {
  res.send('Hello World');
});

app.get('/api/map', (req, res) => {
  res.json({
    "http://localhost:3000/": {
      "GET": "Returns 'Hello World'"
    },
    "http://localhost:3000/posts": {
      "GET": "Retrieves all posts",
      "POST": "Creates a new post",
      "http://localhost:3000/posts/:id": {
        "GET": "Retrieves a specific post by ID",
        "PUT": "Updates a specific post by ID",
        "DELETE": "Deletes a specific post by ID"
      }
    },
    "http://localhost:3000/users": {
      "GET": "Retrieves all users",
      "POST": "Creates a new user",
      "http://localhost:3000/users/:id": {
        "GET": "Retrieves a specific user by ID",
        "PUT": "Updates a specific user by ID",
        "DELETE": "Deletes a specific user by ID"
      }
    }
  });
});

// Default response for any other request
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
