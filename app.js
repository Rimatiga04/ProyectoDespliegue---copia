const express = require('express');
const sql = require('mssql');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos en Azure con pool de conexiones
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    pool: {
        max: 10, // Número máximo de conexiones en el pool
        min: 0,
        idleTimeoutMillis: 30000 // Tiempo antes de cerrar una conexión inactiva
    }
};

// Crear pool de conexiones
let poolPromise;
async function connectDB() {
    try {
        if (!poolPromise) {
            poolPromise = new sql.ConnectionPool(dbConfig);
            await poolPromise.connect();
            console.log("Conectado a la base de datos de Azure SQL");
        }
        return poolPromise;
    } catch (err) {
        console.error("Error de conexión a la base de datos:", err);
    }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Endpoint para obtener todos los killers con pool de conexiones
app.get('/killers', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM Killers');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error en GET /killers:", err);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

// CRUD para los killers
app.post('/killers', async (req, res) => {
    const { name, alias, power, speed, terror_radius, height, difficulty, release_date, dlc } = req.body;
    try {
        const pool = await connectDB();
        const request = pool.request();

        request.input('name', sql.NVarChar, name);
        request.input('alias', sql.NVarChar, alias);
        request.input('power', sql.NVarChar, power);
        request.input('speed', sql.Float, speed);
        request.input('terror_radius', sql.Int, terror_radius);
        request.input('height', sql.NVarChar, height);
        request.input('difficulty', sql.NVarChar, difficulty);
        request.input('release_date', sql.Date, release_date);
        request.input('dlc', sql.Bit, dlc ? 1 : 0);

        await request.query(`
            INSERT INTO Killers (name, alias, power, speed, terror_radius, height, difficulty, release_date, dlc)
            VALUES (@name, @alias, @power, @speed, @terror_radius, @height, @difficulty, @release_date, @dlc)
        `);

        res.status(201).json({ message: 'Killer agregado correctamente' });
    } catch (err) {
        console.error("Error en POST /killers:", err);
        res.status(500).json({ error: 'Error al agregar el killer' });
    }
});
app.put('/killers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, alias, power, speed, terror_radius, height, difficulty, release_date, dlc } = req.body;

    try {
        const pool = await connectDB();
        const request = pool.request();

        // Verificar si el killer existe antes de actualizar
        const checkExist = await request.input('id', sql.Int, id).query('SELECT * FROM Killers WHERE id = @id');
        if (checkExist.recordset.length === 0) {
            return res.status(404).json({ error: 'Killer no encontrado' });
        }

        request.input('name', sql.NVarChar, name);
        request.input('alias', sql.NVarChar, alias);
        request.input('power', sql.NVarChar, power);
        request.input('speed', sql.Float, speed);
        request.input('terror_radius', sql.Int, terror_radius);
        request.input('height', sql.NVarChar, height);
        request.input('difficulty', sql.NVarChar, difficulty);
        request.input('release_date', sql.Date, release_date);
        request.input('dlc', sql.Bit, dlc ? 1 : 0);

        await request.query(`
            UPDATE Killers 
            SET name = @name, alias = @alias, power = @power, speed = @speed, 
                terror_radius = @terror_radius, height = @height, difficulty = @difficulty, 
                release_date = @release_date, dlc = @dlc 
            WHERE id = @id
        `);

        res.json({ message: 'Killer actualizado correctamente' });
    } catch (err) {
        console.error("Error en PUT /killers/:id:", err);
        res.status(500).json({ error: 'Error al actualizar el killer' });
    }
});
app.delete('/killers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await connectDB();
        const request = pool.request();

        // Verificar si el killer existe antes de eliminar
        const checkExist = await request.input('id', sql.Int, id).query('SELECT * FROM Killers WHERE id = @id');
        if (checkExist.recordset.length === 0) {
            return res.status(404).json({ error: 'Killer no encontrado' });
        }

        await request.query('DELETE FROM Killers WHERE id = @id');
        res.json({ message: 'Killer eliminado correctamente' });
    } catch (err) {
        console.error("Error en DELETE /killers/:id:", err);
        res.status(500).json({ error: 'Error al eliminar el killer' });
    }
});


// Iniciar servidor
if (require.main === module) {
    app.listen(port, () => console.log(`API corriendo en http://localhost:${port}`));
}

module.exports = app; // Exportar para Jest
