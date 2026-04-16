import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/database';

export const register = async (req: Request, res: Response): Promise<void> => {
    const { usuario, password, correo, rol } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO usuarios (usuario, password, correo, rol) VALUES ($1, $2, $3, $4) RETURNING id, usuario, correo, rol',
            [usuario, hashedPassword, correo, rol]
        );
        res.status(201).json({ message: 'Usuario creado', user: result.rows[0] });
    } catch (error) {
        console.log("Error detallado:", error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { correo, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            res.status(401).json({ error: 'Contraseña incorrecta' });
            return;
        }

        res.json({ message: 'Login exitoso', userId: user.id, usuario: user.usuario });
    } catch (error) {
        res.status(500).json({ error: 'Error en el login' });
    }
};