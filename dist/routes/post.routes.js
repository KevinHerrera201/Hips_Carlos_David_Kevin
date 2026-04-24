"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/crear', upload_1.upload.single('imagen'), post_controller_1.crearPublicacion);
router.get('/feed', post_controller_1.obtenerFeed);
router.get('/ocultos', post_controller_1.obtenerOcultos);
router.post('/:id/calificar', post_controller_1.calificarPost);
router.post('/:id/reaccionar', post_controller_1.reaccionarPost);
router.put('/:id/oculto', post_controller_1.alternarOculto);
router.put('/:id/ocultar', post_controller_1.alternarOculto);
exports.default = router;
//# sourceMappingURL=post.routes.js.map