import Users from '../models/usuarios.js';

/**
 * POST /users
 * Crea un nuevo usuario en la base de datos.
 */
const createUser = async (req, res) => {
    try {
        const { identification, email } = req.body;

        // Verificar si el usuario ya existe por identificación o email
        const existingUser = await Users.findOne({ 
            $or: [{ identification }, { email }] 
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Usuario ya existe con esta identificación o email' });
        }

        const newUser = new Users(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
};

/**
 * GET /users
 * Obtiene todos los usuarios de la base de datos.
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

/**
 * GET /users/:id
 * Obtiene un usuario por su ID.
 */
const getUserById = async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
    }
};

export { createUser, getAllUsers, getUserById };
