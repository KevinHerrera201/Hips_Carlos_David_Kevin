"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerBitacora = exports.eliminarHashtag = exports.agregarHashtag = exports.obtenerHashtags = exports.eliminarPalabra = exports.agregarPalabra = exports.obtenerPalabras = exports.cambiarRolUsuario = exports.cambiarEstadoUsuario = exports.obtenerUsuarios = void 0;
const database_1 = require("../db/database");
// --- FUNCIÓN AUXILIAR PARA LA BITÁCORA ---
const registrarAccion = async (usuario, accion) => {
    try {
        await database_1.pool.query('INSERT INTO bitacora (usuario, accion) VALUES ($1, $2)', [usuario || 'Sistema', accion]);
    }
    catch (error) {
        console.error('Error al guardar en bitácora:', error);
    }
};
// --- GESTIÓN DE USUARIOS ---
const obtenerUsuarios = async (req, res) => {
    try {
        const result = await database_1.pool.query('SELECT id, usuario, correo, activo, rol, fecha_creacion FROM usuarios ORDER BY id ASC');
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};
exports.obtenerUsuarios = obtenerUsuarios;
const cambiarEstadoUsuario = async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;
    const usuario = req.headers['x-usuario'];
    try {
        await database_1.pool.query('UPDATE usuarios SET activo = $1 WHERE id = $2', [activo, id]);
        const estadoTexto = activo ? 'Activo' : 'Inactivo';
        await registrarAccion(usuario, `Cambió el estado del usuario ID ${id} a ${estadoTexto}`);
        res.status(200).json({ message: 'Estado actualizado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};
exports.cambiarEstadoUsuario = cambiarEstadoUsuario;
const cambiarRolUsuario = async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;
    const usuario = req.headers['x-usuario'];
    try {
        await database_1.pool.query('UPDATE usuarios SET rol = $1 WHERE id = $2', [rol, id]);
        await registrarAccion(usuario, `Cambió el rol del usuario ID ${id} a ${rol.toUpperCase()}`);
        res.status(200).json({ message: 'Rol actualizado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar rol' });
    }
};
exports.cambiarRolUsuario = cambiarRolUsuario;
// --- GESTIÓN DE PALABRAS PROHIBIDAS ---
const obtenerPalabras = async (req, res) => {
    try {
        const result = await database_1.pool.query('SELECT * FROM blacklist_palabras ORDER BY id DESC');
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener palabras' });
    }
};
exports.obtenerPalabras = obtenerPalabras;
const agregarPalabra = async (req, res) => {
    const { palabra } = req.body;
    const usuario = req.headers['x-usuario'];
    try {
        await database_1.pool.query('INSERT INTO blacklist_palabras (palabra) VALUES ($1)', [palabra.toLowerCase()]);
        await registrarAccion(usuario, `Agregó la palabra prohibida: ${palabra}`);
        res.status(201).json({ message: 'Palabra agregada' });
    }
    catch (error) {
        if (error.code === '23505')
            res.status(400).json({ error: 'La palabra ya existe' });
        else
            res.status(500).json({ error: 'Error al agregar palabra' });
    }
};
exports.agregarPalabra = agregarPalabra;
const eliminarPalabra = async (req, res) => {
    const { id } = req.params;
    const usuario = req.headers['x-usuario'];
    try {
        await database_1.pool.query('DELETE FROM blacklist_palabras WHERE id = $1', [id]);
        await registrarAccion(usuario, `Eliminó la palabra prohibida con ID: ${id}`);
        res.status(200).json({ message: 'Palabra eliminada' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar palabra' });
    }
};
exports.eliminarPalabra = eliminarPalabra;
// --- GESTIÓN DE HASHTAGS PROHIBIDOS ---
const obtenerHashtags = async (req, res) => {
    try {
        const result = await database_1.pool.query('SELECT * FROM blacklist_hashtags ORDER BY id DESC');
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener hashtags' });
    }
};
exports.obtenerHashtags = obtenerHashtags;
const agregarHashtag = async (req, res) => {
    let { hashtag } = req.body;
    const usuario = req.headers['x-usuario'];
    if (!hashtag.startsWith('#'))
        hashtag = '#' + hashtag;
    try {
        await database_1.pool.query('INSERT INTO blacklist_hashtags (hashtag) VALUES ($1)', [hashtag.toLowerCase()]);
        await registrarAccion(usuario, `Agregó el hashtag prohibido: ${hashtag}`);
        res.status(201).json({ message: 'Hashtag agregado' });
    }
    catch (error) {
        if (error.code === '23505')
            res.status(400).json({ error: 'El hashtag ya existe' });
        else
            res.status(500).json({ error: 'Error al agregar hashtag' });
    }
};
exports.agregarHashtag = agregarHashtag;
const eliminarHashtag = async (req, res) => {
    const { id } = req.params;
    const usuario = req.headers['x-usuario'];
    try {
        await database_1.pool.query('DELETE FROM blacklist_hashtags WHERE id = $1', [id]);
        await registrarAccion(usuario, `Eliminó el hashtag prohibido con ID: ${id}`);
        res.status(200).json({ message: 'Hashtag eliminado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar hashtag' });
    }
};
exports.eliminarHashtag = eliminarHashtag;
// --- GESTIÓN DE BITÁCORA ---
const obtenerBitacora = async (req, res) => {
    try {
        const result = await database_1.pool.query('SELECT * FROM bitacora ORDER BY fecha DESC LIMIT 100');
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener bitácora' });
    }
};
exports.obtenerBitacora = obtenerBitacora;
//# sourceMappingURL=admin.controller.js.map