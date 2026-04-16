import { Request, Response } from 'express';
import { pool } from '../db/database';

export const agregarPalabra = async (req: Request, res: Response): Promise<void> => {
    const { palabra } = req.body;
    try {
        await pool.query('INSERT INTO blacklist_palabras (palabra) VALUES ($1)', [palabra.toLowerCase()]);
        res.status(201).json({ message: 'Palabra agregada' });
    } catch (error: any) {
        if (error.code === '23505') res.status(400).json({ error: 'La palabra ya existe' });
        else res.status(500).json({ error: 'Error al agregar palabra' });
    }
};

export const agregarHashtag = async (req: Request, res: Response): Promise<void> => {
    let { hashtag } = req.body;
    if (!hashtag.startsWith('#')) hashtag = '#' + hashtag; // Asegura que empiece con #
    
    try {
        await pool.query('INSERT INTO blacklist_hashtags (hashtag) VALUES ($1)', [hashtag.toLowerCase()]);
        res.status(201).json({ message: 'Hashtag agregado' });
    } catch (error: any) {
        if (error.code === '23505') res.status(400).json({ error: 'El hashtag ya existe' });
        else res.status(500).json({ error: 'Error al agregar hashtag' });
    }
};