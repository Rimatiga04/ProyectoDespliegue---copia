const express = require('express');
const sql = require('mssql');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos en Azure
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

// Conectar a la base de datos
sql.connect(dbConfig)
    .then(() => {
        console.log("Conectado a la base de datos de Azure SQL");
    })
    .catch(err => {
        console.error("Error de conexión a la base de datos:", err);
    });

// Middleware para manejar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Endpoint para obtener todos los killers
app.get('/killers', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Killers');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});
// Endpoint para obtener un killer por ID (editar)
app.get('/killers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const request = new sql.Request();
        const query = 'SELECT * FROM Killers WHERE id = @id';
        request.input('id', sql.Int, id);
        const result = await request.query(query);
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el killer' });
    }
});

// CRUD para los killers
// Operación POST (Añadir killer)
app.post('/killers', async (req, res) => {
    const { name, alias, power, speed, terror_radius, height, difficulty, release_date, dlc } = req.body;
    try {
        const request = new sql.Request();
        const query = `
            INSERT INTO Killers (name, alias, power, speed, terror_radius, height, difficulty, release_date, dlc)
            VALUES (@name, @alias, @power, @speed, @terror_radius, @height, @difficulty, @release_date, @dlc)
        `;

        // Definir parámetros
        request.input('name', sql.NVarChar, name);
        request.input('alias', sql.NVarChar, alias);
        request.input('power', sql.NVarChar, power);
        request.input('speed', sql.Float, speed);
        request.input('terror_radius', sql.Int, terror_radius);
        request.input('height', sql.NVarChar, height);
        request.input('difficulty', sql.NVarChar, difficulty);
        request.input('release_date', sql.Date, release_date);
        request.input('dlc', sql.Bit, dlc ? 1 : 0); // Convertir a 1 o 0

        await request.query(query);
        res.status(201).json({ message: 'Killer agregado correctamente' });
    } catch (err) {
        console.error("Error en POST:", err);
        res.status(500).json({ error: 'Error al agregar el killer' });
    }
});

// Operación PUT (Actualizar killer)
app.put('/killers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, alias, power, speed, terror_radius, height, difficulty, release_date, dlc } = req.body;

    // Validar que release_date esté presente y sea una cadena válida
    if (!release_date || typeof release_date !== 'string') {
        return res.status(400).json({ error: 'La fecha de lanzamiento es inválida.' });
    }

    try {
        const request = new sql.Request();
        const query = `
            UPDATE Killers 
            SET name = @name, 
                alias = @alias, 
                power = @power, 
                speed = @speed, 
                terror_radius = @terror_radius, 
                height = @height, 
                difficulty = @difficulty, 
                release_date = @release_date, 
                dlc = @dlc 
            WHERE id = @id
        `;

        // Definir parámetros
        request.input('id', sql.Int, id);
        request.input('name', sql.NVarChar, name);
        request.input('alias', sql.NVarChar, alias);
        request.input('power', sql.NVarChar, power);
        request.input('speed', sql.Float, speed);
        request.input('terror_radius', sql.Int, terror_radius);
        request.input('height', sql.NVarChar, height);
        request.input('difficulty', sql.NVarChar, difficulty);
        request.input('release_date', sql.Date, release_date); // Usar sql.Date
        request.input('dlc', sql.Bit, dlc ? 1 : 0);

        await request.query(query);
        res.json({ message: 'Killer actualizado correctamente' });
    } catch (err) {
        console.error("Error en PUT:", err);
        res.status(500).json({ error: 'Error al actualizar el killer' });
    }
});

app.delete('/killers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await sql.query(`DELETE FROM Killers WHERE id = ${id}`);
        res.json({ message: 'Killer eliminado correctamente' });
    } catch (err) {
        console.error("Error en la consulta SQL:", err);
        res.status(500).json({ error: 'Error al eliminar el killer' });
    }
});

app.listen(port, () => {
    console.log(`API corriendo en http://localhost:${port}`);
});