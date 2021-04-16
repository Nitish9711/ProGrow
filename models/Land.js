const mongoose = require('mongoose');
const landSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    soilType: {
        type: String,
        required: true
    },
    area: {
        amount: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        }
    },
    address:{
        village: {
            type: String,
            required: true,
        },
        district: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        }
    },
    image: String
})

module.exports = mongoose.model('Land',landSchema);