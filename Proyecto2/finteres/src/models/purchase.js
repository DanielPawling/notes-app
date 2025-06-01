// models/Purchase.js
const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    price: {  // Nuevo campo para el precio
        type: Number,
        required: true,
        min: 0,  // Valor mínimo
        max: 1000000,  // Valor máximo
        set: v => parseFloat(v.toFixed(2))  // Guarda con 2 decimales
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);