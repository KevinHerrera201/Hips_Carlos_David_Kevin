"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// Rutas de Usuarios
router.get('/usuarios', admin_controller_1.obtenerUsuarios);
router.put('/usuarios/:id/estado', admin_controller_1.cambiarEstadoUsuario);
router.put('/usuarios/:id/rol', admin_controller_1.cambiarRolUsuario);
// Rutas de Palabras Prohibidas
router.get('/palabras', admin_controller_1.obtenerPalabras);
router.post('/palabras', admin_controller_1.agregarPalabra);
router.delete('/palabras/:id', admin_controller_1.eliminarPalabra);
// Rutas de Hashtags Prohibidos
router.get('/hashtags', admin_controller_1.obtenerHashtags);
router.post('/hashtags', admin_controller_1.agregarHashtag);
router.delete('/hashtags/:id', admin_controller_1.eliminarHashtag);
// Ruta de Bitácora
router.get('/bitacora', admin_controller_1.obtenerBitacora);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map