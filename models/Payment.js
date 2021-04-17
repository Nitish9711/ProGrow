const mongoose = require('mongoose');
const requestSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
    },
    contractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contractor',
        required: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,//in months
        default: Date.now,
        required: true
    }
})

module.exports = mongoose.model('Payment',requestSchema);