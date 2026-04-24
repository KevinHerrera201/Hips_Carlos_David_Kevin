"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../db/database");
const register = async (req, res) => {
    // Ya no recibimos 'rol'
    const { usuario, correo, password } = req.body;
    const passwordSeguro = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordSeguro.test(password)) {
        res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres, un número y un carácter especial.' });
        return; // Detiene el registro si no cumple
    }
    try {
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        // Forzamos el rol 'normal' directamente en la consulta
        await database_1.pool.query('INSERT INTO usuarios (usuario, correo, password, rol) VALUES ($1, $2, $3, $4)', [usuario, correo, hashedPassword, 'normal']);
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { correo, password } = req.body;
    try {
        const result = await database_1.pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        const user = result.rows[0];
        if (user.activo === false) {
            res.status(403).json({ error: 'Tu cuenta ha sido desactivada o bloqueada.' });
            return;
        }
        const passwordSegura = /^(?=.*[A-Z])(?=.*\d).+$/;
        if (!passwordSegura.test(password)) {
            res.status(400).json({
                error: 'La contraseña debe tener al menos una letra mayúscula y un número.'
            });
            return;
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: 'Contraseña incorrecta' });
            return;
        }
        res.json({ message: 'Login exitoso', userId: user.id, usuario: user.usuario });
    }
    catch (error) {
        res.status(500).json({ error: 'Error en el login' });
    }
};
exports.login = login;
//# sourceMappingURL=auth.controller.js.map