const mongoose = require('mongoose');
const requestSchema = new mongoose.Schema({
    land: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Land',
        required: true
    },
    contractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contractor',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    crop: {
        type: String,
        required: true
    },
    period: {
        type: Number,//in months
        required: true
    },
    totalAmount: {
        type: Number,//in months
        required: true
    },
    amountRemaining: {
        type: Number,//in months
        required: true,
        default: 0
    },
    accepted: {
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = mongoose.model('Request',requestSchema);