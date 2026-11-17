const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());

// 🚀 IMPORTANTE: Aumentamos el límite de tamaño a 10MB para aceptar imágenes en Base64 desde el dispositivo
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ status: 'OK', message: 'Conectado a MariaDB', dbTest: rows[0].solution });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', error: error.message });
    }
});

// Ruta de inicio de sesión y auto-registro con contraseña cifrada y nombre
app.post('/api/login', async (req, res) => {
  const { email, password, nombre } = req.body;

  console.log("Datos recibidos:", { email, nombre });

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios.' });
  }

  try {
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [email]);

    let usuarioId;
    let nombreUsuario = nombre || email.split('@')[0];
    let rolUsuario = 'CLIENTE'; // Rol por defecto (usuario común)

    if (usuarios.length > 0) {
      const userRecord = usuarios[0];
      
      const passwordMatch = await bcrypt.compare(password, userRecord.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
      }

      usuarioId = userRecord.id;
      nombreUsuario = userRecord.nombre;
      rolUsuario = userRecord.rol;
    } else {
      const negocioIdDefault = 1; 
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const [result] = await pool.query(
        'INSERT INTO usuarios (negocio_id, nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
        [negocioIdDefault, nombreUsuario, email, passwordHash, 'CLIENTE']
      );
      
      usuarioId = result.insertId;
      console.log("¡Usuario común registrado con contraseña cifrada! ID:", usuarioId);
    }

    res.json({
      success: true,
      message: 'Procesado correctamente',
      user: {
        id: usuarioId,
        name: nombreUsuario,
        email: email,
        rol: rolUsuario,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      }
    });

  } catch (error) {
    console.error('Error en base de datos:', error);
    res.status(500).json({ success: false, message: 'Error interno en la base de datos' });
  }
});

// 1. Obtener datos del negocio y sus servicios
app.get('/api/home-data', async (req, res) => {
  try {
    const [negocios] = await pool.query('SELECT * FROM negocios WHERE id = 1');
    const [servicios] = await pool.query('SELECT * FROM servicios WHERE negocio_id = 1');
    
    res.json({
      success: true,
      negocio: negocios[0] || {},
      servicios: servicios
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener datos' });
  }
});

// 2. Actualizar información general del negocio (Logo, Imágenes, Slogan, Horarios, etc.)
app.put('/api/negocio/1', async (req, res) => {
  const { nombre, slogan, logo_url, imagen_principal, horarios } = req.body;
  try {
    await pool.query(
      'UPDATE negocios SET nombre = ?, slogan = ?, logo_url = ?, imagen_principal = ?, horarios = ? WHERE id = 1',
      [nombre, slogan, logo_url, imagen_principal, horarios]
    );
    res.json({ success: true, message: 'Negocio actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar negocio:', error);
    res.status(500).json({ success: false, message: 'Error en la base de datos' });
  }
});

// 3. Crear un nuevo servicio
app.post('/api/servicios', async (req, res) => {
  const { nombre, categoria, precio, duracion_estimada } = req.body;
  const negocioIdDefault = 1;

  try {
    const [result] = await pool.query(
      'INSERT INTO servicios (negocio_id, nombre, categoria, precio, duracion_estimada) VALUES (?, ?, ?, ?, ?)',
      [negocioIdDefault, nombre, categoria, precio, duracion_estimada]
    );
    res.json({ success: true, message: 'Servicio creado con éxito', id: result.insertId });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ success: false, message: 'Error al guardar el servicio' });
  }
});

// 4. Eliminar un servicio
app.delete('/api/servicios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM servicios WHERE id = ?', [id]);
    res.json({ success: true, message: 'Servicio eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar el servicio' });
  }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en puerto ${PORT}`);
});