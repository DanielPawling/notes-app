//cadena de conexion
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/finteres_tutorial', {
    useNewUrlParser: true, // Corregido el error tipográfico
    useUnifiedTopology: true // Se recomienda agregar esta opción
})
.then(db => console.log('DB is connected'))
.catch(err => console.log(err));
