import { Router } from 'express';
import { 
    obtenerUsuarios, cambiarEstadoUsuario, cambiarRolUsuario,
    obtenerPalabras, agregarPalabra, eliminarPalabra,
    obtenerHashtags, agregarHashtag, eliminarHashtag,
    obtenerBitacora, obtenerActividad
} from '../controllers/admin.controller';

const router = Router();

// Rutas de Usuarios
router.get('/usuarios', obtenerUsuarios);
router.put('/usuarios/:id/estado', cambiarEstadoUsuario);
router.put('/usuarios/:id/rol', cambiarRolUsuario);

// Rutas de Palabras Prohibidas
router.get('/palabras', obtenerPalabras);
router.post('/palabras', agregarPalabra);
router.delete('/palabras/:id', eliminarPalabra);

// Rutas de Hashtags Prohibidos
router.get('/hashtags', obtenerHashtags);
router.post('/hashtags', agregarHashtag);
router.delete('/hashtags/:id', eliminarHashtag);

// Ruta de Bitácora
router.get('/bitacora', obtenerBitacora);
router.get('/actividad', obtenerActividad);

export default router;
