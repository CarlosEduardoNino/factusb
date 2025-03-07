import express from 'express';
import { 
    createProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct 
} from '../controllers/serviciosc.js';

const router = express.Router();

// Ruta para crear un nuevo producto
router.post('/', createProduct);

// Ruta para obtener todos los productos
router.get('/', getAllProducts);

// Ruta para obtener un producto por su ID
router.get('/:id', getProductById);

// Ruta para actualizar un producto
router.put('/:id', updateProduct);

export default router;