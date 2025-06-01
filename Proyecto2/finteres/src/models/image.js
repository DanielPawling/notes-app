const { Schema, model } = require('mongoose');

const imageSchema = new Schema({
    title: { type: String },
    description: { type: String },
    filename: { type: String },
    path: { type: String },
    originalname: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    created_at: { type: Date, default: Date.now },
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        max: 1000000,
        set: v => parseFloat(v.toFixed(2))
    },
    state: {
        type: String,
        required: true,
        enum: [
            'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 
            'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 
            'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 
            'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 
            'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 
            'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 
            'Zacatecas'
        ]
    },
    category: {
        type: String,
        required: true,
        enum: ['Tatuajes', 'Producción Musical', 'Maquillaje', 'Fotografía']
    }
});

module.exports = model('Image', imageSchema);