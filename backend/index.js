
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Pool de conexión a MariaDB
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Endpoint de verificación y prueba de datos
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ 
            status: 'OK', 
            message: 'API de PawsApp conectada exitosamente con MariaDB',
            dbTest: rows[0].solution 
        });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend de PawsApp corriendo en puerto ${PORT}`);
});