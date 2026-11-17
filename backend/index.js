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

// 5. Actualizar un servicio existente
app.put('/api/servicios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, duracion_estimada } = req.body;

  try {
    await pool.query(
      'UPDATE servicios SET nombre = ?, categoria = ?, precio = ?, duracion_estimada = ? WHERE id = ?',
      [nombre, categoria, precio, duracion_estimada, id]
    );
    res.json({ success: true, message: 'Servicio actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el servicio' });
  }
});

// 6. Obtener citas agendadas (para historial o panel admin)
app.get('/api/citas', async (req, res) => {
  try {
    const [citas] = await pool.query(`
      SELECT 
        c.id,
        c.fecha_hora_inicio,
        c.fecha_hora_fin,
        c.estado,
        cl.nombre_completo AS cliente_nombre,
        cl.telefono AS cliente_telefono,
        m.nombre AS mascota_nombre,
        m.especie AS mascota_especie,
        s.nombre AS servicio_nombre,
        s.precio AS servicio_precio
      FROM citas c
      JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN cita_mascota_servicio cms ON c.id = cms.cita_id
      LEFT JOIN mascotas m ON cms.mascota_id = m.id
      LEFT JOIN servicios s ON cms.servicio_id = s.id
      WHERE c.negocio_id = 1
      ORDER BY c.fecha_hora_inicio DESC
    `);
    res.json({ success: true, citas });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ success: false, message: 'Error al cargar citas' });
  }
});

// 7. Agendar una nueva cita completa
app.post('/api/citas', async (req, res) => {
  const {
    nombre_cliente,
    telefono,
    correo,
    nombre_mascota,
    especie,
    raza,
    edad,
    servicio_id,
    fecha,
    hora
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Buscar si el cliente ya existe por teléfono o correo, si no, crearlo
    let [clientes] = await connection.query(
      'SELECT id FROM clientes WHERE negocio_id = 1 AND (telefono = ? OR (correo IS NOT NULL AND correo = ?)) LIMIT 1',
      [telefono, correo || '']
    );

    let clienteId;
    if (clientes.length > 0) {
      clienteId = clientes[0].id;
    } else {
      const [nuevoCliente] = await connection.query(
        'INSERT INTO clientes (negocio_id, nombre_completo, telefono, correo) VALUES (1, ?, ?, ?)',
        [nombre_cliente, telefono, correo || null]
      );
      clienteId = nuevoCliente.insertId;
    }

    // 2. Buscar si la mascota ya existe para ese cliente, si no, crearla
    let [mascotas] = await connection.query(
      'SELECT id FROM mascotas WHERE cliente_id = ? AND nombre = ? LIMIT 1',
      [clienteId, nombre_mascota]
    );

    let mascotaId;
    if (mascotas.length > 0) {
      mascotaId = mascotas[0].id;
    } else {
      const [nuevaMascota] = await connection.query(
        'INSERT INTO mascotas (negocio_id, cliente_id, nombre, especie, raza, edad) VALUES (1, ?, ?, ?, ?, ?)',
        [clienteId, nombre_mascota, especie, raza || null, edad ? parseInt(edad) : null]
      );
      mascotaId = nuevaMascota.insertId;
    }

    // 3. Calcular fecha_hora_inicio y fecha_hora_fin según la duración del servicio
    const [servRows] = await connection.query('SELECT duracion_estimada FROM servicios WHERE id = ?', [servicio_id]);
    const duracionMinutos = servRows.length > 0 && servRows[0].duracion_estimada ? servRows[0].duracion_estimada : 30;

    const fechaInicioStr = `${fecha} ${hora}:00`;
    const fechaInicioDate = new Date(`${fecha}T${hora}:00`);
    const fechaFinDate = new Date(fechaInicioDate.getTime() + duracionMinutos * 60000);

    // Formatear fechaFin a YYYY-MM-DD HH:MM:SS local
    const pad = (n) => n.toString().padStart(2, '0');
    const fechaFinStr = `${fechaFinDate.getFullYear()}-${pad(fechaFinDate.getMonth() + 1)}-${pad(fechaFinDate.getDate())} ${pad(fechaFinDate.getHours())}:${pad(fechaFinDate.getMinutes())}:00`;

    // 4. Insertar en tabla `citas`
    const [nuevaCita] = await connection.query(
      'INSERT INTO citas (negocio_id, cliente_id, fecha_hora_inicio, fecha_hora_fin, estado) VALUES (1, ?, ?, ?, "PENDIENTE")',
      [clienteId, fechaInicioStr, fechaFinStr]
    );
    const citaId = nuevaCita.insertId;

    // 5. Vincular en `cita_mascota_servicio`
    await connection.query(
      'INSERT INTO cita_mascota_servicio (cita_id, mascota_id, servicio_id) VALUES (?, ?, ?)',
      [citaId, mascotaId, servicio_id]
    );

    await connection.commit();
    res.json({ success: true, message: 'Cita agendada exitosamente', citaId });
  } catch (error) {
    await connection.rollback();
    console.error('Error al agendar cita:', error);
    res.status(500).json({ success: false, message: 'Error interno al agendar la cita' });
  } finally {
    connection.release();
  }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en puerto ${PORT}`);
});