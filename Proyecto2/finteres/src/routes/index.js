const { Router } = require('express');
const router = Router();
const path = require('path');
const { unlink } = require('fs-extra');
const Image = require('../models/image');
const { isAuthenticated } = require('../middlewares/auth'); // Asegúrate de tener este middleware

// Ruta principal (solo muestra imágenes del usuario logueado)
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const images = await Image.find()
            .populate({
                path: 'user',
                select: 'username email', // Solo trae estos campos
                model: 'User' // Nombre del modelo
            })
            .sort({ created_at: -1 }); // Ordenar por fecha descendente
            
        res.render('todos', { images });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar las publicaciones');
    }
});
router.get('/upload', (req, res) => {
  res.render('upload'); // Asegúrate de tener este archivo en views/upload.ejs
});
// Subir imagen (protegida por sesión)
router.post('/upload', isAuthenticated, async (req, res) => {
    try {
        // Validación de campos requeridos
        if (!req.body.title || !req.body.price || !req.body.state || !req.body.category) {
            return res.status(400).send('Todos los campos son requeridos');
        }

        // Validación adicional del precio
        const price = parseFloat(req.body.price);
        if (isNaN(price) || price < 0 || price > 1000000) {
            return res.status(400).send('Precio inválido (debe ser entre 0 y 1,000,000)');
        }

        // Validar que se subió un archivo
        if (!req.file) {
            return res.status(400).send('Debes seleccionar una imagen');
        }

        const image = new Image({
            title: req.body.title,
            description: req.body.description,
            filename: req.file.filename,
            path: '/img/uploads/' + req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            user: req.user._id,
            price: price,
            state: req.body.state,    // Nuevo campo estado
            category: req.body.category  // Nuevo campo categoría
        });

        await image.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).send('Error al subir la imagen: ' + error.message);
    }
});
// Mostrar todas las imágenes (de todos los usuarios)
router.get('/todos', isAuthenticated, async (req, res) => {
    const images = await Image.find({ user: req.user._id }); // Filtra por usuario
    res.render('index', { images });
    
});

// Ver imagen individual (solo si pertenece al usuario)

router.get('/image/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const image = await Image.findOne({ _id: id }); // Busca solo por ID

        if (!image) {
            return res.status(404).send('Imagen no encontrada');
        }

        // Comparación segura (funciona con ObjectId o strings)
        const isOwner = String(req.user._id) === String(image.user);

        res.render('profile', {
            image,
            currentUser: req.user,
            isOwner // true/false si el usuario es dueño
            
        });

    } catch (error) {
        console.error('Error al cargar la imagen:', error);
        res.status(500).send('Error interno del servidor');
    }
});
//CD4

//FIN CD4


// Eliminar imagen (solo del usuario logueado)

router.get('/image/:id/delete', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const image = await Image.findOneAndDelete({ _id: id, user: req.user._id }); // Filtro de seguridad

    if (!image) {
        return res.status(404).send('No puedes eliminar esta imagen');
    }
    await unlink(path.resolve('./src/public' + image.path));
    res.redirect('/');
});

// Ruta para procesar compras (DEBE ser POST)
router.post('/image/:id/purchase', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const image = await Image.findById(id);
        
        if (!image) {
            return res.status(404).send('Imagen no encontrada');
        }

        // Lógica de compra aquí (ej: registrar en DB)
        await Purchase.create({
            user: req.user._id,
            image: image._id,
            price: image.price
        });

        res.redirect(`/image/${id}?purchase=success`);
    } catch (error) {
        console.error('Error en la compra:', error);
        res.status(500).send('Error al procesar la compra');
    }
});
// Ruta para mostrar el formulario de edición
router.get('/image/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const image = await Image.findOne({ _id: id, user: req.user._id }); // Solo el dueño puede editar

        if (!image) {
            return res.status(404).send('Publicación no encontrada o no tienes permiso para editarla');
        }

        res.render('edit-image', { image });
    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para procesar la edición
router.post('/image/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validación de campos requeridos
        if (!req.body.title || !req.body.price || !req.body.state || !req.body.category) {
            return res.status(400).send('Todos los campos son requeridos');
        }

        // Validación del precio
        const price = parseFloat(req.body.price);
        if (isNaN(price) ){
            return res.status(400).send('Precio inválido');
        }

        // Buscar la imagen y verificar que pertenece al usuario
        const image = await Image.findOne({ _id: id, user: req.user._id });
        if (!image) {
            return res.status(403).send('No tienes permiso para editar esta publicación');
        }

        // Actualizar campos
        image.title = req.body.title;
        image.description = req.body.description;
        image.price = price;
        image.state = req.body.state;
        image.category = req.body.category;

        // Si se subió una nueva imagen, actualizarla
        if (req.file) {
            // Eliminar la imagen anterior del sistema de archivos
            await unlink(path.resolve('./src/public' + image.path));
            
            // Actualizar con la nueva imagen
            image.filename = req.file.filename;
            image.path = '/img/uploads/' + req.file.filename;
            image.originalname = req.file.originalname;
            image.mimetype = req.file.mimetype;
            image.size = req.file.size;
        }

        await image.save();
        res.redirect(`/image/${id}`);
    } catch (error) {
        console.error('Error al editar imagen:', error);
        res.status(500).send('Error al editar la publicación: ' + error.message);
    }
});
module.exports = router;