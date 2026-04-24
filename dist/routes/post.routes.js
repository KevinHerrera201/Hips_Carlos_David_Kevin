"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const router = (0, express_1.Router)();
router.post('/crear', post_controller_1.crearPublicacion);
router.get('/feed', post_controller_1.obtenerFeed);
router.post('/:id/calificar', post_controller_1.calificarPost);
exports.default = router;
//# sourceMappingURL=post.routes.js.map