import { Router } from 'express';
import { crearPublicacion, obtenerFeed, calificarPost } from '../controllers/post.controller';

const router = Router();

router.post('/crear', crearPublicacion);
router.get('/feed', obtenerFeed);
router.post('/:id/calificar', calificarPost);

export default router;