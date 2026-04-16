import { Request, Response } from 'express';
import { pool } from '../db/database';

// --- FUNCIÓN AUXILIAR PARA LA BITÁCORA ---
const registrarAccion = async (usuario: string, accion: string) => {
    try {
        await pool.query('INSERT INTO bitacora (usuario, accion) VALUES ($1, $2)', [usuario || 'Sistema', accion]);
    } catch (error) {
        console.error('Error al guardar en bitácora:', error);
    }
};

// --- GESTIÓN DE USUARIOS ---
export const obtenerUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query('SELECT id, usuario, correo, activo, rol, fecha_creacion FROM usuarios ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

export const cambiarEstadoUsuario = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { activo } = req.body;
    const usuario = req.headers['x-usuario'] as string;
    try {
        await pool.query('UPDATE usuarios SET activo = $1 WHERE id = $2', [activo, id]);
        const estadoTexto = activo ? 'Activo' : 'Inactivo';
        await registrarAccion(usuario, `Cambió el estado del usuario ID ${id} a ${estadoTexto}`);
        res.status(200).json({ message: 'Estado actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

export const cambiarRolUsuario = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { rol } = req.body;
    const usuario = req.headers['x-usuario'] as string;
    try {
        await pool.query('UPDATE usuarios SET rol = $1 WHERE id = $2', [rol, id]);
        await registrarAccion(usuario, `Cambió el rol del usuario ID ${id} a ${rol.toUpperCase()}`);
        res.status(200).json({ message: 'Rol actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar rol' });
    }
};

// --- GESTIÓN DE PALABRAS PROHIBIDAS ---
export const obtenerPalabras = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM blacklist_palabras ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener palabras' });
    }
};

export const agregarPalabra = async (req: Request, res: Response): Promise<void> => {
    const { palabra } = req.body;
    const usuario = req.headers['x-usuario'] as string;
    try {
        await pool.query('INSERT INTO blacklist_palabras (palabra) VALUES ($1)', [palabra.toLowerCase()]);
        await registrarAccion(usuario, `Agregó la palabra prohibida: ${palabra}`);
        res.status(201).json({ message: 'Palabra agregada' });
    } catch (error: any) {
        if (error.code === '23505') res.status(400).json({ error: 'La palabra ya existe' });
        else res.status(500).json({ error: 'Error al agregar palabra' });
    }
};

export const eliminarPalabra = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const usuario = req.headers['x-usuario'] as string;
    try {
        await pool.query('DELETE FROM blacklist_palabras WHERE id = $1', [id]);
        await registrarAccion(usuario, `Eliminó la palabra prohibida con ID: ${id}`);
        res.status(200).json({ message: 'Palabra eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar palabra' });
    }
};

// --- GESTIÓN DE HASHTAGS PROHIBIDOS ---
export const obtenerHashtags = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM blacklist_hashtags ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener hashtags' });
    }
};

export const agregarHashtag = async (req: Request, res: Response): Promise<void> => {
    let { hashtag } = req.body;
    const usuario = req.headers['x-usuario'] as string;
    if (!hashtag.startsWith('#')) hashtag = '#' + hashtag;
    
    try {
        await pool.query('INSERT INTO blacklist_hashtags (hashtag) VALUES ($1)', [hashtag.toLowerCase()]);
        await registrarAccion(usuario, `Agregó el hashtag prohibido: ${hashtag}`);
        res.status(201).json({ message: 'Hashtag agregado' });
    } catch (error: any) {
        if (error.code === '23505') res.status(400).json({ error: 'El hashtag ya existe' });
        else res.status(500).json({ error: 'Error al agregar hashtag' });
    }
};

export const eliminarHashtag = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const usuario = req.headers['x-usuario'] as string;
    try {
        await pool.query('DELETE FROM blacklist_hashtags WHERE id = $1', [id]);
        await registrarAccion(usuario, `Eliminó el hashtag prohibido con ID: ${id}`);
        res.status(200).json({ message: 'Hashtag eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar hashtag' });
    }
};

// --- GESTIÓN DE BITÁCORA ---
export const obtenerBitacora = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM bitacora ORDER BY fecha DESC LIMIT 100');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener bitácora' });
    }
};