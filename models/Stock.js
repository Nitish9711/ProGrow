const mongoose = require('mongoose');
const stockSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        // required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    qty: {
        amount: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        }
    },
    price: {
        type: Number,
        required: true
    },
    image: String
})

module.exports = mongoose.model('Stock',stockSchema);