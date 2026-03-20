import { Router } from 'express';
import { 
    registrarAdmin, 
    login, 
    registrarUsuario, 
    listarUsuarios, 
    eliminarUsuario
} from '../controllers/auth.controller';
const router: Router = Router();

/**
 * @route   POST /api/auth/register-admin
 * @desc    Registrar un nuevo usuario con cargo Administrador
 * @access  Público (o restringido según tu lógica inicial)
 */
router.post('/register-admin', registrarAdmin);
router.post('/register-staff', registrarUsuario);
router.get('/usuarios', listarUsuarios);
/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuario y obtener Token JWT
 * @access  Público
 */
router.post('/login', login);

/**
 * @route   DELETE /api/auth/usuario/:id
 * @desc    Eliminar un usuario por su ID
 * @access  Privado (Deberías añadir un middleware de admin aquí luego)
 */
router.delete('/usuario/:id', eliminarUsuario);

export default router;