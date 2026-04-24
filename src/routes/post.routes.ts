import { Router } from 'express';

import {
  crearPublicacion,
  obtenerFeed,
  calificarPost,
  reaccionarPost,
  obtenerOcultos,
  alternarOculto,
  obtenerComentarios,
  comentarPost
} from '../controllers/post.controller';

import { upload } from '../middleware/upload';

const router = Router();

router.post('/crear', upload.single('imagen'), crearPublicacion);
router.get('/feed', obtenerFeed);
router.get('/ocultos', obtenerOcultos);

router.post('/:id/calificar', calificarPost);
router.post('/:id/reaccionar', reaccionarPost);

router.put('/:id/oculto', alternarOculto);
router.put('/:id/ocultar', alternarOculto);

router.get('/:id/comentarios', obtenerComentarios);
router.post('/:id/comentar', comentarPost);

export default router;