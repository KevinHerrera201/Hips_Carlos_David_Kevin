import { Request, Response } from 'express';
import { pool } from '../db/database'; 

export const crearPublicacion = async (req: Request, res: Response): Promise<void> => {
    // ... (Mantén tu código actual de crearPublicacion exactamente igual)
    const { descripcion, hashtags } = req.body;
    const usuario = req.headers['x-usuario'] as string || 'Usuario Desconocido';

    if (!descripcion || descripcion.trim().length === 0) { res.status(400).json({ error: 'La descripción no puede estar vacía' }); return; }
    if (descripcion.length > 128) { res.status(400).json({ error: 'La descripción excede los 128 caracteres' }); return; }

    try {
        const resPalabras = await pool.query('SELECT palabra FROM blacklist_palabras');
        const palabrasProhibidas = resPalabras.rows.map((row: any) => row.palabra.toLowerCase());
        const descMinuscula = descripcion.toLowerCase();
        const palabrasEncontradas = palabrasProhibidas.filter((p: string) => descMinuscula.includes(p));

        if (palabrasEncontradas.length > 0) { res.status(403).json({ error: `Contiene palabras prohibidas: ${palabrasEncontradas.join(', ')}` }); return; }

        if (hashtags && hashtags.trim().length > 0) {
            const resHashtags = await pool.query('SELECT hashtag FROM blacklist_hashtags');
            const hashtagsProhibidos = resHashtags.rows.map((row: any) => row.hashtag.toLowerCase());
            const hashArray = hashtags.toLowerCase().split(' ');
            const hashtagsEncontrados = hashtagsProhibidos.filter((hp: string) => hashArray.includes(hp));

            if (hashtagsEncontrados.length > 0) { res.status(403).json({ error: `Contiene hashtags prohibidos: ${hashtagsEncontrados.join(', ')}` }); return; }
        }

        await pool.query('INSERT INTO publicaciones (usuario, descripcion, hashtags) VALUES ($1, $2, $3)', [usuario, descripcion, hashtags]);
        res.status(201).json({ message: 'Publicación creada exitosamente' });

    } catch (error) {
        res.status(500).json({ error: 'Error al crear la publicación' });
    }
};

// ACTUALIZADO: Obtiene el feed con el promedio de estrellas
export const obtenerFeed = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT p.*, 
                   COALESCE(AVG(c.estrellas), 0) as promedio_estrellas
            FROM publicaciones p
            LEFT JOIN calificaciones_posts c ON p.id = c.post_id
            GROUP BY p.id
            ORDER BY p.fecha DESC
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el feed' });
    }
};

// NUEVO: Función para calificar
export const calificarPost = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // ID del post
    const { estrellas } = req.body;
    const usuario = req.headers['x-usuario'] as string;

    try {
        // Verificar que no sea el autor del post
        const post = await pool.query('SELECT usuario FROM publicaciones WHERE id = $1', [id]);
        if (post.rows.length === 0) { res.status(404).json({ error: 'Post no encontrado' }); return; }
        if (post.rows[0].usuario === usuario) { res.status(403).json({ error: 'No puedes calificar tu propia publicación' }); return; }

        // Insertar o actualizar si ya había votado
        await pool.query(`
            INSERT INTO calificaciones_posts (post_id, usuario, estrellas) 
            VALUES ($1, $2, $3)
            ON CONFLICT (post_id, usuario) 
            DO UPDATE SET estrellas = EXCLUDED.estrellas
        `, [id, usuario, estrellas]);

        res.status(200).json({ message: 'Calificación registrada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al calificar' });
    }
};