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
    period: {
        type: Number,//in months
        required: true
    },
    accepted: {
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = mongoose.model('Request',requestSchema);