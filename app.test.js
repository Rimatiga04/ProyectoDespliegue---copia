const request = require('supertest');
const express = require('express');
const app = require('./app'); // Asegúrate de exportar `app` en `app.js`

describe('API de Killers', () => {
    test('Debe obtener todos los killers', async () => {
        const res = await request(app).get('/killers');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('Debe agregar un nuevo killer', async () => {
        const newKiller = {
            name: 'Test Killer',
            alias: 'The Tester',
            power: 'Unit Testing',
            speed: 4.6,
            terror_radius: 32,
            height: 'Mediano',
            difficulty: 'Media',
            release_date: '2025-02-17',
            dlc: false
        };

        const res = await request(app).post('/killers').send(newKiller);
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Killer agregado correctamente');
    });

    test('Debe actualizar un killer', async () => {
        const updateData = {
            name: 'Updated Killer',
            alias: 'The Updater',
            power: 'Editing Tests',
            speed: 4.4,
            terror_radius: 28,
            height: 'Alto',
            difficulty: 'Dificil',
            release_date: '2025-02-18',
            dlc: true
        };

        const res = await request(app).put('/killers/1').send(updateData);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Killer actualizado correctamente');
    });

    test('Debe eliminar un killer', async () => {
        const res = await request(app).delete('/killers/1');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Killer eliminado correctamente');
    });
});
