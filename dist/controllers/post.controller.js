"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alternarOculto = exports.calificarPost = exports.reaccionarPost = exports.obtenerOcultos = exports.obtenerFeed = exports.crearPublicacion = void 0;
const database_1 = require("../db/database");
const registrarActividad = async (usuario, accion) => {
    try {
        await database_1.pool.query('INSERT INTO bitacora (usuario, accion) VALUES ($1, $2)', [usuario || 'Sistema', accion]);
    }
    catch (error) {
        console.error('Error al registrar actividad:', error);
    }
};
const crearPublicacion = async (req, res) => {
    // ... (Mantén tu código actual de crearPublicacion exactamente igual)
    const { descripcion, hashtags } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : null;
    const usuario = req.headers['x-usuario'] || 'Usuario Desconocido';
    if (!descripcion || descripcion.trim().length === 0) {
        res.status(400).json({ error: 'La descripción no puede estar vacía' });
        return;
    }
    if (descripcion.length > 128) {
        res.status(400).json({ error: 'La descripción excede los 128 caracteres' });
        return;
    }
    try {
        const resPalabras = await database_1.pool.query('SELECT palabra FROM blacklist_palabras');
        const palabrasProhibidas = resPalabras.rows.map((row) => row.palabra.toLowerCase());
        const descMinuscula = descripcion.toLowerCase();
        const palabrasEncontradas = palabrasProhibidas.filter((p) => descMinuscula.includes(p));
        if (palabrasEncontradas.length > 0) {
            res.status(403).json({ error: `Contiene palabras prohibidas: ${palabrasEncontradas.join(', ')}` });
            return;
        }
        if (hashtags && hashtags.trim().length > 0) {
            const resHashtags = await database_1.pool.query('SELECT hashtag FROM blacklist_hashtags');
            const hashtagsProhibidos = resHashtags.rows.map((row) => row.hashtag.toLowerCase());
            const hashArray = hashtags.toLowerCase().split(' ');
            const hashtagsEncontrados = hashtagsProhibidos.filter((hp) => hashArray.includes(hp));
            if (hashtagsEncontrados.length > 0) {
                res.status(403).json({ error: `Contiene hashtags prohibidos: ${hashtagsEncontrados.join(', ')}` });
                return;
            }
        }
        await database_1.pool.query('INSERT INTO publicaciones (usuario, descripcion, hashtags, imagen) VALUES ($1, $2, $3, $4)', [usuario, descripcion, hashtags, imagen]);
        await registrarActividad(usuario, `Subió una publicación: "${descripcion}"`);
        res.status(201).json({ message: 'Publicación creada exitosamente' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al crear la publicación' });
    }
};
exports.crearPublicacion = crearPublicacion;
// FEED PRINCIPAL (Solo muestra las activas)
const obtenerFeed = async (req, res) => {
    try {
        const query = `
            SELECT p.id, p.usuario, p.descripcion, p.hashtags, p.fecha, p.oculto,
                COALESCE((SELECT AVG(estrellas) FROM calificaciones_posts WHERE post_id = p.id), 0) AS promedio_estrellas,
                COALESCE((SELECT SUM(CASE WHEN tipo = 1 THEN 1 ELSE 0 END) FROM reacciones_posts WHERE post_id = p.id), 0) AS likes,
                COALESCE((SELECT SUM(CASE WHEN tipo = -1 THEN 1 ELSE 0 END) FROM reacciones_posts WHERE post_id = p.id), 0) AS dislikes
            FROM publicaciones p
            WHERE p.oculto = false
            ORDER BY p.fecha DESC
        `;
        const result = await database_1.pool.query(query);
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener el feed' });
    }
};
exports.obtenerFeed = obtenerFeed;
// NUEVO: FEED DE OCULTOS (Filtra por creador o si es admin)
const obtenerOcultos = async (req, res) => {
    const usuario = req.headers['x-usuario'];
    const rol = req.headers['x-rol'];
    try {
        const query = `
            SELECT p.id, p.usuario, p.descripcion, p.hashtags, p.fecha, p.oculto,
                COALESCE((SELECT AVG(estrellas) FROM calificaciones_posts WHERE post_id = p.id), 0) AS promedio_estrellas,
                COALESCE((SELECT SUM(CASE WHEN tipo = 1 THEN 1 ELSE 0 END) FROM reacciones_posts WHERE post_id = p.id), 0) AS likes,
                COALESCE((SELECT SUM(CASE WHEN tipo = -1 THEN 1 ELSE 0 END) FROM reacciones_posts WHERE post_id = p.id), 0) AS dislikes
            FROM publicaciones p
            WHERE p.oculto = true AND (p.usuario = $1 OR $2 = 'admin')
            ORDER BY p.fecha DESC
        `;
        const result = await database_1.pool.query(query, [usuario, rol]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener posts ocultos' });
    }
};
exports.obtenerOcultos = obtenerOcultos;
const reaccionarPost = async (req, res) => {
    const { id } = req.params;
    const { tipo } = req.body; // 1 (Like) o -1 (Dislike)
    const usuario = req.headers['x-usuario'];
    try {
        await database_1.pool.query(`
            INSERT INTO reacciones_posts (post_id, usuario, tipo) 
            VALUES ($1, $2, $3)
            ON CONFLICT (post_id, usuario) 
            DO UPDATE SET tipo = EXCLUDED.tipo
        `, [id, usuario, tipo]);
        const post = await database_1.pool.query('SELECT descripcion FROM publicaciones WHERE id = $1', [id]);
        const descripcion = post.rows[0]?.descripcion || `ID ${id}`;
        const accion = tipo === 1 ? 'dio like a' : 'dio dislike a';
        await registrarActividad(usuario, `${accion} la publicación: "${descripcion}"`);
        res.status(200).json({ message: 'Reacción registrada' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al reaccionar' });
    }
};
exports.reaccionarPost = reaccionarPost;
// NUEVO: Función para calificar
const calificarPost = async (req, res) => {
    const { id } = req.params; // ID del post
    const { estrellas } = req.body;
    const usuario = req.headers['x-usuario'];
    try {
        // Verificar que no sea el autor del post
        const post = await database_1.pool.query('SELECT usuario FROM publicaciones WHERE id = $1', [id]);
        if (post.rows.length === 0) {
            res.status(404).json({ error: 'Post no encontrado' });
            return;
        }
        if (post.rows[0].usuario === usuario) {
            res.status(403).json({ error: 'No puedes calificar tu propia publicación' });
            return;
        }
        // Insertar o actualizar si ya había votado
        await database_1.pool.query(`
            INSERT INTO calificaciones_posts (post_id, usuario, estrellas) 
            VALUES ($1, $2, $3)
            ON CONFLICT (post_id, usuario) 
            DO UPDATE SET estrellas = EXCLUDED.estrellas
        `, [id, usuario, estrellas]);
        const descripcion = await database_1.pool.query('SELECT descripcion FROM publicaciones WHERE id = $1', [id]);
        await registrarActividad(usuario, `Calificó con ${estrellas} estrellas la publicación: "${descripcion.rows[0]?.descripcion || `ID ${id}`}"`);
        res.status(200).json({ message: 'Calificación registrada' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al calificar' });
    }
};
exports.calificarPost = calificarPost;
// NUEVO: Función para ocultar/mostrar
const alternarOculto = async (req, res) => {
    const { id } = req.params;
    const { oculto } = req.body;
    const usuario = req.headers['x-usuario'];
    const rol = req.headers['x-rol'];
    try {
        // Validar que el post exista
        const post = await database_1.pool.query('SELECT usuario FROM publicaciones WHERE id = $1', [id]);
        if (post.rows.length === 0) {
            res.status(404).json({ error: 'Post no encontrado' });
            return;
        }
        // Validar permisos (Solo el creador o un admin pueden ocultar)
        if (rol !== 'admin' && post.rows[0].usuario !== usuario) {
            res.status(403).json({ error: 'No tienes permiso para modificar esta publicación' });
            return;
        }
        await database_1.pool.query('UPDATE publicaciones SET oculto = $1 WHERE id = $2', [oculto, id]);
        const descripcion = await database_1.pool.query('SELECT descripcion FROM publicaciones WHERE id = $1', [id]);
        await registrarActividad(usuario, oculto
            ? `Ocultó la publicación: "${descripcion.rows[0]?.descripcion || `ID ${id}`}"`
            : `Restauró la publicación: "${descripcion.rows[0]?.descripcion || `ID ${id}`}"`);
        res.status(200).json({ message: 'Visibilidad actualizada' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al cambiar visibilidad' });
    }
};
exports.alternarOculto = alternarOculto;
//# sourceMappingURL=post.controller.js.map