import { Router } from 'express';
import { agregarPalabra, agregarHashtag } from '../controllers/admin.controller';

const router = Router();

router.post('/palabras', agregarPalabra);
router.post('/hashtags', agregarHashtag);

export default router;