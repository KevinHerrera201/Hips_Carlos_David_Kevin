import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/database';

export const register = async (req: Request, res: Response): Promise<void> => {
    const { usuario, correo, password } = req.body; 

    // Regla: 8 caracteres, un número y un símbolo
    const passwordSeguro = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!passwordSeguro.test(password)) {
        res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres, un número y un carácter especial (ej: !@#).' });
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await pool.query(
            'INSERT INTO usuarios (usuario, correo, password, rol) VALUES ($1, $2, $3, $4)', 
            [usuario, correo, hashedPassword, 'normal']
        );
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error("ERROR EN POSTGRES:", error); // Esto te dirá el error real en la terminal
        res.status(500).json({ error: 'Error al registrar usuario en la base de datos' });
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

        if (user.activo === false) {
            res.status(403).json({ error: 'Tu cuenta ha sido desactivada o bloqueada.' });
            return;
        }

        // Aquí comparamos directamente con la base de datos, sin validaciones de Regex
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            res.status(401).json({ error: 'Contraseña incorrecta' });
            return;
        }

        res.json({ message: 'Login exitoso', userId: user.id, usuario: user.usuario });
    } catch (error) {
        console.error("ERROR EN LOGIN:", error);
        res.status(500).json({ error: 'Error en el login' });
    }
};